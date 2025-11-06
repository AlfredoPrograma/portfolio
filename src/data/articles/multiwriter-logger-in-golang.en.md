---
lang: "en"
slug: "multiwriter-logger-in-golang"
canonicalSlug: "multiwriter-logger-in-golang"
title: "How to Implement a MultiWriter logger in Golang"
date: "2025-11-05"
excerpt: "Learn step by step how to create a MultiWriter logger in Golang to write logs to multiple destinations simultaneously using slog."
tags: ["Golang"]
---

A couple of days ago, I needed to make an adjustment to the *logger* of an application written in **Golang**. In short, I needed to write logs to a file on disk persistently, while still maintaining the output in the terminal so I could debug and visualize in real time what was happening with my application during local development.

To my surprise, **Golang doesn’t offer a direct way to write logs to multiple destinations simultaneously**. My first approach was to create two *logger* instances and wrap the most common methods to distribute the writing between both destinations. However, I was left wondering: *“There must be a more elegant and flexible way to do this.”*

So, I decided to review the official documentation and explore the `slog` package until I found an interesting way to achieve it.

## *Handlers*: the heart of loggers

A *handler* is simply a concrete implementation of **how logs should be processed and emitted**. Each *handler* encapsulates the logic for *how* and *where* to write the logs, allowing transformations and defining their output destination anywhere (as long as that destination is an `io.Writer`).

`slog` allows you to instantiate some default *handlers* that format logs into common structures like **JSON** or plain text. To do so, you can use the functions `NewJSONHandler` and `NewTextHandler`, which create *handlers* with those formats respectively.

The good news is that **the `Handler` interface is public**, meaning we can **create our own custom implementations** based on the project’s needs. Some ideas that came to mind were:

* A *handler* that writes logs directly through a **TCP socket**.
* Another one that sends them directly to a monitoring service like **Grafana**.
* Or, as we’ll see today: **a handler that replicates logs to multiple destinations**... Something like a *handler of handlers*. It sounds strange, but you’ll see that it makes perfect sense.

## A *handler* of *handlers*

In our case, we don’t need a *handler* that modifies the log information or formats it in a particular way. What we really want is a *handler* that **distributes logs among several destinations**.

That’s the key: we’ll build a *handler of handlers*. Broadly speaking, our main *handler* will take a list of secondary *handlers* and, each time a log is recorded, it will iterate through that list and write the log to each one. 

## Defining the `MultiWriterHandler`

Let’s start with the base structure that will implement the methods of the `Handler` interface:

```go
package main

type MultiWriterHandler struct {
  handlers []slog.Handler
}

func NewMultiWriterHandler(handlers ...slog.Handler) *MultiWriterHandler {
  return &MultiWriterHandler{handlers: handlers}
}
```

Our *handler* simply stores a *slice* with all the `handlers` where logs will be distributed.
Following the earlier example, this *slice* could contain a `TextHandler` and a `JSONHandler` to write to both simultaneously.

To make it compatible with `slog` and comply with the `Handler` interface, we must implement four key methods:

* `Enabled`
* `Handle`
* `WithAttrs`
* `WithGroup`

Let’s go through each one step by step.

## `Enabled`: should I write this log?

This method determines whether the *handler* should record the log based on its severity level.
For example, if the severity level is `Error`, logs with lower severity levels (`Info`, `Debug`, `Warn`) will be ignored.

In our case, we want the `MultiWriterHandler` to write only if **all internal handlers** are enabled for the given severity level:

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

This way, the log will only be written if all destinations accept it, ensuring that records are consistent across all configured *handlers* and outputs.

## `Handle`: writing the log

The `Handle` method executes the logic for writing the log entry. This is where the transformation of the log content into the desired format happens.
For instance, the *JSON handler* converts the information to JSON format within this method.

Here’s the implementation:

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

Our `MultiWriterHandler` **does not perform transformations**; it simply iterates over the list of *handlers* and executes their `Handle` method so each one processes the log in its own way.

An important detail is that the `record`, which represents the log information, **is cloned** before being sent to each *handler*. This prevents interference since some may modify the record internally.

## `WithAttrs` and `WithGroup`: adding context

These two methods allow you to **inject persistent metadata** into the logs:

* `WithAttrs`: adds fixed attributes to the log.
* `WithGroup`: groups attributes under the same key.

Example with `WithAttrs`:

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

And with `WithGroup`:

```go
jsonHandler := slog.NewJSONHandler(os.Stdout, nil)
groupJsonHandler := jsonHandler.WithGroup("parent")
logger := slog.New(groupJsonHandler)
logger.Info("Informative message", "hello", "world", "name", "john doe")

// Output:
// {"time":"2025-11-04T12:39:52.489122648-04:00","level":"INFO","msg":"Informative message","parent":{"hello":"world","name":"john doe"}}
```

Both methods improve the structure and readability of log data, so let’s implement them in our `MultiWriterHandler`:

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

Each method creates a new `MultiWriterHandler` with the modified *handlers*, maintaining composition and adding attributes or groups to all destinations.

## Putting the MultiWriter to work

It’s time to test it.
We’re going to write logs to three different places and formats:

1. **Console (plain text)**
2. **Console (JSON)**
3. **File (JSON)**

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

When running:

```bash
go run ./main.go
```

You’ll see the logs printed in the console both as plain text and JSON, and the `logs.json` file will contain the same entries.

**A single logger, multiple synchronized outputs.**

---

With this, we have a fully functional **`MultiWriterHandler`**: a custom implementation of the `slog` `Handler` interface capable of writing to multiple destinations simultaneously.

Its main advantages are:

* Centralizes log handling.
* Avoids duplication of instances.
* Maintains consistency across outputs.
* Is easily extensible.

**Golang** shines precisely because of this: its ability to *extend and integrate* the standard library without losing simplicity.
