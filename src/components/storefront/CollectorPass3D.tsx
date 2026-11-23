"use client";

import type { PointerEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Award, Check, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { useFinePointer } from "@/lib/hooks/useFinePointer";
import { useUIStore } from "@/store/useUIStore";
import { cn, formatPrice } from "@/lib/utils";
import type { CollectorRole } from "@/types/database";

export interface CollectorPass3DProps {
  fullName: string;
  email: string;
  memberId: string;
  role: CollectorRole;
  totalValuationUsd: number;
  orderCount: number;
  isPreview?: boolean;
  isUpdatingRole?: boolean;
  onToggleRole?: () => void;
}

export function CollectorPass3D({
  fullName,
  email,
  memberId,
  role,
  totalValuationUsd,
  orderCount,
  isPreview = false,
  isUpdatingRole = false,
  onToggleRole,
}: CollectorPass3DProps) {
  const fine = useFinePointer();
  const currency = useUIStore((s) => s.activeCurrency);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hover = useMotionValue(0);

  const spx = useSpring(px, { stiffness: 150, damping: 20 });
  const spy = useSpring(py, { stiffness: 150, damping: 20 });
  const shover = useSpring(hover, { stiffness: 120, damping: 20 });

  const rotateX = useTransform(spy, [0, 1], [8, -8]);
  const rotateY = useTransform(spx, [0, 1], [-9, 9]);
  const gx = useTransform(spx, (v) => `${v * 100}%`);
  const gy = useTransform(spy, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(520px circle at ${gx} ${gy}, rgba(244, 224, 190, 0.28), transparent 48%)`;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!fine || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    hover.set(1);
  };

  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
    hover.set(0);
  };

  const isAdmin = role === "admin";

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-label="AETHERIA 3D Brushed Titanium Collector Pass"
      className="w-full [perspective:1200px]"
    >
      <motion.div
        style={fine ? { rotateX, rotateY } : undefined}
        className="relative overflow-hidden rounded-[26px] border border-[#D4C3A3]/45 bg-[radial-gradient(125%_110%_at_12%_8%,#36332F_0%,#1F1D1B_52%,#131211_100%)] p-6 text-[#F7F4EF] shadow-[0_38px_80px_-34px_rgba(20,20,19,0.75)] sm:p-7"
      >
        {/* Brushed Titanium Micro-Grain & Champagne Rim Glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-22 [background-image:repeating-linear-gradient(112deg,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_5px)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[#C85632]/20 blur-3xl"
        />

        {fine && (
          <motion.div
            aria-hidden
            style={{ background: glare, opacity: shover }}
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
          />
        )}

        {/* Top Row: Status Tier Badge + Live Role Switcher Pill */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4C3A3]/45 bg-[#F7F4EF]/10 px-3 py-1 font-mono text-[9.5px] font-medium tracking-[0.18em] text-[#D4C3A3]">
            <Award className="size-3.5 text-[#C85632]" strokeWidth={1.75} />
            FOUNDING COLLECTOR // TIER-1 VERIFIED
          </span>

          {onToggleRole ? (
            <button
              type="button"
              disabled={isUpdatingRole}
              onClick={onToggleRole}
              data-testid="role-switcher-pill"
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-1 font-mono text-[9.5px] font-semibold tracking-[0.16em] transition-all",
                isAdmin
                  ? "border-[#C85632] bg-[#C85632] text-[#F7F4EF] shadow-[0_10px_25px_-8px_#C85632]"
                  : "border-[#D4C3A3]/55 bg-[#141312]/80 text-[#F7F4EF] hover:border-[#D4C3A3]",
              )}
            >
              <RefreshCw
                className={cn("size-3", isUpdatingRole && "animate-spin")}
                strokeWidth={2}
              />
              <span>
                {isAdmin ? "[ ROLE: MERCHANT ADMIN ]" : "[ ROLE: COLLECTOR ]"}
              </span>
            </button>
          ) : (
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[9px] tracking-[0.18em] text-[#F7F4EF]/75">
              TITANIUM PASS // EDITION 01
            </span>
          )}
        </div>

        {/* Center Row: Collector Name, Email & Serialized Member ID */}
        <div className="relative z-10 my-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[9.5px] tracking-[0.2em] text-[#F7F4EF]/55">
              COLLECTOR DOSSIER HOLDER
            </p>
            <h2
              data-testid="collector-pass-name"
              className="mt-1 font-display text-[38px] leading-none text-[#F7F4EF] sm:text-[44px]"
            >
              {fullName}
            </h2>
            <p
              data-testid="collector-pass-email"
              className="mt-1.5 font-mono text-[11px] tracking-[0.14em] text-[#D4C3A3]"
            >
              {email}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="font-mono text-[9px] tracking-[0.2em] text-[#F7F4EF]/55">
              SERIALIZED MEMBER ID
            </p>
            <p
              data-testid="collector-pass-member-id"
              className="tabular mt-1 font-mono text-[14px] font-semibold tracking-[0.18em] text-[#F7F4EF]"
            >
              {memberId}
            </p>
            {/* Serialized Barcode Strip */}
            <div
              aria-hidden
              className="mt-2 inline-flex h-5 w-36 items-center justify-between opacity-75"
            >
              {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 3, 1, 2, 2, 1, 3].map((w, i) => (
                <span
                  key={i}
                  style={{ width: `${w * 2}px` }}
                  className="h-full bg-[#D4C3A3]"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row: Total Archive Valuation + Privileges */}
        <div className="relative z-10 grid grid-cols-1 gap-4 border-t border-white/12 pt-4 sm:grid-cols-3">
          <div>
            <p className="font-mono text-[9px] tracking-[0.18em] text-[#F7F4EF]/55">
              TOTAL ARCHIVE VALUATION
            </p>
            <p
              data-testid="collector-pass-valuation"
              className="tabular mt-1 font-mono text-[18px] font-semibold text-[#F7F4EF]"
            >
              {formatPrice(totalValuationUsd, currency)}
            </p>
          </div>

          <div>
            <p className="font-mono text-[9px] tracking-[0.18em] text-[#F7F4EF]/55">
              ACQUIRED DOSSIERS
            </p>
            <p className="tabular mt-1 font-mono text-[14px] text-[#D4C3A3]">
              {String(orderCount).padStart(2, "0")} SERIALIZED{" "}
              {orderCount === 1 ? "ORDER" : "ORDERS"}
            </p>
          </div>

          <div className="flex items-center sm:justify-end">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-400/10 px-3 py-1 font-mono text-[9.5px] tracking-[0.15em] text-emerald-300">
              {isPreview ? (
                <>
                  <Sparkles className="size-3" strokeWidth={1.75} />
                  10-YR WARRANTY VAULT
                </>
              ) : (
                <>
                  <Check className="size-3" strokeWidth={2.2} />
                  SUPABASE RLS ACTIVE
                </>
              )}
            </span>
          </div>
        </div>

        {isPreview && (
          <ul className="relative z-10 mt-5 grid grid-cols-1 gap-2 border-t border-white/10 pt-4 font-mono text-[10px] tracking-[0.14em] text-[#F7F4EF]/80 sm:grid-cols-3">
            <li className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-[#D4C3A3]" strokeWidth={1.75} />
              10-YR WARRANTY VAULT
            </li>
            <li className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-[#D4C3A3]" strokeWidth={1.75} />
              1-CLICK DDP DISPATCH
            </li>
            <li className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-[#D4C3A3]" strokeWidth={1.75} />
              PRIORITY ALLOCATION
            </li>
          </ul>
        )}
      </motion.div>
    </div>
  );
}
