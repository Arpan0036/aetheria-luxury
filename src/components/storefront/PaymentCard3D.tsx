"use client";

import type { PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Cpu, ShieldCheck, Wifi } from "lucide-react";
import { useFinePointer } from "@/lib/hooks/useFinePointer";

export interface PaymentCard3DProps {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvc: string;
  isFlipped: boolean;
}

function formatCardGroups(raw: string): string[] {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  const padded = digits.padEnd(16, "•");
  return [
    padded.slice(0, 4),
    padded.slice(4, 8),
    padded.slice(8, 12),
    padded.slice(12, 16),
  ];
}

export function PaymentCard3D({
  cardNumber,
  cardHolder,
  expiry,
  cvc,
  isFlipped,
}: PaymentCard3DProps) {
  const fine = useFinePointer();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spx = useSpring(px, { stiffness: 150, damping: 20 });
  const spy = useSpring(py, { stiffness: 150, damping: 20 });

  const tiltX = useTransform(spy, [0, 1], [7, -7]);
  const tiltY = useTransform(spx, [0, 1], [-8, 8]);

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!fine || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };

  const onPointerLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  const groups = formatCardGroups(cardNumber);
  const holderDisplay = (cardHolder.trim() || "COLLECTOR NAME").toUpperCase();
  const expiryDisplay = expiry.trim() || "08/29";
  const cvcDisplay = (cvc.trim() || "888").slice(0, 4);

  return (
    <div
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      aria-label="Interactive 3D Metallic Payment Card Visualizer"
      data-flipped={isFlipped ? "true" : "false"}
      className="mx-auto w-full max-w-[440px] [perspective:1200px]"
    >
      <motion.div
        style={fine && !isFlipped ? { rotateX: tiltX, rotateY: tiltY } : undefined}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
        className="relative aspect-[1.586/1] w-full [transform-style:preserve-3d]"
      >
        {/* FRONT FACE — Brushed Anodized Titanium & Warm Brass Accents */}
        <div
          aria-hidden={isFlipped}
          className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[22px] border border-[#D4C3A3]/35 bg-[radial-gradient(120%_100%_at_15%_10%,#35322F_0%,#1F1D1B_55%,#141312_100%)] p-6 text-[#F7F4EF] shadow-[0_32px_70px_-28px_rgba(20,20,19,0.7)] [backface-visibility:hidden]"
        >
          {/* Brushed Anodized Metallic Sheen Lines */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(115deg,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_6px)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-14 -top-14 size-48 rounded-full bg-[#C85632]/20 blur-2xl"
          />

          {/* Top Bar: Brand & Tier */}
          <div className="relative z-10 flex items-start justify-between gap-2">
            <div>
              <p className="font-mono text-[9.5px] tracking-[0.22em] text-[#D4C3A3]">
                AETHERIA PRIVATE CLIENT // WORLD ELITE
              </p>
              <p className="mt-1 font-display text-[22px] leading-none tracking-tight text-[#F7F4EF]">
                AETHERIA<sup className="ml-0.5 text-[10px]">®</sup>{" "}
                <span className="font-mono text-[10px] tracking-[0.18em] text-[#F7F4EF]/65">
                  RESERVE
                </span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4C3A3]/35 bg-[#F7F4EF]/10 px-2.5 py-1 font-mono text-[9px] tracking-[0.16em] text-[#D4C3A3]">
              <ShieldCheck className="size-3" strokeWidth={1.75} />
              256-BIT
            </span>
          </div>

          {/* Middle: CNC Gold EMV Chip + Contactless + Embossed Monospace Card Number */}
          <div className="relative z-10 my-auto pt-2">
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex h-8 w-11 items-center justify-center rounded-lg border border-[#D4C3A3]/55 bg-gradient-to-br from-[#E5D3B3] via-[#C5A059] to-[#8C6D32] text-[#141413] shadow-inner">
                <Cpu className="size-5 opacity-80" strokeWidth={1.5} />
              </span>
              <Wifi className="size-4 rotate-90 text-[#F7F4EF]/60" strokeWidth={1.75} />
            </div>

            <div
              data-testid="card-3d-number"
              className="tabular flex items-center justify-between gap-2 font-mono text-[19px] font-medium tracking-[0.16em] text-[#F7F4EF] drop-shadow-[0_1px_1px_rgba(0,0,0,0.85)] sm:text-[21px]"
            >
              {groups.map((grp, idx) => (
                <span key={idx}>{grp}</span>
              ))}
            </div>
          </div>

          {/* Bottom Bar: Cardholder Name & Valid Thru */}
          <div className="relative z-10 flex items-end justify-between gap-4 border-t border-white/10 pt-3">
            <div className="min-w-0">
              <p className="font-mono text-[8.5px] tracking-[0.2em] text-[#F7F4EF]/55">
                COLLECTOR DOSSIER
              </p>
              <p
                data-testid="card-3d-holder"
                className="mt-0.5 truncate font-mono text-[12.5px] font-medium tracking-[0.16em] text-[#F7F4EF]"
              >
                {holderDisplay}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-[8.5px] tracking-[0.2em] text-[#F7F4EF]/55">
                VALID THRU
              </p>
              <p
                data-testid="card-3d-expiry"
                className="tabular mt-0.5 font-mono text-[12.5px] font-medium tracking-[0.16em] text-[#D4C3A3]"
              >
                {expiryDisplay}
              </p>
            </div>
          </div>
        </div>

        {/* BACK FACE — Magnetic Strip & CVC Security Box (rotateY 180deg) */}
        <div
          aria-hidden={!isFlipped}
          className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[22px] border border-[#D4C3A3]/35 bg-[radial-gradient(120%_100%_at_85%_10%,#35322F_0%,#1A1817_60%,#121110_100%)] py-5 text-[#F7F4EF] shadow-[0_32px_70px_-28px_rgba(20,20,19,0.7)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          {/* Magnetic Anodized Strip */}
          <div className="h-11 w-full bg-[#0A0908] shadow-inner" />

          {/* Signature & CVC Box */}
          <div className="px-6">
            <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.18em] text-[#F7F4EF]/65">
              <span>AUTHORIZED SIGNATURE // SERIALIZED CVC</span>
              <span className="text-[#D4C3A3]">SECURITY CODE</span>
            </div>
            <div className="mt-1.5 flex h-10 items-center justify-between rounded-lg border border-white/15 bg-[#EFECE6] px-3.5 text-[#141413]">
              <span className="font-display text-[17px] italic text-[#65625D]">
                {holderDisplay}
              </span>
              <span
                data-testid="card-3d-cvc"
                className="tabular rounded bg-[#C85632] px-2.5 py-0.5 font-mono text-[13px] font-semibold tracking-[0.18em] text-[#F7F4EF]"
              >
                {cvcDisplay}
              </span>
            </div>
          </div>

          {/* Back Telemetry Footer */}
          <div className="flex items-center justify-between px-6 font-mono text-[8.5px] tracking-[0.18em] text-[#F7F4EF]/55">
            <span>AETHERIA ARCHIVE HOLDINGS · ZURICH / LONDON / NY</span>
            <span>SANDBOX VERIFIED</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
