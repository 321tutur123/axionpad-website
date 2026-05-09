-- Tracks consumed upload tokens to enforce one-time use
CREATE TABLE IF NOT EXISTS upload_tokens_used (
  token_hash TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  used_at INTEGER NOT NULL
);
