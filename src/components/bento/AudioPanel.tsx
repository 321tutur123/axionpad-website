"use client";
import { motion } from "framer-motion";

const CHANNELS = [
  { id: 1, app: "Master",  icon: "🔊", val: 24, hex: "#f59e0b", glow: "rgba(245,158,11,0.50)" },
  { id: 2, app: "Jeu",     icon: "🎵", val: 83, hex: "#22c55e", glow: "rgba(34,197,94,0.50)"  },
  { id: 3, app: "Discord", icon: "🎧", val: 31, hex: "#f59e0b", glow: "rgba(245,158,11,0.50)" },
  { id: 4, app: "Musique", icon: "🌐", val: 3,  hex: "#38bdf8", glow: "rgba(56,189,248,0.50)" },
];

export default function AudioPanel() {
  return (
    <div className="audio-sw">
      <p className="audio-sw-desc">4 canaux · sortie native AxionPad</p>
      <div className="audio-sw-channels">
        {CHANNELS.map((ch, i) => (
          <div key={ch.id} className="audio-sw-ch">
            <span className="audio-sw-pct" style={{ color: ch.hex }}>{ch.val}%</span>

            <div className="audio-sw-track">
              <motion.div
                className="audio-sw-fill"
                initial={{ height: "0%" }}
                whileInView={{ height: `${ch.val}%` }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.13, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: ch.hex, boxShadow: `0 0 18px ${ch.glow}` }}
              />
            </div>

            <span className="audio-sw-icon">{ch.icon}</span>
            <span className="audio-sw-name">{ch.app}</span>
            <div className="audio-sw-badge" style={{ borderColor: ch.hex, color: ch.hex }}>
              {ch.id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
