"use client";

import { useEffect, useRef, type ReactNode, type ButtonHTMLAttributes } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "surface" | "outline";
type Size = "sm" | "md" | "lg";

const RADIUS = 40; // px of magnetic field around the button's edges
const SPRING = { stiffness: 150, damping: 15, mass: 0.6 };

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-on hover:bg-accent-hover shadow-[0_1px_0_0_rgba(255,255,255,0.18)_inset,0_6px_0_-2px_var(--accent-primary-hover),0_18px_30px_-14px_rgb(var(--shadow-tint)/0.55)]",
  surface:
    "bg-surface text-ink hover:bg-surface-strong border border-line shadow-[0_1px_0_0_rgba(255,255,255,0.35)_inset,0_5px_0_-2px_var(--border-strong),0_16px_28px_-16px_rgb(var(--shadow-tint)/0.4)]",
  outline:
    "bg-transparent text-ink border border-line-strong hover:border-ink shadow-[0_4px_0_-2px_var(--border-subtle)]",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-[13px] gap-2",
  md: "h-12 px-6 text-sm gap-2.5",
  lg: "h-14 px-8 text-[15px] gap-3",
};

export interface MagneticButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd" | "style"
  > {
  variant?: Variant;
  size?: Size;
  /** Fraction of the cursor offset applied as pull (0–1). */
  strength?: number;
  children: ReactNode;
}

export function MagneticButton({
  variant = "primary",
  size = "md",
  strength = 0.35,
  className,
  children,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);
  // Inner label drifts slightly further than the shell → parallax depth.
  const ix = useTransform(sx, (v) => v * 0.35);
  const iy = useTransform(sy, (v) => v * 0.35);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        // Distance from cursor to nearest point of the button rect.
        const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
        const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
        const inField = Math.hypot(dx, dy) <= RADIUS;
        if (inField) {
          x.set((e.clientX - cx) * strength);
          y.set((e.clientY - cy) * strength);
        } else if (x.get() !== 0 || y.get() !== 0) {
          x.set(0);
          y.set(0);
        }
      });
    };
    const reset = () => {
      x.set(0);
      y.set(0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", reset);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", reset);
    };
  }, [x, y, strength]);

  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.97, translateY: 3 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={cn(
        "group relative inline-flex select-none items-center justify-center rounded-full font-sans font-medium tracking-[-0.01em]",
        "transition-[background-color,border-color,box-shadow,color] duration-300 ease-[var(--ease-editorial)]",
        "active:shadow-none disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      <motion.span style={{ x: ix, y: iy }} className="relative z-10 inline-flex items-center gap-[inherit]">
        {children}
      </motion.span>
    </motion.button>
  );
}
