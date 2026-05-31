"use client";

import Link from "next/link";
import { formatPrice, ProductVariantFull } from "@/lib/products-data";
import ProductImage from "@/components/products/ProductImage";
import ProductFallback from "@/components/products/ProductFallback";

interface Props {
  product: ProductVariantFull;
}

export default function ProductCard({ product }: Props) {
  return (
    <Link href={`/shop/${product.slug}`} className="related-card group">
      <div className="related-card-visual">
        <ProductImage
          src={product.imagePath}
          alt={product.name}
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain p-4 h-full w-full"
          fallback={<ProductFallback slug={product.slug} category={product.category} />}
        />
      </div>
      <div className="related-card-name">{product.name}</div>
      <div className="related-card-price">{formatPrice(product.price)}</div>
    </Link>
  );
}
