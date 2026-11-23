// Vídeo do topo + prints da Fase 1 (servidor em 127.0.0.1:3000). Saída em docs/fase-1.
import { chromium } from "@playwright/test";
import { renameSync, mkdirSync } from "node:fs";
const out = "docs/fase-1"; mkdirSync(`${out}/tmp`, { recursive: true });
const b = await chromium.launch({ channel: "msedge" });
for (const [name, vp, mobile] of [["1440", { width: 1440, height: 900 }, false], ["390", { width: 390, height: 844 }, true]]) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, reducedMotion: "no-preference", recordVideo: { dir: `${out}/tmp`, size: vp } });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/");
  await p.waitForTimeout(3500);
  await p.screenshot({ path: `${out}/topo-${name}.png` });
  if (!mobile) for (let i = 0; i < 40; i++) { await p.mouse.move(500 + i * 18, 300 + Math.sin(i / 5) * 200); await p.waitForTimeout(60); }
  for (let i = 0; i < 18; i++) { await p.mouse.wheel(0, 50); await p.waitForTimeout(90); }
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${out}/header-vidro-${name}.png` });
  for (let i = 0; i < 18; i++) { await p.mouse.wheel(0, -50); await p.waitForTimeout(90); }
  await p.waitForTimeout(1200);
  const video = p.video(); await ctx.close();
  renameSync(await video.path(), `${out}/video-topo-${name}.webm`);
}
await b.close();
