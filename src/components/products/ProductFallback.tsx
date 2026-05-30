type KV = "d" | "p" | "g";

const PAD_ELITE: KV[][] = [["d","d","p","d"],["d","g","d","d"],["d","d","d","p"]];
const PAD_MINI:  KV[][] = [["d","p","d"],["d","d","g"]];

const FADER_LEVELS = [58, 28, 75, 44];

function PadVisual({ keys, cols, pots = 0 }: { keys: KV[][]; cols: 3 | 4 | 5; pots?: number }) {
  const levels = FADER_LEVELS;
  return (
    <div className="mini-pad">
      <div className="mini-led" aria-hidden />
      <div className="mini-pad-body">
        <div className={`mini-key-grid mini-key-grid--${cols}c`}>
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

export default function ProductFallback({ slug, category }: { slug: string; category: string }) {
  if (slug === "axion-pad-standard") return <PadVisual keys={PAD_ELITE} cols={4} pots={4} />;
  if (slug === "axion-pad-mini")     return <PadVisual keys={PAD_MINI}  cols={3} pots={0} />;
  const emoji =
    slug.includes("cable")  ? "🔌" :
    slug.includes("keycap") ? "⌨️" :
    slug.includes("pcb")    ? "🔬" :
    category === "kits"     ? "🔧" :
    "📦";
  return <span style={{ fontSize: "3.5rem", lineHeight: 1 }}>{emoji}</span>;
}
