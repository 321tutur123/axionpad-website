"use client";

import { useRef, useEffect, useMemo, useCallback } from "react";
import { Canvas, ThreeEvent, useThree, useFrame } from "@react-three/fiber";
import { Suspense } from "react";
import { Environment, OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";
import {
  Group, Box3, Vector3, Object3D, Color,
  MathUtils, Mesh, PointLight, DirectionalLight,
} from "three";
import { useRouter } from "next/navigation";
import { scrollProgress } from "@/lib/scrollProgress";
import FloatingParticles from "./FloatingParticles";
import ModelErrorBoundary from "./ModelErrorBoundary";
import { useFocusStore, ComponentFocus } from "@/store/focusStore";

const MODEL_PATH = "/models/axionpad.glb";
useGLTF.preload(MODEL_PATH);

const COVER_LIFT_WORLD_MAX = 1.82;

const COMPONENT_ROUTES: Record<string, string> = {
  "body axion": "body",
  "top":        "top",
  "bottom":     "bottom",
  "cherry mx":  "switches",
};

function getSlug(name: string): string | null {
  const n = name.trim().toLowerCase();
  if (n === "pcb_main") return "pcb";
  if (n === "box_top") return "top";
  if (n === "box_bottom") return "bottom";
  if (n.startsWith("vis_")) return "top";
  if (n.startsWith("cherry")) return "switches";
  if (n.startsWith("keycaps_")) return "switches";
  if (n.startsWith("faderknob_")) return "pcb";
  if (name in COMPONENT_ROUTES) return COMPONENT_ROUTES[name];
  if (n.includes("pcb") || n.includes("circuit")) return "pcb";
  if (n.includes("cherry") || n.includes("switch") || n.includes("mx")) return "switches";
  if ((n.includes("top") || n.includes("lid") || n.includes("cover")) && !n.includes("bottom")) return "top";
  if (n.includes("body") || n.includes("boitier") || n.includes("coque")) return "body";
  if (n.includes("bottom") || n.includes("base")) return "bottom";
  return null;
}

function explodeLiftLayer(name: string): "cover" | "pcbHalf" | null {
  const n = name.trim().toLowerCase();
  if (n === "box_top") return "cover";
  if (n.startsWith("vis_")) return "cover";
  if (n === "pcb_main") return "pcbHalf";
  if (n.startsWith("keycaps_")) return "pcbHalf";
  if (n.startsWith("faderknob_")) return "pcbHalf";
  if (n.startsWith("cherry")) return "pcbHalf";
  return null;
}

function meshEntry(child: Mesh) {
  return { mesh: child as Object3D, originY: child.position.y };
}

// ── Camera focus positions per UI zone ───────────────────────
const FOCUS_CAM: Record<string, [number, number, number]> = {
  default: [0,    0.3,  6.0],
  keys:    [-0.5, 1.6,  4.6],
  pots:    [0.9,  -0.7, 4.4],
  pcb:     [0.1,  -0.2, 3.9],
  mcu:     [0.0,   0.1, 4.1],
};

// ── Camera controller — smooth lerp toward focus target ───────
function CameraController() {
  const { camera } = useThree();
  const { focus } = useFocusStore();

  useFrame((_, delta) => {
    if (!focus) return;
    const [tx, ty, tz] = FOCUS_CAM[focus] ?? FOCUS_CAM.default;
    const target = new Vector3(tx, ty, tz);
    camera.position.lerp(target, Math.min(1, delta * 2.6));
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ── Reactive lighting — intensity shifts with UI focus ────────
function ReactiveLight() {
  const { focus } = useFocusStore();
  const greenRef  = useRef<PointLight>(null);
  const blueRef   = useRef<PointLight>(null);
  const amberRef  = useRef<DirectionalLight>(null);

  useFrame((_, delta) => {
    if (!greenRef.current || !blueRef.current || !amberRef.current) return;
    const k = Math.min(1, delta * 3.5);
    const greenTarget = focus === "pcb" || focus === "mcu" ? 1.1 : 0.45;
    const blueTarget  = focus === "keys" ? 0.9 : 0.32;
    const amberTarget = focus === "pots" ? 1.8 : 1.15;

    greenRef.current.intensity  = MathUtils.lerp(greenRef.current.intensity,  greenTarget,  k);
    blueRef.current.intensity   = MathUtils.lerp(blueRef.current.intensity,   blueTarget,   k);
    amberRef.current.intensity  = MathUtils.lerp(amberRef.current.intensity,  amberTarget,  k);
  });

  return (
    <>
      <ambientLight color="#C8D8F0" intensity={0.55} />
      <directionalLight ref={amberRef} color="#FFD060" intensity={1.4} position={[2, 3, 2]} castShadow />
      <pointLight ref={greenRef} color="#22c55e" intensity={0.65} position={[-3, -1, -2]} />
      <pointLight ref={blueRef}  color="#38bdf8" intensity={0.45} position={[3,   1,  4]} />
      <pointLight color="#8B5CF6" intensity={0.18} position={[0, -3, -3]} />
    </>
  );
}

// ── X-Ray effect — toggles emissive+transparent on all meshes ─
function XRayEffect() {
  const { scene }    = useThree();
  const { viewMode } = useFocusStore();

  useEffect(() => {
    if (viewMode !== "xray") return;

    type SavedMat = {
      mesh: Mesh;
      transparent: boolean;
      opacity: number;
      emissive: Color;
      emissiveIntensity: number;
    };
    const saved: SavedMat[] = [];

    scene.traverse((obj) => {
      if (!(obj instanceof Mesh) || !obj.material) return;
      const mat = obj.material as any;
      if (mat.isShadowMaterial) return;
      saved.push({
        mesh: obj,
        transparent: mat.transparent,
        opacity: mat.opacity,
        emissive: mat.emissive?.clone() ?? new Color(0),
        emissiveIntensity: mat.emissiveIntensity ?? 0,
      });
      mat.transparent = true;
      mat.opacity = 0.20;
      if (mat.emissive) {
        mat.emissive.set(0x22c55e);
        mat.emissiveIntensity = 0.75;
      }
    });

    return () => {
      saved.forEach(({ mesh, transparent, opacity, emissive, emissiveIntensity }) => {
        const mat = mesh.material as any;
        mat.transparent = transparent;
        mat.opacity = opacity;
        if (mat.emissive) {
          mat.emissive.copy(emissive);
          mat.emissiveIntensity = emissiveIntensity;
        }
      });
    };
  }, [viewMode, scene]);

  return null;
}

// ── Main model with explode + pointer ─────────────────────────
function ExplodingModel() {
  const router    = useRouter();
  const groupRef  = useRef<Group>(null);
  const coverRef  = useRef<{ mesh: Object3D; originY: number }[]>([]);
  const pcbRef    = useRef<{ mesh: Object3D; originY: number }[]>([]);
  const { scene } = useGLTF(MODEL_PATH);

  const { autoScale, centerOffset } = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = new Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = maxDim > 0 ? 2.8 / maxDim : 1;
    const center = box.getCenter(new Vector3());
    return { autoScale: s, centerOffset: center.multiplyScalar(-1) };
  }, [scene]);

  useEffect(() => {
    const covers: { mesh: Object3D; originY: number }[] = [];
    const pcbs:   { mesh: Object3D; originY: number }[] = [];
    scene.traverse(child => {
      if (!(child instanceof Mesh)) return;
      const layer = explodeLiftLayer(child.name);
      if (layer === "cover")   covers.push(meshEntry(child));
      else if (layer === "pcbHalf") pcbs.push(meshEntry(child));
    });
    coverRef.current = covers;
    pcbRef.current   = pcbs;
  }, [scene]);

  useFrame((_, delta) => {
    const p            = scrollProgress.current;
    const scaledMax    = COVER_LIFT_WORLD_MAX / Math.max(autoScale, 1e-6);
    const coverLift    = MathUtils.lerp(0, scaledMax, p);
    const pcbLift      = coverLift * 0.5;
    const k            = Math.min(1, delta * 10);

    coverRef.current.forEach(({ mesh, originY }) => {
      mesh.position.y = MathUtils.lerp(mesh.position.y, originY + coverLift, k);
    });
    pcbRef.current.forEach(({ mesh, originY }) => {
      mesh.position.y = MathUtils.lerp(mesh.position.y, originY + pcbLift, k);
    });

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.003 * 60 * MathUtils.lerp(1, 0.16, p);
    }
  });

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const slug = getSlug(e.object.name);
    if (slug) router.push(`/components/${slug}`);
  }, [router]);

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const slug = getSlug(e.object.name);
    if (!slug) return;
    document.body.style.cursor = "pointer";
    const mesh = e.object as any;
    if (mesh.isMesh && mesh.material) {
      mesh.material = mesh.material.clone();
      mesh.material.emissive = new Color("#22c55e");
      mesh.material.emissiveIntensity = 0.22;
    }
  }, []);

  const handlePointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "auto";
    const mesh = e.object as any;
    if (mesh.isMesh && mesh.material) {
      mesh.material.emissive = new Color("#000000");
      mesh.material.emissiveIntensity = 0;
    }
  }, []);

  return (
    <group ref={groupRef} scale={autoScale}>
      <group position={[centerOffset.x, centerOffset.y, centerOffset.z]}>
        <primitive
          object={scene}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        />
      </group>
    </group>
  );
}

// ── Canvas export ─────────────────────────────────────────────
export default function ScrollScene() {
  const { focus } = useFocusStore();

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <PerspectiveCamera makeDefault position={[0, 0.3, 6]} fov={50} />

      <ReactiveLight />

      {/* Shadow plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <shadowMaterial transparent opacity={0.10} color="#1A3A2A" />
      </mesh>

      <Suspense fallback={null}>
        <FloatingParticles count={200} radius={9} color="#4ADE80" />
      </Suspense>

      <ModelErrorBoundary>
        <Suspense fallback={null}>
          <Environment preset="studio" background={false} />
          <ExplodingModel />
        </Suspense>
      </ModelErrorBoundary>

      {/* Disable user orbit when camera is focused on a component */}
      <OrbitControls
        enabled={!focus}
        enableDamping
        dampingFactor={0.05}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.4}
      />

      {/* Programmatic camera control + effects */}
      <CameraController />
      <XRayEffect />
    </Canvas>
  );
}
