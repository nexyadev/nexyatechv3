// Gera a pasta /logo a partir dos SVGs OFICIAIS (public/brand/nexya-logo-claro.svg e -escuro.svg).
// As letras, o ponto do A e o slogan são os vetores oficiais (nada é redesenhado). Só "THE OFFICE" e "NEXYA"
// do ícone usam texto em Montserrat, com a fonte embutida no SVG (base64) para renderizar igual em qualquer lugar.
// Uso: node scripts/generate-logos.mjs <caminho-do-woff2-da-montserrat>
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const fontPath = process.argv[2];
if (!fontPath) throw new Error("Informe o arquivo woff2 da Montserrat (variável, latin).");
const font = readFileSync(fontPath).toString("base64");
const out = "logo";
mkdirSync(out, { recursive: true });

// Peças oficiais: gradiente metálico, grupo das letras, A, ponto do A e slogan (já em vetores).
function parts(file) {
  const svg = readFileSync(file, "utf8");
  const pick = (re) => { const m = svg.match(re); if (!m) throw new Error(`${file}: ${re}`); return m[0]; };
  return {
    gradient: pick(/<linearGradient id="metal-(?:claro|escuro)"[\s\S]*?<\/linearGradient>/),
    gradientId: pick(/id="metal-(?:claro|escuro)"/).slice(4, -1),
    wordmark: pick(/<g id="nx-wordmark"[\s\S]*?<\/g>/),
    a: pick(/<path id="nx-a"[^>]*\/>/),
    dot: pick(/<path id="nx-adot"[^>]*\/>/),
    tagline: pick(/<g id="nx-tagline"[\s\S]*?<\/g>/).replace(/fill="[^"]*"/, ""),
  };
}
// Medidas das peças no sistema de coordenadas da logo oficial (getBBox).
const WORD = { x: 601.6, y: 374, w: 1996.6, h: 312 };
const TAG = { x: 611, y: 785, w: 1976, h: 31 };
const A = { x: 2349, y: 374, w: 249.2, h: 312 };

const themes = {
  escuro: { p: parts("public/brand/nexya-logo-escuro.svg"), bg: "#0A0A0A", strong: "#D9D9D9", soft: "#8F8F8F", line: "#9A9A9A" },
  claro: { p: parts("public/brand/nexya-logo-claro.svg"), bg: "#F4F4F2", strong: "#1D1D1D", soft: "#6A6A6A", line: "#6A6A6A" },
};

const fontFace = `<style>@font-face{font-family:"NX Montserrat";src:url(data:font/woff2;base64,${font}) format("woff2");font-weight:100 900}.t{font-family:"NX Montserrat",Montserrat,sans-serif}</style>`;
const fade = (id, color, dir) => `<linearGradient id="${id}" x1="${dir === "l" ? 0 : 1}" x2="${dir === "l" ? 1 : 0}" y1="0" y2="0"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset="1" stop-color="${color}"/></linearGradient>`;

/** Monta o SVG no navegador para medir o texto real (largura) e posicionar as linhas finas ao redor dele. */
async function build(page, { w, h, theme, body }) {
  const t = themes[theme];
  const defs = `<defs>${t.p.gradient}${fade("fl", t.line, "l")}${fade("fr", t.line, "r")}</defs>`;
  const src = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="NEXYA">${fontFace}${defs}<rect id="bg" width="${w}" height="${h}" fill="${t.bg}"/>${body(t)}</svg>`;
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${src}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  // Linhas de cada lado dos textos marcados com data-lines="<comprimento>,<gap>".
  return page.evaluate(() => {
    const svg = document.querySelector("svg");
    for (const el of svg.querySelectorAll("[data-lines]")) {
      const [len, gap] = el.getAttribute("data-lines").split(",").map(Number);
      const b = el.getBBox();
      const y = b.y + b.height / 2;
      const mk = (x, id) => { const r = document.createElementNS("http://www.w3.org/2000/svg", "rect"); Object.entries({ x, y: y - .5, width: len, height: 1, fill: `url(#${id})` }).forEach(([k, v]) => r.setAttribute(k, v)); svg.appendChild(r); };
      mk(b.x - gap - len, "fl"); mk(b.x + b.width + gap, "fr");
      el.removeAttribute("data-lines");
    }
    return svg.outerHTML;
  });
}

