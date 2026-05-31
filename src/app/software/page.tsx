import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logiciel Configurateur — Axion Pad",
  description: "Configurez votre Axion Pad en quelques clics. Mappings, macros, layers, protocole AxionPad Native, optimisation CPU ultra-faible. Gratuit, open-source, Windows.",
};

const FEATURES = [
  {
    icon: "⌨️",
    title: "Mapping visuel",
    desc: "Assigne une action à chaque touche. Raccourcis clavier, texte, lancement d'appli, séquences personnalisées.",
    color: "#E8431F",
  },
  {
    icon: "⚡",
    title: "Macros",
    desc: "Enregistre et rejoue des séquences de touches complexes avec délais personnalisables.",
    color: "#0F766E",
  },
  {
    icon: "📚",
    title: "Layers",
    desc: "Jusqu'à 3 layers par profil. Bascule via une touche dédiée pour multiplier les fonctions.",
    color: "#38bdf8",
  },
  {
    icon: "🎚️",
    title: "AxionPad Native",
    desc: "Contrôle le volume de chaque application via les 4 potentiomètres. CPU ultra-faible, Watchdog intégré.",
    color: "#fcd34d",
  },
  {
    icon: "🎨",
    title: "RGB NeoPixel",
    desc: "Contrôle complet des LEDs : statique, breathing, wave — depuis l'app ou l'API OpenRGB.",
    color: "#E8431F",
  },
  {
    icon: "🔄",
    title: "Sync instantanée",
    desc: "Les modifications sont appliquées en temps réel. Aucun redémarrage requis.",
    color: "#0F766E",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Branche ton Axion Pad",
    desc: "Il apparaît comme une clé USB nommée AXIONPAD. Aucun driver à installer.",
  },
  {
    n: "02",
    title: "Ouvre le Configurateur",
    desc: "Clique sur une touche, choisis son action. Les changements sont sauvegardés en direct sur le pad.",
  },
  {
    n: "03",
    title: "C'est prêt",
    desc: "Débranche, rebranche — ta config est stockée dans la mémoire flash du pad, pas sur ton PC.",
  },
];

