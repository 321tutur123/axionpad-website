import Link from "next/link";
import { notFound } from "next/navigation";
import { getComponent, COMPONENTS } from "@/lib/components-data";

const SLUG_EMOJI: Record<string, string> = {
  pcb: "🔌",
  switches: "⌨️",
  body: "📦",
  top: "🪟",
  bottom: "🔩",
};

export function generateStaticParams() {
  return Object.keys(COMPONENTS).map(slug => ({ slug }));
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const component = getComponent(slug);
  if (!component) notFound();

  const emoji = SLUG_EMOJI[slug] ?? "📐";

  return (
    <main style={{ minHeight: "100vh", background: "transparent", paddingTop: "80px" }}>
      <div className="max-w-[1100px] mx-auto px-6 py-14 md:py-20">

        <nav className="flex flex-wrap items-center gap-2 text-sm mb-10 md:mb-14">
          <Link
            href="/"
            className="transition-colors"
            style={{ color: "var(--color-text-mute)" }}
          >
            Accueil
          </Link>
          <span style={{ color: "var(--color-text-mute)" }} aria-hidden>/</span>
          <Link
            href="/#hero"
            className="transition-colors"
            style={{ color: "var(--color-text-mute)" }}
          >
            Axion Pad
          </Link>
          <span style={{ color: "var(--color-text-mute)" }} aria-hidden>/</span>
          <span style={{ color: "var(--color-text)" }}>{component.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-start">

          <div
            className="card aspect-square overflow-hidden flex items-center justify-center text-8xl select-none relative"
            style={{
              borderColor: `${component.color}40`,
              background: `
                radial-gradient(circle at 38% 32%, ${component.color}22 0%, transparent 55%),
                var(--color-bg-soft)
              `,
              boxShadow: `0 1px 2px rgba(20,17,13,0.06), 0 12px 28px rgba(20,17,13,0.08)`,
            }}
          >
            <span className="relative z-[1]" aria-hidden>{emoji}</span>
          </div>

          <div>
            <div
              className="badge mb-4 inline-flex border"
              style={{
                borderColor: `${component.color}40`,
                background: `${component.color}18`,
                color: component.color,
              }}
            >
              Composant
            </div>
            <h1
              className="font-semibold mb-2 tracking-tight"
              style={{
                fontSize: "clamp(1.875rem, 4vw, 2.75rem)",
                color: "var(--color-text)",
                letterSpacing: "-0.02em",
              }}
            >
              {component.name}
            </h1>
            <p className="mb-6 font-medium" style={{ fontSize: "1rem", color: "var(--color-accent)" }}>
              {component.subtitle}
            </p>
            <p
              className="leading-relaxed mb-10"
              style={{ fontSize: "1rem", color: "var(--color-text-mute)", lineHeight: 1.75 }}
            >
              {component.description}
            </p>

            <div className="space-y-0 mb-10 rounded-xl border overflow-hidden"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-bg-card)",
              }}
            >
              {component.specs.map(s => (
                <div
                  key={s.label}
                  className="flex justify-between gap-6 py-3.5 px-4 border-b last:border-b-0"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <span className="text-sm shrink-0" style={{ color: "var(--color-text-mute)" }}>
                    {s.label}
                  </span>
                  <span className="text-sm font-medium text-right" style={{ color: "var(--color-text)" }}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/shop" className="btn-accent w-full sm:w-auto text-center" style={{ padding: "14px 32px" }}>
                Commander l&apos;Axion Pad
              </Link>
              <Link href="/#hero" className="btn-ghost w-full sm:w-auto justify-center">
                ← Vue 3D
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-20 md:mt-28">
          <h2
            className="text-sm font-semibold uppercase tracking-widest mb-6"
            style={{ color: "var(--color-text-mute)", letterSpacing: "0.12em" }}
          >
            Autres composants
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {Object.values(COMPONENTS)
              .filter(c => c.slug !== slug)
              .map(c => (
                <Link
                  key={c.slug}
                  href={`/components/${c.slug}`}
                  className="card p-4 md:p-5 group no-underline"
                  style={{ height: "100%" }}
                >
                  <div
                    className="text-xs mb-1 uppercase tracking-wide transition-colors"
                    style={{ color: "var(--color-text-mute)" }}
                  >
                    {c.slug}
                  </div>
                  <div
                    className="text-sm font-medium transition-colors"
                    style={{ color: "var(--color-text)" }}
                  >
                    {c.name}
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
