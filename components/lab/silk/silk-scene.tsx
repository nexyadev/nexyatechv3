"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { PlaneGeometry, type Mesh, type ShaderMaterial } from "three";
import { clamp01, damp, getLab, live, setLab, useLab } from "../lab-state";
import { RIBBON_COUNT, bezier, blendedPose } from "./choreography";
import { silkMaterialParameters } from "./silk-material";

const CAMERA_Z = 10;
const FOV = 40;
const TAN = Math.tan((FOV * Math.PI) / 360);
/** 3 = 7 ribbons, DPR 1.5, bloom · 2 = 5 ribbons · 1 = DPR 1 · 0 = no bloom. */
type Quality = 0 | 1 | 2 | 3;

const hash = (n: number) => { const x = Math.sin(n * 12.9898 + 4.1414) * 43758.5453; return x - Math.floor(x); };
const layerSoftness = (i: number) => (i % 3 === 0 ? 0 : i % 3 === 1 ? .45 : 1);


function Ribbons({ count, mobile }: { count: number; mobile: boolean }) {
  const meshes = useRef<(Mesh | null)[]>([]);
  const time = useRef(0);
  const pointer = useRef({ x: 0, y: 0, vx: 0, vy: 0, strength: 0 });
  const frameCount = useRef(0);
  const cards = useRef<HTMLElement[]>([]);
  const geometry = useMemo(() => new PlaneGeometry(1, 1, 220, 12), []);
  const parameters = useMemo(() => Array.from({ length: RIBBON_COUNT.desktop }, (_, i) => silkMaterialParameters(hash(i + 1) * 10, layerSoftness(i), mobile)), [mobile]);
  const { size } = useThree();

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    const collect = () => { cards.current = [...document.querySelectorAll<HTMLElement>("[data-ribbon-card]")]; };
    collect();
    const late = window.setTimeout(collect, 800);
    return () => window.clearTimeout(late);
  }, []);

  useFrame(({ camera, clock }, rawDelta) => {
    const paused = getLab().paused;
    const dt = paused ? 0 : Math.min(rawDelta, 1 / 20);
    time.current += dt;
    const step = Math.min(rawDelta, 1 / 20);

    // Inertia: scene, scroll speed and opening follow their targets smoothly, in both directions.
    live.scene = damp(live.scene, live.sceneTarget, 2.4, step);
    live.velocity = damp(live.velocity, live.velocityTarget, 3, step);
    live.velocityTarget = damp(live.velocityTarget, 0, 2.5, step);
    live.open = damp(live.open, live.openTarget, 2.2, step);

    // Pointer with spring physics on desktop; slow automatic sway (or gyroscope) on touch screens.
    const p = pointer.current;
    const target = mobile && !live.pointerTarget.active
      ? { x: Math.sin(clock.elapsedTime * .3) * .5, y: Math.cos(clock.elapsedTime * .23) * .35 }
      : live.pointerTarget;
    p.vx = (p.vx + (target.x - p.x) * 26 * step) * Math.exp(-7 * step);
    p.vy = (p.vy + (target.y - p.y) * 26 * step) * Math.exp(-7 * step);
    p.x += p.vx * step; p.y += p.vy * step;
    p.strength = damp(p.strength, !mobile && live.pointerTarget.active ? 1 : 0, 3, step);

    const aspect = size.width / Math.max(1, size.height);
    const stretch = clamp01(Math.abs(live.velocity) / 2600) * 1.5;
    camera.position.x = damp(camera.position.x, mobile ? 0 : p.x * .28, 3, step);
    camera.position.y = damp(camera.position.y, mobile ? 0 : p.y * .18, 3, step);
    camera.lookAt(0, 0, 0);

    for (let i = 0; i < RIBBON_COUNT.desktop; i++) {
      const mesh = meshes.current[i];
      if (!mesh) continue;
      mesh.visible = i < count;
      if (!mesh.visible) continue;
      const pose = blendedPose(live.scene, live.open, i, count);
      const halfH = (CAMERA_Z - pose.z) * TAN, halfW = halfH * aspect;
      // Parallax: near layers drift more with the pointer than far ones.
      const depth = clamp01((pose.z + 4) / 6) * (mobile ? .35 : 1);
      const ox = p.x * .22 * depth * halfW, oy = p.y * .16 * depth * halfH;
      const uniforms = (mesh.material as ShaderMaterial).uniforms;
      pose.points.forEach(([x, y], k) => { (uniforms[`uP${k}`].value as { set: (x: number, y: number, z: number) => void }).set(x * halfW + ox, y * halfH + oy, pose.z); });
      uniforms.uWidth.value = pose.width;
      uniforms.uTwist.value = pose.twist;
      uniforms.uNoise.value = pose.noise;
      uniforms.uIntensity.value = pose.intensity * (mobile ? .9 : 1);
      uniforms.uTime.value = time.current;
      uniforms.uStretch.value = stretch;
      (uniforms.uMouse.value as { set: (x: number, y: number, z: number) => void }).set(p.x * halfW, p.y * halfH, pose.z);
      uniforms.uMouseStrength.value = p.strength * .9;
      uniforms.uCursorGlow.value = p.strength * 1.1;
      uniforms.uReveal.value = .05 + live.open * 1.25;
    }

    // Solutions: ribbons passing behind the cards light their borders where they actually cross.
    frameCount.current += 1;
    if (frameCount.current % 3 !== 0) return;
    const nearSolutions = clamp01(1 - Math.abs(live.scene - 2));
    for (const card of cards.current) {
      const previous = Number(card.getAttribute("data-ribbon") ?? -1);
      let best = 0, bestX = 50, bestY = 50;
      if (nearSolutions > .02) {
        const rect = card.getBoundingClientRect();
        for (let i = 0; i < count; i++) {
          const pose = blendedPose(live.scene, live.open, i, count);
          for (let s = 0; s <= 24; s++) {
            const [nx, ny] = bezier(pose.points, s / 24);
            const sx = (nx + 1) * .5 * size.width, sy = (1 - ny) * .5 * size.height;
            const dx = Math.max(rect.left - sx, 0, sx - rect.right), dy = Math.max(rect.top - sy, 0, sy - rect.bottom);
            const light = Math.exp(-(dx * dx + dy * dy) / (150 * 150)) * pose.intensity;
            if (light > best) { best = light; bestX = ((sx - rect.left) / rect.width) * 100; bestY = ((sy - rect.top) / rect.height) * 100; }
          }
        }
        best *= nearSolutions;
      }
      if (Math.abs(best - previous) > .01) {
        card.setAttribute("data-ribbon", best.toFixed(3));
        card.style.setProperty("--ribbon-light", best.toFixed(3));
        card.style.setProperty("--ribbon-x", `${Math.max(-20, Math.min(120, bestX)).toFixed(1)}%`);
        card.style.setProperty("--ribbon-y", `${Math.max(-20, Math.min(120, bestY)).toFixed(1)}%`);
      }
    }
  });

  return (
    <>
      {parameters.map((params, i) => (
        <mesh key={`${mobile}-${i}`} ref={(mesh) => { meshes.current[i] = mesh; }} geometry={geometry} frustumCulled={false} renderOrder={i}>
          <shaderMaterial args={[params]} />
        </mesh>
      ))}
    </>
  );
}