export default function SoftwarePage() {
  return (
    <main className="min-h-screen pb-12" style={{ background: "transparent", paddingTop: "5.5rem" }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="pb-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Text */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium mb-6"
              style={{
                background: "rgba(232, 67, 31,0.10)",
                borderColor: "rgba(232, 67, 31,0.25)",
                color: "var(--color-accent)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-accent)" }} />
              v2.1 — Gratuit &amp; open-source
            </div>
            <h1
              className="text-4xl md:text-5xl font-semibold mb-5 leading-tight"
              style={{ color: "var(--color-text)", letterSpacing: "-0.025em" }}
            >
              Axion Pad<br />
              <span style={{ color: "var(--color-accent)" }}>Configurateur</span>
            </h1>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "var(--color-text-mute)" }}>
              L'application desktop pour programmer ton Axion Pad sans toucher à une ligne de code.
              Mappings, macros, layers, protocole AxionPad Native — tout en quelques clics.
            </p>
            <div className="flex flex-wrap gap-3">
              <DownloadButton os="Windows" icon="🪟" ext=".msi" href="https://github.com/321tutur123/axion-pad-apps/tree/main/application/dist" primary />
              <DownloadButton os="macOS"   icon="🍎" ext=".dmg" href="https://github.com/321tutur123/axion-pad-apps/tree/main/application/dist" />
              <DownloadButton os="Linux"   icon="🐧" ext=".AppImage" href="https://github.com/321tutur123/axion-pad-apps/tree/main/application/dist" />
            </div>
            <p className="text-xs mt-4" style={{ color: "var(--color-text-mute)" }}>
              Windows 10+ requis · Java 17 embarqué · Aucune installation manuelle
            </p>
          </div>

          {/* App mockup — pixel-faithful real app */}
          <AppMockup />
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-semibold mb-3" style={{ color: "var(--color-text)", letterSpacing: "-0.02em" }}>
            Tout ce dont tu as besoin
          </h2>
          <p style={{ color: "var(--color-text-mute)" }}>Puissant pour les utilisateurs avancés, simple pour commencer.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="p-5 rounded-2xl border transition-all card"
              style={{ borderColor: "var(--color-border)", background: "var(--color-bg-card)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ background: `${f.color}14`, border: `1px solid ${f.color}30` }}
              >
                {f.icon}
              </div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-mute)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AxionPad Native — potentiomètres ─────────────────────── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <DeejMockup />
          <div>
            <div
              className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border mb-5"
              style={{
                background: "rgba(252,211,77,0.10)",
                color: "#fcd34d",
                borderColor: "rgba(252,211,77,0.28)",
              }}
            >
              Protocole AxionPad Native
            </div>
            <h2 className="text-3xl font-semibold mb-4" style={{ color: "var(--color-text)", letterSpacing: "-0.02em" }}>
              Un potentiomètre,<br />un volume.
            </h2>
            <p className="leading-relaxed mb-6" style={{ color: "var(--color-text-mute)" }}>
              Chacun des 4 potentiomètres peut être assigné à n'importe quelle
              application en cours d'exécution. Plus besoin de plonger dans le mixer Windows.
            </p>
            <ul className="space-y-3">
              {[
                "Pot 1 → Volume système",
                "Pot 2 → Spotify / musique",
                "Pot 3 → Discord / voix",
                "Pot 4 → Navigateur web",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm" style={{ color: "var(--color-text)" }}>
                  <span
                    className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: "rgba(232, 67, 31,0.10)",
                      borderColor: "rgba(232, 67, 31,0.30)",
                      color: "var(--color-accent)",
                    }}
                  >
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-xs mt-5" style={{ color: "var(--color-text-mute)" }}>
              Protocole AxionPad Native — bas-latence, Watchdog auto-recovery intégré.
            </p>
          </div>
        </div>
      </section>

      {/* ── CircuitPython ─────────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div
          className="rounded-3xl border p-10 md:p-14"
          style={{
            borderColor: "rgba(232, 67, 31,0.18)",
            background: "linear-gradient(145deg, rgba(232, 67, 31,0.06) 0%, var(--color-bg-card) 40%, rgba(15, 118, 110,0.04) 100%)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div
                className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border mb-5"
                style={{
                  background: "rgba(15, 118, 110,0.10)",
                  color: "#0F766E",
                  borderColor: "rgba(15, 118, 110,0.28)",
                }}
              >
                Mode avancé
              </div>
              <h2 className="text-3xl font-semibold mb-4" style={{ color: "var(--color-text)", letterSpacing: "-0.02em" }}>
                Pas de limites avec CircuitPython
              </h2>
              <p className="leading-relaxed mb-6" style={{ color: "var(--color-text-mute)" }}>
                Si le configurateur ne suffit plus, édite{" "}
                <code
                  className="px-1.5 py-0.5 rounded text-sm"
                  style={{ color: "var(--color-accent)", background: "rgba(232, 67, 31,0.10)" }}
                >
                  code.py
                </code>{" "}
                à la racine du volume USB. Dans le dépôt, la version Standard est le fichier{" "}
                <code
                  className="px-1.5 py-0.5 rounded text-sm"
                  style={{ color: "var(--color-accent)", background: "rgba(232, 67, 31,0.10)" }}
                >
                  firmwares/STANDARD/code.py
                </code>
                . Sauvegarde → rechargement immédiat, zéro compilation.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://circuitpython.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full border text-sm transition-opacity hover:opacity-80"
                  style={{ borderColor: "rgba(15, 118, 110,0.30)", color: "#0F766E", background: "rgba(15, 118, 110,0.08)" }}
                >
                  Doc CircuitPython →
                </a>
                <a
                  href="https://github.com/321tutur123/axion-pad-apps/tree/main/firmwares"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full border text-sm transition-colors"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-mute)" }}
                >
                  GitHub — firmwares/STANDARD →
                </a>
              </div>
            </div>
            <CodeSnippet />
          </div>
        </div>
      </section>

      {/* ── Getting started ─────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h2
          className="text-3xl font-semibold text-center mb-14"
          style={{ color: "var(--color-text)", letterSpacing: "-0.02em" }}
        >
          Opérationnel en 3 minutes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map(step => (
            <div
              key={step.n}
              className="relative p-6 rounded-2xl border card"
              style={{ borderColor: "var(--color-border)", background: "var(--color-bg-card)" }}
            >
              <div
                className="text-5xl font-black absolute top-4 right-5 leading-none select-none"
                style={{ color: "rgba(232, 67, 31,0.07)" }}
              >
                {step.n}
              </div>
              <div
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--color-accent)" }}
              >
                Étape {step.n}
              </div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-mute)" }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Download ─────────────────────────────────────────────── */}
      <section id="download" className="py-20 px-6 max-w-3xl mx-auto text-center">
        <div className="p-10 rounded-3xl border card" style={{ borderColor: "rgba(232, 67, 31,0.18)", background: "var(--color-bg-card-alt)" }}>
          <div className="text-5xl mb-5">⬇️</div>
          <h2 className="text-3xl font-semibold mb-3" style={{ color: "var(--color-text)", letterSpacing: "-0.02em" }}>
            Télécharger le configurateur
          </h2>
          <p className="mb-8" style={{ color: "var(--color-text-mute)" }}>
            Gratuit, sans publicité, sans télémétrie. Code source disponible sur GitHub.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <DownloadButton os="Windows" icon="🪟" ext=".msi"      href="https://github.com/321tutur123/axion-pad-apps/tree/main/application/dist" primary size="lg" />
            <DownloadButton os="macOS"   icon="🍎" ext=".dmg"      href="https://github.com/321tutur123/axion-pad-apps/tree/main/application/dist" size="lg" />
            <DownloadButton os="Linux"   icon="🐧" ext=".AppImage" href="https://github.com/321tutur123/axion-pad-apps/tree/main/application/dist" size="lg" />
          </div>
          <p className="text-xs" style={{ color: "var(--color-text-mute)" }}>
            v2.1.0 · ~45 MB · Java 17 embarqué · Nécessite l'Axion Pad pour fonctionner
          </p>
        </div>
      </section>

      {/* ── CTA shop ─────────────────────────────────────────────── */}
      <section className="py-16 px-6 text-center">
        <p className="text-sm mb-4" style={{ color: "var(--color-text-mute)" }}>
          Tu n&apos;as pas encore l&apos;Axion Pad ?
        </p>
        <Link href="/shop" className="btn-accent inline-flex px-8 py-3.5 font-semibold">
          Commander — à partir de 49,99 €
        </Link>
      </section>

    </main>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function DownloadButton({
  os, icon, ext, href, primary = false, size = "md",
}: {
  os: string; icon: string; ext: string; href: string;
  primary?: boolean; size?: "md" | "lg";
}) {
  const pad = size === "lg" ? "px-6 py-3.5 text-sm" : "px-4 py-2.5 text-sm";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2.5 rounded-full font-medium transition-all ${pad} ${
        primary ? "btn-accent shadow-md" : "border"
      }`}
      style={
        primary
          ? undefined
          : { borderColor: "var(--color-border)", color: "var(--color-text)", background: "var(--color-bg-card)" }
      }
    >
      <span>{icon}</span>
      <span>{os}</span>
      <span
        className="text-xs"
        style={primary ? { opacity: 0.85 } : { color: "var(--color-text-mute)" }}
      >
        {ext}
      </span>
    </a>
  );
}

// ── AppMockup — pixel-faithful to real AxionPad Configurator ───────────────
const MOCKUP_KEYS: { fn: string; label: string; action: string; icon: string; variant?: "amber" | "purple" }[] = [
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

const MOCKUP_FADERS = [
  { id: 1, emoji: "🔊", name: "Master",  pct: 48,  color: "#fcd34d", glow: "rgba(252,211,77,0.55)"  },
  { id: 2, emoji: "🎵", name: "OBS",     pct: 100, color: "#6ee7b7", glow: "rgba(110,231,183,0.55)" },
  { id: 3, emoji: "🎧", name: "Discord", pct: 97,  color: "#fdba74", glow: "rgba(253,186,116,0.55)" },
  { id: 4, emoji: "🌐", name: "Musique", pct: 4,   color: "#93c5fd", glow: "rgba(147,197,253,0.50)" },
];

function AppMockup() {
  return (
    <div className="sw-window">
      {/* Titlebar */}
      <div className="sw-titlebar">
        <div className="sw-dots">
          <span style={{ background: "#ff5f57" }} />
          <span style={{ background: "#febc2e" }} />
          <span style={{ background: "#28c840" }} />
        </div>
        <span className="sw-logo">▲</span>
        <span className="sw-app-name">AxionPad</span>
        <div className="sw-device-pill">AxionPad Elite</div>
        <div style={{ flex: 1 }} />
        <div className="sw-status-pill">
          <span className="sw-status-dot" />
          Axion Pad connecté
        </div>
      </div>

      {/* Tab bar */}
      <div className="sw-tabs-bar">
        {["Contrôles", "Presets", "RGB", "Paramètres"].map((t, i) => (
          <div key={t} className={`sw-tab${i === 0 ? " sw-tab--active" : ""}`}>{t}</div>
        ))}
      </div>

      {/* Body: keys left + faders right */}
      <div className="sw-body">
        {/* Keys workbench */}
        <div className="sw-keys-zone">
          <div className="sw-layer-bar">
            <button className="sw-layer-btn" aria-label="précédent">◀</button>
            <div className="sw-layer-active">Layer 1</div>
            <button className="sw-layer-btn" aria-label="suivant">▶</button>
            <button className="sw-layer-add" aria-label="ajouter">+</button>
          </div>
          <div className="sw-keys-subtitle">AxionPad Elite — 12 touches</div>
          <div className="sw-key-simple-grid">
            {MOCKUP_KEYS.map((k, i) => (
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

        {/* Faders */}
        <div className="sw-faders-zone">
          <div className="sw-faders-header">4 potentiomètres</div>
          <div className="sw-faders-row">
            {MOCKUP_FADERS.map(ch => (
              <div key={ch.id} className="sw-fader-col">
                <span className="sw-fader-pct" style={{ color: ch.color }}>{ch.pct}%</span>
                <div className="sw-fader-wrap">
                  <div className="sw-fader-track">
                    <div
                      className="sw-fader-fill"
                      style={{ height: `${ch.pct}%`, background: ch.color, boxShadow: `0 0 12px ${ch.glow}` }}
                    />
                  </div>
                  <div
                    className="sw-fader-knob"
                    style={{
                      bottom: `calc(${ch.pct}% - 12px)`,
                      borderColor: ch.color,
                      boxShadow: `0 0 0 3px ${ch.glow}, 0 2px 8px rgba(0,0,0,0.70), inset 0 1px 0 rgba(255,255,255,0.12)`,
                    }}
                  />
                </div>
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
    </div>
  );
}

// ── DeejMockup — faithful DEEJ-style faders ────────────────────────────────
const DEEJ_CHANNELS = [
  { id: 1, emoji: "🔊", name: "Système",  pct: 85, color: "#fcd34d", glow: "rgba(252,211,77,0.55)"  },
  { id: 2, emoji: "🎵", name: "Spotify",  pct: 62, color: "#6ee7b7", glow: "rgba(110,231,183,0.55)" },
  { id: 3, emoji: "🎧", name: "Discord",  pct: 40, color: "#fdba74", glow: "rgba(253,186,116,0.55)" },
  { id: 4, emoji: "🌐", name: "Chrome",   pct: 70, color: "#93c5fd", glow: "rgba(147,197,253,0.50)" },
];

function DeejMockup() {
  return (
    <div className="sw-window" style={{ maxWidth: "320px" }}>
      <div className="sw-titlebar">
        <div className="sw-dots">
          <span style={{ background: "#ff5f57" }} />
          <span style={{ background: "#febc2e" }} />
          <span style={{ background: "#28c840" }} />
        </div>
        <span className="sw-logo">▲</span>
        <span className="sw-app-name">AxionPad</span>
        <div style={{ flex: 1 }} />
        <div className="sw-status-pill">
          <span className="sw-status-dot" />
          Connecté
        </div>
      </div>

      <div className="sw-tabs-bar">
        <div className="sw-tab sw-tab--active">Contrôles</div>
        <div className="sw-tab">Presets</div>
        <div className="sw-tab">RGB</div>
      </div>

      {/* Faders only — no key zone */}
      <div className="sw-faders-zone" style={{ width: "100%", minWidth: "unset", borderLeft: "none", padding: "16px 20px" }}>
        <div className="sw-faders-header" style={{ marginBottom: "12px" }}>
          4 canaux · sortie native AxionPad
        </div>
        <div className="sw-faders-row" style={{ gap: "16px", justifyContent: "space-between" }}>
          {DEEJ_CHANNELS.map(ch => (
            <div key={ch.id} className="sw-fader-col">
              <span className="sw-fader-pct" style={{ color: ch.color }}>{ch.pct}%</span>
              <div className="sw-fader-wrap" style={{ height: "130px" }}>
                <div className="sw-fader-track">
                  <div
                    className="sw-fader-fill"
                    style={{ height: `${ch.pct}%`, background: ch.color, boxShadow: `0 0 12px ${ch.glow}` }}
                  />
                </div>
                <div
                  className="sw-fader-knob"
                  style={{
                    bottom: `calc(${ch.pct}% - 12px)`,
                    borderColor: ch.color,
                    boxShadow: `0 0 0 3px ${ch.glow}, 0 2px 8px rgba(0,0,0,0.70), inset 0 1px 0 rgba(255,255,255,0.12)`,
                  }}
                />
              </div>
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
  );
}

/** Extrait colorisé — firmwares/STANDARD/code.py */
function CodeSnippet() {
  const kw  = "#c678dd";
  const def = "#abb2bf";
  const str = "#98c379";
  const fn  = "#61afef";
  const varC = "#e06c75";
  const cls = "#e5c07b";
  const cm  = "#5c6370";
  const num = "#d19a66";

  const lines = [
    { indent: 0, tokens: [{ t: "# firmwares/STANDARD/code.py — Standard v2.1.0", c: cm }] },
    { indent: 0, tokens: [] },
    { indent: 0, tokens: [{ t: "import ", c: kw }, { t: "analogio", c: cls }, { t: ", board, usb_hid", c: def }] },
    { indent: 0, tokens: [{ t: "from ", c: kw }, { t: "adafruit_hid.keyboard ", c: def }, { t: "import ", c: kw }, { t: "Keyboard", c: cls }] },
    { indent: 0, tokens: [{ t: "from ", c: kw }, { t: "adafruit_hid.keycode ", c: def }, { t: "import ", c: kw }, { t: "Keycode", c: cls }] },
    { indent: 0, tokens: [{ t: "import ", c: kw }, { t: "time", c: cls }] },
    { indent: 0, tokens: [] },
    { indent: 0, tokens: [{ t: "DEVICE_ID ", c: varC }, { t: "= ", c: def }, { t: '"AXIONPAD:STANDARD"', c: str }] },
    { indent: 0, tokens: [] },
    { indent: 0, tokens: [{ t: "sliders ", c: varC }, { t: "= [", c: def }] },
    { indent: 1, tokens: [{ t: "analogio.AnalogIn(board.GP26), analogio.AnalogIn(board.GP27),", c: def }] },
    { indent: 1, tokens: [{ t: "analogio.AnalogIn(board.GP28), analogio.AnalogIn(board.GP29),", c: def }] },
    { indent: 0, tokens: [{ t: "]", c: def }] },
    { indent: 0, tokens: [{ t: "kbd ", c: varC }, { t: "= ", c: def }, { t: "Keyboard", c: cls }, { t: "(usb_hid.devices)", c: def }] },
    { indent: 0, tokens: [] },
    { indent: 0, tokens: [{ t: "while ", c: kw }, { t: "True", c: cls }, { t: ":", c: def }] },
    { indent: 1, tokens: [{ t: "vals ", c: varC }, { t: "= [", c: def }, { t: "str", c: fn }, { t: "(int(s.value / 64)) ", c: def }, { t: "for", c: kw }, { t: " s ", c: def }, { t: "in", c: kw }, { t: " sliders]", c: def }] },
    { indent: 1, tokens: [{ t: "print", c: fn }, { t: '("', c: def }, { t: "|", c: str }, { t: '".join(vals))', c: def }] },
    { indent: 1, tokens: [{ t: "time.sleep", c: fn }, { t: "(", c: def }, { t: "0.01", c: num }, { t: ")", c: def }] },
  ];

  return (
    <div className="rounded-2xl overflow-hidden border shadow-xl" style={{ borderColor: "var(--color-border)", background: "#1a1a2e" }}>
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--color-border)", background: "var(--color-bg-soft)" }}
      >
        <div className="flex items-center gap-1.5">
          {["#ff5f57","#febc2e","#28c840"].map(c => (
            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <span className="text-xs font-mono" style={{ color: "var(--color-text-mute)" }}>
          firmwares/STANDARD/code.py
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-accent)" }} />
          <span className="text-[10px]" style={{ color: "var(--color-text-mute)" }}>modifié</span>
        </div>
      </div>
      <div className="p-4 font-mono text-xs leading-6 overflow-x-auto" style={{ background: "#14141f" }}>
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="w-7 shrink-0 text-right mr-3 select-none" style={{ color: "rgba(255,255,255,0.2)" }}>
              {i + 1}
            </span>
            <span>
              {"  ".repeat(line.indent)}
              {line.tokens.map((tok, j) => (
                <span key={j} style={{ color: tok.c }}>{tok.t}</span>
              ))}
            </span>
          </div>
        ))}
      </div>
      <div
        className="px-4 py-3 border-t flex items-center gap-2"
        style={{ borderColor: "var(--color-border)", background: "var(--color-bg-soft)" }}
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#0F766E" }} />
        <span className="text-xs" style={{ color: "var(--color-text-mute)" }}>
          Sauvegardé — mise à jour instantanée
        </span>
      </div>
    </div>
  );
}
