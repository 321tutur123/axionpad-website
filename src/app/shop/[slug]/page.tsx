import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getAllProducts, formatPrice, listProductImages } from "@/lib/products-data";
import ProductConfigurator from "./ProductConfigurator";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ReviewSection from "@/components/reviews/ReviewSection";
import ProductCard from "@/components/products/ProductCard";

export function generateStaticParams() {
  return getAllProducts().map(p => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug }  = await params;
  const product   = getProduct(slug);
  if (!product) return {};
  return {
    title:       `${product.name} — ${formatPrice(product.price)} | Axion Pad`,
    description: product.tagline,
    openGraph: {
      title:       `${product.name} — ${formatPrice(product.price)}`,
      description: product.tagline,
      images:      listProductImages(product).map(url => ({ url })),
      type:        "website",
    },
  };
}

const TRUST = [
  { icon: "🇫🇷", label: "Assemblé à Orléans" },
  { icon: "🔒", label: "Paiement sécurisé" },
  { icon: "📦", label: "Expédié en 3–5 j" },
  { icon: "↩",  label: "Retours 30 j" },
];

const HIGHLIGHTS = [
  "Assemblé à la main · contrôlé et testé avant envoi",
  "Firmware CircuitPython — sources publiques sur GitHub",
  "Configurateur Windows natif inclus — gratuit",
  "Compatible Windows / macOS / Linux · zéro driver",
];

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug }  = await params;
  const product   = getProduct(slug);
  if (!product) notFound();

  const related = getAllProducts()
    .filter(p => p.slug !== slug && p.category === product.category)
    .slice(0, 4);

  const savings = product.comparePrice
    ? product.comparePrice - product.price
    : 0;

  return (
    <main style={{ minHeight: "100vh", background: "transparent", paddingTop: "80px" }}>
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: "var(--color-text-mute)" }}>
          <Link href="/"     className="hover:underline" style={{ color: "var(--color-text-mute)" }}>Accueil</Link>
          <span>›</span>
          <Link href="/shop" className="hover:underline" style={{ color: "var(--color-text-mute)" }}>Boutique</Link>
          <span>›</span>
          <span style={{ color: "var(--color-text)" }}>{product.name}</span>
        </nav>

        {/* ── HERO ZONE ─────────────────────────────────────────── */}
        <div className="pdp-grid">

          {/* Left — sticky image */}
          <div className="pdp-image-col">
            <ProductImageGallery
              images={listProductImages(product)}
              alt={product.name}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-10 h-full w-full"
              priority
              fallback={
                <div className="absolute inset-0 flex items-center justify-center text-9xl select-none">
                  ⌨️
                </div>
              }
            >
              <div className="pdp-os-badge">
                <span>◻</span> MIT Open Source
              </div>
            </ProductImageGallery>

            {/* Shadow */}
            <div className="pdp-image-shadow" />

            {/* Stock out */}
            {!product.inStock && !product.comingSoon && (
              <p className="pdp-out-of-stock">
                Rupture de stock — disponible sur commande
              </p>
            )}
          </div>

          {/* Right — conversion zone */}
          <div className="pdp-info-col">

            {/* Badges */}
            <div className="pdp-badges">
              {product.badge && <span className="badge">{product.badge}</span>}
              <span className="badge">🇫🇷 Fait main</span>
              {product.inStock && !product.comingSoon && (
                <span className="pdp-stock-badge">
                  <span className="pdp-stock-dot" />
                  En stock
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="pdp-title">{product.name}</h1>
            <p className="pdp-tagline">{product.tagline}</p>

            {/* Price block */}
            <div className="pdp-price-block">
              <span className="pdp-price">{formatPrice(product.price)}</span>
              {product.comparePrice && (
                <>
                  <span className="pdp-compare">{formatPrice(product.comparePrice)}</span>
                  <span className="pdp-savings">Économisez {formatPrice(savings)}</span>
                </>
              )}
            </div>

            {/* Trust strip */}
            <div className="pdp-trust-strip">
              {TRUST.map(t => (
                <div key={t.label} className="pdp-trust-item">
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </div>
              ))}
            </div>

            {/* Key highlights */}
            <div className="pdp-highlights">
              {HIGHLIGHTS.map((h, i) => (
                <div key={i} className="pdp-highlight">
                  <span className="pdp-highlight-check">✓</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>

            {/* Configurator (options + CTA) */}
            <div className="pdp-configurator">
              <ProductConfigurator product={product} />
            </div>

            {/* Stock urgency */}
            {product.inStock && !product.comingSoon && product.stock > 0 && (
              <div className="pdp-stock-urgency">
                <span className="pdp-stock-dot" />
                {product.stock <= 5
                  ? `Plus que ${product.stock} unité${product.stock > 1 ? "s" : ""} disponible${product.stock > 1 ? "s" : ""} !`
                  : `${product.stock} unités en stock`}
              </div>
            )}

          </div>
        </div>

        {/* ── SPECS + BOX + DESCRIPTION ─────────────────────────── */}
        <div className="pdp-details">

          {/* Specs */}
          <div className="pdp-section">
            <h2 className="pdp-section-title">
              <span className="pdp-section-dot" />
              Caractéristiques techniques
            </h2>
            <div className="pdp-specs-table">
              {product.specs.map(s => (
                <div key={s.label} className="pdp-spec-row">
                  <span className="pdp-spec-k">{s.label}</span>
                  <span className="pdp-spec-v">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Box contents */}
          <div className="pdp-section">
            <h2 className="pdp-section-title">
              <span className="pdp-section-dot" />
              Contenu de la boîte
            </h2>
            <ul className="pdp-includes">
              {product.includes.map((item, i) => (
                <li key={i} className="pdp-include">
                  <span className="pdp-include-check">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Long description */}
          <div className="pdp-section pdp-section--full">
            <h2 className="pdp-section-title">
              <span className="pdp-section-dot" />
              À propos
            </h2>
            <p className="pdp-description">{product.longDescription}</p>
          </div>

        </div>

        {/* ── REVIEWS ───────────────────────────────────────────── */}
        <ReviewSection productSlug={slug} />

        {/* ── RELATED ───────────────────────────────────────────── */}
        {related.length > 0 && (
          <div className="pdp-related">
            <h2 className="pdp-related-title">Vous aimerez aussi</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {related.map(p => <ProductCard key={p.slug} product={p} />)}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
