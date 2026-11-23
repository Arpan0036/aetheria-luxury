"use client";

import { useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import type { CategorySlug, ThreeDConfig } from "@/types/database";

export interface Product3DInspectorProps {
  categorySlug: CategorySlug;
  threeDConfig: ThreeDConfig;
  variantHex: string;
  variantName: string;
  isExploded: boolean;
  lightingMode: "studio" | "espresso";
}

function damp(current: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
}

function CategorySculptureMesh({
  categorySlug,
  threeDConfig,
  variantHex,
  isExploded,
}: {
  categorySlug: CategorySlug;
  threeDConfig: ThreeDConfig;
  variantHex: string;
  isExploded: boolean;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const topLayerRef = useRef<THREE.Group>(null);
  const coreLayerRef = useRef<THREE.Group>(null);
  const baseLayerRef = useRef<THREE.Group>(null);
  const ringLayerRef = useRef<THREE.Group>(null);

  const primaryColor = variantHex || threeDConfig.base_hex;
  const accentColor = threeDConfig.accent_hex || "#C85632";
  const metalness = Math.min(0.96, Math.max(0.15, threeDConfig.metallic));
  const roughness = Math.min(0.85, Math.max(0.14, threeDConfig.roughness));

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const explodeOffset = isExploded ? 1 : 0;

    if (rootRef.current) {
      rootRef.current.rotation.y += dt * 0.28;
    }
    if (topLayerRef.current) {
      topLayerRef.current.position.y = damp(
        topLayerRef.current.position.y,
        explodeOffset * 0.58,
        7,
        dt,
      );
    }
    if (coreLayerRef.current) {
      coreLayerRef.current.position.y = damp(
        coreLayerRef.current.position.y,
        explodeOffset * 0.14,
        7,
        dt,
      );
      coreLayerRef.current.rotation.y -= dt * 0.45;
    }
    if (baseLayerRef.current) {
      baseLayerRef.current.position.y = damp(
        baseLayerRef.current.position.y,
        -0.78 - explodeOffset * 0.42,
        7,
        dt,
      );
    }
    if (ringLayerRef.current) {
      ringLayerRef.current.scale.setScalar(
        damp(ringLayerRef.current.scale.x, 1 + explodeOffset * 0.22, 7, dt),
      );
    }
  });

  return (
    <group ref={rootRef}>
      {/* Shared Honed Roman Travertine Architectural Plinth Base */}
      <group ref={baseLayerRef} position={[0, -0.78, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.12, 1.2, 0.34, 64]} />
          <meshStandardMaterial color="#E5DFD3" roughness={0.82} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <torusGeometry args={[0.92, 0.025, 20, 64]} />
          <meshStandardMaterial color={primaryColor} metalness={metalness} roughness={roughness} />
        </mesh>
      </group>

      {/* Category-Adaptive Core & Upper Sub-Assemblies */}
      {categorySlug === "spatial-audio" && (
        <>
          {/* Outer CNC Acoustic Gimbal & Earcup / Waveguide */}
          <group ref={topLayerRef}>
            <mesh castShadow receiveShadow>
              <torusGeometry args={[1.05, 0.085, 32, 96]} />
              <meshStandardMaterial color={primaryColor} metalness={metalness} roughness={roughness} />
            </mesh>
            <mesh position={[0, 0.12, 0]} castShadow>
              <cylinderGeometry args={[0.72, 0.72, 0.26, 64]} />
              <meshPhysicalMaterial
                color="#F5EFE6"
                transmission={0.86}
                opacity={1}
                transparent
                roughness={0.18}
                ior={1.45}
                thickness={1.1}
              />
            </mesh>
          </group>

          {/* 50mm Beryllium Acoustic Transducer Core */}
          <group ref={coreLayerRef}>
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.56, 64, 64]} />
              <meshPhysicalMaterial
                color={accentColor}
                metalness={0.55}
                roughness={0.22}
                clearcoat={0.7}
              />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.76, 0.03, 24, 72]} />
              <meshStandardMaterial color={primaryColor} metalness={metalness} roughness={roughness} />
            </mesh>
          </group>
        </>
      )}

      {categorySlug === "desk-architecture" && (
        <>
          {/* Monolithic Architectural Cantilever / Bridge */}
          <group ref={topLayerRef}>
            <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.95, 0.85, 0.22, 64]} />
              <meshStandardMaterial color={primaryColor} metalness={metalness} roughness={roughness} />
            </mesh>
            <mesh position={[0, 0.31, 0]}>
              <torusGeometry args={[0.78, 0.04, 24, 64]} />
              <meshStandardMaterial
                color="#F4C27A"
                emissive={accentColor}
                emissiveIntensity={0.65}
                roughness={0.2}
              />
            </mesh>
          </group>

          {/* Central Column & Qi2 / Optical Core */}
          <group ref={coreLayerRef}>
            <mesh position={[0, -0.1, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.32, 0.38, 0.96, 48]} />
              <meshStandardMaterial color={primaryColor} metalness={metalness} roughness={roughness} />
            </mesh>
            <mesh position={[0, -0.1, 0]}>
              <torusGeometry args={[0.56, 0.035, 24, 64]} />
              <meshStandardMaterial color={accentColor} metalness={0.75} roughness={0.25} />
            </mesh>
          </group>
        </>
      )}

      {categorySlug === "tactile-computing" && (
        <>
          {/* Upper Tactile Matrix / Rotary Encoder Crown */}
          <group ref={topLayerRef}>
            <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.78, 0.82, 0.32, 48]} />
              <meshStandardMaterial color={primaryColor} metalness={metalness} roughness={roughness} />
            </mesh>
            <mesh position={[0, 0.48, 0]} castShadow>
              <cylinderGeometry args={[0.32, 0.32, 0.24, 36]} />
              <meshStandardMaterial color={accentColor} metalness={0.82} roughness={0.22} />
            </mesh>
          </group>

          {/* Poron Gasket & Haptic Detent Ring */}
          <group ref={coreLayerRef}>
            <mesh position={[0, -0.12, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.45, 0.26, 1.05]} />
              <meshStandardMaterial color={primaryColor} metalness={metalness} roughness={roughness} />
            </mesh>
            <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.64, 0.03, 20, 64]} />
              <meshStandardMaterial color={accentColor} metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        </>
      )}

      {categorySlug === "ambient-lighting" && (
        <>
          {/* Frosted Borosilicate Optical Diffuser Halo */}
          <group ref={topLayerRef}>
            <mesh castShadow receiveShadow>
              <torusGeometry args={[0.88, 0.19, 48, 96]} />
              <meshPhysicalMaterial
                color="#FAF3E8"
                transmission={0.9}
                opacity={1}
                transparent
                roughness={0.16}
                ior={1.48}
                thickness={1.4}
              />
            </mesh>
          </group>

          {/* Warm-Spectrum Circadian Optical Emitter */}
          <group ref={coreLayerRef}>
            <mesh castShadow>
              <sphereGeometry args={[0.42, 48, 48]} />
              <meshStandardMaterial
                color={accentColor}
                emissive={accentColor}
                emissiveIntensity={0.8}
                roughness={0.22}
              />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <torusGeometry args={[0.64, 0.04, 24, 72]} />
              <meshStandardMaterial color={primaryColor} metalness={metalness} roughness={roughness} />
            </mesh>
          </group>
        </>
      )}

      {/* Outer Calibration Ring */}
      <group ref={ringLayerRef}>
        <mesh rotation={[Math.PI / 2.4, 0.2, 0]}>
          <torusGeometry args={[1.28, 0.014, 16, 96]} />
          <meshStandardMaterial color={accentColor} metalness={0.8} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
}

