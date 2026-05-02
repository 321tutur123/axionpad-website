"use client";

import { useRef, useEffect, useMemo } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  Group, Box3, Vector3,
  MeshStandardMaterial,
  CanvasTexture, PlaneGeometry, MeshBasicMaterial, Mesh,
} from "three";
import { gsap } from "@/lib/gsap";

const MODEL_PATH   = "/models/axionpad.glb";
const LID_MESH     = "box_top";
const LID_TILT_RAD = 6 * Math.PI / 180;

interface ProductModelProps {
  modelPath?:      string;
  targetSize?:     number;
  position?:       [number, number, number];
  autoRotate?:     boolean;
  color?:          string;
  engravingText?:  string;
  engravingImage?: string; // data URL
}

function makeEngravingCanvas(text?: string, imageDataUrl?: string): HTMLCanvasElement {
  const w = 1024, h = 512;
  const canvas = document.createElement("canvas");
  canvas.width  = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);

  if (text) {
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = `bold ${Math.min(120, Math.max(40, Math.floor(800 / text.length)))}px ui-monospace, monospace`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.letterSpacing = "8px";
    ctx.fillText(text.toUpperCase(), w / 2, h / 2);
  }
  return canvas;
}

export default function ProductModel({
  modelPath    = MODEL_PATH,
  targetSize   = 2.8,
  position     = [0, 0, 0],
  autoRotate   = true,
  color,
  engravingText,
  engravingImage,
}: ProductModelProps) {
  const groupRef = useRef<Group>(null);
  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, groupRef);

  const autoScale = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = new Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    return maxDim === 0 ? 1 : targetSize / maxDim;
  }, [scene, modelPath, targetSize]);

  const centerOffset = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const center = new Vector3();
    box.getCenter(center);
    return center.multiplyScalar(-1);
  }, [scene]);

  // Couleur + animation initiale
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) Object.values(actions)[0]?.play();
    if (color && groupRef.current) {
      groupRef.current.traverse((child: any) => {
        if (child.isMesh) {
          child.material = new MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.3 });
        }
      });
    }
  }, [actions, color]);

  useEffect(() => {
    if (!groupRef.current) return;
    gsap.from(groupRef.current.scale, { x: 0, y: 0, z: 0, duration: 1.2, ease: "elastic.out(1, 0.5)" });
  }, []);

  // Overlay gravure sur box_top
  useEffect(() => {
    if (!groupRef.current) return;

    // Supprime l'overlay existant (peut être enfant de n'importe quel mesh)
    scene.traverse((child: any) => {
      if (child.name === "__lid_overlay") {
        child.parent?.remove(child);
        (child as Mesh).geometry?.dispose();
        ((child as Mesh).material as MeshBasicMaterial)?.map?.dispose();
        ((child as Mesh).material as MeshBasicMaterial)?.dispose();
      }
    });

    const hasText  = engravingText  && engravingText.trim().length > 0;
    const hasImage = !!engravingImage;
    if (!hasText && !hasImage) return;

    // Trouve box_top dans la scene
    let lidMesh: any = null;
    scene.traverse((child: any) => {
      if (child.isMesh && child.name === LID_MESH) lidMesh = child;
    });
    if (!lidMesh) return;

    // Dimensions en espace LOCAL du couvercle (l'angle 6° est hérité du parent)
    lidMesh.geometry.computeBoundingBox();
    const geoBBox = lidMesh.geometry.boundingBox!;
    const lidCenter = geoBBox.getCenter(new Vector3());
    const topY  = geoBBox.max.y;
    const planeW = (geoBBox.max.x - geoBBox.min.x) * 0.85;
    const planeD = (geoBBox.max.z - geoBBox.min.z) * 0.85;

    const applyOverlay = (canvas: HTMLCanvasElement) => {
      const texture = new CanvasTexture(canvas);
      const geo = new PlaneGeometry(planeW, planeD);
      const mat = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, opacity: 0.88 });
      const plane = new Mesh(geo, mat);
      plane.name = "__lid_overlay";
      // Centré sur la face supérieure du couvercle, légèrement au-dessus
      plane.position.set(lidCenter.x, topY + 0.001, lidCenter.z);
      // Angles inversés car héritage du parent box_top inverse les transforms
      plane.rotation.set(-Math.PI / 2, -LID_TILT_RAD, -Math.PI / 2);
      // Ajout comme enfant du couvercle
      lidMesh.add(plane);
    };

    if (hasImage) {
      const img = new Image();
      img.onload = () => {
        const w = 1024, h = 512;
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, w, h);
        const ratio = Math.min((w * 0.85) / img.width, (h * 0.85) / img.height);
        const iw = img.width * ratio, ih = img.height * ratio;
        ctx.globalAlpha = 0.45;
        ctx.filter = "grayscale(100%)";
        ctx.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
        applyOverlay(canvas);
      };
      img.src = engravingImage!;
    } else {
      applyOverlay(makeEngravingCanvas(engravingText));
    }
  }, [engravingText, engravingImage, autoScale]);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) groupRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={groupRef} position={position} scale={autoScale}>
      <group position={[centerOffset.x, centerOffset.y, centerOffset.z]}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
