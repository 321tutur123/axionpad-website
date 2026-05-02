"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import type { ProductVariantFull } from "@/lib/products-data";
import ProductConfigurator from "./ProductConfigurator";

const ProductModel = dynamic(() => import("@/components/3d/ProductModel"), { ssr: false });

export interface EngravingPreview {
  text?:  string;
  image?: string; // data URL
}

interface Props {
  product: ProductVariantFull;
}

export default function ProductPageClient({ product }: Props) {
  const [engraving, setEngraving] = useState<EngravingPreview>({});

  const hasEngraving = product.options.some(o => o.type === "lidEngraving");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start mb-24">

      {/* Visuel — 3D si gravure dispo, sinon image statique */}
      <div className="lg:sticky lg:top-24">
        <div
          className="relative aspect-square overflow-hidden"
          style={{
            borderRadius: "24px",
            background: "var(--color-accent-lt)",
            border: "0.5px solid var(--color-border)",
            boxShadow: "0 2px 40px rgba(45,52,54,0.08)",
          }}
        >
          {hasEngraving ? (
            <Canvas camera={{ position: [0, 2.5, 4], fov: 40 }} style={{ width: "100%", height: "100%" }}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[5, 8, 5]} intensity={1.2} />
              <Suspense fallback={null}>
                <ProductModel
                  autoRotate={!engraving.text && !engraving.image}
                  engravingText={engraving.text}
                  engravingImage={engraving.image}
                />
                <Environment preset="studio" />
              </Suspense>
              <OrbitControls
                enablePan={false}
                minDistance={2}
                maxDistance={8}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2}
              />
            </Canvas>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-40">
              &#9000;
            </div>
          )}
        </div>

        {hasEngraving && (
          <p className="text-center text-xs mt-3" style={{ color: "var(--color-text-mute)" }}>
            Glissez pour tourner &#183; La rotation s&#8217;arr&#234;te quand une gravure est configur&#233;e
          </p>
        )}

        {!product.inStock && (
          <p
            className="mt-4 text-center text-xs py-2.5 rounded-xl"
            style={{
              color: "var(--color-text-mute)",
              border: "0.5px solid var(--color-border)",
              background: "var(--color-bg-card)",
            }}
          >
            Rupture de stock &#8212; disponible sur commande
          </p>
        )}
      </div>

      {/* Configurateur */}
      <ProductConfigurator product={product} onEngravingChange={setEngraving} />
    </div>
  );
}