export default function Product3DInspector({
  categorySlug,
  threeDConfig,
  variantHex,
  isExploded,
  lightingMode,
}: Product3DInspectorProps) {
  const isStudio = lightingMode === "studio";

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.35, 3.85], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={isStudio ? 0.85 : 0.42} color={isStudio ? "#FFFDF9" : "#F2D4B6"} />
        <directionalLight
          castShadow
          position={[4, 6, 4]}
          intensity={isStudio ? 2.1 : 1.35}
          color={isStudio ? "#FFF8EE" : "#E89968"}
        />
        <pointLight
          position={[-3.5, 1.5, -2.5]}
          intensity={isStudio ? 0.9 : 1.8}
          color={isStudio ? "#EFECE6" : "#C85632"}
        />

        <Environment resolution={128}>
          <group rotation={[-Math.PI / 4, -0.3, 0]}>
            <Lightformer
              form="rect"
              intensity={isStudio ? 3.2 : 1.8}
              position={[0, 4, 2]}
              scale={[6, 2, 1]}
              color={isStudio ? "#FFFDF8" : "#F5C299"}
            />
            <Lightformer
              form="ring"
              intensity={isStudio ? 1.6 : 2.4}
              position={[-3, 1, -2]}
              scale={3}
              color={isStudio ? "#EFECE6" : "#C85632"}
            />
          </group>
        </Environment>

        <CategorySculptureMesh
          categorySlug={categorySlug}
          threeDConfig={threeDConfig}
          variantHex={variantHex}
          isExploded={isExploded}
        />

        <ContactShadows
          position={[0, -1.35, 0]}
          opacity={isStudio ? 0.38 : 0.65}
          scale={5.5}
          blur={2.2}
          far={3.5}
        />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2.5}
          maxDistance={5.5}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 1.75}
        />
      </Canvas>
    </div>
  );
}
