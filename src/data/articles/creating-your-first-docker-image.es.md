---
lang: "es"
slug: "crea-tu-primera-imagen-de-docker" 
canonicalSlug: "creating-your-first-docker-image" 
title: "Crea tu primera imagen de Docker" 
date: "2025-10-20"
excerpt: "Aprende a containerizar tu aplicación construyendo tu primera imagen de Docker" 
tags: ["Docker", "Contenedores", "Golang"]
---

En el desarrollo moderno de aplicaciones, una de las herramientas más utilizadas para facilitar el despliegue y la distribución en diferentes entornos es Docker. 

Docker es una plataforma de containerización que permite empaquetar una aplicación junto con sus dependencias dentro de un entorno aislado y reproducible, llamado contenedor. Cada contenedor se ejecuta a partir de una imagen, la cual define paso a paso cómo se construirá ese entorno de ejecución. 

En pocas palabras, una imagen es una receta, y un contenedor es la instancia resultante de esa receta en funcionamiento.

## Construyendo la aplicación a containerizar

Vamos a crear un pequeño servidor HTTP en Golang, que servirá como ejemplo para generar y probar nuestra imagen de Docker:

```go
// main.go
package main

import (
	"encoding/json"
	"net/http"
)

func main() {
	http.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		content := map[string]any{
			"message": "hello world",
		}

		response, err := json.Marshal(content)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Header().Add("Content-Type", "application/json")
		w.Write(response)
	})

	http.ListenAndServe(":8080", nil)
}
```

Esta aplicación consiste en un programa sumamente simple que escucha en el puerto `8080` y responde a solicitudes `GET /` con un JSON como el siguiente:

```json
{ "message": "hello world" }
```

Ahora, el siguiente paso es containerizar esta aplicación, es decir, construir una imagen que nos permita ejecutar este mismo programa de manera idéntica en cualquier entorno. 

## Creando la receta para nuestro contenedor

