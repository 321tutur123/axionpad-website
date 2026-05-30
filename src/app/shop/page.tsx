"use client";

import { useState } from "react";
import Link from "next/link";
import { getAllProducts, formatPrice, type ProductVariantFull } from "@/lib/products-data";
import { useCart } from "@/store/cart";
import ProductImage from "@/components/products/ProductImage";
import ProductFallback from "@/components/products/ProductFallback";
import { isLifestyle } from "@/lib/lifestyle-images";

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

  const isElite = product.category === "macro-pads";

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
        <div
          className="shop-card-visual-inner"
          data-lifestyle={isLifestyle(product.imagePath) ? "true" : undefined}
        >
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