function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 3) setLab({ sceneReady: true });
  });
  return null;
}

function ContextWatch() {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); setLab({ sceneFailed: true, sceneReady: false }); };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl]);
  return null;
}

/** The single WebGL context of /lab: light ribbons, optional bloom, adaptive quality. */
export default function SilkScene({ mobile }: { mobile: boolean }) {
  const paused = useLab((state) => state.paused);
  const [quality, setQuality] = useState<Quality>(mobile ? 1 : 3);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const count = mobile ? RIBBON_COUNT.mobile : quality >= 3 ? RIBBON_COUNT.desktop : RIBBON_COUNT.reduced;
  const dpr: [number, number] = mobile ? [.75, 1] : quality >= 2 ? [1, 1.5] : [1, 1];

  return (
    <Canvas
      className="lab-silk-canvas"
      dpr={dpr}
      frameloop={hidden || paused ? "never" : "always"}
      camera={{ position: [0, 0, CAMERA_Z], fov: FOV, near: .1, far: 60 }}
      gl={{ antialias: false, alpha: false, stencil: false, depth: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor("#000000", 1)}
    >
      <ContextWatch />
      {/* Degrade in order: fewer ribbons → lower render resolution → no bloom. */}
      {!mobile && <PerformanceMonitor bounds={(refresh) => (refresh > 90 ? [60, 90] : [45, 58])} flipflops={4} onDecline={() => setQuality((q) => Math.max(0, q - 1) as Quality)} onFallback={() => setQuality(0)} />}
      <Ribbons count={count} mobile={mobile} />
      {!mobile && quality >= 1 && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom mipmapBlur luminanceThreshold={.88} luminanceSmoothing={.25} intensity={.6} radius={.75} />
        </EffectComposer>
      )}
      <ReadySignal />
    </Canvas>
  );
}
