# Order Service — Backend

AI-powered E-Commerce Order Service.

## Stack
Java 21 · Spring Boot 3.3 · PostgreSQL 16 + pgvector · Kafka · Spring AI + Ollama · Resilience4j · Flyway · MapStruct · Testcontainers

## Run everything with Docker
```bash
cd backend
docker compose up --build
```

Services:
- Backend:    http://localhost:8080
- Swagger:    http://localhost:8080/swagger-ui.html
- Postgres:   localhost:5432
- Kafka:      localhost:9092
- Ollama:     http://localhost:11434

## Run backend locally (outside Docker)
```bash
# Postgres + Kafka + Ollama via compose (skip backend)
docker compose up postgres kafka zookeeper ollama

# Boot the app
./mvnw spring-boot:run
```

## Pull the embedding model (one time, if Ollama is already running)
```bash
docker exec -it order-ollama ollama pull nomic-embed-text
```

## Run tests
```bash
./mvnw test
```

## Key APIs
- `GET    /api/products`
- `POST   /api/products`
- `GET    /api/products/{id}/similar?topK=5`
- `POST   /api/cart/items`
- `GET    /api/cart`
- `POST   /api/orders`
- `GET    /api/orders`

## Architecture highlights
- **Outbox pattern** → `outbox_events` rows are written in the SAME transaction as orders,
  then drained to Kafka by `OutboxPublisher` using `SELECT ... FOR UPDATE SKIP LOCKED`.
- **Pessimistic inventory locking** → `InventoryRepository.findByProductIdForUpdate` uses
  `PESSIMISTIC_WRITE` (i.e. `SELECT ... FOR UPDATE`) so concurrent checkouts cannot oversell.
- **Embeddings** → generated via local Ollama (`nomic-embed-text`, 768-dim), stored in pgvector.
- **Similar products** → `VectorRepository` uses `<=>` (cosine) with an HNSW index for ANN.
- **Resilience4j** → `ollamaEmbedding` circuit breaker + retry + timelimiter with a fallback
  that returns a null embedding so product writes never fail because of AI.
