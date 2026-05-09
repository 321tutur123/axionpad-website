# Axion Pad — Website

Site e-commerce du projet **Axion Pad** : macro pads open source fabriqués à la main en France.

→ [axionpad.fr](https://axionpad.fr)

---

## Stack

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styles | Tailwind CSS 4 + CSS custom |
| Animations | Framer Motion |
| État global | Zustand 5 |
| Paiement | Stripe |
| Base de données | Cloudflare D1 (SQLite) |
| Déploiement | Cloudflare Pages (`next-on-pages`) |
| Polices | Inter (display) · Space Mono (mono/specs) |
| Palette | Violet `#6C63FF` · Vert `#00D9A3` |

---

## Structure du projet

```
src/
├── app/
│   ├── page.tsx              # Accueil : hero CSS, produits, spec card, software preview, PCB, console
│   ├── layout.tsx            # Layout racine : Inter + Space Mono, orbes animés
│   ├── globals.css           # Design system complet (tokens, composants, pages)
│   ├── shop/
│   │   ├── page.tsx          # Listing boutique 3 colonnes (7 produits)
│   │   └── [slug]/           # Page produit : PDP conversion-first
│   │       ├── page.tsx      # Trust bar, highlights, configurateur, specs
│   │       └── ProductConfigurator.tsx
│   ├── software/page.tsx     # Page logiciel : AppMockup + DeejMockup fidèles au vrai app
│   ├── api/                  # Routes API (checkout, reviews, auth, track, webhook)
│   ├── cart/                 # Panier
│   ├── checkout/ · success/  # Tunnel de commande
│   └── …                     # about, cgv, login, register, track, mentions-legales…
├── components/
│   ├── animations/           # ScrollReveal
│   ├── bento/                # BentoGrid, KeyMatrix, AudioPanel, McuPanel
│   ├── cart/                 # CheckoutButton
│   ├── layout/               # Navbar, Footer
│   ├── products/             # ProductCard, ProductImage
│   ├── reviews/              # ReviewSection
│   └── ui/                   # HwPanel
├── data/
│   └── products.json         # Catalogue produits (source de vérité)
├── lib/                      # products-data, api, auth, gsap, scrollProgress…
├── store/
│   ├── cart.ts               # Panier Zustand
│   └── focusStore.ts         # État focus UI
└── types/
    └── index.ts
```

```
migrations/                   # Migrations Cloudflare D1
public/
└── images/products/          # Photos produits (déposer ici : axion-pad-standard.jpg, etc.)
```

---

## Démarrage rapide

### Prérequis

- Node.js ≥ 18

### Variables d'environnement

Créer `.env.local` à la racine :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001

# Stripe
STRIPE_SECRET_KEY=sk_test_…
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…
STRIPE_WEBHOOK_SECRET=whsec_…

# Auth
ADMIN_PASSWORD_HASH=…
JWT_SECRET=…
```

### Lancer le dev server

```bash
npm install
npm run dev
# → http://localhost:3000
```

Si erreur de cache : supprimer `.next/` et relancer.

---

## Catalogue produits (`src/data/products.json`)

### Modèles actuels

| Slug | Nom | Prix | Statut |
|------|-----|------|--------|
| `axion-pad-standard` | Axion Pad Elite | 79,99 € | Disponible |
| `axion-pad-mini` | Axion Pad Mini | 59,99 € | Bientôt |
| `axion-pad-xl` | Axion Pad XL | 179,99 € | Bientôt |
| `axion-kit-diy` | Kit DIY Axion | 49,99 € | Disponible |
| `kit-pcb` | Kit PCB seul | 22,99 € | Disponible |
| `cable-usbc` | Câble USB-C Tressé | 12,99 € | Disponible |
| `keycaps-custom` | Kit Keycaps Custom | 24,99 € | Disponible |

### Ajouter une photo produit

Placer le fichier sous `public/images/products/` avec le même nom que `imagePath` dans `products.json`.  
`ProductImage` utilise automatiquement la photo dès qu'elle existe, et le fallback CSS sinon.

### Exemple d'entrée produit

```jsonc
{
  "slug": "axion-pad-standard",
  "name": "Axion Pad Elite",
  "category": "macro-pads",
  "price": 7999,          // centimes (79,99 €)
  "comparePrice": 9999,   // prix barré optionnel
  "badge": "Best-seller", // badge optionnel
  "comingSoon": false,
  "stock": 25,
  "imagePath": "/images/products/axion-pad-standard.jpg",
  "tagline": "…",
  "description": "…",
  "longDescription": "…",
  "specs": [{ "label": "Touches", "value": "12 × Cherry MX" }],
  "includes": ["1× Axion Pad Elite", "Câble USB-C 1m"],
  "options": [ … ]
}
```

---

## Design system

Le design system est entièrement dans `src/app/globals.css`.

### Tokens principaux

| Variable | Valeur | Usage |
|----------|--------|-------|
| `--color-accent` | `#6C63FF` | CTA primaires, accents |
| `--color-accent-green` | `#00D9A3` | CTA secondaires, confirmations |
| `--color-bg` | `#050508` | Fond principal |
| `--color-bg-soft` | `#080812` | Sections alternées |
| `--font-sans` | Inter var | Texte courant |
| `--font-mono` | Space Mono | Specs, badges, code |

### Composants clés (CSS)

- `.hero-key`, `.hero-fader` — pad CSS hero homepage
- `.mini-pad`, `.mini-fader` — pad CSS cards produit
- `.sw-window`, `.sw-key-simple`, `.sw-fader-wrap` — preview logiciel
- `.spec-card`, `.shop-card`, `.pdp-grid` — e-commerce
- `.btn-terminal`, `.btn-cart`, `.badge`, `.eyebrow` — éléments UI

---

## Base de données (Cloudflare D1)

| Migration | Contenu |
|-----------|---------|
| `0001_orders.sql` | Table des commandes |
| `0002_reviews.sql` | Avis clients |
| `0003_add_tracking.sql` | Suivi de livraison |
| `0004_idempotency.sql` | Clés d'idempotence Stripe |

```bash
# Local
wrangler d1 migrations apply axionpad-db --local

# Production
wrangler d1 migrations apply axionpad-db
```

---

## Déploiement

```bash
# Cloudflare Pages
npm run pages:build
wrangler pages deploy

# Dev standard
npm run dev
npm run build
npm run lint
```
