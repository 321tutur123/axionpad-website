const ALLOWED_ORIGINS = [
  "https://axionpad.fr",
  "https://www.axionpad.fr",
];

if (process.env.NODE_ENV === "development") {
  ALLOWED_ORIGINS.push("http://localhost:3000", "http://localhost:8788");
}

/** Returns a 403 Response if the request Origin is not allowed; null if OK. */
export function checkOrigin(request: Request): Response | null {
  const origin = request.headers.get("origin");
  if (!origin) return null; // same-origin requests without Origin header (e.g. server-to-server)
  if (ALLOWED_ORIGINS.includes(origin)) return null;
  return new Response(JSON.stringify({ error: "Forbidden" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}
