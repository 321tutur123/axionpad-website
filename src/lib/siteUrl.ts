/**
 * Origine HTTPS du site exposé aux clients : success/cancel Stripe, liens absolus.
 *
 * Ordre : NEXT_PUBLIC_SITE_URL → CF_PAGES_URL (Cloudflare Pages) → domaines autorisés
 * dérivés du Referer (jamais un Referer arbitraire seul).
 */
export function getPublicSiteOrigin(request: Request): string {
  const trim = (s: string) => s.replace(/\/+$/, "");

  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    try {
      return trim(new URL(fromEnv).origin);
    } catch {
      return trim(fromEnv);
    }
  }

  const cf = process.env.CF_PAGES_URL?.trim();
  if (cf) {
    try {
      return trim(new URL(cf).origin);
    } catch {
      return trim(cf);
    }
  }

  const ref = request.headers.get("referer");
  if (ref) {
    try {
      const u = new URL(ref);
      const host = u.hostname.toLowerCase();
      const allowedHosts = new Set([
        "axionpad.fr",
        "www.axionpad.fr",
        "localhost",
        "127.0.0.1",
      ]);
      const isCfPagesPreview = host.endsWith(".pages.dev") || host.endsWith(".cloudflarepages.com");
      if (allowedHosts.has(host) || isCfPagesPreview) {
        const origin = u.origin;
        if (origin.startsWith("https://") || (host === "localhost" && origin.startsWith("http://"))) {
          return trim(origin);
        }
      }
    } catch {
      /* ignore */
    }
  }

  return "https://www.axionpad.fr";
}
