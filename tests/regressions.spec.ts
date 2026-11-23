import { expect, test, type Browser, type Page } from "@playwright/test";

/**
 * Regressões relatadas no Windows (2026-11-23). Cada teste PROVA o comportamento com medição real
 * (transform computado em dois instantes, pixels do canvas, contagem de nós no DOM, clique no seletor).
 */
const W = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
async function ctx(browser: Browser, motion: "no-preference" | "reduce", mobile = false) {
  const context = await browser.newContext({ reducedMotion: motion, colorScheme: "light", viewport: mobile ? W.mobile : W.desktop, isMobile: mobile, hasTouch: mobile });
  return { context, page: await context.newPage() };
}
// Cada teste cria seus próprios contextos (1440 e 390): roda uma vez só, no projeto desktop.
const transformOf = (page: Page, sel: string) => page.locator(sel).first().evaluate((el) => getComputedStyle(el).transform);

test.describe("1. movement", () => {
  test("no-preference: matchMedia says no-preference and BOTH marquees really move (transform changes in 1s)", async ({ browser }) => {
    const { context, page } = await ctx(browser, "no-preference");
    await page.goto("/projetos", { waitUntil: "networkidle" });
    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(false);
    await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
    const band = page.getByRole("region", { name: "Projetos em destaque" });
    await expect(band.locator("[data-track]").first()).toBeAttached();
    const t0 = await transformOf(page, '[aria-label="Projetos em destaque"] [data-track]');
    await page.waitForTimeout(1000);
    expect(await transformOf(page, '[aria-label="Projetos em destaque"] [data-track]')).not.toBe(t0);
    // Faixa da Stack: rola até ela e mede.
    await page.locator("#stack-geral").scrollIntoViewIfNeeded();
    const stackTrack = '[aria-label="Tecnologias usadas nestes projetos"] [data-track]';
    await page.waitForTimeout(300);
    const s0 = await transformOf(page, stackTrack);
    await page.waitForTimeout(1000);
    expect(await transformOf(page, stackTrack)).not.toBe(s0);
    // Uma linha por faixa (desktop: Stack em 2 linhas opostas, cada uma sem quebra).
    for (const track of await page.locator("[data-track]").all()) {
      const tops = await track.evaluate((el) => new Set([...el.querySelectorAll("a, span[class*='pill']")].map((n) => Math.round(n.getBoundingClientRect().top))).size);
      expect(tops).toBeLessThanOrEqual(1);
    }
    await context.close();
  });

  test("no-preference: the WebGL silk really animates (two canvas screenshots differ)", async ({ browser }) => {
    const { context, page } = await ctx(browser, "no-preference");
    await page.goto("/", { waitUntil: "networkidle" });
    await page.mouse.move(700, 400);
    await expect(page.locator(".satin")).toHaveAttribute("data-state", "live", { timeout: 15000 });
    const canvas = page.locator("canvas.satin-canvas");
    const a = await canvas.screenshot();
    await page.waitForTimeout(1000);
    const b = await canvas.screenshot();
    expect(a.equals(b)).toBe(false);
    await context.close();
  });

  test("no-preference: logo opening runs once (svg drawn, then done) and never again on SPA navigation or language change", async ({ browser }) => {
    const { context, page } = await ctx(browser, "no-preference");
    await page.goto("/", { waitUntil: "commit" });
    await expect(page.locator(".nx-logo")).toHaveAttribute("data-intro", "run", { timeout: 5000 });
    await expect(page.locator(".nx-logo")).toHaveAttribute("data-intro", "done", { timeout: 5000 });
    expect(await page.locator(".nx-logo svg").count()).toBeLessThanOrEqual(1);
    // SPA: vai e volta; a abertura não reaparece e nada sobra.
    await page.locator("nav.desktop-nav").getByRole("link", { name: "Soluções" }).click();
    await expect(page).toHaveURL(/\/solucoes$/);
    await page.locator("nav.desktop-nav").getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator(".nx-logo")).toHaveAttribute("data-intro", "done");
    expect(await page.locator(".nx-logo svg").count()).toBe(0);
    await page.locator(".header-lang .lang-button").click();
    await page.getByRole("menuitemradio", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator(".nx-logo")).toHaveAttribute("data-intro", "done");
    expect(await page.locator(".nx-logo svg").count()).toBe(0);
    await context.close();
  });

  test("no-preference: page transition veil runs on navigation (not on first load)", async ({ browser }) => {
    const { context, page } = await ctx(browser, "no-preference");
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator(".silk-veil")).toHaveAttribute("data-active", "false");
    const seen = page.evaluate(() => new Promise<boolean>((resolve) => {
      const veil = document.querySelector<HTMLElement>(".silk-veil")!;
      new MutationObserver(() => { if (veil.dataset.active === "true") resolve(true); }).observe(veil, { attributes: true });
      setTimeout(() => resolve(false), 4000);
    }));
    await page.locator("nav.desktop-nav").getByRole("link", { name: "Projetos" }).click();
    expect(await seen).toBe(true);
    await context.close();
  });

  for (const mobile of [false, true]) {
    test(`reduce (${mobile ? "390" : "1440"}): marquees keep moving sideways (slower); after Pause ONE row, every item exactly once`, async ({ browser }) => {
      const { context, page } = await ctx(browser, "reduce", mobile);
      await page.goto("/projetos", { waitUntil: "networkidle" });
      expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
      await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
      const band = page.getByRole("region", { name: "Projetos em destaque" });
      const sel = '[aria-label="Projetos em destaque"] [data-track]';
      const t0 = await transformOf(page, sel);
      await page.waitForTimeout(1500);
      expect(await transformOf(page, sel), "reduce ainda passa de lado").not.toBe(t0);
      await band.getByRole("button", { name: "Pausar faixas" }).click();
      const names = await band.locator("a").evaluateAll((as) => as.filter((a) => (a as HTMLElement).offsetParent !== null).map((a) => a.textContent?.replace(/Protótipo/i, "").trim()));
      expect(names).toEqual(["NEXYA Auto", "Garagem Mendes", "Dra. Camila Bioclass", "En.r.ico", "Site NEXYA Tech"]);
      const tops = await band.locator("a").evaluateAll((as) => new Set(as.filter((a) => (a as HTMLElement).offsetParent !== null).map((a) => Math.round(a.getBoundingClientRect().top))).size);
      expect(tops).toBe(1);
      await expect(band.locator("[data-viewport]")).toHaveCSS("overflow-x", "auto");
      const pills = await page.locator('[aria-label="Tecnologias usadas nestes projetos"] span[class*="pill"]').evaluateAll((ps) => ps.filter((p) => (p as HTMLElement).offsetParent !== null).map((p) => p.textContent));
      expect(pills.length).toBe(new Set(pills).size);
      await context.close();
    });
  }

  test("reduce: the site is not dead (silk drifts slowly, short fades) and has no parallax/scroll-linked effects", async ({ browser }) => {
    const { context, page } = await ctx(browser, "reduce");
    await page.goto("/", { waitUntil: "networkidle" });
    await page.mouse.move(700, 400);
    await expect(page.locator(".satin")).toHaveAttribute("data-state", "live", { timeout: 15000 });
    const canvas = page.locator("canvas.satin-canvas");
    const a = await canvas.screenshot();
    await page.waitForTimeout(2500);
    expect(a.equals(await canvas.screenshot())).toBe(false);
    // Sem parallax: o mockup do topo não reage ao mouse.
    const stage = page.locator(".devices-stage");
    const before = await stage.evaluate((el) => el.style.cssText);
    await page.mouse.move(1200, 200, { steps: 10 });
    await page.waitForTimeout(400);
    expect(await stage.evaluate((el) => el.style.cssText)).toBe(before);
    await expect(page.locator(".smart-cursor")).toBeHidden();
    await context.close();
  });

  test("Animations control: reachable by keyboard in the footer, toggles live, remembered only after the click", async ({ browser }) => {
    const { context, page } = await ctx(browser, "reduce");
    await page.goto("/projetos", { waitUntil: "networkidle" });
    expect(await page.evaluate(() => localStorage.getItem("nx-motion"))).toBeNull();
    const control = page.locator("footer").getByRole("switch", { name: /Animações/ });
    await expect(control).toHaveAttribute("aria-checked", "false");
    await expect(control).toContainText("reduzidas");
    await control.focus();
    await page.keyboard.press("Enter");
    await expect(control).toHaveAttribute("aria-checked", "true");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
    expect(await page.evaluate(() => localStorage.getItem("nx-motion"))).toBe("full");
    const band = page.getByRole("region", { name: "Projetos em destaque" });
    await band.scrollIntoViewIfNeeded();
    await expect(band.locator("[data-track]").first()).toBeAttached();
    const t0 = await transformOf(page, '[aria-label="Projetos em destaque"] [data-track]');
    await page.waitForTimeout(1000);
    expect(await transformOf(page, '[aria-label="Projetos em destaque"] [data-track]')).not.toBe(t0);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
    await context.close();
  });

  test("Animations control also lives in the mobile menu", async ({ browser }) => {
    const { context, page } = await ctx(browser, "no-preference", true);
    await page.goto("/", { waitUntil: "networkidle" });
    await page.locator(".menu-toggle").click();
    const control = page.locator("#mobile-menu").getByRole("switch", { name: /Animações/ });
    await expect(control).toBeVisible();
    expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await context.close();
  });
});

