-- Migration: add GIN full-text search index on products.
--
-- Replaces LIKE '%x%' (O(n) full table scan, no index) with
-- tsvector @@ tsquery (O(log n) via GIN inverted index).
--
-- search_vector is a STORED generated column — maintained by Postgres
-- automatically on every INSERT/UPDATE, zero application-level cost.
-- Weight A on name, B on brand — name matches rank higher.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(brand, '')), 'B')
    ) STORED;

-- GIN index: the inverted index that makes @@ lookups O(log n + k).
CREATE INDEX IF NOT EXISTS idx_products_search
  ON products USING GIN (search_vector);
