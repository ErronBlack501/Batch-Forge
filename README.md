# BatchForge

High-performance document generation API built with [Fastify](https://fastify.dev?utm_source=chatgpt.com), TypeScript, BullMQ, Redis, MongoDB, and Worker Threads.

BatchForge is designed to process large-scale PDF generation workloads (1000+ documents per batch) with concurrency control, retries, observability, and resilience.

---

## 🚀 Features

* ⚡ Fastify + TypeScript backend
* 📦 BullMQ queue processing
* 🧵 Worker Threads for parallel PDF generation
* 🗄 MongoDB + GridFS PDF storage
* 🔁 Retry mechanism with exponential backoff
* 🛡 Circuit breaker support
* 📊 Prometheus metrics
* 🪵 Structured JSON logging with Pino
* ❤️ Health checks
* 🐳 Docker Compose ready
* 📘 Swagger/OpenAPI documentation
* 🔥 High concurrency batch processing

---

## 🏗 Architecture

```text id="eqtv1w"
Client
  │
  ▼
Fastify API
  │
  ├── MongoDB (batches/documents)
  │
  ├── Redis Queue (BullMQ)
  │
  ▼
Workers
  │
  ├── Worker Threads
  │
  ▼
PDF Generation
  │
  ▼
GridFS Storage
```

---

## 📡 API Endpoints

## Create Batch

### POST `/api/documents/batch`

Creates a batch of asynchronous PDF generation jobs.

### Request

```json id="6vce35"
{
  "userIds": ["u1", "u2", "u3"]
}
```

### Response

```json id="u6m5d2"
{
  "batchId": "batch_123",
  "status": "processing"
}
```

---

## Get Batch Status

### GET `/api/documents/batch/:batchId`

Returns batch progress and generated documents.

### Response2

```json id="a2qf5o"
{
  "batchId": "batch_123",
  "status": "processing",
  "progress": {
    "total": 1000,
    "done": 532,
    "failed": 2
  }
}
```

---

## Download PDF

### GET `/api/documents/:documentId`

Streams generated PDF from GridFS.

---

## Health Check

### GET `/health`

Checks:

* MongoDB
* Redis
* Queue health

---

## Metrics Endpoint

### GET `/metrics`

Prometheus-compatible metrics endpoint.

---

## ⚙️ Tech Stack

## Backend

* [Fastify](https://fastify.dev?utm_source=chatgpt.com)
* TypeScript
* [BullMQ](https://bullmq.io?utm_source=chatgpt.com)
* [MongoDB](https://www.mongodb.com?utm_source=chatgpt.com)
* [Redis](https://redis.io?utm_source=chatgpt.com)

## Observability

* [Prometheus](https://prometheus.io?utm_source=chatgpt.com)
* [Grafana](https://grafana.com?utm_source=chatgpt.com)
* [Pino](https://getpino.io?utm_source=chatgpt.com)

## Infrastructure

* [Docker](https://www.docker.com?utm_source=chatgpt.com)
* [Docker Compose](https://docs.docker.com/compose?utm_source=chatgpt.com)

---

## 📂 Project Structure

```text id="sv98l8"
src/
├── app.ts
├── server.ts
│
├── plugins/
│   ├── redis.ts
│   ├── mongo.ts
│   ├── queue.ts
│   ├── swagger.ts
│   └── metrics.ts
│
├── modules/
│   ├── documents/
│   ├── batch/
│   └── health/
│
├── workers/
│   └── pdf.worker.ts
│
├── jobs/
│   └── document.job.ts
│
├── utils/
│   ├── logger.ts
│   ├── circuitBreaker.ts
│   └── pdfGenerator.ts
```

---

## 🧵 Batch Processing Flow

```text id="z8g82x"
POST /batch
    │
    ▼
Create batch in MongoDB
    │
    ▼
Push jobs into BullMQ queue
    │
    ▼
Workers consume jobs
    │
    ▼
Worker thread generates PDF
    │
    ▼
Store PDF in GridFS
    │
    ▼
Update batch progress
```

---

## 📊 Metrics

Exposed metrics:

* `documents_generated_total`
* `batch_processing_duration_seconds`
* `queue_size`

---

## 🛡 Resilience

* Retry strategy with exponential backoff
* Graceful shutdown support
* Redis failure fallback
* MongoDB connection checks
* PDF generation timeout protection
* Circuit breaker for external services

---

## 🐳 Running with Docker

## Start services

```bash id="k1eqo4"
docker compose up --build
```

Services:

* API
* Redis
* MongoDB

---

## 🧪 Local Development

## Install dependencies

```bash id="evnglz"
pnpm install
```

## Run development server

```bash id="dj4m7i"
pnpm dev
```

---

## 🧪 Benchmark

Run benchmark script:

```bash id="sm6stl"
pnpm benchmark
```

Measures:

* total processing time
* throughput
* memory usage
* CPU usage
* documents/second

---

## 📘 Swagger Documentation

Swagger UI available at:

```text id="oh8vvq"
/documentation
```

---

## 🔐 Security

* Request validation
* Rate limiting
* Secure HTTP headers
* Environment variable isolation
* Structured logging

---

## 🧠 Technical Choices

## Why Fastify?

* High performance
* Native schema validation
* Excellent TypeScript support
* Plugin-based architecture

## Why BullMQ?

* Reliable distributed queue
* Retry and backoff support
* Concurrency control
* Redis-based scalability

## Why GridFS?

* Efficient large file storage
* Native MongoDB integration
* Streaming support

## Why Worker Threads?

* Parallel CPU-intensive PDF generation
* Better resource utilization
* Prevents main event loop blocking

---

## 📄 License

MIT License.
