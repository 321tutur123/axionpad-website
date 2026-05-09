"use client";

import { useState } from "react";
import Link from "next/link";
import { getAllProducts, formatPrice, type ProductVariantFull } from "@/lib/products-data";
import { useCart } from "@/store/cart";
import ProductImage from "@/components/products/ProductImage";

// ── Pad key layouts ───────────────────────────────────────────
type KV = "d" | "p" | "g";

const PAD_ELITE: KV[][] = [["d","d","p","d"],["d","g","d","d"],["d","d","d","p"]];            // 3×4 — 12 touches
const PAD_MINI:  KV[][] = [["d","p","d"],["d","d","g"]];                                       // 2×3 — 6 touches
const PAD_XL:    KV[][] = [["d","p","d","d","d"],["d","d","g","d","d"],["p","d","d","d","p"]]; // 5×3 — 15 touches

const FADER_LEVELS_4 = [58, 28, 75, 44];
const FADER_LEVELS_6 = [68, 38, 52, 85, 24, 60];

function PadVisual({ keys, cols, pots = 0 }: { keys: KV[][]; cols: 3 | 4 | 5; pots?: number }) {
  const levels = pots === 6 ? FADER_LEVELS_6 : FADER_LEVELS_4;
  return (
    <div className="mini-pad">
      <div className="mini-led" aria-hidden />
      <div className="mini-pad-body">
        <div className={`mini-key-grid mini-key-grid--${cols}c`}>
          {keys.flat().map((v, i) => (
            <button key={i} className={`mk${v === "p" ? " mk--p" : v === "g" ? " mk--g" : ""}`} aria-hidden tabIndex={-1} />
          ))}
        </div>
        {pots > 0 && (
          <div className="mini-faders" aria-hidden>
            {Array.from({ length: pots }).map((_, i) => {
              const pct = levels[i] ?? 50;
              return (
                <div key={i} className="mini-fader">
                  <div className="mini-fader-fill" style={{ height: `${pct}%` }} />
                  <div className="mini-fader-knob" style={{ bottom: `calc(${pct}% - 4px)` }} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Fallback visuel selon la catégorie / slug du produit
function ProductFallback({ slug, category }: { slug: string; category: string }) {
  // Macro pads — pad CSS
  if (slug === "axion-pad-standard") return <PadVisual keys={PAD_ELITE} cols={4} pots={4} />;
  if (slug === "axion-pad-mini")     return <PadVisual keys={PAD_MINI}  cols={3} pots={0} />;
  if (slug === "axion-pad-xl")       return <PadVisual keys={PAD_XL}    cols={5} pots={6} />;
  // Accessoires / kits — emoji approprié
  const emoji =
    slug.includes("cable")   ? "🔌" :
    slug.includes("keycap")  ? "⌨️" :
    slug.includes("pcb")     ? "🔬" :
    category === "kits"      ? "🔧" :
    "📦";
  return <span style={{ fontSize: "3.5rem", lineHeight: 1 }}>{emoji}</span>;
}

function shopCardCategoryLabel(category: string): string {
  switch (category) {
    case "macro-pads":
      return "Macro Pad · 🇫🇷";
    case "kits":
      return "Kit DIY · 🇫🇷";
    case "accessories":
      return "Accessoire · 🇫🇷";
    default:
      return "Axion Pad · 🇫🇷";
  }
}

function ShopCard({ product }: { product: ProductVariantFull }) {
  const add  = useCart(s => s.add);
  const [adding, setAdding] = useState(false);
  const [done,   setDone]   = useState(false);

  const isElite = product.category === "macro-pads" && product.slug !== "axion-pad-pro";

  async function handleAdd() {
    if (!product.inStock || adding) return;
    setAdding(true);
    try { await add(product.slug, 1); } catch { /* noop */ }
    setDone(true);
    setAdding(false);
    setTimeout(() => setDone(false), 2200);
  }

  return (
    <div className={`shop-card${isElite ? " shop-card--featured" : ""}`}>
      {product.badge && (
        <div className="shop-card-badge">{product.badge}</div>
      )}

      {/* Visual — image produit ou fallback contextuel */}
      <Link href={`/shop/${product.slug}`} className="shop-card-visual">
        <div className="shop-card-visual-inner">
          <ProductImage
            src={product.imagePath}
            alt={product.name}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-6 h-full w-full"
            fallback={<ProductFallback slug={product.slug} category={product.category} />}
          />
        </div>
      </Link>

      {/* Content */}
      <div className="shop-card-body">
        <div className="shop-card-category">{shopCardCategoryLabel(product.category)}</div>
        <Link href={`/shop/${product.slug}`}>
          <h2 className="shop-card-name">{product.name}</h2>
        </Link>
        <p className="shop-card-tagline">{product.tagline}</p>

        {/* Quick specs */}
        <div className="shop-card-specs">
          {product.specs.slice(0, 4).map(s => (
            <div key={s.label} className="shop-card-spec">
              <span className="shop-card-spec-k">{s.label}</span>
              <span className="shop-card-spec-v">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="shop-card-footer">
          <div className="shop-card-price-block">
            <span className="shop-card-price">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="shop-card-compare">{formatPrice(product.comparePrice)}</span>
            )}
          </div>

          {product.comingSoon ? (
            <span className="shop-card-soon">Bientôt disponible</span>
          ) : !product.inStock ? (
            <span className="shop-card-soon">Rupture</span>
          ) : (
            <div className="shop-card-actions">
              <button
                onClick={handleAdd}
                disabled={adding}
                className="btn-cart btn-cart--primary"
                style={{ width: "auto", padding: "10px 20px", fontSize: "0.78rem" }}
              >
                {done ? "✓ Ajouté" : adding ? "…" : "Ajouter"}
              </button>
              <Link href={`/shop/${product.slug}`} className="btn-cart btn-cart--outline"
                style={{ width: "auto", padding: "10px 20px", fontSize: "0.78rem" }}>
                Voir →
              </Link>
            </div>
          )}
        </div>

        {/* Stock signal */}
        {product.inStock && !product.comingSoon && (
          <div className="shop-card-stock">
            <span className="shop-card-stock-dot" />
            {product.stock} unité{product.stock > 1 ? "s" : ""} en stock · expédié sous 3–5 j
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  const products = getAllProducts();

  return (
    <main style={{ minHeight: "100vh", background: "transparent", paddingTop: "80px" }}>
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="shop-header">
          <div>
            <span className="eyebrow block mb-3">BOUTIQUE</span>
            <h1 className="shop-title">Choisissez votre Axion Pad.</h1>
            <p className="shop-subtitle">
              Open source · assemblé à la main en France · firmware CircuitPython.
            </p>
          </div>
          <div className="shop-trust">
            {[
              { icon: "🇫🇷", label: "Fabriqué à Orléans" },
              { icon: "🔒", label: "Paiement sécurisé" },
              { icon: "📦", label: "Expédition 3–5 j" },
              { icon: "↩", label: "Retours 30 j" },
            ].map(t => (
              <div key={t.label} className="shop-trust-item">
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div className="shop-grid">
          {products.map(p => <ShopCard key={p.id} product={p} />)}
        </div>

      </div>
    </main>
  );
}