Las instrucciones que determinan cómo construiremos el contenedor de nuestra aplicación se definen en un archivo llamado Dockerfile. En él se describe la secuencia de pasos necesarios para preparar el entorno de ejecución con todas las dependencias y configuraciones requeridas para que la aplicación funcione correctamente. Estas instrucciones se escriben utilizando una serie de palabras clave específicas definidas en la [documentación oficial de Docker](https://docs.docker.com/reference/dockerfile/).

Como punto de partida, construiremos un Dockerfile muy sencillo pero potente, que nos permita generar una imagen de manera fácil y eficiente.

```Dockerfile
FROM golang:1.25-trixie AS builder

WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:3.21 AS runner

WORKDIR /app
COPY --from=builder /app/main ./main
CMD ["./main"]
```

## Entendiendo la fase builder

Vamos a desmenuzar el Dockerfile y empecemos echándole un ojo a la fase builder:

1. `FROM golang:1.25-trixie AS builder`: Se define la imagen base desde la cual partimos para compilar nuestra aplicación. En este caso usamos la imagen oficial `golang:1.25-trixie`, que contiene un entorno Debian 13 con el toolchain de Go; ya que son dependencias necesarias para poder compilar la aplicación. La llamamos `builder` porque esta fase solo se encargará de compilar el binario (aunque se puede tener cualquier nombre).

2. `WORKDIR /app`: Establece `/app` como el directorio de trabajo dentro del contenedor. De esta forma Docker entiende que todas las instrucciones posteriores se deben ejecutar tomando como base en este directorio.

3. `COPY . .`: Copia el contenido del directorio actual del código fuente dentro del contenedor, concretamente en la carpeta `/app`.

4. `RUN CGO_ENABLED=0 GOOS=linux go build -o main .`: Ejecuta un comando; en este caso `go build`, que se encarga de compilar el código en un binario. Como puedes notar, el comando viene acompañado de la definición de algunas variables de entorno utilizadas comúnmente junto a `go build`. A continuación, un breve resumen de lo que hace cada una:
	- `CGO_ENABLED=0` deshabilita las dependencias en librerías de C ya que no son necesarias para compilar el codigó.  
	- `GOOS=linux` especifica el sistema operativo de destino.  
	- `go build -o main .` genera el binario con el nombre `main`.

Con esto, la fase `builder` nos deja un binario preparado y listo para ser ejecutado.

## Entendiendo la fase runner

A continuación definimos la segunda fase, llamada `runner`, que contendrá solo y exclusivamente lo necesario para ejecutar el programa:

1. `FROM alpine:3.21 AS runner`: Se define la imagen base `alpine:3.21`, una distribución de Linux minimalista, ideal para crear imágenes ligeras y seguras. En esta etapa ya no necesitamos el compilador de Golang ni ninguna otra herramienta o dependencia del sistema; únicamente necesitamos el binario y el entorno de ejecución necesario para poner en marcha nuestra aplicación.

2. `WORKDIR /app`: Nuevamente se establece a `/app` como el directorio de trabajo.

3. `COPY --from=builder /app/main ./main`: Se replica el binario generado en la etapa anterior (`builder`) dentro de esta nueva etapa. La opción `--from=builder` indica que el archivo proviene de esa fase previa.

4. `CMD ["./main"]`: Especifica el comando que se ejecutará al iniciar un contenedor basado en esta imagen. En este caso, se ejecutará nuestro binario `main`.

¡Listo! Acabamos de definir la receta de nuestra imagen de aplicación. Si prestas atención a cada línea, verás que un Dockerfile no es más que una lista ordenada de pasos que definen cómo construir el entorno donde la aplicación se ejecutará. También notarás que la construcción del entorno se divide en dos fases; esto se conoce como una imagen "multi-stage", y es un patrón estándar en la creación de imágenes para aplicaciones.

Este enfoque cumple múltiples propósitos, siendo uno de los más comunes separar el flujo de compilación del flujo de ejecución de la aplicación. De esta manera, garantizas que la imagen resultante sea mucho más pequeña, y que el entorno de ejecución contenga únicamente lo necesario para que la aplicación funcione correctamente.

## Construyamos la imagen

Con el `Dockerfile` preparado, ahora podemos construir la imagen ejecutando el siguiente comando desde el directorio donde se encuentra nuestro código:

```sh
docker build -t myapp .
```

Durante la ejecución del comando, verás una serie de pasos en la terminal que corresponden a las instrucciones del `Dockerfile`: Docker descargará las imágenes base, copiará los archivos, compilará el binario y finalmente generará una nueva imagen llamada `myapp`.

Si todo sale bien, tendremos nuestra imagen lista para usar. Para probarla, ejecuta:

```sh
docker run -p 8080:8080 myapp
```

Este comando indica a Docker que inicie un contenedor basado en la imagen myapp y que exponga el puerto 8080 dentro del contenedor al puerto 8080 de tu máquina local. Esto es necesario porque, por defecto, los contenedores se ejecutan en una red aislada, inaccesible desde el exterior, por lo que debemos exponer el puerto explícitamente para poder realizar solicitudes HTTP al puerto 8080 de nuestra máquina y que estas se redirijan al puerto 8080 dentro del contenedor.

```sh
curl localhost:8080
```

Deberías recibir la respuesta JSON de tu aplicación:

```json
{ "message": "hello world" }
```

---

¡Felicidades! Ya has construido y ejecutado tu primera imagen de Docker. Ahora, cualquiera que desee ejecutar esta aplicación no necesitará instalar dependencias adicionales, ni el toolchain de Go, ni una versión específica del entorno: solo necesitará tener Docker y acceso a la imagen para poder ejecutarla en su propio equipo.

Hmm... ¿cómo podríamos compartir nuestra imagen con otros colegas para que también puedan correr la aplicación? Para eso existen las plataformas conocidas como repositorios de imágenes o registries, que permiten almacenar y distribuir imágenes de forma sencilla.

Exploraremos algunas de ellas en próximos artículos, ¡así que mantente al tanto!