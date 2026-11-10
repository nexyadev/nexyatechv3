"use client";

import dynamic from "next/dynamic";
import { Component, type ErrorInfo, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { SculptureFallback } from "./sculpture-fallback";
import styles from "./hero-sculpture.module.css";

const SculptureScene = dynamic(() => import("./sculpture-scene"), {
  ssr: false,
  loading: () => <SculptureFallback />,
});

class SceneBoundary extends Component<{ children: ReactNode; onFallback: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onFallback();
    if (process.env.NODE_ENV === "development") {
      console.warn("NEXYA: visualização estática ativada após falha de WebGL.", error.message, info.componentStack);
    }
  }

  render() { return this.state.failed ? <SculptureFallback /> : this.props.children; }
}

export function HeroSculpture({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const mobile = useMediaQuery("(max-width: 767px)");
  const [nearViewport, setNearViewport] = useState(false);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const onFallback = useCallback(() => setFailed(true), []);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const nearObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNearViewport(true);
        nearObserver.disconnect();
      }
    }, { rootMargin: "180px" });
    const visibleObserver = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .04 });
    nearObserver.observe(element);
    visibleObserver.observe(element);
    const onVisibility = () => setDocumentVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      nearObserver.disconnect();
      visibleObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const showScene = nearViewport && !reducedMotion && !failed;

  return (
    <div ref={container} className={`${styles.root} ${compact ? styles.compact : ""} ${className}`}>
      <div className={styles.viewport} aria-hidden="true">
        {showScene ? (
          <SceneBoundary onFallback={onFallback}>
            <SculptureScene active={!compact && visible && documentVisible && !paused} mobile={mobile} compact={compact} className={styles.canvas} onFallback={onFallback} />
          </SceneBoundary>
        ) : <div className={styles.fallback}><SculptureFallback /></div>}
      </div>
      {!compact && <span className={styles.coordinates} aria-hidden="true">Forma, função e movimento</span>}
      {showScene && !compact && (
        <button className={styles.pause} type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? "Retomar animação 3D" : "Pausar animação 3D"} aria-pressed={paused}>
          {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
