const ITEMS = [
  "ZERO-RENT ARCHITECTURE",
  "CNC AL-6061",
  "ITALIAN TRAVERTINE",
  "5-YEAR COLLECTOR WARRANTY",
  "50MM BERYLLIUM TRANSDUCERS",
  "CRI 98+ BOROSILICATE OPTICS",
  "HAND-ASSEMBLED IN SMALL BATCHES",
];

function Run({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={hidden || undefined}>
      {ITEMS.map((item) => (
        <li key={item} className="flex items-center gap-8 whitespace-nowrap">
          <span>{item}</span>
          <span aria-hidden className="text-accent">
            ◆
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Architectural specification ticker strip between hero and departments. */
export function SpecTickerStrip() {
  return (
    <div
      role="region"
      aria-label="Architectural specifications"
      className="marquee border-y border-line bg-surface py-4 font-mono text-[11px] tracking-[0.2em] text-ink"
    >
      <div className="marquee-track" style={{ ["--marquee-duration" as string]: "48s" }}>
        <Run />
        <Run hidden />
      </div>
    </div>
  );
}
