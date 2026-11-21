"use client";

import { useEffect, useRef } from "react";
import { LOGO_BANDS, LOGO_DOT, LOGO_GLYPHS, LOGO_IMAGE } from "@/lib/brand/logo-geometry";
import { LAB_SESSION_KEY, TOUCH_QUERY, getLab, live, setLab } from "./lab-state";
import styles from "./lab.module.css";

const MIN_MS = 1200;
const MAX_MS = 3000;
const EXIT_MS = 950;

const { wordmark } = LOGO_BANDS;
const CAP = wordmark.capHeight;
const CX = (wordmark.x0 + wordmark.x1) / 2;
const CY = (wordmark.y0 + wordmark.y1) / 2;
/** Outline paths in the pixel space of the official image, so the drawn contour sits exactly on it. */
const OUTLINES = LOGO_GLYPHS.map((glyph) => {
  let d = "";
  for (let i = 0; i < glyph.outer.length; i += 2) d += `${i ? "L" : "M"}${(glyph.outer[i] * CAP + CX).toFixed(1)} ${(-glyph.outer[i + 1] * CAP + CY).toFixed(1)}`;
  return `${d}Z`;
});
const STAR = { left: ((LOGO_DOT.x * CAP + CX) / LOGO_IMAGE.width) * 100, top: ((-LOGO_DOT.y * CAP + CY) / LOGO_IMAGE.height) * 100 };
/** Resampled copy of the official file (scripts/derive-logo-assets.mjs): ~35 KB instead of 445 KB. */
const LOADER_LOGO = "/images/lab/nexya-logo-900.webp";
/** Top of the wordmark band as a fraction of the image width (header crop uses the same value). */
const CROP_TOP = (wordmark.y0 - 10) / LOGO_IMAGE.width;

/** Runs before the first paint, right after the loader markup: skip it for this session or reduced motion. */
export const LOADER_BOOT = `(function(){try{var l=document.getElementById("lab-loader"),r=document.getElementById("lab-root");if(!l||!r)return;r.setAttribute("data-js","");if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||window.sessionStorage.getItem(${JSON.stringify(LAB_SESSION_KEY)})){l.setAttribute("data-state","skip");return;}r.setAttribute("data-loading","");}catch(e){}})();`;

export function LabLoader() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const labRoot = document.getElementById("lab-root") ?? document.documentElement;
    if (element.dataset.state === "skip") {
      setLab({ loader: "none" });
      return;
    }
    setLab({ loader: "playing" });
    live.open = 0;
    live.openTarget = 0;

    const touch = window.matchMedia(TOUCH_QUERY).matches;
    const started = performance.now();
    let progress = 0, shown = 0, raf = 0, finished = false, exitTimer = 0;
    const tasks = { fonts: false, scene: false };

    document.fonts.ready.then(() => { tasks.fonts = true; }).catch(() => { tasks.fonts = true; });
    if (touch) {
      // Phones do not wait for WebGL: the background still frame is what the first screen needs.
      const still = new Image();
      still.src = "/images/lab/seda-de-luz-mobile.webp";
      still.decode().catch(() => undefined).finally(() => { tasks.scene = true; });
    }

    const exit = (fast: boolean) => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      const duration = fast ? EXIT_MS * .55 : EXIT_MS;
      element.style.setProperty("--exit-ms", `${duration}ms`);
      element.style.setProperty("--p", "1");
      // The progress line stretches to the edges of the screen and opens the ribbons.
      const width = track.current?.getBoundingClientRect().width ?? 1;
      element.style.setProperty("--stretch", String(window.innerWidth / Math.max(1, width)));
      element.dataset.state = "exiting";
      setLab({ loader: "exiting" });
      live.openTarget = 1;
      labRoot.setAttribute("data-reveal", "play");

      // FLIP: the logo flies to its place in the header.
      const brand = document.querySelector<HTMLElement>("[data-lab-brand]");
      const from = stage.current?.getBoundingClientRect();
      const to = brand?.getBoundingClientRect();
      if (stage.current && from && to && to.width > 0) {
        const targetTop = to.top - CROP_TOP * to.width;
        const scale = to.width / from.width;
        stage.current.animate([
          { transform: "translate(0, 0) scale(1)" },
          { transform: `translate(${to.left - from.left}px, ${targetTop - from.top}px) scale(${scale})` },
        ], { duration: duration * .85, easing: "cubic-bezier(.7, 0, .2, 1)", fill: "forwards" });
      }
      try { window.sessionStorage.setItem(LAB_SESSION_KEY, "1"); } catch { /* the loader simply plays again */ }
      exitTimer = window.setTimeout(() => {
        element.dataset.state = "done";
        labRoot.removeAttribute("data-loading");
        setLab({ loader: "done" });
      }, duration);
    };

    const tick = () => {
      const elapsed = performance.now() - started;
      const lab = getLab();
      if (!touch && (lab.sceneReady || lab.sceneFailed)) tasks.scene = true;
      progress = (Number(tasks.fonts) + Number(tasks.scene)) / 2;
      // Real progress, never ahead of the minimum duration, forced at the maximum.
      const target = elapsed >= MAX_MS ? 1 : Math.min(progress, elapsed / MIN_MS);
      shown += (target - shown) * .12;
      element.style.setProperty("--p", shown.toFixed(4));
      if ((progress >= 1 && elapsed >= MIN_MS && shown > .985) || elapsed >= MAX_MS + 250) { exit(false); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") exit(true); };
    const onClick = () => exit(true);
    window.addEventListener("keydown", onKey);
    element.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(exitTimer);
      window.removeEventListener("keydown", onKey);
      element.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div id="lab-loader" ref={root} className={styles.loader} data-state="playing" suppressHydrationWarning>
      <div ref={stage} className={styles.loaderStage}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a plain, early-decoded image keeps the FLIP pixel-exact */}
        <img className={styles.loaderFill} src={LOADER_LOGO} alt="" width={900} height={300} fetchPriority="high" decoding="async" />
        <svg className={styles.loaderOutline} viewBox={`0 0 ${LOGO_IMAGE.width} ${LOGO_IMAGE.height}`} aria-hidden="true">
          {OUTLINES.map((d, i) => <path key={i} d={d} pathLength={1} style={{ animationDelay: `${i * 55}ms` }} />)}
        </svg>
        <span className={styles.loaderStar} style={{ left: `${STAR.left}%`, top: `${STAR.top}%` }} aria-hidden="true" />
      </div>
      <span ref={track} className={styles.loaderTrack} aria-hidden="true"><span className={styles.loaderBar} /><span className={styles.loaderSpark} /></span>
      <p className={styles.loaderCaption}>Carregando experiência</p>
      <button type="button" className={styles.loaderSkip}>Pular introdução <kbd>Esc</kbd></button>
    </div>
  );
}