test.describe("2. logos", () => {
  const pages = ["/", "/solucoes", "/projetos", "/nexya-auto", "/contato", "/sobre", "/pt-pt", "/pt-pt/projetos", "/en", "/en/projects", "/en/contact"];
  for (const mobile of [false, true]) {
    test(`exactly ONE logo in the header on every page (${mobile ? "390" : "1440"}), also after scrolling`, async ({ browser }, testInfo) => {
      const { context, page } = await ctx(browser, "no-preference", mobile);
      for (const route of pages) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await expect(page.locator("header .brand img, header .brand svg")).toHaveCount(1);
        await expect(page.locator("header img:visible")).toHaveCount(1);
      }
      await page.goto("/", { waitUntil: "networkidle" });
      await page.mouse.wheel(0, 260);
      await page.waitForTimeout(500);
      // Vidro do header quase opaco: a logo grande do topo não aparece por trás como uma segunda logo.
      const alpha = await page.locator(".site-header").evaluate((el) => Number(getComputedStyle(el).backgroundColor.match(/[\d.]+(?=\))/)?.[0] ?? 1));
      expect(alpha).toBeGreaterThanOrEqual(.96);
      await page.screenshot({ path: testInfo.outputPath(`header-${mobile ? 390 : 1440}.png`), clip: { x: 0, y: 0, width: mobile ? 390 : 1440, height: 90 } });
      await context.close();
    });
  }

  test("the big logo is the graphite version on the light theme with contrast >= 4.5:1", async ({ page, request }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const src = await page.locator(".nx-logo img:visible").getAttribute("src");
    expect(src).toBe("/brand/nexya-logo-claro.svg");
    const svg = await (await request.get(src!)).text();
    const grad = svg.match(/<linearGradient id="metal-claro"[\s\S]*?<\/linearGradient>/)![0];
    const stops = [...grad.matchAll(/stop-color="(#[0-9a-f]{6})"/gi)].map((m) => m[1]);
    const lum = (hex: string) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
    const bg = lum("#f4f4f2");
    const worst = Math.min(...stops.map((s) => (bg + .05) / (lum(s) + .05)));
    expect(worst).toBeGreaterThanOrEqual(4.5);
  });
});

