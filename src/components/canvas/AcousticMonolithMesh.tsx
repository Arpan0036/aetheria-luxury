"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { HERO_FINISHES, useHeroStore } from "@/store/useHeroStore";

const { lerp, damp, clamp } = THREE.MathUtils;

/* -------------------------------------------------------------------------- */
/*  Procedural travertine texture (no external assets)                         */
/* -------------------------------------------------------------------------- */
function useTravertineTexture() {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#E5E0D8";
    ctx.fillRect(0, 0, size, size);
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 90; i++) {
      const y = rand() * size;
      ctx.strokeStyle = `rgba(${150 + rand() * 40}, ${130 + rand() * 30}, ${100 + rand() * 30}, ${0.05 + rand() * 0.12})`;
      ctx.lineWidth = 0.6 + rand() * 3;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= size; x += 32) ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 3 + (rand() - 0.5) * 4);
      ctx.stroke();
    }
    for (let i = 0; i < 420; i++) {
      ctx.fillStyle = `rgba(120, 100, 76, ${0.12 + rand() * 0.25})`;
      ctx.beginPath();
      ctx.ellipse(rand() * size, rand() * size, 0.6 + rand() * 2.6, 0.4 + rand() * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 1);
    tex.anisotropy = 4;
    return tex;
  }, []);
}

/* -------------------------------------------------------------------------- */
/*  Explode targets per sub-assembly: [y, z] offsets                           */
/* -------------------------------------------------------------------------- */
const EXPLODE = {
  plinth: [-0.46, 0],
  gimbal: [0, -0.58],
  glass: [0.42, 0.22],
  core: [0.02, 0.88],
  orbit: [0.78, -0.18],
} as const;

const FIN_COUNT = 14;

