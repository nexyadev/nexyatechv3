/**
 * Renders a still frame of the "Seda de Luz" shader (hero pose) and saves it as WebP.
 * It is the background for reduced motion, browsers without WebGL and phones before the first touch.
 *
 *   npm run dev   (or npm run build && npm start)
 *   node scripts/capture-silk-still.mjs [baseUrl]
 */
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const base = process.argv[2] ?? "http://127.0.0.1:3000";
const outputs = [
  { file: "public/images/lab/seda-de-luz.webp", width: 1920, height: 1080 },
  { file: "public/images/lab/seda-de-luz-mobile.webp", width: 800, height: 1733 },
];

mkdirSync("public/images/lab", { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
for (const output of outputs) {
  // Rendered in desktop mode (all ribbons and bloom, widths above 767px) at the target aspect ratio.
  const page = await browser.newPage({ viewport: { width: output.width, height: output.height }, reducedMotion: "no-preference" });
  await page.addInitScript(() => sessionStorage.setItem("nexya:lab-loader-seen", "1"));
  await page.goto(`${base}/lab`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Pausar animação de fundo" }).waitFor({ timeout: 30_000 });
  await page.waitForTimeout(3500);
  // Only the shader: every other layer (text, fog, grain, dev overlays) is hidden for the capture.
  await page.addStyleTag({ content: "body *, nextjs-portal { visibility: hidden !important; } canvas { visibility: visible !important; }" });
  await page.waitForTimeout(100);
  const png = await page.locator("canvas").first().screenshot();
  const webp = await page.evaluate(async ([data, width, height]) => {
    const image = new Image();
    image.src = `data:image/png;base64,${data}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    canvas.getContext("2d").drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/webp", .8).split(",")[1];
  }, [png.toString("base64"), output.width, output.height]);
  writeFileSync(output.file, Buffer.from(webp, "base64"));
  console.log(`${output.file}: ${Math.round(Buffer.from(webp, "base64").length / 1024)} KB`);
  await page.close();
}
await browser.close();