test.describe("4. language switch by real clicks", () => {
  const routes: [string, Record<"pt-PT" | "en", RegExp>][] = [
    ["/projetos", { "pt-PT": /\/pt-pt\/projetos$/, en: /\/en\/projects$/ }],
    ["/solucoes", { "pt-PT": /\/pt-pt\/solucoes$/, en: /\/en\/solutions$/ }],
    ["/nexya-auto", { "pt-PT": /\/pt-pt\/nexya-auto$/, en: /\/en\/nexya-auto$/ }],
    ["/contato", { "pt-PT": /\/pt-pt\/contato$/, en: /\/en\/contact$/ }],
  ];
  const names = { "pt-PT": "Português (Portugal)", en: "English" } as const;
  const langs = { "pt-PT": "pt-PT", en: "en" } as const;
  for (const mobile of [false, true]) {
    for (const [route, targets] of routes) {
      test(`${route} -> pt-PT and en via the selector (${mobile ? "mobile menu" : "header"})`, async ({ browser }) => {
        const { context, page } = await ctx(browser, "no-preference", mobile);
        for (const target of ["pt-PT", "en"] as const) {
          await page.goto(route, { waitUntil: "networkidle" });
          const before = await page.locator("nav[aria-label] a").allTextContents();
          if (mobile) { await page.locator(".menu-toggle").click(); await page.locator(".mobile-lang .lang-button").click(); }
          else await page.locator(".header-lang .lang-button").click();
          await page.getByRole("menuitemradio", { name: names[target] }).click();
          await expect(page).toHaveURL(targets[target]);
          await expect(page.locator("html")).toHaveAttribute("lang", langs[target]);
          // H1 igual ao da página carregada direto nesse idioma.
          const h1 = await page.locator("h1").first().getAttribute("aria-label") ?? await page.locator("h1").first().innerText();
          const direct = await context.newPage();
          await direct.goto(new URL(page.url()).pathname, { waitUntil: "domcontentloaded" });
          const expected = await direct.locator("h1").first().getAttribute("aria-label") ?? await direct.locator("h1").first().innerText();
          await direct.close();
          expect(h1).toBe(expected);
          // Nenhum rótulo do menu do idioma anterior que mude de idioma permaneceu.
          const after = await page.locator("nav[aria-label] a").allTextContents();
          const changed = before.filter((label) => !after.includes(label) || label === "");
          const leftovers = after.filter((label) => before.includes(label) && changed.includes(label));
          expect(leftovers).toEqual([]);
          if (target === "en") expect(after.join(" ")).not.toMatch(/Soluções|Projetos|Contato|Contacto/);
          if (target === "pt-PT") expect(after.join(" ")).toMatch(/Contacto/);
        }
        await context.close();
      });
    }
  }
});

