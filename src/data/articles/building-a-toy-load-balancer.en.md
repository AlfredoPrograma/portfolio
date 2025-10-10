---
lang: "en"
slug: "building-a-toy-load-balancer-en"
canonicalSlug: "building-a-toy-load-balancer"
title: "Setting up load balancer with Docker"
date: "2025-06-29"
excerpt: "We'll explore how to setup a containerized load balancer to provide an evenly requests distribution among backend application replicas using Nginx and Docker."
tags: ["Nginx", "Docker", "Golang", "Containers"]
---

I have a backend for an e-commerce platform that handles all the business logic. It works well with our current customer base.

However, Black Friday is around the corner, and our sales team projects a tenfold increase in traffic.

This requirement was passed on to the development team, who proposed horizontally scaling the application by adding multiple replicas to handle the expected load.

Once the replicas were deployed, they noticed that although each replica responded correctly to requests, each one had a separate IP address. This meant we needed a mechanism to receive incoming requests and distribute them evenly among the replicas—a... load balancer.

## So, What Exactly Is a Load Balancer?

A load balancer is a software component that sits between your application's clients and its servers. Its main role is to receive client requests and consistently redistribute them across multiple backend servers. Think of it as a highway interchange that connects traffic to different destinations efficiently.

## Load Balancing Algorithms

The way a load balancer distributes requests can vary depending on the desired strategy. Some algorithms aim for even distribution, while others ensure that requests from the same client always go to the same server. These strategies are known as load balancing algorithms. The most common are:

- Round Robin: Requests are distributed cyclically across all servers, without any preference. If you have 3 servers, each incoming request goes to the next one in line. This ensures a fair and even distribution of traffic.

- Weighted: Each server is assigned a weight that defines how much traffic it should handle. This is useful when some servers have more resources than others. Requests are routed more frequently to more powerful servers.

- IP Hash: A hash is generated based on the client's IP address, creating a unique and consistent identifier. Requests from the same IP are always directed to the same server, ensuring session consistency.

## Hands On: Let's Build One

To better understand how load balancing works, let’s build a small lab. We’ll use:

- Go (Golang) to implement a simple HTTP server.
- Nginx as our load balancer.
- Docker to run everything in an isolated environment.

### Step 1: Creating Our Service

We’ll start by building a tiny HTTP server that simulates our application. It will expose a single endpoint that returns `"Hello World!"`.

```go
package main

import (
  "net/http"
)

func main() {
  http.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
    w.Write([]byte("Hello world!"))
  })

  // Start the HTTP server on port 80
  http.ListenAndServe("", nil)
}
```

### Step 2: Containerizing the Service

To simulate replicas, we’ll need to containerize our application. Let’s create a Docker image using the following Dockerfile:

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

### Step 3: Deploying Replicas

Now that we have our container image, let’s define how many replicas we want. Using Docker Compose, we can spin up multiple instances:

```yaml
services:
  api1:
    build: .
  api2:
    build: .
  api3:
    build: .
```

Here, we define 3 replicas named `api1`, `api2`, and `api3`, each built from the same Dockerfile.

### Step 4: Configuring the Load Balancer

Next, we configure Nginx to serve as the load balancer. It will listen on port `8080` and route incoming traffic to our services.

Here’s the `nginx.conf` file:

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

Let’s break it down:

* The `events` block is required by Nginx but doesn’t need any specific configuration here.
* Inside the `http` block:

  * We define an `upstream` group called `backend` that includes our three replicas.
  * The `location /` block tells Nginx to forward all requests to the upstream group.
  * The `add_header` directive adds a response header indicating which server handled the request.

Now, let’s add the Nginx service to our Docker Compose setup:

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

This sets up an Nginx container listening on port `8080`, using our custom configuration.

## Testing the Load Balancer

With everything in place, let’s spin up our environment:

```bash
docker compose up
```

Docker will build the services, launch the containers, and set up the network.

To test the setup, open another terminal and run:

```bash
curl -vvv localhost:8080
```

You should see a response like this:

```
< HTTP/1.1 200 OK
< Server: nginx/1.29.0
< X-Upstream-Addr: 172.23.0.2:80
Hello world!
```

If you repeat this command several times, you’ll notice that the `X-Upstream-Addr` changes with each request, cycling through the addresses of your replicas. Every three requests, the cycle resets, showing that Round Robin distribution is in action.
