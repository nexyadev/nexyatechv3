import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

declare global {
  interface Window { nexyaBlockedWebglAttempts?: number }
}

const routes = [
  "/", "/solucoes", "/solucoes/sistemas", "/solucoes/automacoes", "/solucoes/sites", "/solucoes/integracoes",
  "/nexya-auto", "/portfolio", "/portfolio/nexya-auto", "/portfolio/garagem-mendes", "/portfolio/ang", "/portfolio/veia-criativa",
  "/sobre", "/processo", "/contato", "/privacidade",
] as const;

const accessibilityRoutes = ["/", "/solucoes/sistemas", "/nexya-auto", "/portfolio", "/sobre", "/processo", "/contato", "/privacidade"] as const;

async function expectNoHorizontalOverflow(page: Page) {
  const sizes = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  const offenders = sizes.document > sizes.viewport + 1 || sizes.body > sizes.viewport + 1
    ? await page.locator("body *").evaluateAll((elements) => elements.map((element) => ({
      element: `${element.tagName}.${element.getAttribute("class") ?? ""}`,
      right: Math.round(element.getBoundingClientRect().right),
      left: Math.round(element.getBoundingClientRect().left),
    })).filter((element) => element.right > document.documentElement.clientWidth + 1 || element.left < -1).slice(0, 18))
    : [];
  expect(sizes.document, `Document overflows: ${JSON.stringify({ ...sizes, offenders })}`).toBeLessThanOrEqual(sizes.viewport + 1);
  expect(sizes.body, `Body overflows: ${JSON.stringify({ ...sizes, offenders })}`).toBeLessThanOrEqual(sizes.viewport + 1);
}

async function prepareFullPageCapture(page: Page) {
  // Lazy loading is intentional in the product: scroll real images into view before QA captures.
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0)).toBe(true);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
}

test("every public route renders its own title, main content, navigation and responsive layout", async ({ page }, testInfo) => {
  const titles = new Set<string>();
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  for (const route of routes) {
    await test.step(route, async () => {
      const response = await page.goto(route, { waitUntil: "networkidle" });
      expect(response?.status(), `${route} HTTP status`).toBe(200);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const title = await page.title();
      expect(title).toContain("NEXYA");
      expect(titles.has(title), `Duplicate title at ${route}: ${title}`).toBe(false);
      titles.add(title);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      const description = await page.locator('meta[name="description"]').getAttribute("content");
      expect(description?.length, `${route} description`).toBeGreaterThan(30);
      await expect(page.getByRole("main").getByRole("link").first()).toBeAttached();
      await expectNoHorizontalOverflow(page);
      if (["/", "/nexya-auto", "/contato", "/solucoes"].includes(route)) {
        const filename = route === "/" ? "home-full.png" : `${route.slice(1)}-full.png`;
        await prepareFullPageCapture(page);
        await page.screenshot({ path: testInfo.outputPath(filename), fullPage: true, animations: "disabled" });
      }
    });
  }
  expect(runtimeErrors, "No unhandled browser errors during route navigation").toEqual([]);
});

test("mobile menu opens with keyboard, traps navigation and returns focus after Escape", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile navigation applies below the desktop breakpoint.");
  await page.goto("/", { waitUntil: "networkidle" });
  const toggle = page.getByRole("button", { name: "Abrir menu" });
  await toggle.focus();
  await page.keyboard.press("Enter");
  const mobileNavigation = page.getByRole("navigation", { name: "Navegação móvel" });
  await expect(mobileNavigation).toBeVisible();
  await expect(page.getByRole("button", { name: "Fechar menu" })).toHaveAttribute("aria-expanded", "true");
  const firstLink = mobileNavigation.getByRole("link").first();
  await expect(firstLink).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Fechar menu" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(firstLink).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath("mobile-menu.png"), animations: "disabled" });
  await page.keyboard.press("Escape");
  await expect(mobileNavigation).not.toBeAttached();
  await expect(page.getByRole("button", { name: "Abrir menu" })).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page.getByRole("navigation", { name: "Navegação móvel" }).getByRole("link", { name: /Sobre/ }).click();
  await expect(page).toHaveURL(/\/sobre$/);
  await expect(page.getByRole("navigation", { name: "Navegação móvel" })).not.toBeAttached();
});

