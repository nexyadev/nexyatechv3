"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Line, PerformanceMonitor } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { ExtrudeGeometry, Group, MathUtils, Shape, type Vector3Tuple } from "three";
import { SculptureFallback } from "./sculpture-fallback";

type SceneProps = { active: boolean; mobile: boolean; compact: boolean; className?: string; onFallback: () => void };

const RISING_POINTS = [[-1.75, -1.64], [-.7, -1.64], [1.74, 1.65], [.68, 1.65]] as const;
const FALLING_POINTS = [[-1.76, 1.65], [-.69, 1.65], [1.76, -1.65], [.69, -1.65]] as const;

function ChromeBeam({ points, position, color = "#a7b0bd" }: {
  points: ReadonlyArray<readonly [number, number]>;
  position: Vector3Tuple;
  color?: string;
}) {
  const geometry = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
    shape.closePath();
    return new ExtrudeGeometry(shape, { depth: .43, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: .065, bevelThickness: .065, curveSegments: 1 });
  }, [points]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} position={position}>
      <meshPhysicalMaterial color={color} metalness={1} roughness={.24} clearcoat={.7} clearcoatRoughness={.22} envMapIntensity={1.55} />
    </mesh>
  );
}

function Sculpture({ active, mobile, compact }: Pick<SceneProps, "active" | "mobile" | "compact">) {
  const sculpture = useRef<Group>(null);
  const rearBeam = useRef<Group>(null);
  const orbit = useRef<Group>(null);
  const progress = useRef(0);
  const elapsed = useRef(0);
  const { invalidate } = useThree();
  const ring = useMemo<Vector3Tuple[]>(() => Array.from({ length: 81 }, (_, i) => {
    const a = (i / 80) * Math.PI * 2;
    return [Math.cos(a) * 2.9, Math.sin(a) * 2.9, 0];
  }), []);
  const particlePositions = useMemo<Vector3Tuple[]>(() => Array.from({ length: mobile ? 9 : 16 }, (_, i) => {
    const a = i * 2.39996;
    const r = 2.7 + (i % 4) * .17;
    return [Math.cos(a) * r, Math.sin(a) * r, Math.sin(i * 1.7) * 1.3];
  }), [mobile]);

  useEffect(() => {
    const onScroll = () => {
      progress.current = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.5);
      if (active) invalidate();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [active, invalidate]);

  useFrame((state, delta) => {
    if (!active || !sculpture.current) return;
    elapsed.current += Math.min(delta, .05);
    const t = elapsed.current;
    const pointerX = mobile ? 0 : state.pointer.x;
    const pointerY = mobile ? 0 : state.pointer.y;
    const scroll = compact ? 0 : progress.current;
    sculpture.current.rotation.y = MathUtils.damp(sculpture.current.rotation.y, -.4 + Math.sin(t * .17) * .1 + pointerX * .14 + scroll * .28, 3, delta);
    sculpture.current.rotation.x = MathUtils.damp(sculpture.current.rotation.x, .13 + pointerY * .08 - scroll * .07, 3, delta);
    sculpture.current.rotation.z = MathUtils.damp(sculpture.current.rotation.z, -.19 + Math.sin(t * .13) * .025 + scroll * .11, 3, delta);
    sculpture.current.position.y = Math.sin(t * .5) * .045;
    if (rearBeam.current) rearBeam.current.position.z = MathUtils.damp(rearBeam.current.position.z, -.56 - scroll * .38, 3, delta);
    if (orbit.current) orbit.current.rotation.z = t * .018;
    state.camera.position.x = MathUtils.damp(state.camera.position.x, pointerX * .07, 2, delta);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={.35} />
      <directionalLight position={[1, 4, 5]} intensity={2.5} color="#e5edff" />
      <pointLight position={[-3, -2, 3]} intensity={1.5} color="#527fff" distance={9} />
      <Environment resolution={mobile ? 128 : 256} frames={1}>
        <color attach="background" args={["#141820"]} />
        <Lightformer form="rect" intensity={1.8} position={[-3, .2, 6]} scale={[4, 8, 1]} />
        <Lightformer form="rect" intensity={6} position={[-4, 4, 3]} scale={[3, 7, 1]} rotation={[0, .5, .4]} />
        <Lightformer form="rect" intensity={4} position={[4, 1, 3]} scale={[1.5, 8, 1]} rotation={[0, -.6, -.2]} />
        <Lightformer form="rect" intensity={2.5} position={[0, 5, -1]} scale={[8, 2, 1]} rotation={[Math.PI / 2, 0, 0]} />
        <Lightformer form="rect" intensity={3} color="#3d7dff" position={[-4, -2, 0]} scale={[1, 6, 1]} rotation={[0, Math.PI / 2, 0]} />
        <Lightformer form="rect" intensity={1.5} position={[0, -4, 3]} scale={[6, 1, 1]} rotation={[.6, 0, 0]} />
      </Environment>
      <group ref={sculpture} rotation={[.13, -.4, -.19]} scale={compact ? 1.08 : 1.12}>
        <group ref={rearBeam} position={[0, 0, -.56]}>
          <ChromeBeam points={RISING_POINTS} position={[0, 0, 0]} color="#7f8c9f" />
          <Line points={[[-1.68, -1.59, .45], [-.72, -1.59, .45], [1.65, 1.59, .45]]} color="#388cff" lineWidth={1.3} transparent opacity={.8} />
        </group>
        <ChromeBeam points={FALLING_POINTS} position={[0, 0, .06]} />
        <Line points={[[-1.75, 1.59, .12], [.71, -1.65, .12], [1.75, -1.65, .12]]} color="#71b4ff" lineWidth={1.7} transparent opacity={.96} />
        <mesh position={[1.02, -1.25, .51]} rotation={[0, 0, -.93]}>
          <planeGeometry args={[.2, .035]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
      </group>
      {!compact && (
        <group ref={orbit}>
          <group rotation={[1.15, .2, -.25]}>
            <Line points={ring} color="#62789c" lineWidth={.65} transparent opacity={.23} />
          </group>
          <group rotation={[.15, 1.2, .7]}>
            <Line points={ring} color="#476a9d" lineWidth={.55} transparent opacity={.13} />
          </group>
          {particlePositions.map((position, i) => (
            <mesh key={i} position={position}>
              <sphereGeometry args={[i % 4 === 0 ? .018 : .008, 6, 6]} />
              <meshBasicMaterial color={i % 3 === 0 ? "#428dff" : "#a8b7cd"} transparent opacity={i % 3 === 0 ? .8 : .35} />
            </mesh>
          ))}
        </group>
      )}
    </>
  );
}

function ContextMonitor({ onLost }: { onLost: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const handleLoss = (event: Event) => {
      event.preventDefault();
      onLost();
    };
    canvas.addEventListener("webglcontextlost", handleLoss);
    return () => canvas.removeEventListener("webglcontextlost", handleLoss);
  }, [gl, onLost]);
  return null;
}

export default function SculptureScene({ active, mobile, compact, className, onFallback }: SceneProps) {
  const [lowQuality, setLowQuality] = useState(false);

  return (
    <Canvas
      className={className}
      camera={{ position: [0, .1, mobile ? 8.5 : 8], fov: 40, near: .1, far: 30 }}
      dpr={lowQuality ? 1 : mobile ? [1, 1.25] : [1, 1.75]}
      frameloop={active ? "always" : "demand"}
      gl={{ alpha: true, antialias: !mobile, powerPreference: "low-power" }}
      fallback={<SculptureFallback />}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <ContextMonitor onLost={onFallback} />
      {active && <PerformanceMonitor bounds={() => [35, 55]} onDecline={() => setLowQuality(true)} />}
      <Sculpture active={active} mobile={mobile || lowQuality} compact={compact} />
    </Canvas>
  );
}
