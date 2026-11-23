"use client";

import { create } from "zustand";

export type HeroFinish = "silver" | "obsidian" | "brass";

export interface FinishSpec {
  id: HeroFinish;
  index: string;
  label: string;
  hex: string;
  metalness: number;
  roughness: number;
}

/** Real-time PBR finishes for the AETHER-CORE 01 sculpture (shared by UI + WebGL). */
export const HERO_FINISHES: FinishSpec[] = [
  { id: "silver", index: "01", label: "Raw Anodized Silver", hex: "#D8D6D0", metalness: 0.9, roughness: 0.22 },
  { id: "obsidian", index: "02", label: "Obsidian Matte", hex: "#1F1E1D", metalness: 0.6, roughness: 0.45 },
  { id: "brass", index: "03", label: "Brushed Architectural Brass", hex: "#C5A059", metalness: 0.88, roughness: 0.25 },
];

interface HeroState {
  finish: HeroFinish;
  isExploded: boolean;
  /** Smoothed frames-per-second reported by the WebGL loop. */
  fps: number;
  /** False when the hero is scrolled out of view — the render loop pauses. */
  inView: boolean;
  setFinish: (finish: HeroFinish) => void;
  setExploded: (exploded: boolean) => void;
  toggleExploded: () => void;
  setFps: (fps: number) => void;
  setInView: (inView: boolean) => void;
}

export const useHeroStore = create<HeroState>((set) => ({
  finish: "silver",
  isExploded: false,
  fps: 0,
  inView: true,
  setFinish: (finish) => set({ finish }),
  setExploded: (isExploded) => set({ isExploded }),
  toggleExploded: () => set((s) => ({ isExploded: !s.isExploded })),
  setFps: (fps) => set({ fps }),
  setInView: (inView) => set({ inView }),
}));
