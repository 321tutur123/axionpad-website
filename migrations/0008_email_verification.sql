-- Email verification flag on users
ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;

-- Verification tokens (single-use, 24h TTL)
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  token     TEXT    PRIMARY KEY,
  user_id   TEXT    NOT NULL,
  expires_at INTEGER NOT NULL
);
