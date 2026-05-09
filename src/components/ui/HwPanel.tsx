"use client";
import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface HwPanelProps extends Omit<HTMLMotionProps<"div">, "title"> {
  children: ReactNode;
  title?: string;
  badge?: string;
  glow?: boolean;
}

export default function HwPanel({ children, title, badge, glow = false, className = "", style, ...rest }: HwPanelProps) {
  return (
    <motion.div
      className={`hw-panel${glow ? " hw-panel--glow" : ""} ${className}`}
      style={style}
      whileHover={{
        borderColor: "rgba(34, 197, 94, 0.28)",
        boxShadow: [
          "0 1px 0 rgba(255,255,255,0.07) inset",
          "0 -1px 0 rgba(0,0,0,0.10) inset",
          "0 8px 40px rgba(0,0,0,0.50)",
          "0 0 24px rgba(34,197,94,0.10)",
        ].join(", "),
      }}
      transition={{ duration: 0.18 }}
      {...rest}
    >
      {(title || badge) && (
        <div className="hw-panel-header">
          {badge && <span className="hw-panel-badge">{badge}</span>}
          {title && <span className="hw-panel-title">{title}</span>}
        </div>
      )}
      {children}
    </motion.div>
  );
}
