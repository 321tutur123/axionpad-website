"use client";

import { useState } from "react";
import ProductImage from "@/components/products/ProductImage";

interface Props {
  images: string[];
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  fallback?: React.ReactNode;
  children?: React.ReactNode;
}

// Photos lifestyle (fond clair) — reçoivent un traitement CSS spécifique
const LIFESTYLE_IMAGES = ["kit-pcb.png", "kit-pcb-2.png"];
function isLifestyle(src: string): boolean {
  return LIFESTYLE_IMAGES.some(name => src.includes(name));
}

/** Fiche produit : image principale + miniatures si plusieurs URLs. */
export default function ProductImageGallery({
  images,
  alt,
  sizes,
  priority,
  className,
  fallback,
  children,
}: Props) {
  const list = images.filter(Boolean);
  const [index, setIndex] = useState(0);
  const src = list[index] ?? list[0];

  if (!src) {
    return (
      <div className="pdp-image-wrap">
        <div className="absolute inset-0 flex items-center justify-center text-9xl select-none">
          ⌨️
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="pdp-gallery">
      <div
        className="pdp-image-wrap"
        data-lifestyle={isLifestyle(src) ? "true" : undefined}
      >
        <ProductImage
          src={src}
          alt={list.length > 1 ? `${alt} — vue ${index + 1}` : alt}
          sizes={sizes}
          priority={priority}
          className={className}
          fallback={fallback}
        />
        {children}
      </div>
      {list.length > 1 && (
        <div className="pdp-gallery-thumbs" role="tablist" aria-label="Photos du produit">
          {list.map((href, i) => (
            <button
              key={`${href}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={`pdp-gallery-thumb${i === index ? " is-active" : ""}`}
              data-lifestyle={isLifestyle(href) ? "true" : undefined}
              onClick={() => setIndex(i)}
            >
              <span className="relative block h-full w-full">
                <ProductImage
                  src={href}
                  alt=""
                  sizes="80px"
                  className="object-cover p-0"
                />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
