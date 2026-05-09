"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ── Console data ───────────────────────────────────────────────
const CONSOLE_LINES = [
  { t: "cmd",    s: "axionpad system.init()" },
  { t: "ok",     s: "✓  Device: AxionPad Elite v2.1 — FR-ORL" },
  { t: "cmd",    s: "axionpad.specs.dump()" },
  { t: "data",   s: "│  12 touches MX · 4 pots B103 · RP2040@133MHz · USB-C HID" },
  { t: "cmd",    s: "axionpad.checkout({ qty: 1 })" },
  { t: "ok",     s: "✓  Total: 79,99 EUR — Livraison: FR-ORL (5 j.)" },
  { t: "prompt", s: "Confirmer et expédier → " },
];

// ── Hero — CSS Macro Pad ──────────────────────────────────────
type KeyV = "d" | "p" | "g";

const HERO_KEYS: { v: KeyV; label: string }[] = [
  { v: "d", label: "Ctrl"  },
  { v: "d", label: "Alt"   },
  { v: "p", label: "Layer" },
  { v: "d", label: "F16"   },
  { v: "d", label: "Mute"  },
  { v: "g", label: "Vol+"  },
  { v: "d", label: "⏮"    },
  { v: "d", label: "⏵"    },
  { v: "d", label: "Macro" },
  { v: "d", label: "F21"   },
  { v: "d", label: "F22"   },
  { v: "p", label: "⌘"    },
];

// Fill levels for 4 hero faders (0-100) — different positions for a natural look
const HERO_FADER_LEVELS = [65, 30, 82, 47];

function HeroKey({ v, label }: { v: KeyV; label: string }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      className={`hero-key hero-key--${v}`}
      style={pressed ? { transform: "translateY(3px) scale(0.96)", boxShadow: v === "p" ? "0 1px 0 #3A34BB" : v === "g" ? "0 1px 0 #006B4F" : "0 1px 0 #0A0A14" } : {}}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
    >
      {label}
    </button>
  );
}

function MacroPad() {
  return (
    <div className="macropad">
      <div className="macropad-body">
        <div className="led-strip" aria-hidden />
        {/* Keys left + linear faders right — matching real product layout */}
        <div className="macropad-body-row">
          <div className="key-grid kg-4c">
            {HERO_KEYS.map((k, i) => (
              <HeroKey key={i} v={k.v} label={k.label} />
            ))}
          </div>
          <div className="hero-faders" aria-hidden>
            {HERO_FADER_LEVELS.map((pct, i) => (
              <div key={i} className="hero-fader">
                <div className="hero-fader-fill" style={{ height: `${pct}%` }} />
                <div className="hero-fader-knob" style={{ bottom: `calc(${pct}% - 6px)` }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        className="float-badge fb-tl"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5, ease: "easeOut" }}
      >
        <div className="fbi" style={{ background: "rgba(108,99,255,0.14)" }}>⚙</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: ".83rem" }}>RP2040</div>
          <div style={{ color: "var(--color-text-mute)", fontSize: ".7rem" }}>133 MHz · Dual-core</div>
        </div>
      </motion.div>

      <motion.div
        className="float-badge fb-br"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5, ease: "easeOut" }}
      >
        <div className="fbi" style={{ background: "rgba(0,217,163,0.14)" }}>🔌</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: ".83rem" }}>USB-C HID</div>
          <div style={{ color: "var(--color-text-mute)", fontSize: ".7rem" }}>Win / Mac / Linux</div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Products ──────────────────────────────────────────────────
interface ProductDef {
  name: string;
  tagline: string;
  price: number;
  comparePrice?: number;
  badge?: string;
  slug?: string;
  featured?: boolean;
  available: boolean;
  specs: [string, string][];
  keys: KeyV[][];
  gridCols: "2c" | "3c" | "4c" | "5c";
  pots?: number;
}

