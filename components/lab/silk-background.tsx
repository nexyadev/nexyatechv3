"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SCENES, TOUCH_QUERY, live, setLab, useLab, type SceneName } from "./lab-state";
import styles from "./lab.module.css";

const SilkScene = dynamic(() => import("./silk/silk-scene"), { ssr: false, loading: () => null });

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { setLab({ sceneFailed: true, sceneReady: false }); }
  render() { return this.state.failed ? null : this.props.children; }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

const INTERACTIONS = ["pointerdown", "touchstart", "keydown", "wheel", "scroll"] as const;

function whenIdle(callback: () => void) {
  let handle = 0, timer = 0;
  const schedule = () => {
    if (typeof window.requestIdleCallback === "function") handle = window.requestIdleCallback(callback, { timeout: 900 });
    else timer = window.setTimeout(callback, 150);
  };
  if (document.readyState === "complete") schedule(); else window.addEventListener("load", schedule, { once: true });
  return () => { window.removeEventListener("load", schedule); if (handle) window.cancelIdleCallback(handle); window.clearTimeout(timer); };
}

function onFirstInteraction(callback: () => void) {
  let done = false;
  const run = () => { if (done) return; done = true; INTERACTIONS.forEach((type) => window.removeEventListener(type, run)); callback(); };
  INTERACTIONS.forEach((type) => window.addEventListener(type, run, { passive: true }));
  return () => INTERACTIONS.forEach((type) => window.removeEventListener(type, run));
}

/** Scene index (float) from the section that crosses the middle of the screen. */
function sceneFromScroll() {
  const sections = [...document.querySelectorAll<HTMLElement>("[data-silk-scene]")];
  const middle = window.innerHeight / 2;
  const centers = sections.map((section) => {
    const rect = section.getBoundingClientRect();
    return { center: rect.top + rect.height / 2, scene: SCENES.indexOf(section.dataset.silkScene as SceneName) };
  });
  if (!centers.length) return 0;
  if (middle <= centers[0].center) return centers[0].scene;
  for (let i = 0; i < centers.length - 1; i++) {
    const a = centers[i], b = centers[i + 1];
    if (middle >= a.center && middle < b.center) return a.scene + (b.scene - a.scene) * ((middle - a.center) / (b.center - a.center));
  }
  return centers[centers.length - 1].scene;
}

/**
 * Background of /lab: a still frame of the ribbons (also the reduced-motion and no-WebGL state),
 * the live WebGL "Seda de Luz" on top of it, then fog, vignette, grain and the cursor spotlight.
 */
export function SilkBackground() {
  const [mode, setMode] = useState<"still" | "live">("still");
  const [mobile, setMobile] = useState(false);
  const ready = useLab((state) => state.sceneReady);
  const failed = useLab((state) => state.sceneFailed);
  const paused = useLab((state) => state.paused);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !supportsWebGL()) {
      setLab({ sceneFailed: true });
      return;
    }
    const touch = window.matchMedia(TOUCH_QUERY).matches;
    const start = () => { setMobile(touch); setMode("live"); };
    return touch ? onFirstInteraction(start) : whenIdle(start);
  }, []);

  // Scroll → scene, with GSAP ScrollTrigger (velocity included). Never drives the page itself.
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 0,
      end: "max",
      onUpdate: (self) => {
        live.sceneTarget = sceneFromScroll();
        live.velocityTarget = self.getVelocity();
      },
      onRefresh: () => { live.sceneTarget = sceneFromScroll(); },
    });
    live.sceneTarget = sceneFromScroll();
    live.scene = live.sceneTarget;
    return () => trigger.kill();
  }, []);

  // Pointer: drives the silk physics and the CSS spotlight.
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0, cx = 50, cy = 40;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      live.pointerTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
      live.pointerTarget.y = -((event.clientY / window.innerHeight) * 2 - 1);
      live.pointerTarget.active = true;
      cx = (event.clientX / window.innerWidth) * 100; cy = (event.clientY / window.innerHeight) * 100;
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; root.style.setProperty("--lab-cx", `${cx}%`); root.style.setProperty("--lab-cy", `${cy}%`); });
    };
    const onLeave = () => { live.pointerTarget.active = false; };
    // Gyroscope only when the browser already provides it; the page never asks for permission.
    const onTilt = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return;
      live.pointerTarget.x = Math.max(-1, Math.min(1, event.gamma / 35));
      live.pointerTarget.y = Math.max(-1, Math.min(1, (45 - event.beta) / 35));
      live.pointerTarget.active = true;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("deviceorientation", onTilt, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, []);

  const showLive = mode === "live" && !failed;

  return (
    <>
      <div className={styles.silk} aria-hidden="true" data-ready={showLive && ready ? "true" : "false"}>
        <div className={styles.silkStill} />
        {showLive && (
          <div className={styles.silkLive}>
            <SceneBoundary><SilkScene mobile={mobile} /></SceneBoundary>
          </div>
        )}
        <div className={styles.silkFog} />
        <div className={styles.silkSpot} />
        <div className={styles.silkGrain} />
      </div>
      {showLive && ready && (
        <button type="button" className={styles.pause} onClick={() => setLab({ paused: !paused })} aria-pressed={paused} aria-label={paused ? "Retomar animação de fundo" : "Pausar animação de fundo"}>
          {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
        </button>
      )}
    </>
  );
}