test("contact validates before preparing a reviewable WhatsApp message and never sends it automatically", async ({ page, context }, testInfo) => {
  const unexpectedRequests: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" || /^https:\/\/(?:wa\.me|api\.whatsapp\.com)/.test(request.url())) unexpectedRequests.push(request.url());
  });
  await page.goto("/contato", { waitUntil: "networkidle" });
  const prepare = page.getByRole("button", { name: "Preparar conversa" });
  await expect(prepare).toBeEnabled();
  await prepare.click();
  await expect(page.locator("#name-error")).toBeVisible();
  await expect(page.locator("#email-error")).toBeVisible();
  await expect(page.locator("#service-error")).toBeVisible();
  await expect(page.locator("#message-error")).toBeVisible();
  await expect(page.locator("#consent-error")).toBeVisible();
  await expect(page.getByRole("link", { name: "Continuar no WhatsApp" })).not.toBeAttached();

  await page.getByLabel(/^Seu nome/).fill("Ana Teste");
  await page.getByLabel(/^E-mail/).fill("ana@example.com");
  await page.getByLabel(/^Empresa/).fill("Empresa de teste");
  await page.getByLabel(/^Como podemos ajudar/).selectOption("Sistema sob medida");
  await page.getByLabel(/^Seu projeto/).fill("Quero organizar os processos da empresa com uma solução sob medida.");
  await page.getByLabel(/Concordo em compartilhar/).check();
  await prepare.click();
  await expect(page.getByRole("heading", { name: "Sua conversa está pronta." })).toBeVisible();
  await expect(page.getByLabel("Mensagem para a NEXYA")).toHaveValue(/Nome: Ana Teste/);
  const href = await page.getByRole("link", { name: "Continuar no WhatsApp" }).getAttribute("href");
  expect(href).toBeTruthy();
  const destination = new URL(href!);
  expect(destination.origin).toBe("https://wa.me");
  expect(destination.pathname).toBe("/5541997830046");
  expect(destination.searchParams.get("text")).toContain("Empresa: Empresa de teste");
  await expect(page.getByText("Nenhuma informação foi enviada por este site.")).toBeVisible();
  expect(context.pages()).toHaveLength(1);
  expect(unexpectedRequests).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("contact-prepared.png"), fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "Editar informações" }).click();
  await expect(page.getByLabel(/^Seu nome/)).toHaveValue("Ana Teste");
  await expect(page.getByLabel(/^Seu projeto/)).toHaveValue(/organizar os processos/);
});

test("NEXYA Auto uses real product screenshots, confirmed registration link and keyboard accessible FAQ", async ({ page }) => {
  await page.goto("/nexya-auto", { waitUntil: "networkidle" });
  const trialLinks = page.getByRole("link", { name: "Testar grátis por 7 dias" });
  await expect(trialLinks).toHaveCount(2);
  for (const link of await trialLinks.all()) {
    await expect(link).toHaveAttribute("href", "https://nexyaauto.com/register");
    await expect(link).toHaveAttribute("rel", /noopener/);
  }
  const image = page.getByRole("img", { name: /Interface real da NEXYA Auto/ });
  await expect(image).toBeVisible();
  expect(await image.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0)).toBe(true);
  const question = page.locator("summary").filter({ hasText: "Como funciona o teste gratuito de 7 dias?" });
  await question.scrollIntoViewIfNeeded();
  await question.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Basta criar sua conta no site da NEXYA Auto.", { exact: false })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Basta criar sua conta no site da NEXYA Auto.", { exact: false })).not.toBeVisible();
});

test("a solution enquiry keeps its selected service and ignores unknown query values", async ({ page }) => {
  await page.goto("/solucoes/sistemas", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Conversar sobre meu projeto" }).click();
  await expect(page).toHaveURL(/\/contato\?solucao=sistemas$/);
  await expect(page.getByRole("button", { name: "Preparar conversa" })).toBeEnabled();
  await expect(page.getByLabel(/^Como podemos ajudar/)).toHaveValue("Sistema sob medida");
  await page.goto("/contato?solucao=__proto__", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: "Preparar conversa" })).toBeEnabled();
  await expect(page.getByLabel(/^Como podemos ajudar/)).toHaveValue("");
  await page.goto("/contato?solucao=sites&solucao=sistemas", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: "Preparar conversa" })).toBeEnabled();
  await expect(page.getByLabel(/^Como podemos ajudar/)).toHaveValue("");
});

