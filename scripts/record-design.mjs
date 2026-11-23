// Prints 1440/390 das melhorias de design + vídeo da rolagem de /projetos (servidor em 127.0.0.1:3000).
import { chromium } from "@playwright/test";
import { mkdirSync, renameSync, rmSync } from "node:fs";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = "docs/melhorias-design";
mkdirSync(`${out}/tmp`, { recursive: true });
const b = await chromium.launch({ channel: "msedge" });
const shots = [["home-solucoes", "/", "#servicos"], ["home-processo", "/", "#processo"], ["solucoes", "/solucoes", null], ["projetos", "/projetos", null], ["projetos-case", "/projetos", "#nexya-auto"], ["case-nexya-auto", "/projetos/nexya-auto", null], ["case-garagem-mendes", "/projetos/garagem-mendes", null], ["projetos-stack", "/projetos", "#stack-geral"]];

for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  const p = await ctx.newPage();
  await p.addInitScript(() => sessionStorage.setItem("nx:intro-seen", "1"));
  for (const [name, route, anchor] of shots) {
    await p.goto(base + route, { waitUntil: "networkidle" });
    if (anchor) {
      // Rola de verdade até a seção para disparar revelações e o trilho de luz.
      const y = await p.evaluate((sel) => document.querySelector(sel).getBoundingClientRect().top + scrollY - 80, anchor);
      for (let s = 0; s < y; s += 160) { await p.evaluate((v) => window.scrollTo(0, v), Math.min(s + 160, y)); await p.waitForTimeout(40); }
      if (anchor === "#processo") { await p.evaluate(() => window.scrollBy(0, innerHeight * .45)); }
    }
    await p.waitForTimeout(1600);
    await p.screenshot({ path: `${out}/${name}-${w}.png` });
  }
  await ctx.close();

  // Vídeo: rolagem completa de /projetos.
  const vctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, recordVideo: { dir: `${out}/tmp`, size: { width: w, height: h } } });
  const vp = await vctx.newPage();
  await vp.goto(base + "/projetos", { waitUntil: "networkidle" });
  await vp.waitForTimeout(800);
  if (!mobile) { await vp.mouse.move(300, 640); await vp.waitForTimeout(500); await vp.mouse.move(420, 780, { steps: 20 }); await vp.waitForTimeout(600); }
  const total = await vp.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let y = 0; y < total; y += mobile ? 28 : 36) {
    if (mobile) await vp.evaluate((v) => window.scrollTo(0, v), y); else await vp.mouse.wheel(0, 36);
    await vp.waitForTimeout(30);
  }
  await vp.waitForTimeout(800);
  const video = vp.video();
  await vctx.close();
  renameSync(await video.path(), `${out}/video-projetos-${w}.webm`);
}
await b.close();
rmSync(`${out}/tmp`, { recursive: true, force: true });
