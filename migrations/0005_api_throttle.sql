-- Sliding-window style throttling for API abuse (admin brute-force, review spam).
CREATE TABLE IF NOT EXISTS api_throttle (
  bucket_id TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);
