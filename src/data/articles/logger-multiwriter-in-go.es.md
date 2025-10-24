---
lang: "es"
slug: "logger-multiwriter-en-go"
canonicalSlug: "logger-multiwriter-in-go"
title: "Implementa un logger multiwriter en Golang"
date: "2025-11-03"
excerpt: "Inspecciona el paquete `slog` y construye un logger multiwriter"
tags: ["Golang"]
---

# Implementando el multiwriter

Por defecto, `slog` no nos permite crear un logger que escriba en diferentes destinos al mismo tiempo. Unicamente nos permite instanciar un logger con un handler especifico asociado. Asi que, si por ejemplo, queremos exponer los logs en la consola y en un archivo de texto al mismo tiempo no podremos; o al menos, directamente.

Una de las cosa que mas me gusta y me asombra de Golang, es su facilidad para integrar funcionalidades sobre recursos ya existentes. El hecho de que la libreria estandar sea flexible y exponga las APIs publicas necesarias par poder construir sobre ella, otorga muchisimo poder al desarrollador.

# Definiendo las piezas de nuestro logger

Para crear un `logger` basado en el paquete `slog` de la libreria estandar, lo primero que necesitamos es un `Handler`; un handler no es mas que una implementacion concreta de como se quiere que los logs emitidos por el logger sean tratados y expuestos. De hecho, `slog` provee un par de funciones que permiten crear `Handlers` por defecto que son de suma utilidad; como por ejemplo la funcion `NewJSONHandler`; que automaticamente expone los logs en formato `json`... O directamente la funcion `NewTextHandler`, que permite redactar los logs en formato de texto plano. 

Si eres un poco ingenioso y lees la documentacion o el codigo fuente del paquete `slog`; podras notar que, efectivamente, el *grueso* de como se *escriben* los logs depende enteramente del `Handler`; que es la entidad que se encargara de, efectivamente, manejar la escritura de los logs en base a la implementacion concreta que queramos... Y adivina que; Golang nos expone esa interfaz como una API publica!!! Esto nos permite *crear* nuestras propias implementaciones de `Handlers`, asi que podemos crear un `handler` que escriba a traves de un socket, o que escriba los logs enviando peticiones HTTP a otros servicios de monitoreo como Grafana... O, justo lo que queremos! Un handler que replique los logs en multiples handlers!!! Un handler de; handlers? Parece un poco extrano pero ya veras que todo cobra sentido.

# Handler de handlers....

Para entender un poco sobre esta idea de crear un handler de handlers. Imagina que quieres escribir los logs de tu aplicacion en dos destinos diferentes: la consola, en un formato de texto plano para ver de forma secuencial lo que va ocurriendo en tu aplicacion en tiempo real; y en un archivo llamado `logs` con un formato `json`, con el fin de garantizar la persistencia de los logs en el disco y poder analizarlos luego mas facilmente. Podemos usar las herramientas que ya nos provee el paquete `slog` y crear un logger que utilice el text handler y otro logger que utilice el json handler e ir llamando de forma individual a las funciones para escribir los logs... Pero esto seria un poco raro, tendriamos dos instancias de loggers, que escriben exactamente lo mismo pero en dos destinos diferentes. Aja! Lo vas viendo? Para nuestra comodidad, quisieramos tener una unica instancia de logger, que, al escribir un log, lo distribuya entre ambos handlers; replicando el contenido del log tanto en la consola como en el archivo. Esto es una idea sumamente poderosa porque, de ser necesario, podriamos agregar mas handlers que repliquen los logs en mas destinos de ser necesario. Entonces; la idea es crear un handler, que sea capaz de recibir el log y replicarlo en tantos handlers como se quiera... Exactamente un handler de handlers!

# Definamos la base, nuestro MultiWriterHandler

Bueno bueno, mucha chachara y poco codigo; asi que vamos a ponernos manos a la obra. Primero que nada, debemos definir la struct que sera responsable de implementar los metodos de la interfaz `Handler`:

```go
package logger

type MultiWriterHandler struct {
  handlers []slog.Handler
}

func NewMultiWriterHandler(handlers ...slog.Handler) *MultiWriterHandler {
  return &MultiWriterHandler{handlers: handlers}
}
```

Nuestro handler sera sencillo; de hecho, el unico campo que almacena en su interior es un slice que representa el listado de handlers a los cuales va a distribuir el log que se escriba en el. Si aterrizamos esta idea al ejemplo anterior de los logs en consola y en un archivo json; los handlers que almacenaria en el slice serian, el text handler y el json handler respectivamente.

