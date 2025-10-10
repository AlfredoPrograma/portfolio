---
lang: "en"
slug: "spinning-up-kafka-producers-and-consumers"
canonicalSlug: "spinning-up-kafka"
title: "Setting up a Kafka event broker with producers and consumers"
date: "2025-10-09"
excerpt: "Learn the fundamentals of event streaming with Kafka and how to build producers and consumers in Go."
tags: ["Kafka", "Microservices", "Golang", "Docker"]
---

In software development, engineers are constantly exploring new ways to build scalable and resilient systems. They experiment with tools, frameworks, and architectures that, when effective, evolve into widely adopted patterns or paradigms across projects with similar needs.

One of these modern architectural patterns is event driven architecture and event streaming, which promotes building highly decoupled asynchronous systems. Each service operates independently, executing its own business logic while communicating with others through events. This approach enables greater scalability, reliability, and flexibility in distributed applications.

## What is Event Streaming

An event represents a unit of information produced by a producer, usually describing an action that has occurred in a system or application. In essence, an event captures something that happened, whether triggered by a user or by another service within the system.

Event streaming refers to the continuous flow of such events being published, transmitted, and processed across multiple applications. Each service can subscribe to specific streams of events and act upon them independently, without tight coupling to other components.

This decoupling allows each part of the system to handle its own responsibilities, improving maintainability and scalability.

## A Simple Example

Imagine a typical user registration flow in a web application. When a user signs up, the system might need to:

* Send a welcome email
* Subscribe the user to a newsletter
* Push a mobile notification with a discount code

In a monolithic setup, the user module would orchestrate all of these actions directly. Any change in one action could impact the entire registration process.

Now, in an event driven architecture, we approach this differently. Instead of directly invoking each action, the user service simply emits an event such as `UserRegistered`. Other independent services, such as email, newsletter, and notifications, listen to this event and perform their own tasks asynchronously. This model is cleaner, more flexible, and more scalable.

## Kafka as the Event Broker

At the center of this architecture lies the event broker, the “megaphone” that broadcasts events from producers to all interested consumers.

That is where Kafka comes in.

Apache Kafka is a distributed event streaming platform that acts as a central hub for real time data. It connects producers, which publish messages, with consumers, which process them. You can think of Kafka as a pipeline where data continuously flows between different services.

Kafka is built on a Publish Subscribe model, ensuring that events are reliably delivered and persistently stored. Unlike traditional message brokers such as RabbitMQ, which use a push based model, Kafka provides stronger guarantees around ordering, durability, and fault tolerance.

Another key differentiator is Kafka’s ability to persist messages. Events are stored in a distributed log, allowing consumers to replay or reprocess them if needed, an essential feature for debugging and data consistency.

## Running Kafka Locally

Let us spin up a local Kafka instance using Docker.
Below is a simple `docker compose.yml` configuration that starts a single node Kafka cluster:

```yaml
services:
  kafka_cluster:
    image: confluentinc/cp_kafka:8.0.1
    ports:
      - 9092:9092
    environment:
      CLUSTER_ID: an unique kafka cluster identifier
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_NODE_ID: 1
      KAFKA_LISTENERS: PLAINTEXT://kafka_cluster:29092,CONTROLLER://kafka_cluster:29093,PLAINTEXT_HOST://0.0.0.0:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka_cluster:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka_cluster:29093
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
```

It may look verbose, but these settings configure a Kafka broker that can self manage as a minimal cluster and act as an event broker locally. 
Once it is running, your local Kafka instance will be ready to handle event production and consumption.

## Building a Producer in Go

With our “megaphone” in place, let us build a producer, an application that sends events to Kafka.
We will use Go and the `confluent-kafka-go` package to connect and publish messages:

```go
package main

import (
  "errors"
  "io"
  "log"
  "net/http"

  "gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

var kafkaMainTopic = "main_topic"

func main() {
  producer, err := kafka.NewProducer(&kafka.ConfigMap{
    "bootstrap.servers": "localhost:9092",
    "client.id":         "kafka_producer_example",
  })
  if err != nil {
    log.Fatal("failed to initiate Kafka producer:", err)
  }

  http.HandleFunc("POST /", func(w http.ResponseWriter, r *http.Request) {
    event := make([]byte, 512)
    read, err := r.Body.Read(event)
    if err != nil && !errors.Is(err, io.EOF) {
      http.Error(w, "failed to read request body", http.StatusInternalServerError)
      return
    }

    err = producer.Produce(&kafka.Message{
      TopicPartition: kafka.TopicPartition{Topic: &kafkaMainTopic},
      Value:          event[:read],
    }, nil)
    if err != nil {
      http.Error(w, "failed to send event to Kafka", http.StatusInternalServerError)
      return
    }

    w.WriteHeader(http.StatusOK)
  })

  log.Println("Producer listening on port 8080")
  http.ListenAndServe(":8080", nil)
}
```

This simple HTTP server reads the request body and forwards it as a Kafka event.
In a production environment, you would typically define structured event payloads, for example using JSON schemas, but this minimal setup is enough to demonstrate the concept.

## Building a Consumer in Go

Now let us create a consumer to receive and process these events.
This service subscribes to the same topic and prints every message it receives:

```go
package main

import (
  "fmt"
  "log"

  "gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

var kafkaMainTopic = "main_topic"
var pollInterval = 100

func main() {
  consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
    "bootstrap.servers": "localhost:9092",
    "group.id":          "kafka_consumer_example",
  })
  if err != nil {
    log.Fatal("failed to initiate Kafka consumer:", err)
  }

  if err = consumer.SubscribeTopics([]string{kafkaMainTopic}, nil); err != nil {
    log.Fatalf("failed to subscribe to topic %s: %v", kafkaMainTopic, err)
  }

  for {
    event := consumer.Poll(pollInterval)
    switch e := event.(type) {
      case *kafka.Message:
        fmt.Printf("RECEIVED: %s\n", string(e.Value))
      default:
        continue
    }
  }
}
```

This consumer listens for events from the same Kafka topic and logs them to the console.
In a real system, each consumer would execute specific logic depending on the event type, such as sending emails, updating a database, or triggering another workflow.

---

Nice! You have just set up a complete local event driven workflow using Kafka and Go.
You now understand how producers, consumers, and the Kafka broker work together to enable scalable asynchronous communication.

This was only the beginning. Kafka offers far more powerful features such as topics, partitions, consumer groups, offsets, and retention policies that enable robust distributed processing at scale.

We will explore those advanced topics in future articles. See ya!
