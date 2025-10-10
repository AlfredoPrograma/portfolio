---
lang: "es"
slug: "building-a-toy-load-balancer-es"
canonicalSlug: "building-a-toy-load-balancer"
title: "Configurar un balanceador de carga con Docker"
date: "2025-06-29"
excerpt: "Exploramos cómo desplegar un balanceador de carga containerizado para distribuir peticiones entre réplicas de una aplicación usando Nginx y Docker."
tags: ["Nginx", "Docker", "Golang", "Contenedores"]
---

Tengo un backend para una tienda en línea que maneja toda la lógica de negocio y hasta ahora ha funcionado bien.

Pero se acerca el Black Friday y el equipo de ventas proyecta un incremento de tráfico de diez veces. El equipo de desarrollo propuso escalar horizontalmente la aplicación añadiendo varias réplicas para manejar la demanda.

Cuando las réplicas estuvieron listas, notamos que cada contenedor respondía correctamente, pero todos tenían direcciones IP diferentes. Necesitábamos un componente que recibiera las solicitudes entrantes y las distribuyera de forma uniforme. Necesitábamos un balanceador de carga.

## ¿Qué es un balanceador de carga?

Es un componente que se ubica entre los clientes y los servidores de tu aplicación. Recibe cada petición HTTP y decide a qué réplica enviarla. Es parecido a un distribuidor de tráfico que dirige autos a diferentes pistas según la carga.

## Algoritmos de balanceo

No todos los balanceadores reparten la carga igual. Dependiendo de la estrategia, pueden priorizar distribución uniforme o afinidad con el cliente. Estos son los algoritmos más comunes:

- **Round Robin**: envía las peticiones de manera cíclica a cada servidor, asegurando un reparto parejo.
- **Weighted**: asigna pesos a cada servidor según su capacidad. Los más potentes reciben más tráfico.
- **IP Hash**: genera un *hash* con la IP del cliente para que siempre caiga en la misma réplica, manteniendo afinidad de sesión.

## Manos a la obra

Para entender todo mejor armaremos un laboratorio con:

- Go para implementar un servicio HTTP mínimo.
- Nginx como balanceador.
- Docker para orquestar todo aislado.

### Paso 1: crear el servicio

Primero escribimos un servidor sencillo que responda `"Hello World!"`:

```go
package main

import (
  "net/http"
)

func main() {
  http.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
    w.Write([]byte("Hello world!"))
  })

  http.ListenAndServe("", nil)
}
```

### Paso 2: construir la imagen

Empaquetamos el servicio en un contenedor con este Dockerfile:

```docker
# Build binary
FROM golang:1.24.3-alpine3.22 AS builder

WORKDIR /app
COPY go.mod main.go ./
RUN go build -o main ./...

# Run application
FROM alpine:3.22 AS runner

COPY --from=builder ./app/main .
CMD ["./main"]
```

### Paso 3: correr réplicas

Definimos tres instancias en Docker Compose:

```yaml
services:
  api1:
    build: .
  api2:
    build: .
  api3:
    build: .
```

### Paso 4: configurar Nginx

Agregamos un contenedor con Nginx que reciba el tráfico en `8080`:

```nginx
events {}

http {
  upstream backend {
    server api1;
    server api2;
    server api3;
  }

  server {
    listen 80;

    location / {
      proxy_pass http://backend;
      add_header X-Upstream-Addr $upstream_addr;
    }
  }
}
```

Actualizamos `docker compose.yml` para incluir el balanceador:

```yaml
services:
  api1:
    build: .
  api2:
    build: .
  api3:
    build: .

  load-balancer:
    image: nginx:1.29.0
    ports:
      - 8080:80
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

## Probar el lab

Levantamos todo con:

```bash
docker compose up
```

En otra terminal ejecutamos:

```bash
curl -vvv localhost:8080
```

La respuesta se verá así:

```
< HTTP/1.1 200 OK
< Server: nginx/1.29.0
< X-Upstream-Addr: 172.23.0.2:80
Hello world!
```

Al repetir el comando observarás que `X-Upstream-Addr` rota entre las réplicas, demostrando el Round Robin en acción.

Con este laboratorio tienes un punto de partida para experimentar con balanceo de carga containerizado y ampliar la resiliencia de tus servicios.
