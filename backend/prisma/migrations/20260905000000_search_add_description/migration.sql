-- Migration: extend the products full-text search vector to include description.
--
-- The original search_vector weighted only name (A) and brand (B). A generated
-- column's expression cannot be altered in place, so we drop and recreate it
-- (and its GIN index), now also indexing description at weight C. Name/brand
-- matches still outrank description matches via the A/B/C weighting.

DROP INDEX IF EXISTS idx_products_search;

ALTER TABLE products DROP COLUMN IF EXISTS search_vector;

ALTER TABLE products
  ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(brand, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'C')
    ) STORED;

CREATE INDEX idx_products_search
  ON products USING GIN (search_vector);
