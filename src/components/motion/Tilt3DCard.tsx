"use client";

import { useEffect, useRef, useState, type ReactNode, type PointerEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

const MAX_TILT = 10; // degrees
const SPRING = { stiffness: 180, damping: 20, mass: 0.5 };

interface Tilt3DCardProps {
  children: ReactNode;
  className?: string;
  /** Classes for the inner elevated layer. */
  innerClassName?: string;
  maxTilt?: number;
}

/**
 * Perspective container: cursor-tracked rotateX/rotateY, moving specular glare,
 * and translateZ(24px) elevation for inner content. Tracking is disabled on
 * coarse pointers / reduced-motion so touch scrolling stays smooth.
 */
export function Tilt3DCard({ children, className, innerClassName, maxTilt = MAX_TILT }: Tilt3DCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [interactive, setInteractive] = useState(false);

  const px = useMotionValue(0.5); // 0 → 1 across width
  const py = useMotionValue(0.5);
  const hover = useMotionValue(0);

  const spx = useSpring(px, SPRING);
  const spy = useSpring(py, SPRING);
  const shover = useSpring(hover, { stiffness: 120, damping: 20 });

  const rotateX = useTransform(spy, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(spx, [0, 1], [-maxTilt, maxTilt]);
  const glareX = useTransform(spx, (v) => `${v * 100}%`);
  const glareY = useTransform(spy, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(520px circle at ${glareX} ${glareY}, var(--glare), transparent 45%)`;

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setInteractive(mq.matches && !reduce.matches);
    update();
    mq.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    hover.set(1);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
    hover.set(0);
  };

  return (
    <div className={cn("[perspective:1000px]", className)}>
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={interactive ? { rotateX, rotateY } : undefined}
        className="relative h-full rounded-[22px] will-change-transform"
      >
        <div
          className={cn(
            "relative h-full rounded-[22px] border border-line bg-surface",
            "shadow-[0_30px_60px_-36px_rgb(var(--shadow-tint)/0.45)]",
            innerClassName,
          )}
        >
          <div className="relative h-full">{children}</div>
        </div>
        {interactive && (
          <motion.div
            aria-hidden
            style={{ background: glare, opacity: shover }}
            className="pointer-events-none absolute inset-0 z-10 rounded-[22px] mix-blend-soft-light"
          />
        )}
      </motion.div>
    </div>
  );
}
