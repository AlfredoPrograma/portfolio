---
lang: "es"
slug: "multiwriter-logger-en-golang"
canonicalSlug: "multiwriter-logger-in-golang"
title: "Cómo implementar un logger MultiWriter Golang"
date: "2025-11-05"
excerpt: "Aprende paso a paso cómo crear un logger MultiWriter en Golang para escribir logs en múltiples destinos simultáneamente usando slog."
tags: ["Golang"]
---

Hace un par de días me surgió la necesidad de realizar un ajuste en el *logger* de una aplicación escrita en **Golang**. En pocas palabras, necesitaba escribir los registros (*logs*) en un archivo del disco de forma persistente, además de mantener la salida en la terminal para poder depurar y visualizar en tiempo real lo que ocurre con mi aplicación durante el desarrollo local.

Para mi sorpresa, **Golang no ofrece una forma directa de escribir logs en múltiples destinos simultáneamente**. Mi primera aproximación fue crear dos instancias de *loggers* y envolver los métodos más comunes para distribuir la escritura entre ambos destinos. Sin embargo, me quedó la duda y pensé: *“Debe existir una forma más elegante y flexible de hacerlo.”* 

Así que me dispuse a revisar la documentación oficial y explorar el paquete `slog` hasta encontré una forma interesante de lograrlo. 

## Los *Handlers*, el corazón de los loggers

Un *handler* no es más que una implementación concreta de **cómo se desea que los logs sean procesados y emitidos**. Cada *handler* encapsula la lógica sobre *cómo* y *dónde* escribir los registros, permitiendo realizar transformaciones y definir su destino de salida a cualquier lugar. (siempre que dicho destino sea un `io.Writer`).

`slog` permite instanciar algunos *handlers* por defecto que formatean los logs en estructuras comunes, como **JSON** o texto plano. Para ello se pueden usar las funciones `NewJSONHandler` y `NewTextHandler`, que crean *handlers* con esos formatos respectivamente.

La buena noticia es que **la interfaz `Handler` es pública**, lo que significa que podemos **crear nuestras propias implementaciones personalizadas** según las necesidades del proyecto. Algunas ideas que se me ocurrieron fueron:

* Un *handler* que escriba los logs directamente a través de un **socket TCP**.
* Otro que los envíe directamente a algún servicio de monitoreo como **Grafana**.
* O, como veremos hoy: **un handler que replique los logs en múltiples destinos**... Algo así como un *handler* de *handlers*. Suena extraño, pero verás que tiene mucho sentido.

## Un *handler* de *handlers*

En nuestro caso, no necesitamos un *handler* que modifique la información del log ni que lo formatee de una manera particular. Lo que realmente queremos es un *handler* que **distribuya los registros entre varios destinos**.

Ahí está la clave: construiremos un *handler de handlers*. A grandes rasgos, nuestro *handler* principal tomará una lista de *handlers* secundarios y, cada vez que se registre un log, recorrerá esa lista y lo escribirá en cada uno de ellos. Esa será la esencia de nuestro **`MultiWriterHandler`**.

## Definiendo el `MultiWriterHandler`

Comencemos con la estructura base que implementará los métodos de la interfaz `Handler`:

```go
package main

type MultiWriterHandler struct {
  handlers []slog.Handler
}

func NewMultiWriterHandler(handlers ...slog.Handler) *MultiWriterHandler {
  return &MultiWriterHandler{handlers: handlers}
}
```

Nuestro *handler* simplemente almacena un *slice* con todos los `handlers` a los que se distribuirán los logs.
Siguiendo el ejemplo anterior, este *slice* podría contener un `TextHandler` y un `JSONHandler` para escribir en ambos de forma simultánea.

Para hacerlo compatible con `slog` y cumplir la interfaz `Handler`, debemos implementar cuatro métodos clave:

* `Enabled`
* `Handle`
* `WithAttrs`
* `WithGroup`

Veamos cada uno de ellos paso a paso.

## `Enabled`: ¿debo escribir este log?

Este método determina si el *handler* debe registrar el log según su nivel de severidad.
Por ejemplo, si el nivel de severidad está en `Error`, los registros con menor nivel severidad de (`Info`, `Debug`, `Warn`) serán ignorados.

En nuestro caso, queremos que el `MultiWriterHandler` solo escriba si **todos los handlers internos** están habilitados para el nivel de severidad indicado:

```go
func (m *MultiWriterHandler) Enabled(ctx context.Context, level slog.Level) bool {
  for _, h := range m.handlers {
    if !h.Enabled(ctx, level) {
      return false
    }
  }

  return true
}
```

De esta forma, solo se escribirá el log si todos los destinos lo aceptan, garantizando que los registros sean consistentes en todos los *handlers* y salidas configuradas.

## `Handle`: escribiendo el log

