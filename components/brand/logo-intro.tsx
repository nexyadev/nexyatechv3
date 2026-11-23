"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/lib/motion";
import { darkEnabled } from "@/lib/theme";

const SEEN_KEY = "nx:intro-seen";
const SVG_NS = "http://www.w3.org/2000/svg";
const EASE_DRAW = "cubic-bezier(.65,0,.35,1)";
const EASE_OUT = "cubic-bezier(.16,1,.3,1)";
/** Se o SVG não chegar a tempo, a abertura é pulada: a logo aparece pronta, sem esperar. */
const FETCH_BUDGET_MS = 700;
/** Cópia literal dos gradientes de public/brand/nexya-logo-escuro.svg (mesmo desenho, acabamento prata). */
const DARK_DEFS = '<linearGradient id="metal-escuro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f6f4"/><stop offset=".38" stop-color="#c9c9c6"/><stop offset=".5" stop-color="#ffffff"/><stop offset=".6" stop-color="#8a8a87"/><stop offset="1" stop-color="#dcdcd9"/></linearGradient><linearGradient id="hl-escuro" gradientUnits="userSpaceOnUse" x1="320" x2="554"><stop offset="0" stop-color="#a3a3a3" stop-opacity="0"/><stop offset="1" stop-color="#a3a3a3" stop-opacity=".6"/></linearGradient><linearGradient id="hr-escuro" gradientUnits="userSpaceOnUse" x1="2646" x2="2880"><stop offset="0" stop-color="#a3a3a3" stop-opacity=".6"/><stop offset="1" stop-color="#a3a3a3" stop-opacity="0"/></linearGradient>';

function seen() { try { return sessionStorage.getItem(SEEN_KEY) === "1"; } catch { return false; } }
function markSeen() { try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* storage blocked: the intro may simply replay */ } }

/**
 * Receita 1 (tema claro): traço grafite desenha cada letra → preenchimento grafite metálico → reflexo branco
 * atravessa as letras → ponto do A por último → hairlines abrem do centro. ≤ 1,2s, nunca bloqueia:
 * rolar, clicar ou tecla terminam na hora; reduced-motion e visitas repetidas vão direto ao estado final.
 */
export function LogoIntro({ src, srcDark, label, className, animate }: { src: string; srcDark: string; label: string; className?: string; animate: boolean }) {
  const reduced = useReducedMotionPref();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!animate || reduced || seen()) { root.dataset.intro = "done"; return; }

    let cleanup: (() => void) | undefined;
    let disposed = false;
    const controller = new AbortController();
    const budget = window.setTimeout(() => controller.abort(), FETCH_BUDGET_MS);
    fetch(src, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error(String(response.status)); return response.text(); })
      .then((text) => {
        window.clearTimeout(budget);
        if (disposed) return;
        // DOMParser + importNode: our own versioned file, parsed as SVG (scripts inside an SVG document never run).
        const parsed = new DOMParser().parseFromString(text, "image/svg+xml").documentElement;
        if (parsed.nodeName !== "svg") throw new Error("invalid svg");
        parsed.querySelector("title")?.remove();
        parsed.setAttribute("aria-hidden", "true");
        parsed.setAttribute("focusable", "false");
        // Nunca deixa duas cópias: remove qualquer SVG anterior antes de inserir.
        root.querySelectorAll(":scope > svg").forEach((old) => old.remove());
        const svg = root.appendChild(document.importNode(parsed, true)) as unknown as SVGSVGElement;
        const stopPlay = play(root, svg);
        cleanup = () => { stopPlay(); svg.remove(); };
      })
      .catch(() => { if (!disposed) { root.dataset.intro = "done"; markSeen(); } });
    return () => { disposed = true; controller.abort(); window.clearTimeout(budget); cleanup?.(); };
  }, [animate, src, reduced]);

  return <div ref={rootRef} className={`nx-logo ${className ?? ""}`} data-intro={animate ? "pending" : "done"} role="img" aria-label={label}>
    {/* eslint-disable-next-line @next/next/no-img-element -- SVG oficial, servido como arquivo estático */}
    <img className={darkEnabled ? "logo-light" : undefined} src={src} alt="" width={2600} height={470} fetchPriority="low" />
    {/* eslint-disable-next-line @next/next/no-img-element -- versão prata (só com o modo escuro ligado) */}
    {darkEnabled && <img className="logo-dark" src={srcDark} alt="" width={2600} height={470} fetchPriority="low" />}
  </div>;
}

