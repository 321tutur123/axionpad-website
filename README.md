# Axion Pad — Website

Site e-commerce d'[axionpad.fr](https://axionpad.fr).

## Stack

Next.js 15 · TypeScript · Cloudflare Pages · D1 (SQLite) · Stripe

## Développement

```bash
npm install
npm run dev
```

Variables d'environnement requises dans `.env.local` :

```
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
ADMIN_PASSWORD_HASH=
JWT_SECRET=
```

## Déploiement

```bash
npm run pages:build
wrangler pages deploy
```

Migrations D1 :

```bash
wrangler d1 migrations apply axionpad-db --remote
```
