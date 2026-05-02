# Axion Pad — Website

Site e-commerce du projet **Axion Pad** : macro pads fabriqués en France.

## Stack

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styles | Tailwind CSS 4 |
| 3D / Animations | Three.js · @react-three/fiber · GSAP |
| État global | Zustand 5 |
| Paiement | Stripe |
| Base de données | Cloudflare D1 (SQLite) |
| Déploiement | Cloudflare Pages (`next-on-pages`) |

## Structure du projet

```
src/
├── app/
│   ├── api/                 # Routes API (checkout, reviews, auth, track, webhook…)
│   ├── admin/orders/        # Interface d'administration
│   ├── shop/                # Boutique + pages produit dynamiques
│   ├── cart/                # Panier
│   ├── checkout/ · success/ # Tunnel de commande
│   └── …                   # about, cgv, login, register, track, upload…
├── components/
│   ├── 3d/                  # Scènes Three.js (HeroScene, ProductModel, ScrollScene…)
│   ├── animations/          # ScrollReveal
│   ├── cart/                # CheckoutButton
│   ├── layout/              # Navbar, Footer
│   ├── products/            # ProductCard, ProductImage
│   └── reviews/             # ReviewSection
├── data/
│   └── products.json        # Catalogue produits (source de vérité)
├── hooks/                   # Custom hooks (useScrollAnimation)
├── lib/                     # Utilitaires (products-data, api, auth, gsap, three…)
├── store/
│   └── cart.ts              # Store Zustand du panier
└── types/
    └── index.ts             # Types TypeScript partagés
```

```
migrations/                  # Migrations Cloudflare D1
public/
├── fonts/
├── images/products/         # Photos produits (ajout manuel)
├── models/                  # Modèle 3D (axionpad.glb)
└── textures/
```

## Démarrage rapide

### Prérequis

- Node.js ≥ 18
- Compte Stripe (clés API test/live)
- Compte Cloudflare (Workers + D1) pour la prod

### Variables d'environnement

Créer `.env.local` à la racine :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001

# Stripe
STRIPE_SECRET_KEY=sk_test_…
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…
STRIPE_WEBHOOK_SECRET=whsec_…

# Authentification
ADMIN_PASSWORD_HASH=…
JWT_SECRET=…
```

### Lancer le dev server

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Catalogue produits

### Ajouter ou modifier un produit

1. Placer l'image sous `public/images/products/` (ex. `axion-pad-standard.jpg`).
2. Éditer `src/data/products.json` — ajouter ou modifier l'entrée :

```jsonc
{
  "slug": "axion-pad-standard",
  "name": "Axion Pad Standard",
  "category": "macro-pads",   // "macro-pads" | "kits" | "accessories"
  "price": 8900,              // centimes (89,00 €)
  "imagePath": "/images/products/axion-pad-standard.jpg",
  "inStock": true,
  "badge": "Nouveau",         // optionnel
  "tagline": "…",
  "description": "…",
  "longDescription": "…",
  "specs": [{ "label": "Switch", "value": "Gateron Yellow" }],
  "includes": ["1× Axion Pad Standard", "Câble USB-C"]
}
```

3. Redémarrer le dev server si nécessaire.

## Base de données (Cloudflare D1)

| Migration | Contenu |
|-----------|---------|
| `0001_orders.sql` | Table des commandes |
| `0002_reviews.sql` | Avis clients |
| `0003_add_tracking.sql` | Suivi de livraison |
| `0004_idempotency.sql` | Clés d'idempotence Stripe |

Appliquer les migrations en local :

```bash
wrangler d1 migrations apply axionpad-db --local
```

En production :

```bash
wrangler d1 migrations apply axionpad-db
```

## Déploiement

### Cloudflare Pages (production)

```bash
npm run pages:build        # Build compatible Cloudflare
wrangler pages deploy      # Push sur Cloudflare Pages
```

Configuration dans `wrangler.toml` — binding D1 : `axionpad-db`.

### Vercel (alternatif)

```bash
vercel --prod
```

## Commandes

```bash
npm run dev          # Dev server (localhost:3000, Turbopack)
npm run build        # Build Next.js standard
npm run pages:build  # Build Cloudflare Pages
npm run lint         # ESLint
```
