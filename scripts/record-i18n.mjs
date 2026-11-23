// Prints da Home nos 3 idiomas (seletor aberto) + vídeo da transição de página e da paleta de comandos.
import { chromium } from "@playwright/test";
import { mkdirSync, renameSync, rmSync } from "node:fs";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = "docs/i18n-fase";
mkdirSync(`${out}/tmp`, { recursive: true });
const b = await chromium.launch({ channel: "msedge" });

for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
  for (const [name, path] of [["pt-br", "/"], ["pt-pt", "/pt-pt"], ["en", "/en"]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1, reducedMotion: "no-preference" });
    const p = await ctx.newPage();
    await p.addInitScript(() => sessionStorage.setItem("nx:intro-seen", "1"));
    await p.goto(base + path, { waitUntil: "networkidle" });
    await p.waitForTimeout(1000);
    if (mobile) { await p.locator(".menu-toggle").click(); await p.waitForTimeout(300); await p.locator(".mobile-lang .lang-button").click(); }
    else await p.locator(".header-lang .lang-button").click();
    await p.waitForTimeout(400);
    await p.screenshot({ path: `${out}/home-${name}-${w}.png` });
    await ctx.close();
  }
}

// Vídeo (desktop 1440): transição com a seda entre páginas, depois a paleta de comandos.
const vctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference", recordVideo: { dir: `${out}/tmp`, size: { width: 1440, height: 900 } } });
const v = await vctx.newPage();
await v.addInitScript(() => sessionStorage.setItem("nx:intro-seen", "1"));
await v.goto(base + "/", { waitUntil: "networkidle" });
await v.waitForTimeout(1200);
await v.locator("nav.desktop-nav").getByRole("link", { name: "Soluções" }).click();
await v.waitForTimeout(1500);
await v.locator("nav.desktop-nav").getByRole("link", { name: "Projetos" }).click();
await v.waitForTimeout(1500);
await v.keyboard.press("Control+k");
await v.waitForTimeout(900);
await v.keyboard.type("engl", { delay: 140 });
await v.waitForTimeout(900);
await v.keyboard.press("Enter");
await v.waitForTimeout(1800);
await v.keyboard.press("Control+k");
await v.waitForTimeout(700);
await v.keyboard.type("auto", { delay: 140 });
await v.waitForTimeout(700);
await v.keyboard.press("Enter");
await v.waitForTimeout(1800);
const video = v.video();
await vctx.close();
renameSync(await video.path(), `${out}/video-transicao-e-paleta-1440.webm`);
await b.close();
rmSync(`${out}/tmp`, { recursive: true, force: true });
