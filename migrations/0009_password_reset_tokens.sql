-- Password reset tokens (single-use, 1h TTL)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token      TEXT    PRIMARY KEY,
  user_id    TEXT    NOT NULL,
  expires_at INTEGER NOT NULL
);
