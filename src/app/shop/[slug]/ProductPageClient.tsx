"use client";

import { useState, Suspense, useCallback } from "react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";

const ProductModel = dynamic(() => import("@/components/3d/ProductModel"), { ssr: false });

export interface EngravingPreview {
  text?:  string;
  image?: string; // data URL
}

interface Props {
  mode:        string;          // "text" | "logo-custom" | "logo-axion" | "none"
  textValue:   string;
  onConfirm:   (preview: EngravingPreview, logoDataUrl: string) => void;
  onClose:     () => void;
  initialLogo?: string;
}

export default function EngravingModal({ mode, textValue, onConfirm, onClose, initialLogo = "" }: Props) {
  const [text,     setText]     = useState(textValue);
  const [logoUrl,  setLogoUrl]  = useState(initialLogo);
  const [dragging, setDragging] = useState(false);

  const preview: EngravingPreview =
    mode === "text"        ? { text: text || undefined } :
    mode === "logo-custom" ? { image: logoUrl || undefined } :
    {};

  const handleFileDrop = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => setLogoUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const pickFile = () => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "image/*,.svg,.pdf";
    inp.onchange = () => { if (inp.files?.[0]) handleFileDrop(inp.files[0]); };
    inp.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col md:flex-row"
        style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", maxHeight: "90vh" }}
      >
        {/* 3D Preview */}
        <div className="flex-1 min-h-[280px] md:min-h-0 relative" style={{ background: "var(--color-accent-lt)" }}>
          <Canvas camera={{ position: [0, 2.2, 4.5], fov: 40 }} style={{ width: "100%", height: "100%" }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} />
            <Suspense fallback={null}>
              <ProductModel
                autoRotate={!preview.text && !preview.image}
                engravingText={preview.text}
                engravingImage={preview.image}
              />
              <Environment preset="studio" />
            </Suspense>
            <OrbitControls enablePan={false} minDistance={2} maxDistance={8}
              minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2} />
          </Canvas>
          <p className="absolute bottom-3 left-0 right-0 text-center text-xs pointer-events-none"
            style={{ color: "var(--color-text-mute)" }}>
            Glissez pour tourner
          </p>
        </div>

        {/* Panneau droite */}
        <div className="w-full md:w-80 flex flex-col p-6 gap-5 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base" style={{ color: "var(--color-text)" }}>
              Personnaliser le couvercle
            </h2>
            <button onClick={onClose} className="text-xl leading-none transition-opacity hover:opacity-60"
              style={{ color: "var(--color-text-mute)" }}>&#10005;</button>
          </div>

          {mode === "text" && (
            <div>
              <label className="text-xs font-medium block mb-2" style={{ color: "var(--color-text)" }}>
                Texte &#224; graver
              </label>
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value.slice(0, 16))}
                maxLength={16}
                placeholder="Ex. Axion Studio"
                autoFocus
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-shadow"
                style={{ background: "var(--color-bg-soft)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
              />
              <p className="text-xs mt-1.5 text-right tabular-nums" style={{ color: "var(--color-text-mute)" }}>
                {text.length}/16
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-mute)" }}>
                Lettres, chiffres, tiret, apostrophe &#8212; la pr&#233;visualisation 3D se met &#224; jour en direct.
              </p>
            </div>
          )}

          {mode === "logo-custom" && (
            <div>
              <label className="text-xs font-medium block mb-2" style={{ color: "var(--color-text)" }}>
                Votre logo
              </label>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFileDrop(f); }}
                onClick={pickFile}
                className="rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all"
                style={{ borderColor: dragging ? "var(--color-accent)" : "var(--color-border)", background: dragging ? "var(--color-accent-lt)" : "var(--color-bg-soft)" }}
              >
                {logoUrl ? (
                  <div>
                    <img src={logoUrl} alt="Logo" className="h-16 object-contain mx-auto mb-2 rounded" />
                    <p className="text-xs" style={{ color: "var(--color-text-mute)" }}>Cliquer pour changer</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl mb-1">&#128196;</p>
                    <p className="text-xs font-medium" style={{ color: "var(--color-text)" }}>Glissez votre image ici</p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-mute)" }}>PNG, JPEG, SVG</p>
                  </div>
                )}
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--color-text-mute)" }}>
                &#8505; Pr&#233;visualisation indicative. Vous enverrez le fichier vectoriel (SVG/DXF) apr&#232;s commande.
              </p>
            </div>
          )}

          {mode === "logo-axion" && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--color-accent-lt)", color: "var(--color-accent)" }}>
              Le logo officiel Axion Pad sera grav&#233; tel quel sur le couvercle.
            </div>
          )}

          <div className="mt-auto flex flex-col gap-2">
            <button
              onClick={() => onConfirm(preview, logoUrl)}
              className="w-full py-3.5 rounded-full font-semibold text-sm btn-accent"
            >
              Confirmer la personnalisation &#10003;
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-full text-sm transition-colors"
              style={{ border: "1px solid var(--color-border)", color: "var(--color-text-mute)" }}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