async function save(page, name, svg, w, h) {
  writeFileSync(`${out}/${name}.svg`, svg);
  await page.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${svg}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${out}/${name}.png`, clip: { x: 0, y: 0, width: w, height: h } });
  await page.evaluate(() => document.getElementById("bg").remove());
  await page.screenshot({ path: `${out}/${name}-transparente.png`, clip: { x: 0, y: 0, width: w, height: h }, omitBackground: true });
}

// Texto centralizado com letter-spacing: compensa o espaço extra depois da última letra.
const text = (x, y, size, weight, spacingEm, fill, value, lines) =>
  `<text class="t" x="${x + (size * spacingEm) / 2}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="${weight}" letter-spacing="${size * spacingEm}" fill="${fill}"${lines ? ` data-lines="${lines}"` : ""}>${value}</text>`;
// Peça oficial reposicionada: escala s, canto superior esquerdo em (x, y).
const place = (inner, box, s, x, y) => `<g transform="translate(${x - box.x * s} ${y - box.y * s}) scale(${s})">${inner}</g>`;
const tagline = (t, s, cx, y, lines) => {
  const w = TAG.w * s;
  return `<g${lines ? ` data-lines="${lines}"` : ""} fill="${lines === "120,28" ? t.soft : t.strong}">${place(t.p.tagline, TAG, s, cx - w / 2, y)}</g>`;
};

const b = await chromium.launch({ channel: "msedge" });
const page = await b.newPage({ deviceScaleFactor: 1 });

for (const theme of ["escuro", "claro"]) {
  // 1/2. NEXYA THE OFFICE horizontal (1600x600): logo com 1000 px, THE OFFICE entre linhas, slogan oficial embaixo.
  const s = 1000 / WORD.w, logoH = WORD.h * s, top = 600 / 2 - (logoH + 62 + 30 + 40 + 10) / 2;
  const office = await build(page, { w: 1600, h: 600, theme, body: (t) =>
    place(`<g fill="url(#${t.p.gradientId})">${t.p.wordmark.replace(/<g id="nx-wordmark"[^>]*>/, "<g>")}`.replace(/<\/g>$/, "</g></g>"), WORD, s, 300, top)
    + text(800, top + logoH + 62 + 22, 30, 400, .9, t.strong, "THE OFFICE", "120,36")
    + `<g fill="${t.soft}">${place(t.p.tagline, TAG, .30, 800 - (TAG.w * .30) / 2, top + logoH + 62 + 30 + 40)}</g>` });
  await save(page, `nexya-the-office-horizontal-${theme}`, office, 1600, 600);

  // 3/4. NEXYA horizontal: logo + slogan oficial entre as duas linhas finas.
  const top2 = 600 / 2 - (logoH + 56 + 16) / 2;
  const main = await build(page, { w: 1600, h: 600, theme, body: (t) =>
    place(`<g fill="url(#${t.p.gradientId})">${t.p.wordmark.replace(/<g id="nx-wordmark"[^>]*>/, "<g>")}`.replace(/<\/g>$/, "</g></g>"), WORD, s, 300, top2)
    + tagline(t, .37, 800, top2 + logoH + 56, "120,30") });
  await save(page, `nexya-horizontal-${theme}`, main, 1600, 600);

  // 5. Ícone 800x800: A oficial com ponto num círculo fino; NEXYA + slogan (ou THE OFFICE) entre linhas de 48 px.
  for (const variant of ["", "-the-office"]) {
    const sa = 190 / A.h, ax = 400 - (A.w * sa) / 2, ay = 290 - (A.h * sa) / 2;
    const icon = await build(page, { w: 800, h: 800, theme, body: (t) =>
      `<circle cx="400" cy="290" r="196" fill="none" stroke="url(#${t.p.gradientId})" stroke-width="3.5"/>`
      + place(`<g fill="url(#${t.p.gradientId})">${t.p.a}</g>${t.p.dot.replace(/fill="[^"]*"/, "")}`, A, sa, ax, ay).replace(t.p.dot.replace(/fill="[^"]*"/, ""), t.p.dot.replace(/fill="[^"]*"/, "").replace("<path", `<path fill="${theme === "escuro" ? "#FFFFFF" : "#111111"}"`))
      + text(400, 590, 40, 400, .7, t.strong, "NEXYA")
      + (variant ? text(400, 650, 12, 500, .45, t.soft, "THE OFFICE", "48,22") : `<g fill="${t.soft}">${place(t.p.tagline, TAG, .25, 400 - (TAG.w * .25) / 2, 638)}</g>`) });
    // Linhas de 48 px ao redor do slogan vetorial do ícone (o texto THE OFFICE já recebe as suas).
    const withLines = variant ? icon : icon.replace("</svg>", `<rect x="${400 - (TAG.w * .25) / 2 - 22 - 48}" y="641.4" width="48" height="1" fill="url(#fl)"/><rect x="${400 + (TAG.w * .25) / 2 + 22}" y="641.4" width="48" height="1" fill="url(#fr)"/></svg>`);
    await save(page, `nexya${variant}-icone-${theme}`, withLines, 800, 800);
  }
}
await b.close();
console.log("logo/: ok");
