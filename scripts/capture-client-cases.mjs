// Capturas dos sites de clientes autorizados para /projetos. Só faixas seguras de cada página:
// sem placas, telefones, nomes de clientes, depoimentos, antes/depois ou fotos de terceiros.
// Saída: public/projetos/[slug]/ (desktop, mobile, scroll alto) + scratch PNG para o vídeo.
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdirSync } from "node:fs";

// Cada faixa é calculada na própria página: [y inicial, y final] em px do documento.
const sites = [
  { slug: "garagem-mendes", url: "https://garagemmendes.com.br/",
    // Do topo até antes de "O que dizem nossos clientes" (avaliações com nomes; depois vêm contato e telefone).
    ranges: () => { const h = [...document.querySelectorAll("h2")].find((e) => /dizem nossos clientes/i.test(e.textContent)); return [[0, h.getBoundingClientRect().top + scrollY - 60]]; },
    mobileStart: () => 0 },
  { slug: "dra-camila-bioclass", url: "https://www.dracamilabioclass.com/",
    ranges: () => {
      const y = (el) => el.getBoundingClientRect().top + scrollY;
      const sec = (el) => el.closest("section") ?? el.parentElement;
      const h1 = document.querySelector("h1");
      const heroEnd = y(sec(h1)) + sec(h1).offsetHeight;
      const results = [...document.querySelectorAll("h2")].find((e) => /Resultados/i.test(e.textContent));
      const procs = [...document.querySelectorAll("h2")].find((e) => /^Procedimentos/i.test(e.textContent.trim()));
      const doctor = [...document.querySelectorAll("h2")].find((e) => /Dra\. Camila/i.test(e.textContent));
      const cta = [...document.querySelectorAll("h2")].find((e) => /Realce sua beleza/i.test(e.textContent));
      const header = document.querySelector("header, nav");
      return [
        [0, header.offsetHeight],                                   // cabeçalho (logo + menu), sem a foto do topo
        [heroEnd, y(sec(results))],                                 // cards de tratamentos (ícones e texto)
        [y(sec(procs)), y(sec(doctor))],                            // procedimentos
        [y(sec(cta)), y(sec(cta)) + sec(cta).offsetHeight],         // faixa final, sem o rodapé de contato
      ];
    },
    mobileStart: () => { const h1 = document.querySelector("h1"); const s = h1.closest("section") ?? h1.parentElement; return s.getBoundingClientRect().top + scrollY + s.offsetHeight; } },
  { slug: "enrico", url: "https://nexyadev.github.io/enrico/",
    // Do topo até antes da galeria "Dentro da história" (fotos com outras pessoas).
    ranges: () => { const h = [...document.querySelectorAll("h2")].find((e) => /Dentro\s*da\s*hist/i.test(e.textContent)); return [[0, h.getBoundingClientRect().top + scrollY - 80]]; },
    mobileStart: () => 0 },
];

const b = await chromium.launch({ channel: "msedge" });
async function open(url, viewport, dpr, mobile) {
  const ctx = await b.newContext({ viewport, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForTimeout(2000);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 600) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(100); }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(800);
  return { ctx, p };
}

for (const site of sites) {
  const out = `public/projetos/${site.slug}`; mkdirSync(out, { recursive: true });
  // Página inteira a 1440 (DPR 1), recortada nas faixas seguras e empilhada.
  const { ctx, p } = await open(site.url, { width: 1440, height: 900 }, 1, false);
  const ranges = (await p.evaluate(site.ranges)).map(([a, z]) => [Math.max(0, Math.round(a)), Math.round(z)]).filter(([a, z]) => z - a > 40);
  const full = await p.screenshot({ fullPage: true });
  const meta = await sharp(full).metadata();
  const parts = await Promise.all(ranges.map(([a, z]) => sharp(full).extract({ left: 0, top: a, width: 1440, height: Math.min(z, meta.height) - a }).toBuffer()));
  const totalH = ranges.reduce((s, [a, z]) => s + Math.min(z, meta.height) - a, 0);
  let top = 0; const comp = [];
  for (const [i, input] of parts.entries()) { comp.push({ input, left: 0, top }); top += Math.min(ranges[i][1], meta.height) - ranges[i][0]; }
  const safe = await sharp({ create: { width: 1440, height: totalH, channels: 3, background: "#ffffff" } }).composite(comp).png().toBuffer();
  // Imagem da tela do notebook: largura 1200, até 4 telas de altura (16:10).
  const scaled = await sharp(safe).resize({ width: 1200 }).png().toBuffer();
  const sm = await sharp(scaled).metadata();
  const tall = await sharp(scaled).extract({ left: 0, top: 0, width: 1200, height: Math.min(sm.height, 3000) }).png().toBuffer();
  await sharp(tall).webp({ quality: 78 }).toFile(`${out}/scroll.webp`);
  await sharp(tall).toFile(`scripts/.case-cache-${site.slug}.png`);
  await ctx.close();

  // Desktop em alta (DPR 2): primeira tela da faixa segura (montada a partir do recorte, para não incluir áreas puladas).
  const { ctx: c2, p: p2 } = await open(site.url, { width: 1440, height: 900 }, 2, false);
  const r2 = (await p2.evaluate(site.ranges)).map(([a, z]) => [Math.max(0, Math.round(a)), Math.round(z)]).filter(([a, z]) => z - a > 40);
  const full2 = await p2.screenshot({ fullPage: true });
  const m2 = await sharp(full2).metadata();
  const parts2 = await Promise.all(r2.map(([a, z]) => sharp(full2).extract({ left: 0, top: a * 2, width: 2880, height: Math.min(z * 2, m2.height) - a * 2 }).toBuffer()));
  let t2 = 0; const comp2 = [];
  for (const [i, input] of parts2.entries()) { comp2.push({ input, left: 0, top: t2 }); t2 += Math.min(r2[i][1] * 2, m2.height) - r2[i][0] * 2; }
  const safe2 = await sharp({ create: { width: 2880, height: t2, channels: 3, background: "#ffffff" } }).composite(comp2).png().toBuffer();
  const first = await sharp(safe2).extract({ left: 0, top: 0, width: 2880, height: Math.min(1800, t2) }).png().toBuffer();
  await sharp(first).resize({ width: 1600, height: 1000, fit: "cover", position: "top" }).webp({ quality: 82 }).toFile(`${out}/desktop.webp`);
  await c2.close();

  // Celular 390 (DPR 3): uma tela a partir do início da faixa segura.
  const { ctx: c3, p: p3 } = await open(site.url, { width: 390, height: 844 }, 3, true);
  const start = await p3.evaluate(site.mobileStart);
  await p3.evaluate((v) => scrollTo(0, v), start); await p3.waitForTimeout(900);
  await sharp(await p3.screenshot()).resize({ width: 600 }).webp({ quality: 82 }).toFile(`${out}/mobile.webp`);
  await c3.close();
  console.log(site.slug, "ok", ranges);
}
await b.close();
