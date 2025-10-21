---
lang: "es"
slug: "configura-kafka-con-productores-y-consumidores"
canonicalSlug: "spinning-up-kafka"
title: "Configura un broker de eventos con Kafka, productores y consumidores"
date: "2025-10-09"
excerpt: "Entiende los fundamentos del event streaming con Kafka y cómo construir productores y consumidores en Golang."
tags: ["Kafka", "Microservicios", "Golang", "Docker"]
---

En el desarrollo de software buscamos constantemente nuevas formas de crear sistemas escalables y resilientes. Probamos herramientas, frameworks y arquitecturas que, cuando funcionan, se convierten en patrones repetibles para proyectos con necesidades similares.

Uno de esos patrones modernos es la arquitectura dirigida por eventos y el event streaming, donde cada servicio ejecuta su lógica de negocios de manera independiente y se coordina con el resto mediante eventos. Este enfoque permite aplicaciones más escalables, confiables y flexibles.

## ¿Qué es el event streaming?

Un evento representa una pieza de información producida por un emisor y describe algo que ocurrió dentro de un sistema. Puede originarse por una acción de un usuario o por otro servicio. El *event streaming* es el flujo continuo de esos eventos siendo publicados, transmitidos y procesados entre múltiples aplicaciones.

Como cada servicio consume sólo los eventos que necesita, el acoplamiento se reduce y cada parte del sistema puede evolucionar sin bloquear al resto.

## Un ejemplo rápido

Imagina el flujo de registro de usuarios en una aplicación web. Al registrarse, el sistema podría tener que:

- Enviar un correo de bienvenida
- Suscribir a la persona al boletín
- Disparar una notificación móvil con un código de descuento

En un enfoque monolítico, el módulo de usuarios se encargaría de todo, lo que complica el mantenimiento. Con eventos, el servicio de usuarios únicamente emite `UserRegistered` y los demás servicios reaccionan de forma asíncrona. El resultado es un sistema más limpio y escalable.

## Kafka como broker de eventos

El broker es el megáfono que transmite los eventos a todos los consumidores interesados. Ahí es donde entra Kafka.

Apache Kafka es una plataforma distribuida de event streaming que conecta productores (quienes publican mensajes) con consumidores (quienes los procesan). Funciona como un canal por donde los datos fluyen continuamente entre servicios.

Kafka está construido sobre un modelo publish/subscribe que garantiza entrega confiable y almacenamiento persistente. A diferencia de brokers tradicionales como RabbitMQ, ofrece garantías más fuertes sobre orden, durabilidad y tolerancia a fallos.

Otra ventaja es su capacidad de persistir mensajes en un log distribuido, lo cual permite reproducir eventos para depuración o reprocesamiento cuando sea necesario.

## Ejecutar Kafka localmente

Vamos a levantar Kafka con Docker. Este `docker compose.yml` inicia un clúster de un solo nodo:

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

La configuración se ve extensa, pero deja un broker auto-contenido listo para manejar producción y consumo de eventos en tu máquina.

## Construir un productor en Golang

Con el broker listo, creamos un productor que envía eventos usando `confluent-kafka-go`:

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

El servidor HTTP lee el cuerpo de la petición y lo publica como evento en Kafka. En producción conviene definir contratos más estrictos (por ejemplo JSON Schema), pero esto sirve para ilustrar el flujo.

## Construir un consumidor en Golang

Creamos ahora un consumidor que se suscribe al mismo tópico y procesa los mensajes:

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
        fmt.Printf("RECIBIDO: %s\n", string(e.Value))
      default:
        continue
    }
  }
}
```

Este consumidor imprime cada evento recibido. En un sistema real podrías enviar correos, actualizar una base de datos o disparar otro flujo según el tipo de evento.

---

Con esto tienes un flujo de eventos completo usando Kafka y Golang. Aprendiste cómo productores, consumidores y el broker se coordinan para habilitar comunicación asíncrona escalable.

Kafka ofrece muchas más capacidades: tópicos particionados, grupos de consumidores, manejo de offsets y políticas de retención, entre otras. Algunas de ellas las exploraremos en futuros artículo.