export function AcousticMonolithMesh({
  reducedMotion = false,
}: {
  reducedMotion?: boolean;
}) {
  const finishId = useHeroStore((s) => s.finish);
  const isExploded = useHeroStore((s) => s.isExploded);
  const travertine = useTravertineTexture();

  const master = useRef<THREE.Group>(null);
  const plinth = useRef<THREE.Group>(null);
  const gimbal = useRef<THREE.Group>(null);
  const glass = useRef<THREE.Group>(null);
  const core = useRef<THREE.Group>(null);
  const fins = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);
  const orbitA = useRef<THREE.Mesh>(null);
  const orbitB = useRef<THREE.Mesh>(null);

  // 3D anchor points for the 3 spatial engineering callouts
  const anchorCore = useRef<THREE.Object3D>(null);
  const anchorGlass = useRef<THREE.Object3D>(null);
  const anchorPlinth = useRef<THREE.Object3D>(null);

  const coreMat = useRef<THREE.MeshStandardMaterial>(null);
  const finishMat1 = useRef<THREE.MeshStandardMaterial>(null);
  const finishMat2 = useRef<THREE.MeshStandardMaterial>(null);
  const finishMat3 = useRef<THREE.MeshStandardMaterial>(null);
  const finishMat4 = useRef<THREE.MeshStandardMaterial>(null);
  const finishMat5 = useRef<THREE.MeshStandardMaterial>(null);

  const targetColor = useMemo(() => new THREE.Color(), []);
  const projVec = useMemo(() => new THREE.Vector3(), []);
  const explodeT = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const t = state.clock.elapsedTime;
    const { pointer } = state;

    // 1. Exploded-view spring (critically damped)
    explodeT.current = damp(explodeT.current, isExploded ? 1 : 0, 4.2, dt);
    const e = explodeT.current;
    const place = (g: THREE.Group | null, [y, z]: readonly [number, number]) => {
      if (!g) return;
      g.position.y = lerp(0, y, e);
      g.position.z = lerp(0, z, e);
    };
    place(plinth.current, EXPLODE.plinth);
    place(gimbal.current, EXPLODE.gimbal);
    place(glass.current, EXPLODE.glass);
    place(core.current, EXPLODE.core);
    place(orbit.current, EXPLODE.orbit);

    // 2. Cursor parallax with inertial damping
    if (master.current) {
      const autoSpin = reducedMotion ? 0 : Math.sin(t * 0.18) * 0.25;
      master.current.rotation.y = damp(master.current.rotation.y, pointer.x * 0.55 + autoSpin, 2.4, dt);
      master.current.rotation.x = damp(master.current.rotation.x, -pointer.y * 0.18 + e * 0.1, 2.4, dt);
    }
    state.camera.position.x = damp(state.camera.position.x, pointer.x * 0.22, 1.6, dt);
    state.camera.position.y = damp(state.camera.position.y, 0.35 + pointer.y * 0.14, 1.6, dt);
    state.camera.lookAt(0, 0.1, 0);

    // 3. Counter-rotating acoustic fins + gimbal precession
    const speed = reducedMotion ? 0.15 : 1;
    if (fins.current) fins.current.rotation.z -= dt * 0.6 * speed;
    if (core.current) core.current.rotation.y += dt * 0.35 * speed;
    if (gimbal.current) gimbal.current.rotation.y = Math.sin(t * 0.3) * 0.12 * speed;

    // 4. Orbital calibration rings tilt with the cursor
    if (orbitA.current) {
      orbitA.current.rotation.x = damp(orbitA.current.rotation.x, Math.PI / 2 + pointer.y * 0.5, 3, dt);
      orbitA.current.rotation.y = damp(orbitA.current.rotation.y, pointer.x * 0.4, 3, dt);
    }
    if (orbitB.current) {
      orbitB.current.rotation.x = damp(orbitB.current.rotation.x, Math.PI / 2.3 - pointer.y * 0.35, 3, dt);
      orbitB.current.rotation.z += dt * 0.15 * speed;
    }

    // 5. Live PBR finish interpolation
    const f = HERO_FINISHES.find((x) => x.id === finishId)!;
    targetColor.set(f.hex);
    const alpha = 1 - Math.exp(-8 * dt);
    const updateMat = (mat: THREE.MeshStandardMaterial | null) => {
      if (!mat) return;
      mat.color.lerp(targetColor, alpha);
      mat.metalness = damp(mat.metalness, f.metalness, 8, dt);
      mat.roughness = damp(mat.roughness, f.roughness, 8, dt);
    };
    updateMat(finishMat1.current);
    updateMat(finishMat2.current);
    updateMat(finishMat3.current);
    updateMat(finishMat4.current);
    updateMat(finishMat5.current);

    if (coreMat.current) coreMat.current.emissiveIntensity = 0.55 + Math.sin(t * 1.6) * 0.18 + e * 0.35;

    // 6. Project 3D anchor coordinates onto the stage's 2D viewport for the spatial callout pills
    const projectToOverlay = (anchor: THREE.Object3D | null, id: string, minY: number, maxY: number) => {
      if (!anchor) return;
      const el = document.getElementById(id);
      if (!el) return;
      anchor.getWorldPosition(projVec);
      projVec.project(state.camera);
      const xPct = clamp((projVec.x * 0.5 + 0.5) * 100, 24, 76);
      const yPct = clamp((-projVec.y * 0.5 + 0.5) * 100, minY, maxY);
      el.style.left = `${xPct.toFixed(2)}%`;
      el.style.top = `${yPct.toFixed(2)}%`;
    };
    projectToOverlay(anchorGlass.current, "hero-hotspot-02", 16, 36);
    projectToOverlay(anchorCore.current, "hero-hotspot-01", 42, 60);
    projectToOverlay(anchorPlinth.current, "hero-hotspot-03", 72, 86);
  });

  const initialFinish = HERO_FINISHES[0];

  return (
    <Float speed={reducedMotion ? 0 : 1.4} rotationIntensity={0.14} floatIntensity={0.38} floatingRange={[-0.05, 0.05]}>
      <group ref={master} scale={0.76} position={[0, 0.22, 0]}>
        {/* 1. Honed travertine pedestal */}
        <group ref={plinth}>
          <mesh position={[0, -1.35, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.02, 1.1, 0.34, 96, 1]} />
            <meshStandardMaterial map={travertine} color="#E5E0D8" roughness={0.85} metalness={0} />
          </mesh>
          <mesh position={[0, -1.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.0, 0.025, 16, 128]} />
            <meshStandardMaterial map={travertine} color="#E9E4DC" roughness={0.8} />
          </mesh>
          <mesh position={[0, -1.165, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.52, 0.56, 96]} />
            <meshStandardMaterial color="#B8B5AE" metalness={0.9} roughness={0.3} side={THREE.DoubleSide} />
          </mesh>
          <object3D ref={anchorPlinth} position={[0.35, -1.25, 0.3]} />
        </group>

        {/* 2. Outer CNC anodized acoustic gimbal ring + yoke */}
        <group ref={gimbal}>
          <mesh castShadow>
            <torusGeometry args={[1.22, 0.075, 48, 160]} />
            <meshStandardMaterial
              ref={finishMat1}
              color={initialFinish.hex}
              metalness={initialFinish.metalness}
              roughness={initialFinish.roughness}
              envMapIntensity={1.15}
            />
          </mesh>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[1.32, 0.012, 12, 160]} />
            <meshStandardMaterial
              ref={finishMat2}
              color={initialFinish.hex}
              metalness={initialFinish.metalness}
              roughness={initialFinish.roughness}
              envMapIntensity={1.15}
            />
          </mesh>
          <mesh position={[-0.42, -1.06, 0]} rotation={[0, 0, 0.42]}>
            <cylinderGeometry args={[0.035, 0.05, 0.42, 24]} />
            <meshStandardMaterial
              ref={finishMat3}
              color={initialFinish.hex}
              metalness={initialFinish.metalness}
              roughness={initialFinish.roughness}
              envMapIntensity={1.15}
            />
          </mesh>
          <mesh position={[0.42, -1.06, 0]} rotation={[0, 0, -0.42]}>
            <cylinderGeometry args={[0.035, 0.05, 0.42, 24]} />
            <meshStandardMaterial
              ref={finishMat4}
              color={initialFinish.hex}
              metalness={initialFinish.metalness}
              roughness={initialFinish.roughness}
              envMapIntensity={1.15}
            />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={`pivot-${s}`} position={[s * 1.22, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.07, 0.07, 0.12, 32]} />
              <meshStandardMaterial color="#C85632" metalness={0.5} roughness={0.35} />
            </mesh>
          ))}
        </group>

        {/* 3. Frosted borosilicate glass halo chamber */}
        <group ref={glass}>
          <mesh>
            <sphereGeometry args={[0.8, 96, 96]} />
            <meshPhysicalMaterial
              color="#F4EFE8"
              transmission={0.92}
              ior={1.45}
              thickness={1.2}
              roughness={0.15}
              metalness={0}
              clearcoat={1}
              clearcoatRoughness={0.1}
              attenuationColor="#F2D9C4"
              attenuationDistance={2.5}
              transparent
              opacity={0.98}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.81, 0.018, 16, 128]} />
            <meshStandardMaterial
              ref={finishMat5}
              color={initialFinish.hex}
              metalness={initialFinish.metalness}
              roughness={initialFinish.roughness}
              envMapIntensity={1.15}
            />
          </mesh>
          <object3D ref={anchorGlass} position={[-0.35, 0.65, 0.25]} />
        </group>

        {/* 4. Beryllium acoustic core + terracotta driver coil + fins */}
        <group ref={core}>
          <mesh>
            <sphereGeometry args={[0.3, 64, 64]} />
            <meshStandardMaterial
              ref={coreMat}
              color="#C85632"
              emissive="#C85632"
              emissiveIntensity={0.6}
              metalness={0.45}
              roughness={0.3}
            />
          </mesh>
          <mesh>
            <torusGeometry args={[0.4, 0.028, 24, 96]} />
            <meshStandardMaterial color="#D9C7A6" metalness={1} roughness={0.18} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.36, 0.012, 16, 96]} />
            <meshStandardMaterial color="#E7E3DC" metalness={1} roughness={0.12} />
          </mesh>
          <group ref={fins}>
            {Array.from({ length: FIN_COUNT }).map((_, i) => {
              const a = (i / FIN_COUNT) * Math.PI * 2;
              return (
                <mesh key={i} position={[Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0]} rotation={[0, 0, a]}>
                  <boxGeometry args={[0.16, 0.012, 0.22]} />
                  <meshStandardMaterial color="#CFCBC4" metalness={0.95} roughness={0.2} />
                </mesh>
              );
            })}
          </group>
          <object3D ref={anchorCore} position={[0.4, 0.08, 0.35]} />
        </group>

        {/* 5. Orbital calibration rings */}
        <group ref={orbit}>
          <mesh ref={orbitA} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.55, 0.006, 8, 200]} />
            <meshStandardMaterial color="#9E9890" metalness={1} roughness={0.25} />
          </mesh>
          <mesh ref={orbitB} rotation={[Math.PI / 2.3, 0, 0]}>
            <torusGeometry args={[1.68, 0.004, 6, 120]} />
            <meshBasicMaterial color="#C85632" wireframe transparent opacity={0.55} />
          </mesh>
        </group>
      </group>
    </Float>
  );
}
