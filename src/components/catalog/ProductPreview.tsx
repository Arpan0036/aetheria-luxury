import { useId } from "react";
import type { ProceduralShape } from "@/types/database";

/* Colour helpers ------------------------------------------------------------ */
function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(hex: string, target: string, amount: number) {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * amount));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
const light = (h: string, a = 0.35) => mix(h, "#ffffff", a);
const dark = (h: string, a = 0.35) => mix(h, "#000000", a);

interface Props {
  shape: ProceduralShape;
  base: string;
  accent: string;
  metallic: number;
  label: string;
}

/**
 * Procedural architectural studio render — an SVG stand-in driven by each
 * product's `three_d_config` until AI studio photography / WebGL lands.
 */
export function ProductPreview({ shape, base, accent, metallic, label }: Props) {
  const uid = useId().replace(/:/g, "");
  const body = `url(#body-${uid})`;
  const side = dark(base, 0.28);
  const top = light(base, 0.25);
  const sheen = 0.18 + metallic * 0.4;

  return (
    <svg viewBox="0 0 400 300" role="img" aria-label={label} className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light(base, 0.3)} />
          <stop offset="0.55" stopColor={base} />
          <stop offset="1" stopColor={dark(base, 0.35)} />
        </linearGradient>
        <linearGradient id={`sheen-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.45" stopColor="#fff" stopOpacity={sheen} />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`glow-${uid}`}>
          <stop offset="0" stopColor={accent} stopOpacity="0.85" />
          <stop offset="1" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <filter id={`blur-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* floor shadow */}
      <ellipse cx="200" cy="256" rx="120" ry="12" style={{ fill: "rgb(var(--shadow-tint))" }} opacity="0.2" filter={`url(#blur-${uid})`} />

      {shape === "headphones" && (
        <g>
          <path d="M120 170 C120 70 280 70 280 170" fill="none" stroke={dark(base, 0.15)} strokeWidth="14" strokeLinecap="round" />
          <path d="M126 168 C128 84 272 84 274 168" fill="none" stroke="#2a2522" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
          {[110, 250].map((x) => (
            <g key={x}>
              <rect x={x} y="150" width="40" height="92" rx="20" fill="#2a2522" />
              <rect x={x + (x < 200 ? 10 : -10)} y="146" width="40" height="100" rx="20" fill={body} />
              <rect x={x + (x < 200 ? 10 : -10)} y="146" width="40" height="100" rx="20" fill={`url(#sheen-${uid})`} />
              <circle cx={x + (x < 200 ? 30 : 10)} cy="196" r="6" fill={accent} />
            </g>
          ))}
        </g>
      )}

      {shape === "lamp" && (
        <g>
          <ellipse cx="200" cy="242" rx="70" ry="14" fill="#cfc2ac" />
          <rect x="130" y="226" width="140" height="16" fill="#E3D6C1" />
          <ellipse cx="200" cy="226" rx="70" ry="14" fill="#efe5d4" />
          <rect x="192" y="88" width="16" height="140" fill={body} />
          <rect x="192" y="88" width="16" height="140" fill={`url(#sheen-${uid})`} />
          <circle cx="200" cy="76" r="60" fill={`url(#glow-${uid})`} opacity="0.55" />
          <path d="M150 92 Q200 40 250 92 Z" fill={body} />
          <ellipse cx="200" cy="92" rx="50" ry="8" fill={accent} />
          <circle cx="216" cy="190" r="7" fill={dark(base, 0.2)} />
        </g>
      )}

      {shape === "keyboard" && (
        <g>
          <path d="M70 200 L120 130 L340 130 L330 200 Z" fill={top} />
          <path d="M70 200 L330 200 L330 222 L70 222 Z" fill={side} />
          {Array.from({ length: 4 }).map((_, row) =>
            Array.from({ length: 12 }).map((__, col) => {
              const y = 140 + row * 14;
              const inset = (4 - row) * 10;
              const x = 80 + inset + col * 18.5 - row * 2;
              const isAccent = row === 0 && col === 0;
              return <rect key={`${row}-${col}`} x={x} y={y} width="15" height="11" rx="2.5" fill={isAccent ? accent : mix(base, "#1f1e1c", 0.55)} opacity={0.95} />;
            }),
          )}
          <circle cx="318" cy="142" r="9" fill="#B8935A" stroke={dark("#B8935A")} strokeWidth="2" />
        </g>
      )}

      {shape === "obelisk" && (
        <g>
          <path d="M168 248 L178 64 L222 64 L232 248 Z" fill={body} />
          <path d="M200 64 L222 64 L232 248 L200 248 Z" fill={dark(base, 0.25)} opacity="0.5" />
          <ellipse cx="200" cy="64" rx="22" ry="6" fill={accent} />
          <ellipse cx="200" cy="58" rx="18" ry="5" fill={light(accent, 0.3)} />
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={i} x1={178 + i * 0.4} y1={110 + i * 12} x2={222 - i * 0.4} y2={110 + i * 12} stroke={light(base, 0.15)} strokeWidth="1" opacity="0.5" />
          ))}
        </g>
      )}

      {shape === "dial" && (
        <g>
          <ellipse cx="200" cy="232" rx="78" ry="20" fill="#2a2522" />
          <rect x="128" y="160" width="144" height="70" fill={body} />
          <rect x="128" y="160" width="144" height="70" fill={`url(#sheen-${uid})`} />
          {Array.from({ length: 24 }).map((_, i) => (
            <line key={i} x1={132 + i * 5.8} y1="166" x2={132 + i * 5.8} y2="226" stroke={dark(base, 0.2)} strokeWidth="1" opacity="0.5" />
          ))}
          <ellipse cx="200" cy="160" rx="72" ry="18" fill={top} />
          <ellipse cx="200" cy="160" rx="54" ry="13" fill={light(base, 0.1)} />
          <rect x="196" y="146" width="8" height="12" rx="3" fill={accent} />
        </g>
      )}

      {shape === "tray" && (
        <g>
          <path d="M80 210 L130 160 L330 160 L300 210 Z" fill={top} />
          <path d="M80 210 L300 210 L300 228 L80 228 Z" fill={side} />
          <path d="M300 210 L330 160 L330 178 L300 228 Z" fill={dark(base, 0.4)} />
          {[170, 250].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy="186" rx="26" ry="10" fill={accent} opacity="0.9" />
              <ellipse cx={x} cy="184" rx="20" ry="7" fill={light(accent, 0.3)} />
            </g>
          ))}
        </g>
      )}

      {shape === "halo" && (
        <g>
          <circle cx="200" cy="140" r="110" fill={`url(#glow-${uid})`} opacity="0.5" />
          <circle cx="200" cy="140" r="78" fill="none" stroke={base} strokeWidth="22" />
          <circle cx="200" cy="140" r="78" fill="none" stroke={accent} strokeWidth="6" opacity="0.65" />
          <rect x="150" y="226" width="100" height="18" rx="4" fill="#E3D6C1" />
          <rect x="196" y="214" width="8" height="14" fill={dark(base, 0.4)} />
        </g>
      )}

      {shape === "riser" && (
        <g>
          <path d="M60 150 L100 116 L350 116 L320 150 Z" fill={top} />
          <path d="M60 150 L320 150 L320 166 L60 166 Z" fill={side} />
          <rect x="72" y="166" width="22" height="70" fill={dark(base, 0.3)} />
          <rect x="290" y="166" width="22" height="70" fill={dark(base, 0.3)} />
          <rect x="104" y="196" width="176" height="40" rx="4" fill={accent} />
          <line x1="192" y1="196" x2="192" y2="236" stroke={dark(accent, 0.3)} strokeWidth="2" />
          <rect x="140" y="214" width="20" height="3" rx="1.5" fill={light(accent, 0.3)} />
          <rect x="224" y="214" width="20" height="3" rx="1.5" fill={light(accent, 0.3)} />
        </g>
      )}

      {shape === "amplifier" && (
        <g>
          <path d="M90 170 L130 140 L320 140 L290 170 Z" fill={top} />
          <rect x="90" y="170" width="200" height="70" fill={body} />
          <path d="M290 170 L320 140 L320 210 L290 240 Z" fill={dark(base, 0.4)} />
          <circle cx="200" cy="112" r="40" fill={`url(#glow-${uid})`} />
          <rect x="186" y="92" width="28" height="56" rx="14" fill={light(accent, 0.55)} opacity="0.55" stroke={light(base, 0.5)} strokeWidth="1.5" />
          <rect x="196" y="110" width="8" height="26" rx="2" fill={accent} />
          {[124, 160, 240].map((x) => (
            <circle key={x} cx={x} cy="205" r="11" fill={dark(base, 0.2)} stroke={light(base, 0.3)} strokeWidth="2" />
          ))}
          <circle cx="270" cy="205" r="3" fill={accent} />
        </g>
      )}

      {shape === "mat" && (
        <g>
          <path d="M40 220 L110 140 L370 140 L330 220 Z" fill={body} />
          <path d="M40 220 L330 220 L330 228 L40 228 Z" fill="#c9a77a" />
          <path d="M58 212 L114 148 L356 148 L322 212 Z" fill="none" stroke={accent} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.8" />
        </g>
      )}

      {shape === "macropad" && (
        <g>
          <path d="M110 200 L150 120 L300 120 L280 200 Z" fill={top} />
          <path d="M110 200 L280 200 L280 220 L110 220 Z" fill={side} />
          {Array.from({ length: 3 }).map((_, row) =>
            Array.from({ length: 4 }).map((__, col) => {
              const y = 130 + row * 22;
              const x = 150 + col * 32 - row * 10;
              return (
                <g key={`${row}-${col}`}>
                  <rect x={x} y={y} width="26" height="17" rx="3" fill="#1b1a18" />
                  <rect x={x + 6} y={y + 6} width="14" height="5" rx="1" fill={accent} opacity={0.5 + ((row + col) % 3) * 0.2} />
                </g>
              );
            }),
          )}
        </g>
      )}

      {shape === "lantern" && (
        <g>
          <path d="M168 84 C168 40 232 40 232 84" fill="none" stroke="#3a2a1c" strokeWidth="6" strokeLinecap="round" />
          <circle cx="200" cy="160" r="90" fill={`url(#glow-${uid})`} opacity="0.55" />
          <rect x="160" y="84" width="80" height="20" rx="6" fill={body} />
          <rect x="166" y="104" width="68" height="110" rx="8" fill={light(accent, 0.45)} />
          <rect x="166" y="104" width="68" height="110" rx="8" fill={`url(#glow-${uid})`} opacity="0.7" />
          <rect x="160" y="212" width="80" height="34" rx="8" fill={body} />
          <rect x="160" y="212" width="80" height="34" rx="8" fill={`url(#sheen-${uid})`} />
        </g>
      )}
    </svg>
  );
}
