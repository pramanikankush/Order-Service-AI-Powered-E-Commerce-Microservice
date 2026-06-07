-- Testcontainers init script: enable pgvector + uuid ext.
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
