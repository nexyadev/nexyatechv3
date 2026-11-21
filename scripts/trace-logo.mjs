/**
 * Traces the official raster logo into vector outlines for the 3D hero.
 *
 * The geometry is derived only from the alpha channel of the official file:
 * nothing is redrawn. Run again whenever the logo changes:
 *   node scripts/trace-logo.mjs
 * It uses the Playwright browser already required by the e2e tests.
 */
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";

const SOURCE = "public/images/logonexyaa.png";
const OUTPUT = "lib/brand/logo-geometry.ts";

const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
const page = await browser.newPage();
const data = await page.evaluate(async (src) => {
  const THRESHOLD = 128;
  const MIN_LETTER_AREA = 5000;
  const img = new Image();
  img.src = src;
  await img.decode();
  const W = img.width, H = img.height;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const context = canvas.getContext("2d");
  context.drawImage(img, 0, 0);
  const pixels = context.getImageData(0, 0, W, H).data;
  const alpha = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : pixels[(y * W + x) * 4 + 3]);

  // Connected components above the threshold.
  const labels = new Int32Array(W * H).fill(-1);
  const components = [];
  for (let i = 0; i < W * H; i++) {
    if (labels[i] >= 0 || pixels[i * 4 + 3] < THRESHOLD) continue;
    const id = components.length;
    let area = 0, x0 = W, x1 = 0, y0 = H, y1 = 0, sx = 0, sy = 0;
    const stack = [i];
    labels[i] = id;
    while (stack.length) {
      const p = stack.pop();
      const x = p % W, y = (p / W) | 0;
      area++; sx += x; sy += y;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const q = ny * W + nx;
        if (labels[q] < 0 && pixels[q * 4 + 3] >= THRESHOLD) { labels[q] = id; stack.push(q); }
      }
    }
    components.push({ id, area, x0, x1, y0, y1, cx: sx / area, cy: sy / area });
  }

  // Marching squares on one component, with sub-pixel interpolation of the alpha edge.
  function trace(component) {
    const value = (x, y) => (x < 0 || y < 0 || x >= W || y >= H || labels[y * W + x] !== component.id ? 0 : alpha(x, y));
    const point = (key) => {
      const [kind, xs, ys] = key.split(",");
      const x = Number(xs), y = Number(ys);
      if (kind === "h") { const a = value(x, y), b = value(x + 1, y); return [x + (THRESHOLD - a) / (b - a || 1), y]; }
      const a = value(x, y), b = value(x, y + 1);
      return [x, y + (THRESHOLD - a) / (b - a || 1)];
    };
    const segments = [];
    for (let y = component.y0 - 1; y <= component.y1; y++) {
      for (let x = component.x0 - 1; x <= component.x1; x++) {
        const tl = value(x, y) >= THRESHOLD, tr = value(x + 1, y) >= THRESHOLD;
        const br = value(x + 1, y + 1) >= THRESHOLD, bl = value(x, y + 1) >= THRESHOLD;
        const top = `h,${x},${y}`, bottom = `h,${x},${y + 1}`, left = `v,${x},${y}`, right = `v,${x + 1},${y}`;
        const code = (tl ? 8 : 0) | (tr ? 4 : 0) | (br ? 2 : 0) | (bl ? 1 : 0);
        const table = {
          1: [[left, bottom]], 2: [[bottom, right]], 3: [[left, right]], 4: [[top, right]],
          5: [[left, top], [bottom, right]], 6: [[top, bottom]], 7: [[left, top]], 8: [[left, top]],
          9: [[top, bottom]], 10: [[left, bottom], [top, right]], 11: [[top, right]], 12: [[left, right]],
          13: [[bottom, right]], 14: [[left, bottom]],
        }[code];
        if (table) segments.push(...table);
      }
    }
    const byEdge = new Map();
    segments.forEach(([a, b], index) => {
      for (const key of [a, b]) { const list = byEdge.get(key) ?? []; list.push(index); byEdge.set(key, list); }
    });
    const used = new Uint8Array(segments.length);
    const loops = [];
    for (let start = 0; start < segments.length; start++) {
      if (used[start]) continue;
      used[start] = 1;
      const loop = [segments[start][0]];
      let current = segments[start][1];
      while (current !== loop[0]) {
        loop.push(current);
        const next = (byEdge.get(current) ?? []).find((index) => !used[index]);
        if (next === undefined) break;
        used[next] = 1;
        const [a, b] = segments[next];
        current = a === current ? b : a;
      }
      if (loop.length > 8) loops.push(loop.map(point));
    }
    return loops;
  }

  // Ramer–Douglas–Peucker simplification keeps the drawn contour within a fraction of a pixel.
  function simplify(points, epsilon) {
    if (points.length < 4) return points;
    const distance = ([px, py], [ax, ay], [bx, by]) => {
      const dx = bx - ax, dy = by - ay, length = Math.hypot(dx, dy) || 1;
      return Math.abs(dy * px - dx * py + bx * ay - by * ax) / length;
    };
    let index = 0, max = 0;
    for (let i = 1; i < points.length - 1; i++) {
      const d = distance(points[i], points[0], points[points.length - 1]);
      if (d > max) { max = d; index = i; }
    }
    if (max <= epsilon) return [points[0], points[points.length - 1]];
    return [...simplify(points.slice(0, index + 1), epsilon).slice(0, -1), ...simplify(points.slice(index), epsilon)];
  }
  const closedSimplify = (loop, epsilon) => {
    const half = Math.floor(loop.length / 2);
    return [...simplify(loop.slice(0, half + 1), epsilon).slice(0, -1), ...simplify([...loop.slice(half), loop[0]], epsilon).slice(0, -1)];
  };
  const signedArea = (loop) => loop.reduce((sum, [x, y], i) => { const [nx, ny] = loop[(i + 1) % loop.length]; return sum + x * ny - nx * y; }, 0) / 2;

  const letters = components.filter((component) => component.area >= MIN_LETTER_AREA).sort((a, b) => a.x0 - b.x0);
  const wordmark = {
    x0: Math.min(...letters.map((c) => c.x0)), x1: Math.max(...letters.map((c) => c.x1)),
    y0: Math.min(...letters.map((c) => c.y0)), y1: Math.max(...letters.map((c) => c.y1)),
  };
  const capHeight = wordmark.y1 - wordmark.y0;
  const centerX = (wordmark.x0 + wordmark.x1) / 2, centerY = (wordmark.y0 + wordmark.y1) / 2;
  const normalise = ([x, y]) => [+((x - centerX) / capHeight).toFixed(4), +(-(y - centerY) / capHeight).toFixed(4)];

  const glyphs = letters.map((component) => {
    const loops = trace(component).map((loop) => closedSimplify(loop, .55)).filter((loop) => loop.length >= 3);
    loops.sort((a, b) => Math.abs(signedArea(b)) - Math.abs(signedArea(a)));
    const [outer, ...holes] = loops;
    return { x0: component.x0, outer: outer.map(normalise).flat(), holes: holes.map((hole) => hole.map(normalise).flat()) };
  });

  // The dot of the A: the compact component sitting inside the A's bounding box.
  const a = letters[letters.length - 1];
  const dot = components.filter((c) => c.area < MIN_LETTER_AREA && c.area > 400 && c.x0 > a.x0 && c.x1 < a.x1 && c.y1 < a.y1).sort((p, q) => q.area - p.area)[0];
  const tagline = components.filter((c) => c.y0 > wordmark.y1 + 20);
  const tagBox = { y0: Math.min(...tagline.map((c) => c.y0)), y1: Math.max(...tagline.map((c) => c.y1)) };

  return {
    image: { width: W, height: H },
    wordmark: { ...wordmark, capHeight },
    tagline: tagBox,
    dot: { x: +((dot.cx - centerX) / capHeight).toFixed(4), y: +(-(dot.cy - centerY) / capHeight).toFixed(4), r: +(((dot.x1 - dot.x0 + dot.y1 - dot.y0) / 4) / capHeight).toFixed(4) },
    glyphs,
    width: +((wordmark.x1 - wordmark.x0) / capHeight).toFixed(4),
  };
}, `data:image/png;base64,${readFileSync(SOURCE).toString("base64")}`);
await browser.close();

