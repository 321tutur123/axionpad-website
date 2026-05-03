// Minimal D1 types — remove if you install @cloudflare/workers-types
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<{ success: boolean; meta: Record<string, unknown> }>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}

interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  error?: string;
  meta: Record<string, unknown>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<D1Result>;
  batch<T = Record<string, unknown>>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

interface CloudflareEnv {
  DB: D1Database;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  RESEND_API_KEY?: string;
  AUTH_SECRET: string;
  JWT_SECRET: string;
  /** PBKDF2 hash (salt:hash) — generate with `npm run hash-admin-password`. */
  ADMIN_PASSWORD_HASH?: string;
  /** Legacy plaintext fallback — remove once ADMIN_PASSWORD_HASH is set. */
  ADMIN_PASSWORD?: string;
}