const PRODUCTS: ProductDef[] = [
  {
    name: "Axion Pad Mini",
    tagline: "Ultra-compact, 6 touches — l'essentiel, sans compromis",
    price: 4999,
    badge: "Bientôt",
    available: false,
    specs: [
      ["Touches",   "6 mécaniques MX"],
      ["MCU",       "RP2040 @ 133 MHz"],
      ["Interface", "USB-C HID"],
      ["RGB",       "Non"],
    ],
    gridCols: "3c",
    keys: [
      ["d", "d", "d"],
      ["d", "p", "g"],
    ],
    pots: 0,
  },
  {
    name: "Axion Pad Elite",
    tagline: "Le macro pad essentiel pour votre workflow",
    price: 7999,
    comparePrice: 9999,
    badge: "Best-seller",
    slug: "axion-pad-standard",
    featured: true,
    available: true,
    specs: [
      ["Touches",   "12 mécaniques MX"],
      ["Potars",    "4 × B103 10 kΩ"],
      ["MCU",       "RP2040 @ 133 MHz"],
      ["Interface", "USB-C HID"],
    ],
    gridCols: "4c",
    keys: [
      ["d", "d", "p", "d"],
      ["d", "g", "d", "d"],
      ["d", "d", "d", "p"],
    ],
    pots: 4,
  },
  {
    name: "Axion Pad XL",
    tagline: "15 touches, écran OLED intégré et 6 potentiomètres",
    price: 11999,
    badge: "Bientôt",
    available: false,
    specs: [
      ["Touches",   "15 mécaniques MX (5×3)"],
      ["Potars",    "6 × B103 10 kΩ"],
      ["OLED",      "SSD1306 128×64"],
      ["RGB",       "NeoPixel"],
    ],
    gridCols: "5c",
    keys: [
      ["d", "p", "d", "d", "d"],
      ["d", "d", "g", "d", "d"],
      ["p", "d", "d", "d", "p"],
    ],
    pots: 6,
  },
];

// Fill levels for mini faders — different positions for realism
const MINI_FADER_LEVELS_4 = [60, 25, 78, 42];
const MINI_FADER_LEVELS_6 = [70, 40, 55, 82, 28, 63];