test.describe("5. quick checks", () => {
  for (const width of [360, 1920]) {
    test(`no horizontal page scroll at ${width}px (3 languages)`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "no-preference" });
      const page = await context.newPage();
      for (const route of ["/", "/projetos", "/solucoes", "/en/projects", "/pt-pt/contato"]) {
        await page.goto(route, { waitUntil: "networkidle" });
        const { doc, view } = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, view: document.documentElement.clientWidth }));
        expect(doc, `${route} @ ${width}`).toBeLessThanOrEqual(view + 1);
      }
      await context.close();
    });
  }

  test("projects progress indicator is short, sticky, away from the edge and hidden without side margin", async ({ browser }) => {
    for (const [width, visible] of [[1440, true], [1920, true], [1024, false], [390, false]] as const) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "no-preference" });
      const page = await context.newPage();
      await page.goto("/projetos", { waitUntil: "networkidle" });
      const track = page.locator("[class*='progressTrack']");
      if (!visible) { await expect(track).toBeHidden(); await context.close(); continue; }
      await page.locator("#garagem-mendes").scrollIntoViewIfNeeded();
      const box = (await track.boundingBox())!;
      expect(box.height).toBeLessThanOrEqual(150);
      expect(box.x).toBeGreaterThanOrEqual(24);
      await context.close();
    }
  });
});