El método `Handle` ejecuta la lógica de escritura del registro. Aquí es donde se encapsula la transformación del contenido del log al formato deseado.
Por ejemplo, el *JSON handler* convierte la información al formato JSON dentro de este mismo método.

Así se implementa:

```go
func (m *MultiWriterHandler) Handle(ctx context.Context, record slog.Record) error {
  for _, h := range m.handlers {
    if err := h.Handle(ctx, record.Clone()); err != nil {
      return err
    }   
  }

  return nil
}
```

Nuestro `MultiWriterHandler` **no realiza transformaciones**, simplemente recorre la lista de *handlers* y ejecuta su método `Handle` para que cada uno procese el log a su manera.

Un detalle importante es que el `record`, que representa la información del log, **se clona** antes de enviarlo a cada *handler*. Esto evita interferencias, ya que algunos pueden modificar el registro internamente.

## `WithAttrs` y `WithGroup`: añadiendo contexto

Estos dos métodos permiten **inyectar metadatos persistentes** en los registros:

* `WithAttrs`: añade atributos fijos al log.
* `WithGroup`: agrupa los atributos bajo una misma clave.

Ejemplo con `WithAttrs`:

```go
jsonHandler := slog.NewJSONHandler(os.Stdout, nil)
serviceJsonHandler := jsonHandler.WithAttrs([]slog.Attr{
  {
    Key: "service",
    Value: slog.StringValue("MY_SERVICE_NAME"),
  },
})
logger := slog.New(serviceJsonHandler)
logger.Info("Informative message")

// Output:
// {"time":"2025-11-04T12:31:53.491981635-04:00","level":"INFO","msg":"Informative message","service":"MY_SERVICE_NAME"}
```

Y con `WithGroup`:

```go
jsonHandler := slog.NewJSONHandler(os.Stdout, nil)
groupJsonHandler := jsonHandler.WithGroup("parent")
logger := slog.New(groupJsonHandler)
logger.Info("Informative message", "hello", "world", "name", "john doe")

// Output:
// {"time":"2025-11-04T12:39:52.489122648-04:00","level":"INFO","msg":"Informative message","parent":{"hello":"world","name":"john doe"}}
```

Ambos métodos mejoran la estructura y legibilidad de los datos en los registros, así que implementémoslos en nuestro `MultiWriterHandler`:

```go
func (m *MultiWriterHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
  attrHandlers := make([]slog.Handler, len(m.handlers))

  for i, h := range m.handlers {
    attrHandlers[i] = h.WithAttrs(attrs)
  }

  return &MultiWriterHandler{handlers: attrHandlers}
}

func (m *MultiWriterHandler) WithGroup(name string) slog.Handler {
  groupedHandlers := make([]slog.Handler, len(m.handlers))

  for i, h := range m.handlers {
    groupedHandlers[i] = h.WithGroup(name)
  }

  return &MultiWriterHandler{handlers: groupedHandlers}
}
```

Cada método crea un nuevo `MultiWriterHandler` con los *handlers* modificados, manteniendo la composición y agregando los atributos o grupos a todos los destinos.

## Poniendo el MultiWriter en marcha

Es momento de probarlo.
Vamos a escribir registros en tres lugares distintos y con diferentes formatos:

1. **Consola (texto plano)**
2. **Consola (JSON)**
3. **Archivo (JSON)**

```go
// ...
// MultiWriterHandler implementation above...

func main() {
	file, err := os.OpenFile("logs.json", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		panic(err)
	}
	defer file.Close()

	textConsoleHandler := slog.NewTextHandler(os.Stdout, nil)
	jsonConsoleHandler := slog.NewJSONHandler(os.Stdout, nil)
	jsonFileHandler := slog.NewJSONHandler(file, nil)

	multiWriterHandler := NewMultiWriterHandler(
		textConsoleHandler,
		jsonConsoleHandler,
		jsonFileHandler,
	)

	logger := slog.New(multiWriterHandler)

	logger.Info("Informative message", "success", true)
	logger.Warn("Warning message", "failing", true)
	logger.Error("Error message", "error", "database is broken!")
}
```

Al ejecutar:

```bash
go run ./main.go
```

Verás en consola los registros tanto en texto plano como en JSON, y además el archivo `logs.json` contendrá las mismas entradas.

**Un solo logger, múltiples salidas sincronizadas.**

--- 

Con esto, tenemos un **`MultiWriterHandler`** totalmente funcional: una implementación personalizada de la interfaz `Handler` de `slog` capaz de escribir en múltiples destinos simultáneamente.

Sus principales ventajas son:

* Centraliza el manejo de logs.
* Evita la duplicación de instancias.
* Mantiene la coherencia entre las salidas.
* Es fácilmente extensible.

**Golang** brilla precisamente por esto: su capacidad de *extender e integrar* la librería estándar sin perder simplicidad.