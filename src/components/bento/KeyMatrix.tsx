"use client";
import { motion } from "framer-motion";
import { useState } from "react";

type KeyDef = {
  fn: string; label: string; shortcut: string; icon: string;
  special?: boolean; media?: boolean;
};

const KEYS: KeyDef[] = [
  { fn: "F13", label: "F13",  shortcut: "I",       icon: "⌨" },
  { fn: "F14", label: "F14",  shortcut: "M",       icon: "⌨" },
  { fn: "F15", label: "F15",  shortcut: "F15",     icon: "⌨" },
  { fn: "F16", label: "F16",  shortcut: "L+1",     icon: "▶", media: true },
  { fn: "F17", label: "F17",  shortcut: "F17",     icon: "⌨" },
  { fn: "F18", label: "F18",  shortcut: "Alt+Tab", icon: "⌨" },
  { fn: "F19", label: "APP",  shortcut: "APP",     icon: "🚀", special: true },
  { fn: "F20", label: "F20",  shortcut: "F20",     icon: "⌨" },
  { fn: "F21", label: "F21",  shortcut: "F21",     icon: "⌨" },
  { fn: "F22", label: "F22",  shortcut: "F22",     icon: "⌨" },
  { fn: "F23", label: "F23",  shortcut: "F23",     icon: "⌨" },
  { fn: "F24", label: "F24",  shortcut: "F24",     icon: "⌨" },
];

export default function KeyMatrix() {
  const [active, setActive] = useState<number | null>(null);

  function press(i: number) {
    setActive(i);
    setTimeout(() => setActive(p => p === i ? null : p), 300);
  }

  return (
    <div className="key-matrix-sw">
      {KEYS.map((k, i) => (
        <motion.button
          key={i}
          className={[
            "key-sw",
            k.special ? "key-sw--special" : "",
            k.media   ? "key-sw--media"   : "",
            active === i ? "key-sw--active" : "",
          ].filter(Boolean).join(" ")}
          onTap={() => press(i)}
          whileTap={{ y: 3, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 600, damping: 20 }}
          aria-label={k.label}
        >
          <div className="key-sw-header">
            <span className="key-sw-icon">{k.icon}</span>
            <span className="key-sw-fn">{k.fn}</span>
          </div>
          <span className="key-sw-label">{k.label}</span>
          <div
            className="key-sw-pill"
            style={
              k.special ? {
                background: "rgba(245,158,11,0.18)",
                borderColor: "rgba(245,158,11,0.45)",
                color: "#f59e0b",
              } : k.media ? {
                background: "rgba(56,189,248,0.12)",
                borderColor: "rgba(56,189,248,0.35)",
                color: "#38bdf8",
              } : undefined
            }
          >
            {k.shortcut}
          </div>
        </motion.button>
      ))}
    </div>
  );
}
