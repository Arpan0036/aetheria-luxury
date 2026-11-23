/**
 * Sculptural, theme-adaptive CSS renders standing in for product photography
 * until the WebGL product stage lands in a later phase.
 */
export type ObjectKind = "orb" | "monolith" | "lamp" | "recorder" | "ring" | "tray";

const shadow = (w: string) => (
  <div
    aria-hidden
    className="absolute bottom-[14%] left-1/2 h-4 -translate-x-1/2 rounded-[50%] bg-[rgb(var(--shadow-tint)/0.28)] blur-md"
    style={{ width: w }}
  />
);

export function ObjectRender({ kind }: { kind: ObjectKind }) {
  switch (kind) {
    case "orb":
      return (
        <>
          {shadow("46%")}
          <div
            className="absolute left-1/2 top-[18%] aspect-square w-[52%] -translate-x-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 34% 28%, #f3d3bf 0%, #d98a66 22%, var(--accent-primary) 48%, #6e2a16 100%)",
              boxShadow: "inset -14px -18px 40px rgba(40,12,4,0.45), inset 10px 12px 30px rgba(255,236,220,0.35)",
            }}
          >
            <div
              className="absolute inset-[22%] rounded-full opacity-50"
              style={{ background: "repeating-radial-gradient(circle at 50% 50%, rgba(20,10,5,0.35) 0 1.2px, transparent 1.6px 5px)" }}
            />
          </div>
        </>
      );
    case "monolith":
      return (
        <>
          {shadow("34%")}
          <div
            className="absolute left-1/2 top-[10%] h-[70%] w-[30%] -translate-x-1/2 rounded-[18px]"
            style={{
              background: "linear-gradient(105deg, #3b3936 0%, #1d1c1a 45%, #2c2a27 70%, #4a4743 100%)",
              boxShadow: "inset 1px 0 0 rgba(255,255,255,0.12), 0 30px 40px -24px rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="absolute inset-x-[16%] top-[10%] h-[52%] rounded-[10px] opacity-70"
              style={{ background: "radial-gradient(circle, rgba(247,244,239,0.28) 1.1px, transparent 1.5px) 0 0 / 7px 7px" }}
            />
            <div className="absolute bottom-[12%] left-1/2 size-[22%] -translate-x-1/2 rounded-full border border-white/20 bg-[radial-gradient(circle_at_40%_35%,#5a5651,#1b1a18)]" />
          </div>
        </>
      );
    case "lamp":
      return (
        <>
          {shadow("40%")}
          <div className="absolute bottom-[18%] left-1/2 h-[5%] w-[34%] -translate-x-1/2 rounded-[6px] bg-[linear-gradient(180deg,#d8d2c8,#a39c90)]" />
          <div className="absolute bottom-[22%] left-[46%] h-[50%] w-[3%] rounded-full bg-[linear-gradient(90deg,#9c958a,#e7e1d7,#8b847a)]" />
          <div
            className="absolute left-[30%] top-[16%] h-[18%] w-[42%] rounded-t-full"
            style={{
              background: "linear-gradient(180deg, var(--accent-primary), #8c3519)",
              boxShadow: "0 22px 50px 6px rgba(255,190,140,0.35)",
            }}
          />
        </>
      );
    case "recorder":
      return (
        <>
          {shadow("48%")}
          <div
            className="absolute left-1/2 top-[20%] aspect-[1/1.12] w-[46%] -translate-x-1/2 rounded-[22px]"
            style={{
              background: "linear-gradient(160deg, #ece7df 0%, #d6cfc4 60%, #bfb7aa 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -10px 24px rgba(80,60,40,0.18)",
            }}
          >
            <div className="absolute left-[12%] top-[12%] size-[38%] rounded-full bg-[conic-gradient(from_200deg,#1b1a18,#3a3733,#1b1a18)] shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]">
              <div className="absolute left-1/2 top-[8%] h-[30%] w-[6%] -translate-x-1/2 rounded-full bg-[var(--accent-primary)]" />
            </div>
            <div className="absolute right-[12%] top-[14%] grid grid-cols-2 gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="size-3 rounded-full bg-[#2b2925] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" />
              ))}
            </div>
            <div className="absolute inset-x-[12%] bottom-[12%] h-[26%] rounded-[8px] bg-[#1b1a18] p-2 font-mono text-[9px] text-[#d4c3a3]">
              REC ● 00:42:17
            </div>
          </div>
        </>
      );
    case "ring":
      return (
        <>
          {shadow("42%")}
          <div
            className="absolute left-1/2 top-[14%] aspect-square w-[50%] -translate-x-1/2 rounded-full"
            style={{
              border: "14px solid transparent",
              background:
                "linear-gradient(var(--bg-surface), var(--bg-surface)) padding-box, conic-gradient(from 140deg, #d4c3a3, #8f7a55, #f1e4c8, #a08a63, #d4c3a3) border-box",
              boxShadow: "0 26px 40px -26px rgba(0,0,0,0.45)",
            }}
          />
          <div className="absolute bottom-[19%] left-1/2 h-[7%] w-[22%] -translate-x-1/2 rounded-[6px] bg-[linear-gradient(180deg,#bba981,#7a6847)]" />
        </>
      );
    case "tray":
      return (
        <>
          {shadow("64%")}
          <div
            className="absolute left-1/2 top-[44%] h-[18%] w-[66%] -translate-x-1/2 rounded-[14px]"
            style={{
              background: "linear-gradient(180deg, #4b5d4f 0%, var(--accent-secondary) 55%, #1f3726 100%)",
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.18), 0 24px 34px -22px rgba(0,0,0,0.5)",
            }}
          >
            <div className="absolute inset-x-[8%] top-[22%] h-[30%] rounded-full bg-black/25 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]" />
          </div>
          <div className="absolute left-[36%] top-[34%] h-[12%] w-[5%] rotate-[18deg] rounded-full bg-[linear-gradient(90deg,#c9a46a,#f3dcae,#a8854e)]" />
          <div className="absolute left-[56%] top-[36%] size-[9%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#f7f4ef,#bdb5a8)]" />
        </>
      );
  }
}
