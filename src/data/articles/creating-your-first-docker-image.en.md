---
lang: "en"
slug: "creating-your-first-docker-image"
canonicalSlug: "creating-your-first-docker-image"
title: "Create your first Docker image"
date: "2025-10-20"
excerpt: "Learn how to containerize your application by building your first Docker image."
tags: ["Docker", "Containers", "Golang"]
---

In modern application development, one of the most popular tools for simplifying deployment and cross-environment distribution is Docker.

Docker is a containerization platform that lets you package an application together with its dependencies inside an isolated and reproducible environment called a container. Each container runs from an image, which defines step by step how that runtime environment will be built.

In short, an image is a recipe, and a container is that recipe running in production.

## Building the Application to Containerize

We are going to create a small HTTP server written in Go that will serve as the example application for generating and testing our Docker image:

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

This application listens on port `8080` and responds to `GET /` requests with the following JSON payload:

```json
{ "message": "hello world" }
```

The next step is to containerize this application, meaning we will build an image that lets us run the same program identically in any environment.

## Creating the Recipe for Our Container

The instructions that describe how to build the container are defined in a file named `Dockerfile`. It specifies the sequence of steps required to prepare the runtime environment with all the dependencies and configuration needed for the application to work correctly. These instructions rely on specific keywords documented in the [official Dockerfile reference](https://docs.docker.com/reference/dockerfile/).

As a starting point, we will build a simple yet powerful Dockerfile that makes generating an image straightforward and efficient.

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

## Understanding the Builder Stage

Let us break down the Dockerfile, starting with the builder stage:

1. `FROM golang:1.25-trixie AS builder`: Sets the base image we use to compile the application. Here we rely on the official `golang:1.25-trixie` image, which includes a Debian 13 environment with the Go toolchain. These dependencies are necessary to compile the application. We name this stage `builder` because it focuses exclusively on producing the binary (the name can be anything).
2. `WORKDIR /app`: Defines `/app` as the working directory inside the container, meaning Docker runs all subsequent commands relative to that path.
3. `COPY . .`: Copies the contents of our current source directory into `/app` within the container.
4. `RUN CGO_ENABLED=0 GOOS=linux go build -o main .`: Executes the `go build` command, which compiles the code into a binary. The command is preceded by some commonly used environment variables:
   - `CGO_ENABLED=0` disables dependencies on C libraries, which are unnecessary for this build.
   - `GOOS=linux` targets Linux as the operating system.
   - `go build -o main .` generates the binary and names it `main`.

After this step, the builder stage leaves us with a ready-to-run binary.

## Understanding the Runner Stage

Next we define the second stage, named `runner`, which contains only what we need to execute the program:

1. `FROM alpine:3.21 AS runner`: Uses the `alpine:3.21` base image, a minimalist Linux distribution ideal for creating lightweight, secure images. At this stage we no longer need the Go compiler or any build tooling; we only require the binary and the runtime dependencies for the application.
2. `WORKDIR /app`: Again sets `/app` as the working directory.
3. `COPY --from=builder /app/main ./main`: Copies the binary produced in the builder stage into the runner stage. The `--from=builder` flag tells Docker to fetch the file from that previous stage.
4. `CMD ["./main"]`: Specifies the command to run when a container starts from this image. Here, it executes our `main` binary.

That is it! We just defined the recipe for our application image. A Dockerfile is essentially an ordered list of steps that specify how to build the environment where the application will run. You will notice that construction happens in two stages; this pattern is known as a multi-stage build and is standard practice for application images.

This approach serves multiple purposes, one of the most common being to separate the compile phase from the run phase. As a result, the final image is smaller, and the runtime environment contains only what is strictly necessary for the application to function correctly.

## Let Us Build the Image

With the Dockerfile ready, we can now build the image by running the following command from the project directory:

```sh
docker build -t myapp .
```

While the command runs, you will see a series of steps in the terminal corresponding to the Dockerfile instructions: Docker pulls the base images, copies files, compiles the binary, and finally produces a new image named `myapp`.

If everything completes successfully, we will have a ready-to-use image. To test it, run:

```sh
docker run -p 8080:8080 myapp
```

This command tells Docker to start a container from the `myapp` image and expose port 8080 in the container on port 8080 of your local machine. Containers run in an isolated network by default, so exposing the port explicitly is necessary to issue HTTP requests to `localhost:8080` and have them routed to the container.

```sh
curl localhost:8080
```

You should receive the JSON response from your application:

```json
{ "message": "hello world" }
```

---

Congratulations! You have built and run your first Docker image. Anyone who wants to run this application no longer needs to install extra dependencies, the Go toolchain, or any specific environment version. They only need Docker and access to the image to run it locally.

Now, how could we share this image with other teammates so they can run the application too? That is where image repositories, also known as registries, come into play—they store and distribute images easily.

We will explore some of them in upcoming articles, so stay tuned!