Ahora que tenemos definida nuestra struct tenemos claro por que holdeamos un listado de handlers en su interior; debemos hacer que satisfaga la interfaz `Handler` para poder enchufarlo y poder crear un `Logger` que escriba logs directamente en el. Para ello, debemos implementar los metodos `Enabled`, `Handle`, `WithAttrs` y `WithGroup`; que son los necesarios para satisfacer la interfaz `Handler`. Vamos paso a paso revisando cada uno de ellos.

## Enabled

Este metodo es muy sencillo; y tal como indica la documentacion oficial, solamente se encarga de determinar si el handler debe escribir el log en base al log level indicado. Si tenemos un log level definido en "Error"; esto quiere decir que todos los logs que tengan un menor nivel, como "Debug, Info y Warn" se van a ignorar y por ende no se deben exponer. Bueno, precisamente de eso se encarga este metodo.

Si llevamos este comportamiento a nuestro caso concreto, nosotros lo que queremos es que nuestro handler escriba en los handlers que tambien esten disponibles en base al log level; asi que podemos hacer lo siguiente

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

Que!? Parece magia... Pero no lo es. De hecho la implementacion es bastante elegante. Basicamente va por cada uno de los handlers y llama a su metodo `Enabled` para verificar si ese handler debe o no ignorar la escritura del log. Como nos interesa mantener la consistencia y por ende garantizar que en todos los destinos se escriban los mismos logs; hacemos logs logs se escriban si **todos los handlers** deben escribir el log respectivamente. Si alguno de ellos debe ignorarlo, entonces todos los handlers ignoran el log.

## Handle

La funcion `Handle` se encarga de ejecutar el bloque de logica para escribir el log en su destino; con bloque de logica me refiero a cualquier manejo arbitrario del log y su escritura en el destino respectivo. Por ejemplo, para el caso del json handler; este metodo se encarga de formatear el log en json y luego escribirlo en el destino. Para un caso mas complejo, como por ejemplo un logger que escriba a traves de HTTP; este metodo seria el encargado de implementar la logica para ejecutar la request HTTP y escribir en ella. Vamos a implementarlo:

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

La implementacion es muy parecida a la de `Enabled`. Dado que estamos tratando con un listado de `Handlers`; el trabajo de nuestro `MultiWriterHandler` en el metodo `Handle` no es mas que llamar a cada uno de los handlers y ejecutar el manejo del log. 

Como puedes notar, en cada `h.Handle` pasamos el record pero *clonado*. Esto porque los handlers pueden mutar el record; asi que nos interesa hacer una copia del record original para cada handle y asi evitar posibles sobreescrituras en el mismo record.

# WithAttrs y WithGroup

Estos dos son los ultimos metodos necesarios para satisfacer la interfaz de `Handler` y asi instanciar nuestro logger usando el  `MultiWriterHandler`. Estos dos metodos los agrupo en una misma seccion porque son bastante similares en cuanto a su comportamiento e implementacion. Basicamente, ambos se encargan instanciar un nuevo handler argumentos o grupos inyectados de forma permanente.

Digamos que en todos los logs, siempre queremos tener a la mano un campo llamado `service` y como valor el respectivo nombre del servicio. La opcion mas rudimentaria es escribir manualmente estos argumentos en cada llamada a la escritura de un log; algo asi como `myLogger.Info("Informative message", "service", "MY_SERVICE_NAME")`. Como podras notar, esto no escala absolutamente nada y ademas tendremos la carga cognitiva y responsabilidad de *siempre* agregar el argumento `service` y su valor. Para solventar esta problematica tenemos el wrapper `WithAttrs`, el cual crea un nuevo handler (basado en el anterior) pero con una serie de atributos/argumentos predefinidos. Asi que la idea seria algo como:

```go
jsonHandler := slog.NewJSONHandler(os.Stdout, nil)
serviceJsonHandler := jsonHandler.WithAttrs([]slog.Attr{
  {
    Key: "service",
    Value: slog.StringValue("MY_SERVICE_NAME")
  }
})
logger := slog.New(serviceJsonHandler)
logger.Info("Informative message")

// Output: {"time":"2025-11-04T12:31:53.491981635-04:00","level":"INFO","msg":"Informative message","service":"MY_SERVICE_NAME"}
```
Notese que, partiendo de un handler base (el `jsonHandler`), podemos generar un handler asociado a nuestro servicio que inyecta por defecto un listado de atributos a traves del metodo `WithAttrs`. Ahora, todos los logs que sean escritos con un logger que utilice nuestro `serviceJsonHandler` contendran la llave/valor `"service":"MY_SERVICE_NAME"`.

