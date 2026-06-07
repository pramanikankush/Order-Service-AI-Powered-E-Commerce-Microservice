import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Boxes, Layers, Sparkles, Workflow, Zap, Cpu, Database, Network } from "lucide-react";

export function Landing() {
  return (
    <div className="flex flex-col">
      <Hero />
      <TechStrip />
      <Features />
      <Architecture />
      <Explanations />
      <CTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-28">
      <div className="absolute inset-0 -z-10 dot-grid opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-gradient-to-b from-indigo-50/50 via-transparent to-transparent" />

      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-zinc-600 backdrop-blur"
        >
          <Sparkles size={12} className="text-indigo-500" />
          Built with Spring Boot · pgvector · Ollama · Kafka
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-zinc-900 md:text-6xl lg:text-7xl"
        >
          An <span className="bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">AI-native</span> commerce
          <br className="hidden sm:block" />
          order service.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-zinc-500 md:text-lg"
        >
          Production-grade Java 21 microservice with transactional outbox, pessimistic inventory locking,
          local embeddings, and cosine-similarity product recommendations — paired with a premium React frontend.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/products"
            className="group inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
          >
            Explore products
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#architecture"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            View architecture
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-16 w-full max-w-3xl"
        >
          <CodeWindow />
        </motion.div>
      </div>
    </section>
  );
}

function CodeWindow() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_12px_50px_-20px_rgba(0,0,0,0.2)]">
      <div className="flex items-center gap-1.5 border-b border-zinc-100 px-4 py-3">
        <div className="size-2.5 rounded-full bg-rose-300" />
        <div className="size-2.5 rounded-full bg-amber-300" />
        <div className="size-2.5 rounded-full bg-emerald-300" />
        <div className="ml-3 text-[11px] font-medium text-zinc-400">POST /api/products → 201 Created</div>
      </div>
      <pre className="overflow-x-auto nice-scroll p-5 text-left text-[12.5px] leading-relaxed text-zinc-700">
{`{
  "sku": "KEY-001",
  "title": "Mechanical Keyboard 87-Key",
  "description": "Compact hot-swappable keyboard with RGB and PBT keycaps.",
  "category": "Keyboards",
  "price": 149.00,
  "stock": 50
}

// → Embedding generated locally via Ollama (nomic-embed-text, 768-dim)
// → Stored in pgvector. GET /products/{id}/similar returns top-5 matches.`}
      </pre>
    </div>
  );
}

