-- Adds storage for the Kontaktformular and Newsletter-Anmeldung blocks.
-- Safe to run multiple times.

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_shop_id ON messages(shop_id);

CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shop_id, email)
);
CREATE INDEX IF NOT EXISTS idx_subscribers_shop_id ON subscribers(shop_id);