const names = ["N", "E1", "E2", "E3", "X", "Y", "A"];
const glyphs = [...data.glyphs].sort((a, b) => a.x0 - b.x0);
// E bars share the same x0: order them top-to-bottom by their first y coordinate.
const ordered = [...glyphs.slice(0, 1), ...glyphs.slice(1, 4).sort((a, b) => b.outer[1] - a.outer[1]), ...glyphs.slice(4)];
if (ordered.length !== names.length) throw new Error(`Expected ${names.length} glyph regions, found ${ordered.length}.`);

const source = `/**
 * Generated by scripts/trace-logo.mjs from ${SOURCE}. Do not edit by hand.
 * Units: 1 = cap height of the wordmark. Origin: centre of the wordmark. Y points up.
 */
export type LogoGlyph = { readonly id: string; readonly outer: readonly number[]; readonly holes: readonly (readonly number[])[] };

export const LOGO_IMAGE = ${JSON.stringify({ src: `/${SOURCE.replace(/^public\//, "")}`, ...data.image })} as const;
/** Wordmark and tagline bands in source pixels, used to align the HTML fallback with the 3D logo. */
export const LOGO_BANDS = ${JSON.stringify({ wordmark: data.wordmark, tagline: data.tagline })} as const;
export const LOGO_WIDTH = ${data.width};
export const LOGO_DOT = ${JSON.stringify(data.dot)} as const;
export const LOGO_GLYPHS: readonly LogoGlyph[] = [
${ordered.map((glyph, i) => `  { id: "${names[i]}", outer: [${glyph.outer.join(",")}], holes: [${glyph.holes.map((hole) => `[${hole.join(",")}]`).join(",")}] },`).join("\n")}
];
`;
writeFileSync(OUTPUT, source);
console.log(`${OUTPUT}: ${ordered.map((g, i) => `${names[i]}=${g.outer.length / 2}pts/${g.holes.length}holes`).join(" ")}; dot=${JSON.stringify(data.dot)}; width=${data.width}`);