Finalmente, de una forma exactamente igual se comporta el metodo `WithGroup`; con la sutil diferencia de que un `Group` lo que hace es wrappear el listado de argumentos que se pasan al log en un objeto cuya llave corresponde al nombre del grupo y como valor contiene todos los argumentos pasados al log en forma de llave/valor. Veamoslo de forma practica:

```go
jsonHandler := slog.NewJSONHandler(os.Stdout, nil)
groupJsonHandler := jsonHandler.WithGroup("parent")
logger := slog.New(groupJsonHandler)
logger.Info("Informative message", "hello", "world", "name", "john doe")

// Output: {"time":"2025-11-04T12:39:52.489122648-04:00","level":"INFO","msg":"Informative message","parent":{"hello":"world","name":"john doe"}}
```

Como puedes notar, los argumentos `hello: world` y `name: john doe`, fueron agrupados (por eso el nombre `WithGroup`) en un objeto padre bajo la llave `parent` (que corresponde al nombre del grupo que definimos).

Genial genial genial; ya entendemos el comportamiento de ambos metodos `WithAttrs` y `WithGroup`; asi que vamos con la implementacion concreta de los mismos para nuestro `MultiWriterHandler` y asi poder poner a prueba nuestro handler.

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

Fijate, tal como te comente antes; la implementacion es casi que exactamente igual. Basicamente creamos un nuevo array de handlers, el cual contendra todos los handlers originales pero con la modificacion correspondiente inyectada por el metodo `WithAttrs` o `WithGroup` (o ambos). Una vez tenemos todos nuestros handlers modificados, retornamos exactamente un nuevo `MultiWriterHandler` pero que contiene los handlers modificados.

# Poniendo el multi writer en marcha

Que emocion!!! Vamos a poner en marcha nuestro logger para que escriba en 3 lugares diferentes al mismo tiempo con diferentes formatos:

1. En nuestra consola en formato de texto plano
2. En nuestra consola en formato JSON
3. En un archivo en disco en formato JSON

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

Aca orquestamos todo. Primero que nada, abrimos (y creamos si es necesario) el archivo donde va a escribir nuestro handler en disco. Luego inicializamos nuestros 3 handlers; como puedes notar, tenemos un `TextHandler` y un `JSONHandler` que escribiran en `os.Stdout`; que corresponde precisamente al standard output haciendo que los logs se vean reflejados en nuestra consola. El ultimo handler, es un `JSONHandler` al que le pasamos el `file` como destino de escritura; es decir, los logs los escribira en el archivo que hemos abierto previamente. Ya que tenemos nuestros handlers, tenemos que crear nuestro `MultiWriterHandler`!!! Si! Justo el handler custom que implementamos a lo largo del articulo. Como recordaras, el toma como argumentos todos los handlers que queramos, asi que lo instanciamos pasandole los 3 handlers definidos previamente; y, para finalizar, creamos un `logger` que utiliza nuestra instancia de multiWriterHandler. Como prueba sencilla, escribimos 3 con diferentes log levels y mensajes.

Ejecutemos nuestro programita usando `go run ./main.go` y veamos que ocurre... En consola se mostraron 3 pares de mensajes; cada uno correspondiente a cada log de nuestro programa. Se diferencian porque unos mensajes estan en formato de texto plano y otros en json... Es decir, que efectivamente nuestro multi writer escribio los logs a traves del `textConsoleHandler` y del `jsonConsoleHandler`. Por otro lado, si vemos nuestro sistema de archivos, tendremos el archivo `logs.json`; cuyo contenido constara de 3 logs en formato `json`; confirmando que tambien nuestro multi writer escribio esos logs en el archivo.

---

Con esto, queda listo nuestro MultiWriterHandler; una pequena implementacion custom de un `Handler` para los loggers basados en el paquete estandar `slog` de Golang. Con el, podremos escribir logs en cuantos lugares queramos con los formatos que queramos! Siempre y cuando todas las implementaciones satisfagan la interfaz `Handler`. 

Honestamente Golang me encanta; el hecho de que otorgue esta facilidad para poder integrarte con recursos de los paquetes de la libreria estandar es sumamente valioso! Ademas que, como puedes notar, la implementacion en si fue absurdamente sencilla.

Espero hayas disfrutado de este articulo! Nos vemos pronto... Happy hacking!