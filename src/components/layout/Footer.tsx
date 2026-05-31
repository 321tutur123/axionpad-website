"use client";
import Link from "next/link";
import { IconShield, IconPackage } from "@/components/ui/Icons";

const NAV = [
  {
    title: "Boutique",
    links: [
      { href: "/shop",                        label: "Tous les produits" },
      { href: "/shop?category=macro-pads",    label: "Macro Pads" },
      { href: "/shop?category=kits",          label: "Kits DIY" },
      { href: "/shop?category=accessories",   label: "Accessoires" },
    ],
  },
  {
    title: "Aide",
    links: [
      { href: "/track",        label: "Suivi de commande" },
      { href: "/software",     label: "Logiciel configurateur" },
      { href: "/about",        label: "À propos" },
      { href: "mailto:contact@axionpad.fr", label: "Contact" },
      { href: "/cgv#7",        label: "Retours & remboursements" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/mentions-legales",  label: "Mentions légales" },
      { href: "/cgv",               label: "CGV" },
      { href: "/confidentialite",   label: "Politique de confidentialité" },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{ background: "var(--color-bg-soft)", borderTop: "1px solid var(--color-border)" }}>

      {/* Bandeau "Fabriqué en France" */}
      <div
        className="w-full py-3 text-center text-sm font-semibold"
        style={{ background: "var(--color-accent)", color: "#FAF7EF", letterSpacing: "0.01em" }}
      >
        🇫🇷 Fabriqué en France · Orléans — assemblé et expédié à la main
      </div>

      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="font-bold text-xl tracking-tight" style={{ color: "var(--color-text)", fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.02em" }}>
              Axion<span style={{ color: "var(--color-accent)" }}>Pad</span>
            </Link>
            <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--color-text-mute)" }}>
              Macro pad RP2040 open-source.<br />
              Fabriqué à la main en France.
            </p>
            <div className="flex items-center gap-1.5 mt-5">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--color-green)" }} />
              <span className="text-xs" style={{ color: "var(--color-text-mute)" }}>En stock — expédié sous 5 jours</span>
            </div>
          </div>

          {/* Nav columns */}
          {NAV.map(col => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--color-text-mute)", fontFamily: "var(--font-mono)" }}>
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors"
                      style={{ color: "var(--color-text-mute)" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-mute)")}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <p className="text-xs" style={{ color: "var(--color-text-mute)" }}>
            © {new Date().getFullYear()} Axion Pad — Arthur Delacour. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: "var(--color-text-mute)" }}>
            <span className="inline-flex items-center gap-1.5">
              <IconShield size={14} /> Paiement sécurisé Stripe
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5">
              <IconPackage size={14} /> Expédié depuis Orléans
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