function MiniPad({ keys, gridCols, pots = 0 }: { keys: KeyV[][]; gridCols: "2c" | "3c" | "4c" | "5c"; pots?: number }) {
  const levels = pots === 6 ? MINI_FADER_LEVELS_6 : MINI_FADER_LEVELS_4;

  return (
    <div className="mini-pad">
      <div className="mini-led" aria-hidden />
      {/* Keys left + linear faders right — layout fidèle au produit réel */}
      <div className="mini-pad-body">
        <div className={`mini-key-grid mini-key-grid--${gridCols}`}>
          {keys.flat().map((v, i) => (
            <button
              key={i}
              className={`mk${v === "p" ? " mk--p" : v === "g" ? " mk--g" : ""}`}
              aria-hidden
              tabIndex={-1}
            />
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

function ProductCard({ p, delay = 0 }: { p: ProductDef; delay?: number }) {
  const euros = Math.floor(p.price / 100);
  const cents = String(p.price % 100).padStart(2, "0");

  return (
    <motion.div
      className={[
        "product-card",
        p.featured ? "product-card--featured" : "",
        !p.available ? "product-card--dimmed" : "",
      ].filter(Boolean).join(" ")}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {p.badge && (
        <div className={`product-badge-pill${!p.available ? " product-badge-pill--soon" : ""}`}>
          {p.badge}
        </div>
      )}

      <div className="product-visual">
        <MiniPad keys={p.keys} gridCols={p.gridCols} pots={p.pots} />
      </div>

      <div className="product-name">{p.name}</div>
      <div className="product-tagline">{p.tagline}</div>

      <div className="product-specs-table">
        {p.specs.map(([k, v]) => (
          <div key={k} className="product-spec-row">
            <span className="product-spec-k">{k}</span>
            <span className="product-spec-v">{v}</span>
          </div>
        ))}
      </div>

      <div className="product-price-row">
        <span className="product-price-main">{euros},{cents}</span>
        <span className="product-price-cur">&nbsp;EUR</span>
        {p.comparePrice && (
          <span className="product-price-strike">
            {Math.floor(p.comparePrice / 100)},{String(p.comparePrice % 100).padStart(2, "0")} EUR
          </span>
        )}
      </div>

      {p.available && p.slug ? (
        <Link href={`/shop/${p.slug}`} className="btn-cart btn-cart--primary">
          → Commander
        </Link>
      ) : p.available ? (
        <Link href="/shop" className="btn-cart btn-cart--primary">
          → Commander
        </Link>
      ) : (
        <button className="btn-cart btn-cart--disabled" disabled>
          En développement
        </button>
      )}
    </motion.div>
  );
}

// ── Spec Card ─────────────────────────────────────────────────────
const SPECS = [
  { k: "TOUCHES",        v: "12 × Cherry MX"      },
  { k: "MCU",            v: "RP2040 @ 133 MHz"     },
  { k: "POTENTIOMÈTRES", v: "4 × B103 10 kΩ"      },
  { k: "INTERFACE",      v: "USB-C HID"            },
  { k: "FIRMWARE",       v: "CircuitPython 8"      },
  { k: "RGB",            v: "WS2812B NeoPixel"     },
  { k: "FABRIQUÉ",       v: "Orléans, France 🇫🇷"  },
  { k: "LICENCE",        v: "MIT Open Source"      },
];

function SpecCard() {
  return (
    <section className="spec-card-section">
      <motion.div
        className="spec-card"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.55 }}
      >
        <div className="spec-card-header">
          <span className="eyebrow">FICHE TECHNIQUE</span>
          <span className="spec-card-badge">AxionPad Pro</span>
        </div>

        <div className="spec-card-rows">
          {SPECS.map((s, i) => (
            <motion.div
              key={s.k}
              className="spec-card-row"
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <span className="spec-card-key">{s.k}</span>
              <span className="spec-card-val">{s.v}</span>
            </motion.div>
          ))}
        </div>

        <div className="spec-card-footer">
          <Link href="/shop/axion-pad-standard" className="btn-terminal btn-terminal--sm">
            → Commander — 79,99 EUR
          </Link>
          <Link href="https://github.com/321tutur123/axion-pad-apps/tree/main/application/dist" className="btn-terminal btn-terminal--ghost btn-terminal--sm" target="_blank" rel="noopener noreferrer">
            Télécharger l'app
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

// ── Software Preview — pixel-faithful to real AxionPad Configurator UI ─
const SW_KEYS: { fn: string; label: string; action: string; icon: string; variant?: "amber" | "purple" }[] = [
  { fn: "F13", label: "F13", action: "I",       icon: "⌨" },
  { fn: "F14", label: "F14", action: "M",       icon: "⌨" },
  { fn: "F15", label: "F15", action: "F15",     icon: "⌨" },
  { fn: "F16", label: "F16", action: "L+1",     icon: "▶", variant: "purple" },
  { fn: "F17", label: "F17", action: "F17",     icon: "⌨" },
  { fn: "F18", label: "F18", action: "Alt+TAB", icon: "⌨" },
  { fn: "F19", label: "F19", action: "APP",     icon: "🚀", variant: "amber" },
  { fn: "F20", label: "F20", action: "F20",     icon: "⌨" },
  { fn: "F21", label: "F21", action: "F21",     icon: "⌨" },
  { fn: "F22", label: "F22", action: "F22",     icon: "⌨" },
  { fn: "F23", label: "F23", action: "F23",     icon: "⌨" },
  { fn: "F24", label: "F24", action: "F24",     icon: "⌨" },
];

// Values and colors from the real app screenshot + SlidersController source
const SW_FADERS = [
  { id: 1, emoji: "🔊", name: "Master",  pct: 48,  color: "#fcd34d", glow: "rgba(252,211,77,0.55)"  },
  { id: 2, emoji: "🎵", name: "OBS",     pct: 100, color: "#6ee7b7", glow: "rgba(110,231,183,0.55)" },
  { id: 3, emoji: "🎧", name: "Discord", pct: 97,  color: "#fdba74", glow: "rgba(253,186,116,0.55)" },
  { id: 4, emoji: "🌐", name: "Musique", pct: 4,   color: "#93c5fd", glow: "rgba(147,197,253,0.50)" },
] as const;

function SoftwarePreview() {
  return (
    <section className="software-section">
      <div className="software-section-inner">
        <motion.div
          className="software-section-header"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <span className="eyebrow block mb-4">CONFIGURATEUR // SOFTWARE</span>
          <h2 className="software-section-title">Chaque touche,<br />votre outil.</h2>
          <p className="software-section-sub">
            L'application native Windows configure chaque macro, contrôle chaque potentiomètre,
            programme chaque LED — en temps réel, sans cloud, sans abonnement.
          </p>
        </motion.div>

        <motion.div
          className="sw-window"
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Titlebar */}
          <div className="sw-titlebar">
            <div className="sw-dots">
              <span style={{ background: "#ff5f57" }} />
              <span style={{ background: "#febc2e" }} />
              <span style={{ background: "#28c840" }} />
            </div>
            <span className="sw-logo">▲</span>
            <span className="sw-app-name">AxionPad</span>
            <div className="sw-device-pill">AxionPad Pro</div>
            <div style={{ flex: 1 }} />
            <div className="sw-status-pill">
              <span className="sw-status-dot" />
              Axion Pad connecté
            </div>
          </div>

          {/* Tab bar — matches real app navigation */}
          <div className="sw-tabs-bar">
            {["Contrôles", "Presets", "RGB", "Paramètres"].map((t, i) => (
              <div key={t} className={`sw-tab${i === 0 ? " sw-tab--active" : ""}`}>{t}</div>
            ))}
          </div>

          {/* Body: keys left + faders right */}
          <div className="sw-body">
            {/* ── Keys workbench (left) ── */}
            <div className="sw-keys-zone">
              {/* Layer bar */}
              <div className="sw-layer-bar">
                <button className="sw-layer-btn" aria-label="précédent">◀</button>
                <div className="sw-layer-active">Layer 1</div>
                <button className="sw-layer-btn" aria-label="suivant">▶</button>
                <button className="sw-layer-add" aria-label="ajouter">+</button>
              </div>
              <div className="sw-keys-subtitle">AxionPad Pro — 12 touches</div>
              {/* 3×4 key grid — column layout matching real app .key-sw */}
              <div className="sw-key-simple-grid">
                {SW_KEYS.map((k, i) => (
                  <button
                    key={i}
                    className={`sw-key-simple${k.variant ? ` sw-key-simple--${k.variant}` : ""}`}
                  >
                    <div className="sw-key-header">
                      <span className="sw-key-type-icon">{k.icon}</span>
                      <span className="sw-key-fn-badge">{k.fn}</span>
                    </div>
                    <span className="sw-key-main-label">{k.label}</span>
                    <span className="sw-key-action-pill">{k.action}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Vertical DEEJ faders (right) — matches real SlidersController UI ── */}
            <div className="sw-faders-zone">
              <div className="sw-faders-header">4 potentiomètres</div>
              <div className="sw-faders-row">
                {SW_FADERS.map((ch, i) => (
                  <div key={ch.id} className="sw-fader-col">
                    {/* % label */}
                    <span className="sw-fader-pct" style={{ color: ch.color }}>{ch.pct}%</span>

                    {/* Track wrapper — positions fill (inside, clipped) + knob (outside, absolute) */}
                    <div className="sw-fader-wrap">
                      {/* Inner capsule — clips the fill */}
                      <div className="sw-fader-track">
                        <motion.div
                          className="sw-fader-fill"
                          initial={{ height: "0%" }}
                          whileInView={{ height: `${ch.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                          style={{
                            background: ch.color,
                            boxShadow: `0 0 12px ${ch.glow}`,
                          }}
                        />
                      </div>
                      {/* Circular puck knob — sits at the top of the fill */}
                      <div
                        className="sw-fader-knob"
                        style={{
                          bottom: `calc(${ch.pct}% - 12px)`,
                          borderColor: ch.color,
                          boxShadow: `0 0 0 3px ${ch.glow}, 0 2px 8px rgba(0,0,0,0.70), inset 0 1px 0 rgba(255,255,255,0.12)`,
                        }}
                      />
                    </div>

                    {/* Below-fader metadata: emoji → name → badge */}
                    <span className="sw-fader-emoji">{ch.emoji}</span>
                    <span className="sw-fader-name">{ch.name}</span>
                    <div className="sw-fader-badge" style={{ borderColor: ch.color, color: ch.color }}>
                      {ch.id}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="software-cta-row"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: 0.3, duration: 0.45 }}
        >
          <Link href="https://github.com/321tutur123/axion-pad-apps/tree/main/application/dist" className="btn-terminal" target="_blank" rel="noopener noreferrer">
            → TÉLÉCHARGER L'APP — GRATUIT
          </Link>
          <Link href="/shop" className="btn-terminal btn-terminal--ghost">
            COMMANDER LE PAD
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ── PCB Schematic SVG ─────────────────────────────────────────
function PcbSchematic() {
  return (
    <div className="schematic-wrap">
      <span className="schematic-filename">PCB_LAYOUT_v2.1.kicad · MICRO PAD V4</span>
      <svg viewBox="0 0 520 340" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="6" y="6" width="508" height="328" rx="4" stroke="rgba(108,99,255,0.25)" strokeWidth="1"/>
        {([[22,22],[498,22],[22,318],[498,318]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="6" stroke="rgba(108,99,255,0.22)" strokeWidth="0.75"/>
            <circle cx={cx} cy={cy} r="2" fill="rgba(108,99,255,0.15)"/>
          </g>
        ))}
        {Array.from({ length: 3 }, (_, r) =>
          Array.from({ length: 4 }, (_, c) => (
            <g key={`sw${r}${c}`}>
              <rect x={38+c*46} y={30+r*46} width="34" height="34" rx="3"
                stroke="rgba(200,200,230,0.22)" strokeWidth="0.75" fill="rgba(255,255,255,0.025)"/>
              <circle cx={38+c*46+17} cy={30+r*46+17} r="8"
                stroke="rgba(200,200,230,0.16)" strokeWidth="0.6"/>
              <circle cx={38+c*46+17} cy={30+r*46+17} r="2.5"
                fill="rgba(200,200,230,0.12)"/>
            </g>
          ))
        )}
        <text x="109" y="172" textAnchor="middle" fontSize="6.5" fill="rgba(200,200,230,0.35)" fontFamily="monospace" letterSpacing="0.06em">KEY MATRIX 3×4</text>
        <rect x="188" y="100" width="104" height="104" rx="3"
          stroke="rgba(108,99,255,0.65)" strokeWidth="1.5" fill="rgba(108,99,255,0.04)"/>
        <text x="240" y="144" textAnchor="middle" fontSize="10" fill="rgba(108,99,255,0.90)" fontFamily="monospace" fontWeight="bold" letterSpacing="0.04em">RP2040</text>
        <text x="240" y="158" textAnchor="middle" fontSize="6" fill="rgba(108,99,255,0.50)" fontFamily="monospace" letterSpacing="0.1em">RASPBERRY PI</text>
        {Array.from({ length: 7 }, (_, i) => (
          <g key={`pin${i}`}>
            <rect x={168} y={108+i*13} width="20" height="5" rx="1" fill="rgba(200,200,230,0.10)" stroke="rgba(200,200,230,0.18)" strokeWidth="0.5"/>
            <rect x={292} y={108+i*13} width="20" height="5" rx="1" fill="rgba(200,200,230,0.10)" stroke="rgba(200,200,230,0.18)" strokeWidth="0.5"/>
          </g>
        ))}
        <rect x="360" y="60" width="20" height="148" rx="3"
          stroke="rgba(0,217,163,0.35)" strokeWidth="1" fill="rgba(0,217,163,0.03)"/>
        {Array.from({ length: 10 }, (_, i) => (
          <g key={`conn${i}`}>
            <rect x={364} y={68+i*13} width="12" height="7" rx="1"
              stroke="rgba(0,217,163,0.28)" strokeWidth="0.6" fill="rgba(0,217,163,0.06)"/>
          </g>
        ))}
        <text x="370" y="220" textAnchor="middle" fontSize="6" fill="rgba(0,217,163,0.45)" fontFamily="monospace" letterSpacing="0.05em" style={{ writingMode: "vertical-rl" } as React.CSSProperties}>CONNECTOR</text>
        {Array.from({ length: 4 }, (_, i) => (
          <g key={`pot${i}`}>
            <circle cx={400+i*26} cy={260} r="13"
              stroke="rgba(0,217,163,0.38)" strokeWidth="0.75"/>
            <circle cx={400+i*26} cy={260} r="6"
              fill="rgba(0,217,163,0.10)" stroke="rgba(0,217,163,0.25)" strokeWidth="0.5"/>
            <circle cx={400+i*26} cy={260} r="2" fill="rgba(0,217,163,0.20)"/>
            <text x={400+i*26} y={282} textAnchor="middle" fontSize="5.5" fill="rgba(0,217,163,0.40)" fontFamily="monospace">B103</text>
          </g>
        ))}
        <text x="452" y="248" textAnchor="middle" fontSize="6" fill="rgba(0,217,163,0.45)" fontFamily="monospace" letterSpacing="0.06em">POTS ×4</text>
        <rect x="200" y="296" width="80" height="22" rx="3"
          stroke="rgba(56,189,248,0.45)" strokeWidth="1" fill="rgba(56,189,248,0.04)"/>
        <rect x="216" y="300" width="12" height="8" rx="1"
          stroke="rgba(56,189,248,0.30)" strokeWidth="0.5" fill="rgba(56,189,248,0.06)"/>
        <rect x="252" y="300" width="12" height="8" rx="1"
          stroke="rgba(56,189,248,0.30)" strokeWidth="0.5" fill="rgba(56,189,248,0.06)"/>
        <text x="240" y="312" textAnchor="middle" fontSize="7" fill="rgba(56,189,248,0.65)" fontFamily="monospace" fontWeight="bold" letterSpacing="0.06em">USB-C</text>
        <path d="M188 130 L168 130 L109 130" stroke="rgba(108,99,255,0.28)" strokeWidth="1.2"/>
        <path d="M292 130 L360 130" stroke="rgba(108,99,255,0.22)" strokeWidth="1.2"/>
        <path d="M240 204 L240 296" stroke="rgba(0,217,163,0.18)" strokeWidth="1"/>
        <path d="M240 100 L240 30 L109 30" stroke="rgba(108,99,255,0.20)" strokeWidth="0.9" strokeDasharray="4 3"/>
        <path d="M360 80 L312 80 L292 118" stroke="rgba(0,217,163,0.25)" strokeWidth="0.75"/>
        <path d="M360 100 L312 100 L292 135" stroke="rgba(0,217,163,0.20)" strokeWidth="0.75"/>
        <path d="M400 247 L400 220 L370 200 L340 170" stroke="rgba(0,217,163,0.18)" strokeWidth="0.75" strokeDasharray="3 2"/>
        <path d="M188 170 L150 170 L150 100 L84 100" stroke="rgba(200,200,230,0.14)" strokeWidth="0.6"/>
        <path d="M188 148 L160 148 L160 62 L106 62" stroke="rgba(200,200,230,0.12)" strokeWidth="0.6" strokeDasharray="3 2"/>
        <text x="36" y="320" fontSize="8" fill="rgba(108,99,255,0.55)" fontFamily="monospace" fontWeight="bold" letterSpacing="0.08em">MICRO PAD V4</text>
        <text x="36" y="332" fontSize="6" fill="rgba(200,200,230,0.20)" fontFamily="monospace" letterSpacing="0.05em">FR-ORL · MIT OPEN SOURCE · REV 2.1</text>
      </svg>
    </div>
  );
}

// ── Glass Console ─────────────────────────────────────────────
function GlassConsole() {
  const [visible, setVisible] = useState(0);
  const inViewRef = useRef(false);

  return (
    <section className="console-section">
      <motion.div
        className="console-window"
        initial={{ opacity: 0, y: 36, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        onViewportEnter={() => {
          if (inViewRef.current) return;
          inViewRef.current = true;
          let i = 0;
          function next() {
            if (i >= CONSOLE_LINES.length) return;
            setVisible(v => v + 1);
            i++;
            setTimeout(next, i === 1 ? 400 : 650);
          }
          setTimeout(next, 300);
        }}
      >
        <div className="console-titlebar">
          <div className="console-dots">
            <span style={{ background: "#ff5f57" }} />
            <span style={{ background: "#febc2e" }} />
            <span style={{ background: "#28c840" }} />
          </div>
          <span className="console-title">AXIONPAD.SYS // CONSOLE v2.1</span>
          <span className="led" style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.09em", marginLeft: "auto" }}>
            LIVE
          </span>
        </div>

        <div className="console-body">
          <AnimatePresence>
            {CONSOLE_LINES.slice(0, visible).map((line, i) => (
              <motion.div
                key={i}
                className={`console-line console-line--${line.t}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28 }}
              >
                {line.t === "cmd" && <span className="console-ps">$ </span>}
                {line.s}
              </motion.div>
            ))}
          </AnimatePresence>

          {visible > 0 && visible < CONSOLE_LINES.length && (
            <span className="terminal-cursor" />
          )}

          <AnimatePresence>
            {visible >= CONSOLE_LINES.length && (
              <motion.div
                className="console-cta-row"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
              >
                <Link href="/shop" className="btn-terminal">
                  COMMANDER — 79,99 EUR →
                </Link>
                <Link href="https://github.com/321tutur123/axion-pad-apps/tree/main/application/dist" className="btn-terminal btn-terminal--ghost btn-terminal--sm" target="_blank" rel="noopener noreferrer">
                  TÉLÉCHARGER L'APP
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main style={{ background: "transparent" }}>

      {/* ═══ SECTION 1 — HERO ════════════════════════════════ */}
      <section className="hero-section">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-badge-pill">
            <span className="hero-badge-dot" />
            Firmware CircuitPython · Open source
          </div>

          <h1 className="hero-display">
            Chaque touche.<br />
            <span className="accent-p">Une action.</span><br />
            Instantanée.
          </h1>

          <p className="hero-sub">
            Macro pad RP2040 open-source, assemblé à la main en France.
            12 touches mécaniques, 4 potentiomètres, configurateur natif Windows.
          </p>

          <div className="hero-actions">
            <Link href="/shop/axion-pad-standard" className="btn-terminal">
              → Commander l'Elite — 79,99 EUR
            </Link>
            <Link href="https://github.com/321tutur123/axion-pad-apps/tree/main/application/dist" className="btn-terminal btn-terminal--ghost" target="_blank" rel="noopener noreferrer">
              Télécharger l'app
            </Link>
          </div>

          <div className="hero-spec-pills">
            {[
              { k: "Touches",   v: "12 MX"    },
              { k: "MCU",       v: "RP2040"   },
              { k: "Interface", v: "USB-C HID"},
              { k: "Fabriqué",  v: "🇫🇷 Orléans" },
            ].map(s => (
              <div key={s.k} className="hero-spec-pill">
                <span className="sp-k">{s.k}</span>
                <span className="sp-v">{s.v}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <MacroPad />
        </motion.div>
      </section>

      {/* ═══ SECTION 2 — PRODUITS ════════════════════════════ */}
      <section className="products-section">
        <motion.div
          className="products-section-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <span className="eyebrow block mb-4">CHOISISSEZ VOTRE MODÈLE</span>
          <h2 className="products-section-title">Le pad qui vous correspond.</h2>
          <p className="products-section-sub">
            De 6 à 16 touches, avec ou sans OLED — chaque modèle est open source,
            assemblé à la main et expédié depuis Orléans.
          </p>
        </motion.div>

        <div className="products-grid">
          {PRODUCTS.map((p, i) => (
            <ProductCard key={p.slug ?? p.name} p={p} delay={i * 0.1} />
          ))}
        </div>
      </section>

      {/* ═══ SECTION 3 — SPEC CARD ═══════════════════════════ */}
      <SpecCard />

      {/* ═══ SECTION 4 — SOFTWARE ════════════════════════════ */}
      <SoftwarePreview />

      {/* ═══ SECTION 5 — OPEN SOURCE ═════════════════════════ */}
      <section className="make-section">
        <div className="make-inner">
          <PcbSchematic />
          <div className="make-content">
            <span className="eyebrow block mb-3">OPEN SOURCE</span>
            <h2 className="make-title">Tout est public.</h2>
            <p className="make-desc">
              PCB sous KiCad. Firmware CircuitPython. App Java 17 open-source.
              Chaque trace de cuivre et chaque ligne de code visible et modifiable.
              Pas de cloud, pas d'abonnement, zéro black box.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <a
                href="https://github.com/321tutur123"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-terminal btn-terminal--sm"
              >
                → GITHUB
              </a>
              <Link href="https://github.com/321tutur123/axion-pad-apps/tree/main/application/dist" className="btn-terminal btn-terminal--ghost btn-terminal--sm" target="_blank" rel="noopener noreferrer">
                TÉLÉCHARGER L'APP
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 6 — CONSOLE CTA ═════════════════════════ */}
      <GlassConsole />

    </main>
  );
}
