-- ============================================================
-- Enable pgvector extension for semantic similarity search
-- ============================================================
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Products: catalog + embedding (768-dim for nomic-embed-text)
-- ============================================================
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku             VARCHAR(64) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    category        VARCHAR(128),
    price           NUMERIC(12,2) NOT NULL,
    image_url       VARCHAR(1024),
    embedding       vector(768),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    version         INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT chk_product_price CHECK (price >= 0)
);
CREATE UNIQUE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
-- HNSW index for fast approximate nearest-neighbor (cosine)
CREATE INDEX idx_products_embedding ON products
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- ============================================================
-- Inventory: 1:1 with product, pessimistic-locked on checkout
-- ============================================================
CREATE TABLE inventory (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    quantity        INTEGER NOT NULL DEFAULT 0,
    reserved        INTEGER NOT NULL DEFAULT 0,
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    version         INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT chk_inv_qty CHECK (quantity >= 0),
    CONSTRAINT chk_inv_reserved CHECK (reserved >= 0 AND reserved <= quantity)
);
CREATE INDEX idx_inventory_product ON inventory(product_id);

-- ============================================================
-- Carts (anonymous by session / simple user_id for demo)
-- ============================================================
CREATE TABLE carts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_key       VARCHAR(128) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_carts_owner ON carts(owner_key);

CREATE TABLE cart_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id         UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity        INTEGER NOT NULL,
    unit_price      NUMERIC(12,2) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_cart_qty CHECK (quantity > 0),
    CONSTRAINT chk_cart_price CHECK (unit_price >= 0),
    CONSTRAINT uq_cart_item UNIQUE (cart_id, product_id)
);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- ============================================================
-- Orders + order_items
-- ============================================================
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number    VARCHAR(64) NOT NULL,
    owner_key       VARCHAR(128) NOT NULL,
    status          VARCHAR(32) NOT NULL DEFAULT 'CREATED',
    total_amount    NUMERIC(14,2) NOT NULL,
    shipping_address TEXT,
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    version         INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT chk_order_total CHECK (total_amount >= 0)
);
CREATE UNIQUE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_owner ON orders(owner_key);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id),
    sku             VARCHAR(64) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    quantity        INTEGER NOT NULL,
    unit_price      NUMERIC(12,2) NOT NULL,
    line_total      NUMERIC(14,2) NOT NULL,
    CONSTRAINT chk_oi_qty CHECK (quantity > 0),
    CONSTRAINT chk_oi_price CHECK (unit_price >= 0)
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================================
-- Transactional Outbox (for reliable Kafka publishing)
-- ============================================================
CREATE TABLE outbox_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aggregate_type  VARCHAR(64) NOT NULL,
    aggregate_id    VARCHAR(128) NOT NULL,
    event_type      VARCHAR(64) NOT NULL,
    payload         JSONB NOT NULL,
    topic           VARCHAR(128) NOT NULL,
    status          VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    retry_count     INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    published_at    TIMESTAMP
);
CREATE INDEX idx_outbox_pending ON outbox_events (created_at) WHERE status = 'PENDING';
