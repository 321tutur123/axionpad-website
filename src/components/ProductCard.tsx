"use client";

import Link from "next/link";

export default function ProductCard({ p, productEmoji, formatPrice }: any) {
  return (
    <Link
      href={`/shop/${p.slug}`}
      className="card p-4 group"
    >
      <div className="text-2xl mb-2">{productEmoji(p.slug)}</div>

      <div
        className="text-sm font-medium leading-tight mb-1 transition-colors"
        style={{ color: "var(--color-text)" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "var(--color-accent)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "var(--color-text)")
        }
      >
        {p.name}
      </div>

      <div
        className="text-xs"
        style={{ color: "var(--color-text-mute)" }}
      >
        {formatPrice(p.price)}
      </div>
    </Link>
  );
}