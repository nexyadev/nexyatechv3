// Provas da correção urgente: vídeos com reducedMotion "no-preference" e "reduce" + prints do header/topo.
// Uso: BASE_URL=http://localhost:3100 node scripts/record-proof.mjs
import { chromium } from "@playwright/test";
import { mkdirSync, renameSync, rmSync } from "node:fs";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = "docs/correcao-urgente";
mkdirSync(`${out}/tmp`, { recursive: true });
const b = await chromium.launch({ channel: "msedge" });

async function script(p, mobile) {
  // 1. Abertura da logo (sessão nova) e fitas.
  await p.goto(base + "/", { waitUntil: "commit" });
  await p.waitForTimeout(1800);
  await p.mouse.move(700, 420, { steps: 12 });
  await p.waitForTimeout(2200);
  // 2. Faixas em /projetos (projetos e Stack).
  await p.goto(base + "/projetos", { waitUntil: "networkidle" });
  await p.waitForTimeout(2200);
  await p.evaluate(() => document.querySelector("#stack-geral").scrollIntoView({ block: "center" }));
  await p.waitForTimeout(2500);
  // 3. Transição de página.
  await p.evaluate(() => scrollTo(0, 0));
  if (!mobile) { await p.locator("nav.desktop-nav").getByRole("link", { name: "Soluções" }).click(); await p.waitForTimeout(1400); }
  // 4. Troca de idioma pelos 3 idiomas (clique real no seletor).
  for (const name of ["Português (Portugal)", "English", "Português (Brasil)"]) {
    if (mobile) { await p.locator(".menu-toggle").click(); await p.waitForTimeout(300); await p.locator(".mobile-lang .lang-button").click(); }
    else await p.locator(".header-lang .lang-button").click();
    await p.waitForTimeout(500);
    await p.getByRole("menuitemradio", { name }).click();
    await p.waitForTimeout(1600);
  }
  // 5. Tema: flag desligada (sem botão de tema) + controle "Animações" no rodapé.
  await p.evaluate(() => document.querySelector("footer").scrollIntoView({ block: "end" }));
  await p.waitForTimeout(1200);
}

for (const motion of ["no-preference", "reduce"]) {
  for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, reducedMotion: motion, colorScheme: "light", recordVideo: { dir: `${out}/tmp`, size: { width: w, height: h } } });
    const p = await ctx.newPage();
    await script(p, mobile);
    const video = p.video();
    await ctx.close();
    renameSync(await video.path(), `${out}/video-${motion}-${w}.webm`);
  }
}

// Prints: header e topo (logo única), 1440 e 390, nos dois modos.
for (const motion of ["no-preference", "reduce"]) {
  for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, reducedMotion: motion, colorScheme: "light", deviceScaleFactor: mobile ? 2 : 1 });
    const p = await ctx.newPage();
    await p.addInitScript(() => sessionStorage.setItem("nx:intro-seen", "1"));
    await p.goto(base + "/", { waitUntil: "networkidle" });
    await p.waitForTimeout(800);
    await p.screenshot({ path: `${out}/topo-${motion}-${w}.png` });
    await p.mouse.wheel(0, 240); await p.waitForTimeout(1200);
    await p.screenshot({ path: `${out}/header-rolado-${motion}-${w}.png`, clip: { x: 0, y: 0, width: w, height: 90 } });
    await p.goto(base + "/projetos", { waitUntil: "networkidle" });
    await p.evaluate(() => document.querySelector("#stack-geral").scrollIntoView({ block: "center", behavior: "instant" }));
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `${out}/stack-${motion}-${w}.png` });
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
    const band = p.getByRole("region", { name: "Projetos em destaque" });
    await band.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
    await band.screenshot({ path: `${out}/faixa-projetos-${motion}-${w}.png` });
    await ctx.close();
  }
}
await b.close();
rmSync(`${out}/tmp`, { recursive: true, force: true });
console.log("provas ok");