function play(root: HTMLDivElement, svg: SVGSVGElement) {
  const fine = window.matchMedia("(pointer: fine)").matches;
  const letters = [...svg.querySelectorAll<SVGPathElement>("#nx-wordmark > path:not(#nx-adot)")];
  const dot = svg.querySelector<SVGPathElement>("#nx-adot");
  const tagline = svg.querySelector<SVGGElement>("#nx-tagline");
  const hairlines = [...svg.querySelectorAll<SVGLineElement>("#nx-hairline-l, #nx-hairline-r")];

  // Reflexo: faixa branca recortada pelas próprias letras (clones, as paths oficiais ficam intactas).
  const clip = document.createElementNS(SVG_NS, "clipPath");
  clip.id = "nx-sheen-clip";
  [...letters, ...(dot ? [dot] : [])].forEach((p) => { const c = p.cloneNode() as SVGPathElement; c.removeAttribute("id"); clip.appendChild(c); });
  const grad = document.createElementNS(SVG_NS, "linearGradient");
  grad.id = "nx-sheen-grad";
  [["0", "0"], [".5", ".85"], ["1", "0"]].forEach(([o, a]) => { const s = document.createElementNS(SVG_NS, "stop"); s.setAttribute("offset", o); s.setAttribute("stop-color", "#fff"); s.setAttribute("stop-opacity", a); grad.appendChild(s); });
  const defs = svg.querySelector("defs") ?? svg.insertBefore(document.createElementNS(SVG_NS, "defs"), svg.firstChild);
  defs.append(clip, grad);
  // Gradientes da versão prata oficial (nexya-logo-escuro.svg): o CSS troca o preenchimento no tema escuro.
  defs.insertAdjacentHTML("beforeend", DARK_DEFS);
  const sheenGroup = document.createElementNS(SVG_NS, "g");
  sheenGroup.setAttribute("clip-path", "url(#nx-sheen-clip)");
  const sheen = document.createElementNS(SVG_NS, "rect");
  Object.entries({ x: "-200", y: "360", width: "420", height: "360", fill: "url(#nx-sheen-grad)" }).forEach(([k, v]) => sheen.setAttribute(k, v));
  sheen.style.opacity = "0";
  sheenGroup.appendChild(sheen);
  svg.appendChild(sheenGroup);

  const timers: number[] = [];
  const listeners: Array<[EventTarget, string, EventListener]> = [];
  let finished = false;

  const followPointer = () => {
    if (!fine) return;
    let raf = 0;
    const onMove: EventListener = (event) => {
      const e = event as PointerEvent;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = svg.getBoundingClientRect();
        if (e.clientY < r.top - 220 || e.clientY > r.bottom + 220) { sheen.style.opacity = "0"; return; }
        const t = Math.min(Math.max((e.clientX - r.left) / r.width, -.1), 1.1);
        sheen.style.transition = `transform .9s ${EASE_OUT}, opacity .6s ease`;
        sheen.style.transform = `translateX(${300 + t * 2600}px)`;
        sheen.style.opacity = ".55";
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    listeners.push([window, "pointermove", onMove]);
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    [...letters, ...(dot ? [dot] : []), tagline, ...hairlines, sheen].forEach((el) => { if (el) el.style.transition = "none"; });
    letters.forEach((p) => { p.style.strokeDashoffset = "0"; p.style.fillOpacity = "1"; p.style.strokeOpacity = "0"; });
    if (dot) dot.style.opacity = "1";
    if (tagline) tagline.style.opacity = "1";
    hairlines.forEach((h) => { h.style.transform = "scaleX(1)"; });
    sheen.style.opacity = "0";
    root.dataset.intro = "done";
    markSeen();
    listeners.splice(0).forEach(([t, n, l]) => t.removeEventListener(n, l));
    followPointer();
  };

  root.dataset.intro = "run";
  letters.forEach((p, i) => {
    const length = p.getTotalLength();
    Object.assign(p.style, { stroke: getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#141414", strokeWidth: "5", strokeOpacity: "1", strokeDasharray: `${length}`, strokeDashoffset: `${length}`, fillOpacity: "0" });
    p.getBoundingClientRect();
    p.style.transition = `stroke-dashoffset .75s ${EASE_DRAW} ${i * .05}s, fill-opacity .45s ease ${.6 + i * .04}s, stroke-opacity .4s ease .8s`;
  });
  if (dot) Object.assign(dot.style, { opacity: "0", transition: "opacity .25s ease .95s" });
  if (tagline) Object.assign(tagline.style, { opacity: "0", transition: "opacity .4s ease .7s" });
  hairlines.forEach((h) => Object.assign(h.style, { transformBox: "fill-box", transformOrigin: h.id.endsWith("-l") ? "right center" : "left center", transform: "scaleX(0)", transition: `transform .45s ${EASE_OUT} .75s` }));
  Object.assign(sheen.style, { opacity: ".9", transform: "translateX(300px)", transition: `transform .6s ${EASE_OUT} .55s, opacity .25s ease 1.0s` });
  svg.getBoundingClientRect();

  requestAnimationFrame(() => {
    letters.forEach((p) => { p.style.strokeDashoffset = "0"; p.style.fillOpacity = "1"; p.style.strokeOpacity = "0"; });
    if (dot) dot.style.opacity = "1";
    if (tagline) tagline.style.opacity = "1";
    hairlines.forEach((h) => { h.style.transform = "scaleX(1)"; });
    sheen.style.transform = "translateX(2900px)";
    sheen.style.opacity = "0";
  });
  timers.push(window.setTimeout(finish, 1250));
  const skip: EventListener = () => finish();
  for (const name of ["pointerdown", "keydown", "wheel", "touchstart", "scroll"]) {
    window.addEventListener(name, skip, { passive: true, once: true });
    listeners.push([window, name, skip]);
  }
  return () => { timers.forEach(clearTimeout); listeners.forEach(([t, n, l]) => t.removeEventListener(n, l)); sheenGroup.remove(); clip.remove(); grad.remove(); };
}
