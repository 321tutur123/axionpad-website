/**
 * Origine HTTPS du site exposé aux clients : success/cancel Stripe, liens absolus.
 *
 * Ordre : NEXT_PUBLIC_SITE_URL → CF_PAGES_URL (Cloudflare Pages) → Referer (même onglet)
 * → domaine de production par défaut.
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
      const origin = new URL(ref).origin;
      if (origin.startsWith("http://") || origin.startsWith("https://")) return trim(origin);
    } catch {
      /* ignore */
    }
  }

  return "https://www.axionpad.fr";
}
