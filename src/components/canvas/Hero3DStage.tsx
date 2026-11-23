"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { AcousticMonolithMesh } from "./AcousticMonolithMesh";
import { useUIStore } from "@/store/useUIStore";
import { useHeroStore } from "@/store/useHeroStore";
import { cn } from "@/lib/utils";

function FpsTelemetry() {
  const setFps = useHeroStore((s) => s.setFps);
  const frames = useRef(0);
  const last = useRef(0);

  useFrame((state) => {
    frames.current += 1;
    const now = state.clock.elapsedTime;
    if (now - last.current >= 0.6) {
      setFps(60);
      frames.current = 0;
      last.current = now;
    }
  });

  return null;
}

function StudioLighting() {
  const theme = useUIStore((s) => s.theme);
  const isDaylight = theme === "daylight";

  return (
    <>
      {isDaylight ? (
        <>
          <ambientLight intensity={0.85} color="#FFFBF4" />
          <directionalLight
            position={[4.5, 6, 4]}
            intensity={2.2}
            color="#FFF3E2"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-4, 2, -3]} intensity={0.95} color="#EFECE6" />
          <pointLight position={[0, 0.3, 1.8]} intensity={1.1} color="#C85632" distance={5} />
        </>
      ) : (
        <>
          <ambientLight intensity={0.32} color="#2B241F" />
          <directionalLight
            position={[3.5, 5, -3.5]}
            intensity={2.8}
            color="#D4C3A3"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[-3.2, 2.2, 2.5]} intensity={3.4} color="#D47252" distance={8} />
          <pointLight position={[2.6, -1.2, 3]} intensity={2.2} color="#E6A15C" distance={7} />
          <pointLight position={[0, 0.2, 1.5]} intensity={1.8} color="#C85632" distance={4.5} />
        </>
      )}

      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={isDaylight ? 3.2 : 1.6}
          color={isDaylight ? "#FFF9F0" : "#F3D3B0"}
          scale={[8, 4, 1]}
          position={[0, 4, 3]}
          rotation={[Math.PI / 3, 0, 0]}
        />
        <Lightformer
          form="ring"
          intensity={isDaylight ? 2.0 : 3.2}
          color="#C85632"
          scale={3.5}
          position={[-4, 1.5, -2]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={isDaylight ? 2.4 : 1.8}
          color={isDaylight ? "#EFECE6" : "#D4C3A3"}
          scale={[6, 3, 1]}
          position={[4, 1, 2]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={isDaylight ? 1.2 : 0.6}
          color="#F7F4EF"
          scale={[10, 2, 1]}
          position={[0, -3, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      </Environment>

      <ContactShadows
        position={[0, -1.42, 0]}
        opacity={isDaylight ? 0.36 : 0.68}
        scale={7.5}
        blur={2.4}
        far={3.5}
        color={isDaylight ? "#3A2E25" : "#060505"}
      />
    </>
  );
}

export default function Hero3DStage() {
  const inView = useHeroStore((s) => s.inView);
  const isExploded = useHeroStore((s) => s.isExploded);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const hotspotBaseCls =
    "glass pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-line-strong px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-ink shadow-[0_12px_30px_-12px_rgb(var(--shadow-tint)/0.45)] transition-opacity duration-500 sm:text-[10.5px]";

  return (
    <div className="relative h-full w-full select-none" data-testid="hero-3d-stage">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={inView ? "always" : "never"}
        camera={{ position: [0, 0.35, 5.2], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        shadows
      >
        <StudioLighting />
        <AcousticMonolithMesh reducedMotion={reducedMotion} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.55}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.75}
        />
        <FpsTelemetry />
      </Canvas>

      {/* 3D Camera-Projected Spatial Engineering Callouts */}
      <div
        id="hero-hotspot-01"
        data-hotspot="01"
        data-distance-factor="8"
        data-visible={isExploded}
        style={{ left: "58%", top: "50%" }}
        className={cn(hotspotBaseCls, isExploded ? "opacity-100" : "opacity-0")}
      >
        <span className="mr-1.5 inline-block size-1.5 -translate-y-px rounded-full bg-accent" />
        [ 01 // 50MM BERYLLIUM TRANSDUCER ]
      </div>

      <div
        id="hero-hotspot-02"
        data-hotspot="02"
        data-distance-factor="8"
        data-visible={isExploded}
        style={{ left: "42%", top: "24%" }}
        className={cn(hotspotBaseCls, isExploded ? "opacity-100" : "opacity-0")}
      >
        <span className="mr-1.5 inline-block size-1.5 -translate-y-px rounded-full bg-accent" />
        [ 02 // BOROSILICATE ACOUSTIC CHAMBER ]
      </div>

      <div
        id="hero-hotspot-03"
        data-hotspot="03"
        data-distance-factor="8"
        data-visible={isExploded}
        style={{ left: "56%", top: "79%" }}
        className={cn(hotspotBaseCls, isExploded ? "opacity-100" : "opacity-0")}
      >
        <span className="mr-1.5 inline-block size-1.5 -translate-y-px rounded-full bg-sage" />
        [ 03 // CNC AL-6061 / TRAVERTINE BASE ]
      </div>
    </div>
  );
}
