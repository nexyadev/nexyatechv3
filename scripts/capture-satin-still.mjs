// Gera o fallback estático da Seda Acetinada a partir do shader real (dev server em 127.0.0.1:3000).
import { chromium } from "@playwright/test";
import sharp from "sharp";
const base = process.env.BASE_URL ?? "http://localhost:3000/";
const b = await chromium.launch({ channel: "msedge" });
// THEME=dark gera a versão escura (seda-acetinada-escura*.webp).
const dark = process.env.THEME === "dark";
const suffix = dark ? "-escura" : "";
for (const [file, vp, scale, mobile] of [[`seda-acetinada${suffix}.webp`, { width: 1600, height: 1000 }, 1, false], [`seda-acetinada${suffix}-mobile.webp`, { width: 430, height: 932 }, 2, true]]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: scale, isMobile: mobile, hasTouch: mobile, reducedMotion: "no-preference" });
  const p = await ctx.newPage();
  await p.addInitScript((d) => { sessionStorage.setItem("nx:intro-seen", "1"); localStorage.setItem("nx-theme", d ? "dark" : "light"); }, dark);
  await p.goto(base, { waitUntil: "networkidle" });
  await p.waitForSelector('.satin[data-state="live"]');
  await p.waitForTimeout(4000);
  await p.addStyleTag({ content: "header,main,footer,nextjs-portal{visibility:hidden!important} body::after{display:none!important}" });
  const png = await p.screenshot();
  await sharp(png).webp({ quality: 72 }).toFile(`public/images/${file}`);
  await ctx.close();
}
await b.close();
