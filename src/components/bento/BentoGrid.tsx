"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import HwPanel from "@/components/ui/HwPanel";
import KeyMatrix from "@/components/bento/KeyMatrix";
import AudioPanel from "@/components/bento/AudioPanel";
import McuPanel from "@/components/bento/McuPanel";

const CONN = [
  { label: "INTERFACE",     value: "USB-C HID"      },
  { label: "LATENCE",       value: "< 1 ms"          },
  { label: "COMPATIBILITÉ", value: "WIN / MAC / LIN" },
  { label: "DRIVER",        value: "AUCUN REQUIS"    },
];

const SPECS_FULL = [
  ["DIMENSIONS", "112 × 76 × 12 mm"  ],
  ["BOÎTIER",    "ABS + ALU INLAY"   ],
  ["FIRMWARE",   "CIRCUITPYTHON 8"   ],
  ["RGB",        "WS2812B NEOPIXEL"  ],
  ["ORIGINE",    "ORLÉANS, FR"       ],
  ["LICENCE",    "MIT OPEN SOURCE"   ],
  ["PRIX",       "79,99 EUR"         ],
  ["STOCK",      "EN STOCK"          ],
];

function cellProps(delay = 0) {
  return {
    initial:    { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport:   { once: true, amount: 0.08 } as const,
    transition: { duration: 0.45, delay },
  };
}

export default function BentoGrid() {
  return (
    <div className="bento-grid">
      {/* KEY MATRIX */}
      <motion.div {...cellProps(0)} className="bento-cell bento-cell--keys">
        <HwPanel badge="INPUT" title="KEY MATRIX" style={{ height: "100%" }}>
          <p className="bento-desc">12 touches MX-compatibles — interactives</p>
          <KeyMatrix />
        </HwPanel>
      </motion.div>

      {/* MCU */}
      <motion.div {...cellProps(0.07)} className="bento-cell bento-cell--mcu">
        <HwPanel badge="MCU" title="MICROCONTROLLER" style={{ height: "100%" }}>
          <McuPanel />
        </HwPanel>
      </motion.div>

      {/* AUDIO */}
      <motion.div {...cellProps(0.14)} className="bento-cell bento-cell--audio">
        <HwPanel badge="AUDIO" title="VOLUME CONTROL" style={{ height: "100%" }}>
          <p className="bento-desc">4 × potentiomètres B103 10kΩ linéaire</p>
          <AudioPanel />
        </HwPanel>
      </motion.div>

      {/* CONNECTIVITY */}
      <motion.div {...cellProps(0.21)} className="bento-cell bento-cell--conn">
        <HwPanel badge="IO" title="CONNECTIQUE" style={{ height: "100%" }}>
          <div className="conn-grid">
            {CONN.map(c => (
              <div key={c.label} className="conn-item">
                <span className="conn-label">{c.label}</span>
                <span className="conn-value">{c.value}</span>
              </div>
            ))}
          </div>
        </HwPanel>
      </motion.div>

      {/* SPECS TABLE */}
      <motion.div {...cellProps(0.28)} className="bento-cell bento-cell--specs">
        <HwPanel badge="SPEC" title="FICHE TECHNIQUE" glow style={{ height: "100%" }}>
          <div className="specs-table">
            {SPECS_FULL.map(([k, v]) => (
              <div key={k} className="specs-row">
                <span className="specs-key">{k}</span>
                <span className="specs-val">{v}</span>
              </div>
            ))}
          </div>
          <Link
            href="/shop"
            className="btn-terminal btn-terminal--sm"
            style={{ marginTop: "16px", display: "flex" }}
          >
            → COMMANDER — 79,99 EUR
          </Link>
        </HwPanel>
      </motion.div>
    </div>
  );
}
