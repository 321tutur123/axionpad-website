"use client";

import { useRef, useEffect, useMemo, useCallback } from "react";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { Suspense } from "react";
import { Environment, OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Group, Box3, Vector3, Object3D, Color, MathUtils, Mesh } from "three";
import { useRouter } from "next/navigation";
import { scrollProgress } from "@/lib/scrollProgress";
import FloatingParticles from "./FloatingParticles";
import ModelErrorBoundary from "./ModelErrorBoundary";

const MODEL_PATH = "/models/axionpad.glb";
useGLTF.preload(MODEL_PATH);

/** À plein scroll : déplacement vertical max du couvercle (coords « monde » équivalentes après / autoScale). */
const COVER_LIFT_WORLD_MAX = 1.82;

const COMPONENT_ROUTES: Record<string, string> = {
  "body axion": "body",
  "top":        "top",
  "bottom":     "bottom",
  "cherry mx":  "switches",
};

/** Noms issus du blend / axionpad.glb (Outliner Blender). */
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
  if ((n.includes("top") || n.includes("lid") || n.includes("cover")) && !n.includes("bottom"))
    return "top";
  if (n.includes("body") || n.includes("boitier") || n.includes("coque")) return "body";
  if (n.includes("bottom") || n.includes("base")) return "bottom";
  return null;
}

/**
 * Couche d’éclatement : couvercle (+ vis plaques) monte jusqu’à COVER_LIFT_WORLD_MAX ;
 * tout le bloc PCB / touches / faders monte à la moitié. box_bottom immobile.
 */
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

function ExplodingModel() {
  const router = useRouter();
  const groupRef   = useRef<Group>(null);
  const coverRef   = useRef<{ mesh: Object3D; originY: number }[]>([]);
  const pcbRef     = useRef<{ mesh: Object3D; originY: number }[]>([]);
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
    const pcbs: { mesh: Object3D; originY: number }[] = [];
    scene.traverse(child => {
      if (!(child instanceof Mesh)) return;
      const layer = explodeLiftLayer(child.name);
      if (layer === "cover") covers.push(meshEntry(child));
      else if (layer === "pcbHalf") pcbs.push(meshEntry(child));
    });
    coverRef.current = covers;
    pcbRef.current = pcbs;
  }, [scene]);

  useFrame((_, delta) => {
    const p = scrollProgress.current;
    const scaledCoverMax = COVER_LIFT_WORLD_MAX / Math.max(autoScale, 1e-6);
    const coverLift = MathUtils.lerp(0, scaledCoverMax, p);
    const pcbLift = coverLift * 0.5;
    const k = Math.min(1, delta * 10);

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
      mesh.material.emissive = new Color("#E07B39");
      mesh.material.emissiveIntensity = 0.18;
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

export default function ScrollScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />

      {/* Éclairage chaud — zéro néon */}
      <ambientLight color="#FFF5E6" intensity={0.8} />
      <directionalLight
        color="#FFE4C4"
        intensity={1.2}
        position={[2, 3, 2]}
        castShadow
      />
      <directionalLight
        color="#FFDDB0"
        intensity={0.5}
        position={[-3, 1, -2]}
      />

      {/* Ombre portée sous le pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <shadowMaterial transparent opacity={0.12} color="#B4783C" />
      </mesh>

      <Suspense fallback={null}>
        <FloatingParticles count={200} radius={9} color="#C89A6A" />
      </Suspense>

      <ModelErrorBoundary>
        <Suspense fallback={null}>
          <Environment preset="sunset" />
          <ExplodingModel />
        </Suspense>
      </ModelErrorBoundary>

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.4}
      />
    </Canvas>
  );
}