test("Home, solutions and contact remain readable and navigable with JavaScript disabled", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: testInfo.project.use.baseURL,
    viewport: testInfo.project.use.viewport,
    isMobile: testInfo.project.name === "mobile",
    hasTouch: testInfo.project.name === "mobile",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  try {
    for (const route of ["/", "/solucoes", "/contato"]) {
      await test.step(`No JavaScript: ${route}`, async () => {
        const response = await page.goto(route, { waitUntil: "networkidle" });
        expect(response?.status()).toBe(200);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page.getByRole("main").getByRole("link").first()).toBeVisible();
        await expectNoHorizontalOverflow(page);
      });
    }
    await expect(page.getByRole("button", { name: "Preparar conversa" })).toBeDisabled();
    // Playwright text selectors intentionally skip noscript content; inspect the actual visible node.
    await expect(page.locator("noscript p")).toBeVisible();
    await expect(page.locator("noscript p")).toContainText("Ative o JavaScript para preparar seu briefing");
    await expect(page.getByRole("link", { name: /Conversar pelo WhatsApp/ })).toHaveAttribute("href", "https://wa.me/5541997830046");
    await page.screenshot({ path: testInfo.outputPath("contact-no-javascript.png"), fullPage: true });
    await page.getByRole("link", { name: "Sistemas sob medida", exact: true }).click();
    await expect(page).toHaveURL(/\/solucoes\/sistemas$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  } finally {
    await context.close();
  }
});

test("reduced motion skips the opening and WebGL while preserving the complete experience", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /animação 3D/ })).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("nexya:intro-seen"))).toBeNull();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
  await expect(page.locator('svg[viewBox="0 0 640 640"]').first()).toBeVisible();
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.waitForLoadState("networkidle");
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Vamos construir juntos" })).toBeAttached();
});

test("WebGL initialization failure falls back to static art without losing content or navigation", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    sessionStorage.setItem("nexya:intro-seen", "1");
    window.nexyaBlockedWebglAttempts = 0;
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: function (this: HTMLCanvasElement, contextId: string, ...args: unknown[]) {
        if (contextId.includes("webgl")) {
          window.nexyaBlockedWebglAttempts = (window.nexyaBlockedWebglAttempts ?? 0) + 1;
          return null;
        }
        return Reflect.apply(original, this, [contextId, ...args]);
      },
    });
  });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect.poll(() => page.evaluate(() => window.nexyaBlockedWebglAttempts ?? 0)).toBeGreaterThan(0);
  await expect(page.locator('svg[viewBox="0 0 640 640"]').first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("webgl-fallback.png"), animations: "disabled" });
  await page.getByRole("link", { name: "Explorar soluções", exact: true }).first().click();
  await expect(page).toHaveURL(/#solucoes$/);
});

test("3D scene renders and the visitor can pause its movement", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => sessionStorage.setItem("nexya:intro-seen", "1"));
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("canvas").first()).toBeVisible();
  const pause = page.getByRole("button", { name: "Pausar animação 3D" });
  await expect(pause).toBeVisible();
  await pause.click();
  await expect(page.getByRole("button", { name: "Retomar animação 3D" })).toHaveAttribute("aria-pressed", "true");
  await page.screenshot({ path: testInfo.outputPath("home-3d.png"), animations: "disabled" });
  await page.getByRole("button", { name: "Retomar animação 3D" }).click();
  await expect(page.getByRole("button", { name: "Pausar animação 3D" })).toHaveAttribute("aria-pressed", "false");
});

test("unknown routes show a recoverable 404 page", async ({ page }) => {
  const response = await page.goto("/pagina-inexistente-nexya-test", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("A próxima ideia");
  await page.getByRole("link", { name: "Voltar ao início" }).click();
  await expect(page).toHaveURL(/\/$/);
});

for (const route of accessibilityRoutes) {
  test(`accessibility: ${route} has no serious or critical WCAG violations`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .exclude("nextjs-portal")
      .analyze();
    const serious = results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
    const diagnostics = serious.map(({ id, impact, description, nodes }) => ({ id, impact, description, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) }));
    expect(serious, JSON.stringify(diagnostics, null, 2)).toEqual([]);
  });
}
