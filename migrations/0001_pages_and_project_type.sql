-- Upgrades a database created from an earlier version of schema.sql
-- (single-page shops, no project type) to the multi-page model.
-- Safe to run multiple times.

ALTER TABLE shops ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'shop';

CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL DEFAULT '',
  is_home BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shop_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_pages_shop_id ON pages(shop_id);

-- Give every existing shop a "Start" home page.
INSERT INTO pages (shop_id, title, slug, is_home, position)
SELECT id, 'Start', '', true, 0 FROM shops
ON CONFLICT (shop_id, slug) DO NOTHING;

-- Re-point blocks from shops directly to that new home page.
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS page_id INTEGER REFERENCES pages(id) ON DELETE CASCADE;

UPDATE blocks b SET page_id = p.id
FROM pages p
WHERE p.shop_id = b.shop_id AND p.is_home = true AND b.page_id IS NULL;

ALTER TABLE blocks ALTER COLUMN page_id SET NOT NULL;
ALTER TABLE blocks DROP COLUMN IF EXISTS shop_id;

CREATE INDEX IF NOT EXISTS idx_blocks_page_id ON blocks(page_id);
