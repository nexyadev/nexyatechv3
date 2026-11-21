/**
 * Derives light delivery copies of the official logo (resampled pixels only, no redesign):
 * - public/images/lab/nexya-logo-900.webp  loader (the 445 KB PNG competed with fonts on mobile)
 * - public/images/lab/nexya-icon-64.png     favicon for /lab
 *   node scripts/derive-logo-assets.mjs
 */
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const source = readFileSync("public/images/logonexyaa.png").toString("base64");
mkdirSync("public/images/lab", { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
const page = await browser.newPage();
const [logo, icon] = await page.evaluate(async (data) => {
  const image = new Image();
  image.src = `data:image/png;base64,${data}`;
  await image.decode();
  const draw = (width, height, fit) => {
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    const context = canvas.getContext("2d");
    context.imageSmoothingQuality = "high";
    if (fit) {
      context.fillStyle = "#000"; context.fillRect(0, 0, width, height);
      const w = width * .94, h = (w * image.height) / image.width;
      context.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
    } else {
      context.drawImage(image, 0, 0, width, height);
    }
    return canvas;
  };
  return [
    draw(900, Math.round((900 * image.height) / image.width), false).toDataURL("image/webp", .88).split(",")[1],
    draw(64, 64, true).toDataURL("image/png").split(",")[1],
  ];
}, source);
writeFileSync("public/images/lab/nexya-logo-900.webp", Buffer.from(logo, "base64"));
writeFileSync("public/images/lab/nexya-icon-64.png", Buffer.from(icon, "base64"));
console.log(`logo ${Math.round(Buffer.from(logo, "base64").length / 1024)} KB, icon ${Math.round(Buffer.from(icon, "base64").length / 1024)} KB`);
await browser.close();
