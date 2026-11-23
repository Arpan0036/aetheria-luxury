export default function RootLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading AETHERIA Archive"
      className="mx-auto max-w-[1440px] px-5 py-20 md:px-8"
    >
      <div className="rounded-[28px] border border-line bg-surface/75 p-8 sm:p-12">
        <div className="flex items-center gap-3 font-mono text-[10.5px] tracking-[0.2em] text-muted">
          <span className="size-2 animate-ping rounded-full bg-accent" aria-hidden />
          <span>SYNCHRONIZING WITH AETHERIA OBJECT ARCHIVE…</span>
        </div>

        <div className="mt-8 space-y-4">
          <div className="h-12 w-2/3 max-w-xl animate-pulse rounded-2xl bg-line/70" />
          <div className="h-5 w-1/2 max-w-md animate-pulse rounded-xl bg-line/50" />
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="aspect-[4/4.5] animate-pulse rounded-[24px] border border-line bg-canvas/80 p-6"
            >
              <div className="h-3 w-24 rounded-full bg-line/70" />
              <div className="mt-4 h-7 w-3/4 rounded-xl bg-line/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
