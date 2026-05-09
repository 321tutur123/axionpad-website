"use client";
import { motion } from "framer-motion";

const SPECS = [
  ["ARCH",  "Cortex-M0+ ×2"],
  ["CLOCK", "133 MHz"],
  ["SRAM",  "264 KB"],
  ["FLASH", "2 MB (ext)"],
  ["USB",   "1.1 FS HID"],
  ["GPIO",  "30 pins"],
];

export default function McuPanel() {
  return (
    <div className="mcu-panel">
      <div className="mcu-chip-wrap">
        <motion.div
          className="mcu-chip"
          animate={{ boxShadow: ["0 0 0px rgba(34,197,94,0)", "0 0 18px rgba(34,197,94,0.30)", "0 0 0px rgba(34,197,94,0)"] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="mcu-pins mcu-pins-l">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="mcu-pin" />)}</div>
          <div className="mcu-chip-inner">
            <span className="mcu-chip-name">RP2040</span>
            <span className="mcu-chip-brand">RASPBERRY PI</span>
          </div>
          <div className="mcu-pins mcu-pins-r">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="mcu-pin" />)}</div>
        </motion.div>
      </div>
      <div className="mcu-specs">
        {SPECS.map(([k, v]) => (
          <div key={k} className="mcu-spec-row">
            <span className="mcu-spec-key">{k}</span>
            <span className="mcu-spec-val">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
