# Gourmet Go — Distributed Order System

A microservices demo built around the **Saga orchestration pattern**. An order flows through three independent services coordinated by a central orchestrator over gRPC.

## Architecture

```
Browser (Next.js : 3000)
        │  REST
        ▼
order-orchestrator (: 8083)
        │  gRPC
   ┌────┼────┐
   ▼    ▼    ▼
order  kitchen  accounting
(8080) (8081)   (8082)
(50051)(50052)  (50053)
   │    │        │
  PG   PG       PG
```

The orchestrator runs a **4-step saga**:

1. Create order → `APPROVAL_PENDING`
2. Create kitchen ticket
3. Authorize payment (rejected if amount ≥ 100)
4. Happy path — confirm ticket + payment → `APPROVED`  
   Failure path — compensate ticket + order → `REJECTED`

## Stack

| Layer | Technology |
|---|---|
| Services | Java 17, Spring Boot 3, gRPC (protobuf) |
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind |
| Database | PostgreSQL 16 (one DB per service) |
| Observability | Prometheus, Grafana |
| Build | Maven multi-module, pnpm |
| CI/CD | GitHub Actions → Docker Hub |

## Running locally

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Orchestrator API | http://localhost:8083/api/orders |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 (admin / admin) |

### Recommended Grafana dashboards

Import these by ID from **Dashboards → Import**:

| ID | Name | What it shows |
|---|---|---|
| `4701` | JVM (Micrometer) | Heap, GC pauses, thread pools per service |
| `19004` | Spring Boot 3.x Statistics | HTTP request rate, p95 latency, error rate |
| `12900` | Spring Boot APM | Side-by-side service comparison |

## API

**Place an order**
```
POST /api/orders
{ "customerId": "alice", "amount": 49.99, "deliveryAddress": "12 Rue Gafsa" }
```

**Get an order**
```
GET /api/orders/{orderId}
```

## CI/CD

Every push to `main`:

1. Builds and tests all Java modules (Maven + PostgreSQL service container)
2. Type-checks, lints, and builds the Next.js frontend
3. Builds and pushes five Docker images to Docker Hub tagged `YYYYMMDDHHmmss-<sha7>` (parallel matrix)
4. Pins the new tags in `docker-compose.prod.yml` and commits `[skip ci]`

Required secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`.

## Production

```bash
docker compose -f docker-compose.prod.yml up
```

Images are pinned to the last successful CI run by the CD pipeline.
