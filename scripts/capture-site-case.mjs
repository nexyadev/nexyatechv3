// Capturas do próprio site para o case "Site NEXYA Tech" (servidor em 127.0.0.1:3000). Saída: public/images/cases.
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = "public/images/cases";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: "msedge" });

async function shoot(viewport, dpr, mobile, anchors) {
  const ctx = await b.newContext({ viewport, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.addInitScript(() => sessionStorage.setItem("nx:intro-seen", "1"));
  await p.goto(base + "/", { waitUntil: "networkidle" });
  const shots = [];
  for (const anchor of anchors) {
    if (anchor) await p.evaluate((sel) => { const el = document.querySelector(sel); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 76); }, anchor);
    else await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(900);
    shots.push(await p.screenshot());
  }
  await ctx.close();
  return shots;
}

const [top, solutions, processShot] = await shoot({ width: 1440, height: 900 }, 2, false, [null, "#servicos", "#processo"]);
await sharp(top).resize({ width: 1600 }).webp({ quality: 82 }).toFile(`${out}/site-nexya-tech-topo.webp`);
await sharp(solutions).resize({ width: 1600 }).webp({ quality: 82 }).toFile(`${out}/site-nexya-tech-solucoes.webp`);
const parts = await Promise.all([top, solutions, processShot].map((png) => sharp(png).resize({ width: 1200, height: 750 }).toBuffer()));
const tall = await sharp({ create: { width: 1200, height: 2250, channels: 3, background: "#f4f4f2" } }).composite(parts.map((input, i) => ({ input, top: i * 750, left: 0 }))).png().toBuffer();
await sharp(tall).webp({ quality: 80 }).toFile(`${out}/site-nexya-tech-rolagem.webp`);
const [phone] = await shoot({ width: 390, height: 844 }, 3, true, [null]);
await sharp(phone).resize({ width: 600 }).webp({ quality: 82 }).toFile(`${out}/site-nexya-tech-celular.webp`);
await b.close();