function TechStrip() {
  const items = ["Java 21", "Spring Boot 3.3", "PostgreSQL 16", "pgvector", "Kafka", "Spring AI", "Ollama", "Resilience4j", "Flyway", "MapStruct", "React 18", "TypeScript"];
  return (
    <section className="border-y border-zinc-100 bg-white/60 py-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 text-[13px] font-medium text-zinc-500">
        {items.map(t => (
          <span key={t} className="inline-flex items-center gap-1.5">
            <span className="size-1 rounded-full bg-zinc-300" />
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: Boxes, title: "Catalog & Inventory", text: "Typed entities with JPA auditing, optimistic and pessimistic locking, and atomic stock decrements that prevent overselling under load." },
    { icon: Workflow, title: "Transactional Outbox", text: "Orders and outbox events are written in one Postgres transaction. A SKIP-LOCKED poller drains them to Kafka with at-least-once guarantees." },
    { icon: Sparkles, title: "Semantic Similarity", text: "Embeddings generated locally with Ollama's nomic-embed-text and stored in pgvector. Cosine similarity queries use an HNSW index." },
    { icon: Layers, title: "Resilience", text: "Resilience4j circuit breakers, retries and time-limiters protect every AI call. Failures never break the user's write path." },
    { icon: Zap, title: "Concurrency-safe", text: "SELECT ... FOR UPDATE on inventory. Deterministic productId ordering avoids deadlocks. 5s lock timeout keeps P99 bounded." },
    { icon: Cpu, title: "Enterprise Observability", text: "Actuator health, OpenAPI docs, and structured logs. Testcontainers integration tests prove every migration works." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Everything you expect.<br />Nothing you don't.</h2>
        <p className="mt-3 text-zinc-500">A single microservice that ships the patterns senior teams actually ask for in interviews — and production.</p>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(({ icon: Icon, title, text }) => (
          <motion.div
            key={title}
            whileHover={{ y: -3 }}
            className="rounded-2xl border border-zinc-200/70 bg-white p-6 transition-shadow hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)]"
          >
            <div className="grid size-9 place-items-center rounded-lg bg-zinc-900 text-white">
              <Icon size={16} />
            </div>
            <h3 className="mt-4 text-sm font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Architecture() {
  return (
    <section id="architecture" className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
            <Network size={12} /> Architecture
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">One service. Real patterns.</h2>
          <p className="mt-3 max-w-md text-zinc-500">
            A focused order-service microservice that wires together the canonical enterprise patterns in the
            simplest possible way — no Kubernetes required to reason about it.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-zinc-600">
            <Bullet>1. Client submits cart / checkout → controller delegates to service.</Bullet>
            <Bullet>2. Service locks inventory rows with SELECT ... FOR UPDATE.</Bullet>
            <Bullet>3. Order + OrderItems + OutboxEvent written atomically.</Bullet>
            <Bullet>4. OutboxPublisher drains rows to Kafka using SKIP LOCKED.</Bullet>
            <Bullet>5. Spring AI calls Ollama locally to embed new products into pgvector.</Bullet>
          </ul>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="space-y-3">
            <Row label="Client" desc="React + Vite + Tailwind" color="bg-indigo-500" />
            <Arrow />
            <Row label="Spring Boot REST" desc="Controllers + Validation + MapStruct DTOs" color="bg-zinc-900" />
            <Arrow />
            <div className="grid grid-cols-2 gap-3">
              <Row label="OrderService" desc="@Transactional + PESSIMISTIC_WRITE" color="bg-violet-500" />
              <Row label="EmbeddingService" desc="Resilience4j CB + retry" color="bg-fuchsia-500" />
            </div>
            <Arrow />
            <div className="grid grid-cols-2 gap-3">
              <Row label="PostgreSQL" desc="JPA + pgvector + Flyway" color="bg-emerald-500" />
              <Row label="Kafka" desc="Outbox relay → order-created" color="bg-amber-500" />
            </div>
            <Arrow />
            <Row label="Ollama (local)" desc="nomic-embed-text, 768-dim" color="bg-rose-500" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, desc, color }: { label: string; desc: string; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3">
      <div className={`size-2 rounded-full ${color}`} />
      <div className="flex-1">
        <div className="text-[13px] font-semibold text-zinc-900">{label}</div>
        <div className="text-[11.5px] text-zinc-500">{desc}</div>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center text-zinc-300">
      <svg width="10" height="14" viewBox="0 0 10 14" fill="none"><path d="M5 0v13M1 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-zinc-400" />
      <span>{children}</span>
    </li>
  );
}

function Explanations() {
  const deps = [
    { name: "Spring AI + Ollama", what: "Unified LLM/embedding client for Spring that talks to a local Ollama instance.", why: "Gives us free, private, on-prem embeddings — no OpenAI bills, no egress.", alt: "OpenAI / Gemini (paid, cloud-only)." },
    { name: "pgvector", what: "PostgreSQL extension that stores vectors and supports similarity indexes (HNSW, IVFFlat).", why: "Keeps embeddings, products, and orders in one database. No new infra to operate.", alt: "Pinecone / Weaviate (managed, paid, operational overhead)." },
    { name: "Kafka + Outbox", what: "Durable event log + transactional outbox pattern.", why: "Decouples order placement from downstream consumers with at-least-once delivery, no 2PC.", alt: "Direct HTTP fan-out (lossy, tightly coupled)." },
    { name: "Resilience4j", what: "Circuit breaker / retry / time-limiter for Java.", why: "Protects the app from slow or flaky AI calls — never blocks user-facing requests.", alt: "Custom retries (easy to get wrong; no metrics)." },
    { name: "Flyway", what: "Version-controlled SQL migrations.", why: "Reproducible schema across environments; pairs perfectly with pgvector and CI.", alt: "Hibernate auto DDL (only for local dev, never prod)." },
    { name: "Testcontainers", what: "Spins up real Postgres + Kafka in tests.", why: "Catches migration and integration bugs locally, without flaky mocks.", alt: "H2 in-memory (doesn't understand pgvector or Postgres semantics)." },
  ];

  const modules = [
    { name: "OrderService.place()", analogy: "A cashier locking the register while ringing you up so no one else steals the last candy bar.", scaling: "Horizontal scaling is safe — Postgres serializes the row locks. Add read-replicas for queries." },
    { name: "OutboxPublisher", analogy: "A mail sorter that keeps retrying undelivered letters until they leave the building.", scaling: "Stateless. Run many instances; SKIP LOCKED divides the work without coordination." },
    { name: "EmbeddingService", analogy: "A librarian turning a book into a fingerprint, so similar books can be found later.", scaling: "Run Ollama on a GPU box behind a queue; circuit breaker keeps product writes fast." },
    { name: "VectorRepository", analogy: "A nearest-neighbor phone book: 'find me the 5 people most like this one.'", scaling: "HNSW index gives ~O(log n) lookups — good to millions of products." },
  ];

  return (
    <section className="border-t border-zinc-100 bg-zinc-50/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">Why each dependency, explained.</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-zinc-500">Every tool in this stack earns its keep. Here's what it is, why it's here, and what you'd use instead if you wanted something simpler.</p>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {deps.map(d => (
            <div key={d.name} className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-indigo-500" />
                <h3 className="text-sm font-semibold">{d.name}</h3>
              </div>
              <dl className="mt-3 space-y-2 text-[13px] leading-relaxed text-zinc-600">
                <div><span className="font-semibold text-zinc-900">What:</span> {d.what}</div>
                <div><span className="font-semibold text-zinc-900">Why:</span> {d.why}</div>
                <div><span className="font-semibold text-zinc-900">Simpler alternative:</span> {d.alt}</div>
              </dl>
            </div>
          ))}
        </div>

        <h3 className="mt-14 text-center text-xl font-semibold tracking-tight">And each major module.</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {modules.map(m => (
            <div key={m.name} className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h4 className="text-sm font-semibold text-zinc-900">{m.name}</h4>
              <div className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-zinc-600">
                <div><span className="font-semibold text-zinc-900">Analogy:</span> {m.analogy}</div>
                <div><span className="font-semibold text-zinc-900">Scaling:</span> {m.scaling}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 p-10 text-white md:p-14">
        <div className="absolute inset-0 -z-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 20% 0%, rgba(99,102,241,.6), transparent 40%), radial-gradient(circle at 80% 100%, rgba(217,70,239,.4), transparent 40%)",
        }} />
        <div className="relative">
          <h2 className="max-w-xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Clone it, docker compose up, build on top.
          </h2>
          <p className="mt-3 max-w-lg text-zinc-300">
            The backend boots with seeded products, Flyway migrations, and Ollama embedding ready.
            The frontend talks to it when it's up and runs an in-memory demo when it isn't.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100">
              Open the app <ArrowRight size={14} />
            </Link>
            <code className="rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-mono text-white/90">
              cd backend && docker compose up
            </code>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-100 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 text-xs text-zinc-500 md:flex-row">
        <div>© {new Date().getFullYear()} Order Service. A reference architecture.</div>
        <div className="flex items-center gap-4">
          <a className="hover:text-zinc-900" href="#architecture">Architecture</a>
          <Link className="hover:text-zinc-900" to="/products">Products</Link>
          <Link className="hover:text-zinc-900" to="/orders">Orders</Link>
        </div>
      </div>
    </footer>
  );
}
