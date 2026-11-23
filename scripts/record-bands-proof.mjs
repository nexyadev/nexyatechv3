// Provas das faixas: vídeos de 8s em /projetos (no-preference e reduce com Pausar) + prints.
// Uso: BASE_URL=http://localhost:3100 node scripts/record-bands-proof.mjs
import { chromium } from "@playwright/test";
import { mkdirSync, renameSync, rmSync } from "node:fs";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = "docs/faixas";
mkdirSync(`${out}/tmp`, { recursive: true });
const b = await chromium.launch({ channel: "msedge" });

for (const motion of ["no-preference", "reduce"]) {
  for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, reducedMotion: motion, colorScheme: "light", recordVideo: { dir: `${out}/tmp`, size: { width: w, height: h } } });
    const p = await ctx.newPage();
    await p.addInitScript(() => sessionStorage.setItem("nx:intro-seen", "1"));
    await p.goto(base + "/projetos", { waitUntil: "networkidle" });
    await p.mouse.move(1, 1);
    await p.evaluate(() => document.querySelector("[data-marquee]").scrollIntoView({ block: "center" }));
    await p.waitForTimeout(3000);
    await p.evaluate(() => document.querySelector("#stack-geral").scrollIntoView({ block: "start" }));
    await p.waitForTimeout(motion === "reduce" ? 2500 : 5000);
    if (motion === "reduce") {
      const stack = p.locator("[data-marquee]").nth(1);
      await stack.getByRole("button", { name: "Pausar faixas" }).click();
      await p.mouse.move(1, 1);
      await p.waitForTimeout(1500);
      await stack.locator("[data-viewport]").evaluate((el) => el.scrollBy({ left: 400, behavior: "smooth" }));
      await p.waitForTimeout(1500);
      await p.screenshot({ path: `${out}/pausado-${w}.png` });
    }
    const video = p.video();
    await ctx.close();
    renameSync(await video.path(), `${out}/video-${motion}-${w}.webm`);
  }
}
for (const [w, h, mobile] of [[1440, 900, false], [768, 1000, false], [390, 844, true], [1920, 1080, false]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, reducedMotion: "no-preference", colorScheme: "light" });
  const p = await ctx.newPage();
  await p.addInitScript(() => sessionStorage.setItem("nx:intro-seen", "1"));
  await p.goto(base + "/projetos", { waitUntil: "networkidle" });
  await p.mouse.move(1, 1);
  await p.evaluate(() => document.querySelector("#stack-geral").scrollIntoView({ block: "start" }));
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${out}/stack-${w}.png` });
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(600);
  await p.screenshot({ path: `${out}/topo-${w}.png` });
  await ctx.close();
}
await b.close();
rmSync(`${out}/tmp`, { recursive: true, force: true });
console.log("provas ok");
