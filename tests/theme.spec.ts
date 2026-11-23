import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const bg = (page: import("@playwright/test").Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
/** Modo escuro fica atrás da flag NEXT_PUBLIC_ENABLE_DARK (desligada por padrão). */
const darkOn = process.env.NEXT_PUBLIC_ENABLE_DARK === "true";

test.describe("dark mode flag off (default)", () => {
  test.use({ colorScheme: "dark" });
  test.skip(darkOn, "Só vale com o modo escuro desligado.");
  test("site stays light, no theme button and exactly one header logo even with a dark system", async ({ page }) => {
    for (const route of ["/", "/en/projects", "/pt-pt/contato"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
      expect(await bg(page)).toBe("rgb(244, 244, 242)");
      await expect(page.locator(".theme-toggle")).toHaveCount(0);
      await expect(page.locator("header .brand img")).toHaveCount(1);
      await expect(page.locator(".nx-logo img, footer .footer-brand img")).toHaveCount(route === "/" ? 2 : 1);
    }
  });
});

test.describe("system preference", () => {
  test.use({ colorScheme: "light" });
  test.skip(!darkOn, "Modo escuro desligado pela flag NEXT_PUBLIC_ENABLE_DARK.");
  test("follows prefers-color-scheme when there is no saved choice (light)", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(await bg(page)).toBe("rgb(244, 244, 242)");
    await expect(page.locator(".brand .logo-light")).toBeVisible();
    await expect(page.locator(".brand .logo-dark")).toBeHidden();
  });
});

test.describe("system preference dark", () => {
  test.use({ colorScheme: "dark" });
  test.skip(!darkOn, "Modo escuro desligado pela flag NEXT_PUBLIC_ENABLE_DARK.");
  test("follows prefers-color-scheme when there is no saved choice (dark)", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await bg(page)).toBe("rgb(10, 10, 10)");
    await expect(page.locator(".brand .logo-dark")).toBeVisible();
    await expect(page.locator(".brand .logo-light")).toBeHidden();
  });
});

test.describe("toggle", () => {
  test.use({ colorScheme: "light" });
  test.skip(!darkOn, "Modo escuro desligado pela flag NEXT_PUBLIC_ENABLE_DARK.");
  test("sun/moon button switches theme, saves the choice and keeps it after reload and in other languages", async ({ page }, testInfo) => {
    await page.goto("/", { waitUntil: "networkidle" });
    if (testInfo.project.name === "mobile") await page.getByRole("button", { name: "Abrir menu" }).click();
    const toggle = page.getByRole("button", { name: "Ativar modo escuro" }).first();
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await page.evaluate(() => localStorage.getItem("nx-theme"))).toBe("dark");
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await bg(page)).toBe("rgb(10, 10, 10)");
    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    if (testInfo.project.name === "mobile") await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("button", { name: "Switch to light mode" }).first().click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(await page.evaluate(() => localStorage.getItem("nx-theme"))).toBe("light");
  });
});

test.describe("dark accessibility", () => {
  test.use({ colorScheme: "dark" });
  test.skip(!darkOn, "Modo escuro desligado pela flag NEXT_PUBLIC_ENABLE_DARK.");
  for (const route of ["/", "/en/projects", "/pt-pt/contato", "/nexya-auto"]) {
    test(`dark mode keeps WCAG AA contrast on ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle" });
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).exclude("nextjs-portal").analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => ({ id: v.id, nodes: v.nodes.slice(0, 3).map((n) => n.target) }));
      expect(serious, route).toEqual([]);
    });
  }
});

test("no flash: the theme is applied by the inline head script before the page paints", async ({ page }) => {
  test.skip(!darkOn, "Modo escuro desligado pela flag NEXT_PUBLIC_ENABLE_DARK.");
  await page.addInitScript(() => localStorage.setItem("nx-theme", "dark"));
  await page.goto("/", { waitUntil: "commit" });
  await page.waitForSelector("body");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
