/**
 * Records the /lab prototype (loader + full scroll) and takes section screenshots.
 *   node scripts/record-lab.mjs [baseUrl]
 * Output: docs/lab/*.webm and docs/lab/*.jpg
 */
import { chromium } from "@playwright/test";
import { mkdirSync, rmSync } from "node:fs";

const base = process.argv[2] ?? "http://127.0.0.1:3000";
const out = "docs/lab";
const tmp = `${out}/.tmp-video`;
mkdirSync(out, { recursive: true });

const runs = [
  { name: "desktop-1440", viewport: { width: 1440, height: 900 }, mobile: false },
  { name: "mobile-390", viewport: { width: 390, height: 844 }, mobile: true },
];
const sections = ["inicio", "manifesto", "solucoes", "produto", "portfolio", "processo", "contato"];
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });

for (const run of runs) {
  const context = await browser.newContext({
    viewport: run.viewport, isMobile: run.mobile, hasTouch: run.mobile, deviceScaleFactor: 1,
    reducedMotion: "no-preference", recordVideo: { dir: tmp, size: run.viewport },
  });
  const page = await context.newPage();
  await page.goto(`${base}/lab`, { waitUntil: "commit" });
  // The loader, untouched, until it opens the page.
  await page.waitForFunction(() => document.getElementById("lab-loader")?.dataset.state === "done", null, { timeout: 10_000 });
  await page.waitForTimeout(1200);
  if (!run.mobile) {
    // The cursor bends the silk and lights it.
    for (const [x, y] of [[1100, 300], [900, 520], [1250, 640], [700, 420]]) { await page.mouse.move(x, y, { steps: 25 }); await page.waitForTimeout(250); }
  }
  // Wheel scrolling through the whole page, with pauses so every scene can settle.
  const height = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let y = 0; y < height; y += 120) { await page.mouse.wheel(0, 120); await page.waitForTimeout(run.mobile ? 55 : 45); if (y % 1080 < 120) await page.waitForTimeout(700); }
  await page.waitForTimeout(1800);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(1500);
  for (const id of sections) {
    await page.evaluate((section) => document.getElementById(section)?.scrollIntoView({ block: section === "inicio" ? "start" : "center", behavior: "instant" }), id);
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${out}/${run.name}-${id}.jpg`, type: "jpeg", quality: 82 });
  }
  const video = page.video();
  await context.close();
  await video.saveAs(`${out}/lab-${run.name}.webm`);
  console.log(`${out}/lab-${run.name}.webm`);
}
await browser.close();
rmSync(tmp, { recursive: true, force: true });
