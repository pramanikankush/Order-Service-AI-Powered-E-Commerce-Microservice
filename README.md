# Order Service — AI-Powered E-Commerce Microservice

[![Java](https://img.shields.io/badge/Java-21-blue)](https://adoptium.net)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+%2F%20pgvector-316192)](https://www.postgresql.org)
[![Kafka](https://img.shields.io/badge/Kafka-3.x-231F20)](https://kafka.apache.org)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF)](https://vitejs.dev)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A production-grade full-stack microservice that implements a real-world e-commerce order system with **AI-powered semantic product recommendations**, **transactional outbox pattern**, **pessimistic inventory locking**, and a **React + Tailwind** frontend. Runs entirely on local infrastructure — no cloud dependencies.

---

## Architecture at a Glance

```
Client (React + Vite + Tailwind)
   │  X-Owner-Key header (identity)
   ▼
Spring Boot REST (Controllers + MapStruct DTOs)
   │
   ├── OrderService ─── @Transactional + PESSIMISTIC_WRITE on inventory
   │                        ↓ atomic outbox event
   ├── CartService
   ├── ProductService ──── EmbeddingService ── Resilience4j (CB + retry)
   │                                            └── Ollama (local, nomic-embed-text)
   │
   ├── PostgreSQL 16 + pgvector
   │      ├── JPA entities (products, inventory, carts, orders, outbox)
   │      ├── HNSW index for cosine-similarity ANN queries
   │      └── Flyway migrations (version-controlled schema + seed data)
   │
   └── OutboxPublisher (SKIP LOCKED poller) ──► Kafka (order-created topic)
```

---

## ✨ Features

### Backend (Spring Boot 3.3 / Java 21)

| Feature | Implementation | Why |
|---|---|---|
| **Product Catalog** | Full CRUD with JPA auditing, optimistic locking, SKU uniqueness | Manage inventory with versioned updates |
| **Pessimistic Inventory Locking** | `SELECT ... FOR UPDATE` on stock rows during checkout | Prevents overselling under concurrent checkouts |
| **Transactional Outbox** | Order + `outbox_event` written atomically in one Postgres transaction | Reliable Kafka publishing without 2PC or distributed transactions |
| **SKIP LOCKED Poller** | Multiple app instances drain outbox rows concurrently | Horizontal scaling with zero coordination |
| **Semantic Similarity** | Local Ollama embeddings (`nomic-embed-text`, 768-dim) stored in pgvector with HNSW index | Free, private, on-prem AI recommendations |
| **Resilience4j** | Circuit breaker + retry + time-limiter around every AI/embedding call | AI slowness never blocks user-facing writes |
| **Flyway Migrations** | Version-controlled SQL with seed data | Reproducible schema across dev/CI/prod |
| **OpenAPI / Swagger** | Springdoc auto-generated docs at `/swagger-ui.html` | Interactive API exploration |
| **Actuator** | Health, info, metrics endpoints | Production observability |
| **Testcontainers** | Integration tests against real pgvector Postgres + Kafka | Catches migration bugs without flaky mocks |

### Frontend (React 19 / Vite 7 / Tailwind 4)

| Page | Features |
|---|---|
| **Landing** | Hero, tech strip, feature grid, architecture diagram, dependency explanations, CTA |
| **Products** | Grid/table view, live search, category filter, CRUD with modals, stock badges, embedding status, add to cart |
| **Similar Products** | Semantic similarity view with animated similarity bars, cosine scores, product detail |
| **Cart** | Quantity controls, line totals, shipping form, tax/shipping breakdown, place order |
| **Orders** | Expandable order cards with timeline, status pills, item list, shipping info |
| **Demo Fallback** | Full in-memory demo mode when backend is unreachable (localStorage-backed) |

### State Management
- **Zustand** for backend-availability detection and owner-key
- **Framer Motion** for page transitions, hover effects, micro-animations
- **Sonner** for toast notifications
- **Axios** with automatic retry for idempotent requests

---

## Tech Stack

### Backend
| Dependency | Version | Purpose |
|---|---|---|
| Java 21 | LTS | Modern language features, virtual threads |
| Spring Boot 3.3.4 | 3.3.4 | REST framework, JPA, validation, AOP |
| PostgreSQL + pgvector | 16 / 0.1.6 | Operational DB + vector similarity search |
| Apache Kafka | 3.x | Event streaming for order-created events |
| Spring AI (Ollama) | 1.0.0-M3 | Local embeddings via Ollama |
| Resilience4j | 2.2.0 | Circuit breaker, retry, time-limiter |
| Flyway | 10.x | Database migrations |
| MapStruct | 1.6.2 | Type-safe DTO mapping |
| Lombok | 1.18.34 | Boilerplate reduction |
| Hypersistence Utils | 3.8.3 | Hibernate vector type support |
| Springdoc OpenAPI | 2.6.0 | Swagger UI docs |
| Testcontainers | 1.20.2 | Integration testing with real infra |

### Frontend
| Dependency | Version | Purpose |
|---|---|---|
| React | 19.2.6 | UI framework |
| TypeScript | 5.9.3 | Type safety |
| Vite | 7.3.2 | Build tool and dev server |
| Tailwind CSS | 4.1.17 | Utility-first styling |
| Framer Motion | 12.40.0 | Animation library |
| React Router | 7.16.0 | Client-side routing |
| Zustand | 5.0.14 | Lightweight state management |
| Axios | 1.16.1 | HTTP client |
| Lucide React | 1.17.0 | Icon library |
| Sonner | 2.0.7 | Toast notifications |
| clsx + tailwind-merge | — | Class name utilities |

---

## Quick Start

### Prerequisites
- **Docker Desktop** (for backend infrastructure)
- **Node.js 22+** (for frontend)
- **Java 21** (for local backend dev, optional if using Docker)

### Run Everything

```bash
# 1. Clone and start the backend (Postgres + Kafka + Ollama + app)
cd backend
docker compose up --build
# Backend: http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui.html

# 2. In a separate terminal, start the frontend
npm install
npm run dev
# Frontend: http://localhost:5173
```

The frontend auto-detects the backend. If it's unreachable, it falls back to a full **in-memory demo mode** (localStorage-backed).

### Run Just the Frontend (Demo Mode)

```bash
npm install
npm run dev
# → http://localhost:5173
# App works with seeded demo data in memory
```

### Run Backend Locally (Outside Docker)

```bash
# Start infrastructure only
cd backend
docker compose up postgres kafka zookeeper ollama

# Boot the app with Maven
./mvnw spring-boot:run
```

---

## API Reference

All endpoints are prefixed with `/api`. Identity is passed via the `X-Owner-Key` header (default: `anonymous`).

### Products

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List all products |
| `POST` | `/api/products` | Create a product |
| `GET` | `/api/products/{id}` | Get product by ID |
| `PUT` | `/api/products/{id}` | Update product |
| `DELETE` | `/api/products/{id}` | Delete product |
| `GET` | `/api/products/{id}/similar?topK=5` | Top-K similar products by cosine similarity |

### Cart

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cart` | Get current cart |
| `POST` | `/api/cart/items` | Add item to cart |
| `PUT` | `/api/cart/items/{id}?quantity=N` | Update item quantity |
| `DELETE` | `/api/cart/items/{id}` | Remove item from cart |

### Orders

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/orders` | Place order (requires shipping address) |
| `GET` | `/api/orders` | List all orders |
| `GET` | `/api/orders/{id}` | Get order details |

### System

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/swagger-ui.html` | Swagger UI |
| `GET` | `/actuator/health` | Actuator health |

---

## Database Schema (PostgreSQL + pgvector)

```
products
├── id (UUID PK)
├── sku (unique)
├── title, description, category
├── price (NUMERIC), image_url
├── embedding (vector(768)) ← nomic-embed-text
├── created_at, updated_at, version
└── HNSW index on embedding (vector_cosine_ops)

inventory
├── id (UUID PK)
├── product_id (unique FK → products)
├── quantity, reserved
├── updated_at, version
└── CHECK (quantity >= 0, reserved <= quantity)

carts / cart_items
├── owner_key (unique)
└── items with product FK, unit_price, quantity

orders / order_items
├── order_number (unique), owner_key, status
├── items with snapshot of SKU, title, price
└── shipping_address, notes

outbox_events
├── aggregate_type, aggregate_id, event_type
├── payload (JSONB), topic
├── status (PENDING / PUBLISHED / FAILED), retry_count
└── index on (created_at) WHERE status = 'PENDING'
```

---

## Key Architectural Decisions

### Transactional Outbox Pattern
Orders and outbox events are written in the **same database transaction**. The `OutboxPublisher` polls for `PENDING` events using `SELECT ... FOR UPDATE SKIP LOCKED`, publishes them to Kafka (`order-created` topic), and marks them as `PUBLISHED`. This ensures **at-least-once delivery** without distributed transactions.

### Pessimistic Inventory Locking
During checkout, `InventoryRepository` locks the product's inventory row with `PESSIMISTIC_WRITE` (`SELECT ... FOR UPDATE`). This serializes concurrent checkout attempts on the same product, preventing overselling. Lock timeout is 5 seconds.

### Local AI Embeddings
Product descriptions are embedded using **Ollama** running `nomic-embed-text` (768-dimensional vectors). Embeddings are stored directly in PostgreSQL via **pgvector** with an **HNSW index** for approximate nearest-neighbor search. A **Resilience4j circuit breaker** wraps the Ollama call — if Ollama is down, the embedding is skipped (returned as null) rather than failing the product write.

### SKIP LOCKED Outbox Poller
Multiple backend instances can drain the outbox table concurrently. Each instance grabs the next batch of pending events with `FOR UPDATE SKIP LOCKED`, ensuring every event is processed exactly once per instance without coordination.

---

## Testing

```bash
# Run backend integration tests (Testcontainers spins up real Postgres + Kafka)
cd backend
./mvnw test
```

Tests use **Testcontainers** with a real pgvector-enabled PostgreSQL container, avoiding the H2 incompatibility trap.

---

## Configuration

Key environment variables (see `backend/src/main/resources/application.yml`):

| Variable | Default | Description |
|---|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/orders` | PostgreSQL connection |
| `SPRING_DATASOURCE_USERNAME` | `ankush` | DB username |
| `SPRING_DATASOURCE_PASSWORD` | `ankush` | DB password |
| `SPRING_KAFKA_BOOTSTRAP_SERVERS` | `localhost:9092` | Kafka brokers |
| `SPRING_AI_OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server |
| `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173` | CORS origins |
| `VITE_API_BASE` | `http://localhost:8080/api` | Frontend API base URL |

---

## Project Structure

```
├── backend/
│   ├── src/main/java/com/ankush/orderservice/
│   │   ├── ai/EmbeddingService.java       # Ollama embedding client + Resilience4j
│   │   ├── config/                        # Web, Kafka, AI fallback config
│   │   ├── controller/                    # REST controllers
│   │   ├── dto/                           # Request/response DTOs
│   │   ├── entity/                        # JPA entities
│   │   ├── exception/                     # Domain exceptions + global handler
│   │   ├── kafka/                         # Outbox publisher, event sender
│   │   ├── mapper/                        # MapStruct mappers
│   │   ├── repository/                    # JPA + native query repos
│   │   ├── service/                       # Order, Cart, Product services
│   │   └── util/                          # ID generator, vector helpers
│   ├── src/main/resources/
│   │   ├── application.yml                # All configuration
│   │   └── db/migration/                  # Flyway V1 (schema) + V2 (seed)
│   ├── docker-compose.yml                 # Postgres + Kafka + Ollama + backend
│   ├── Dockerfile                         # Multi-stage build
│   └── pom.xml                            # Maven with all dependencies
│
├── src/
│   ├── components/                        # Navbar, ProductCard, ProductForm, Modal, etc.
│   ├── hooks/                             # useData (API + demo fallback), useBackendDetect
│   ├── pages/                             # Landing, Products, Cart, Orders, Similar
│   ├── services/                          # Axios client + in-memory demo store
│   ├── store/                             # Zustand UI store
│   ├── types/                             # TypeScript interfaces
│   ├── utils/                             # cn() utility (clsx + tailwind-merge)
│   ├── App.tsx                            # Router + Framer Motion transitions
│   ├── main.tsx                           # Entry point
│   └── index.css                          # Tailwind imports + global styles
│
├── index.html                             # Vite entry HTML
├── vite.config.ts                         # Vite + React + Tailwind + singlefile plugin
├── tsconfig.json                          # TypeScript config
└── package.json                           # Frontend dependencies + scripts
```

---

## Why This Stack

| Component | What | Why | Alternative |
|---|---|---|---|
| **Spring AI + Ollama** | Local LLM/embedding client | Free, private, on-prem | OpenAI/Gemini (paid, cloud) |
| **pgvector** | Vector extension for Postgres | Single DB for everything | Pinecone/Weaviate (managed, paid) |
| **Kafka + Outbox** | Durable event log + outbox | At-least-once delivery, no 2PC | Direct HTTP fan-out (lossy) |
| **Resilience4j** | Circuit breaker + retry | Protects against AI flakiness | Custom retries (no metrics) |
| **Flyway** | Versioned SQL migrations | Reproducible schema across envs | Hibernate auto-DDL (unsafe) |
| **Testcontainers** | Real infra in tests | Catches real integration bugs | H2 in-memory (incompatible with pgvector) |

---

## Build & Deploy

```bash
# Build JAR
cd backend
./mvnw clean package -DskipTests

# Build Docker image
docker build -t order-service backend/

# Run with Docker Compose (production-like)
cd backend
docker compose up --build
```

The backend Docker image uses a multi-stage build with Maven + JDK 21 for compilation and a slim JRE 21 runtime.

---

## License

MIT
#   O r d e r - S e r v i c e - A I - P o w e r e d - E - C o m m e r c e - M i c r o s e r v i c e  
 