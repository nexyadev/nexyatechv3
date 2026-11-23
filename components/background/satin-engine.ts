import { satinFragment, satinVertex } from "./satin-shader";

type Quality = { ribbons: number; lines: number; scale: number };
export type SatinCallbacks = { onReady(): void; onFail(reason: string): void };

const DESKTOP: Quality = { ribbons: 6, lines: 7, scale: .7 };
const MOBILE: Quality = { ribbons: 3, lines: 5, scale: .5 };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** One full-screen triangle + fragment shader. One WebGL context, paused when hidden, everything released on stop. */
/**
 * reduced=true (movimento reduzido): deriva MUITO lenta (tempo a 12%), intensidade baixa, sem reagir ao mouse
 * e sem nada ligado à rolagem (posição, ângulo ou velocidade).
 */
export function startSatin(canvas: HTMLCanvasElement, mobile: boolean, cb: SatinCallbacks, reduced = false) {
  const context = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power", preserveDrawingBuffer: false });
  if (!context) { cb.onFail("no-webgl"); return () => {}; }
  const gl: WebGLRenderingContext = context;

  let quality = mobile ? { ...MOBILE } : { ...DESKTOP };
  let program: WebGLProgram | null = null;
  let uniforms: Record<string, WebGLUniformLocation | null> = {};
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  const compile = (q: Quality) => {
    const make = (type: number, src: string) => { const sh = gl.createShader(type)!; gl.shaderSource(sh, src); gl.compileShader(sh); return sh; };
    const vs = make(gl.VERTEX_SHADER, satinVertex), fs = make(gl.FRAGMENT_SHADER, satinFragment(q.ribbons, q.lines));
    const next = gl.createProgram()!;
    gl.attachShader(next, vs); gl.attachShader(next, fs); gl.linkProgram(next);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if (!gl.getProgramParameter(next, gl.LINK_STATUS)) { gl.deleteProgram(next); return false; }
    if (program) gl.deleteProgram(program);
    program = next;
    gl.useProgram(program);
    const loc = gl.getAttribLocation(program, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    uniforms = Object.fromEntries(["r", "t", "m", "s", "v", "ink", "dk"].map((n) => [n, gl.getUniformLocation(program!, n)]));
    return true;
  };
  if (!compile(quality)) { cb.onFail("shader"); return () => {}; }

  const fine = !reduced && window.matchMedia("(pointer: fine)").matches;
  const mouse = { x: .35, y: -.1, tx: .35, ty: -.1 };
  const scroll = { s: scrollY / innerHeight, v: 0, last: scrollY, vs: 0 };
  const start = performance.now();
  let ink = 0, raf = 0, running = true;
  // Tema: lê o data-theme do <html> (troca suave entre claro e escuro, sem recompilar o shader).
  const isDark = () => document.documentElement.dataset.theme === "dark";
  let dk = isDark() ? 1 : 0;
  let frames = 0, windowStart = performance.now(), downgraded = 0;

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(innerWidth * quality.scale * dpr));
    const h = Math.max(1, Math.round(innerHeight * quality.scale * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  };
  const onPointer = (e: PointerEvent) => { mouse.tx = (e.clientX - innerWidth / 2) / innerHeight; mouse.ty = (innerHeight / 2 - e.clientY) / innerHeight; };
  const onVisibility = () => { if (!document.hidden && running) { windowStart = performance.now(); frames = 0; raf = requestAnimationFrame(frame); } };

  function frame(now: number) {
    if (!running || document.hidden) return;
    const t = ((now - start) / 1000) * (reduced ? .12 : 1);
    if (!fine) { mouse.tx = .38 + .22 * Math.sin(t * .23); mouse.ty = -.12 + .1 * Math.sin(t * .17 + 1.3); }
    mouse.x = lerp(mouse.x, mouse.tx, .05); mouse.y = lerp(mouse.y, mouse.ty, .05);
    const y = reduced ? 0 : scrollY;
    scroll.s = lerp(scroll.s, y / innerHeight, .06);
    scroll.vs = reduced ? 0 : lerp(scroll.vs, Math.min(Math.abs(y - scroll.last) / 40, 1), .08);
    scroll.last = y;
    ink = Math.min(reduced ? .6 : 1, ink + .025);
    resize();
    gl.uniform2f(uniforms.r, canvas.width, canvas.height);
    gl.uniform1f(uniforms.t, t);
    gl.uniform2f(uniforms.m, mouse.x, mouse.y);
    gl.uniform1f(uniforms.s, scroll.s);
    gl.uniform1f(uniforms.v, scroll.vs);
    gl.uniform1f(uniforms.ink, ink);
    dk = lerp(dk, isDark() ? 1 : 0, .08);
    gl.uniform1f(uniforms.dk, dk);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Adaptive quality: average over ~60 frames. < 45 fps → fewer ribbons/lines/resolution; < 30 fps → static image.
    frames++;
    if (frames >= 60) {
      const fps = frames * 1000 / (now - windowStart);
      frames = 0; windowStart = now;
      if (fps < 30 && downgraded >= 1) { cb.onFail("slow"); stop(); return; }
      if (fps < 45 && downgraded < 2) {
        downgraded++;
        quality = { ribbons: Math.max(2, quality.ribbons - 2), lines: Math.max(3, quality.lines - 2), scale: Math.max(.4, quality.scale - .15) };
        if (!compile(quality)) { cb.onFail("shader"); stop(); return; }
      }
    }
    raf = requestAnimationFrame(frame);
  }

  addEventListener("resize", resize, { passive: true });
  if (fine) addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  resize();
  cb.onReady();
  raf = requestAnimationFrame(frame);

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    removeEventListener("resize", resize);
    removeEventListener("pointermove", onPointer);
    document.removeEventListener("visibilitychange", onVisibility);
    if (program) gl.deleteProgram(program);
    gl.deleteBuffer(buffer);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
  return stop;
}
