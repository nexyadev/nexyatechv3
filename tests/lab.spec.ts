import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function overflowX(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

test.describe("/lab prototype", () => {
  test("is not indexed, not in the sitemap and not linked from the site navigation", async ({ page, request }) => {
    await page.goto("/lab", { waitUntil: "domcontentloaded" });
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("/lab");
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator('a[href="/lab"]')).toHaveCount(0);
  });

  test("loader plays once per session, can be skipped with Esc or a click, and never hides the real content", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/lab", { waitUntil: "domcontentloaded" });
    const loader = page.locator("#lab-loader");
    await expect(loader).toBeVisible();
    await expect(loader).toContainText("Carregando experiência");
    // The page underneath is real HTML from the first frame.
    await expect(page.getByRole("heading", { level: 1 })).toBeAttached();
    await expect(page.getByRole("link", { name: /Falar com a NEXYA/ })).toBeAttached();
    await page.keyboard.press("Escape");
    await expect(loader).toBeHidden({ timeout: 3000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => sessionStorage.getItem("nexya:lab-loader-seen"))).toBe("1");

    // Same session: no loader at all.
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(loader).toHaveAttribute("data-state", "skip");
    await expect(loader).toBeHidden();

    // A new session: a click also skips it.
    await page.evaluate(() => sessionStorage.removeItem("nexya:lab-loader-seen"));
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(loader).toBeVisible();
    await loader.click();
    await expect(loader).toBeHidden({ timeout: 3000 });
  });

  test("the silk scene runs behind the content without capturing clicks", async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(() => sessionStorage.setItem("nexya:lab-loader-seen", "1"));
    await page.goto("/lab", { waitUntil: "networkidle" });
    // Touch screens load the WebGL bundle on the first interaction.
    if (testInfo.project.name === "mobile") await page.mouse.wheel(0, 20);
    await expect(page.getByRole("button", { name: "Pausar animação de fundo" })).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("canvas")).toHaveCount(1);
    expect(await page.locator("canvas").evaluate((canvas) => getComputedStyle(canvas).pointerEvents)).toBe("none");
    const cta = page.getByRole("link", { name: /Falar com a NEXYA/ });
    expect(await cta.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return element.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2));
    })).toBe(true);
    await page.getByRole("button", { name: "Pausar animação de fundo" }).click();
    await expect(page.getByRole("button", { name: "Retomar animação de fundo" })).toHaveAttribute("aria-pressed", "true");
  });

  test("reduced motion: no loader, no WebGL, a still frame of the ribbons and everything readable", async ({ page }) => {
    await page.goto("/lab", { waitUntil: "networkidle" });
    await expect(page.locator("#lab-loader")).toBeHidden();
    await expect(page.locator("canvas")).toHaveCount(0);
    const still = await page.evaluate(() => {
      const element = [...document.querySelectorAll("div")].find((node) => getComputedStyle(node).backgroundImage.includes("seda-de-luz"));
      return element ? getComputedStyle(element).opacity : null;
    });
    expect(still).toBe("1");
    for (const id of ["manifesto", "solucoes", "produto", "portfolio", "processo", "contato"]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await expect(page.locator(`#${id} h2`)).toBeVisible();
      await expect(page.locator(`#${id} h2`)).toHaveCSS("opacity", "1");
    }
  });

  test("has no serious or critical WCAG violations", async ({ page }) => {
    await page.goto("/lab", { waitUntil: "networkidle" });
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).exclude("nextjs-portal").analyze();
    const serious = results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
    expect(serious, JSON.stringify(serious.map(({ id, nodes }) => ({ id, nodes: nodes.map((node) => node.target) })), null, 2)).toEqual([]);
  });

  test("no horizontal scroll from 360px to 1920px", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Widths are set explicitly below.");
    await page.addInitScript(() => sessionStorage.setItem("nexya:lab-loader-seen", "1"));
    for (const width of [360, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/lab", { waitUntil: "networkidle" });
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      expect(await overflowX(page), `overflow at ${width}px`).toBeLessThanOrEqual(0);
    }
  });
});
