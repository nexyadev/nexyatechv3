import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

declare global {
  interface Window { nexyaBlockedWebglAttempts?: number }
}

const routes = [
  "/", "/solucoes", "/solucoes/sistemas", "/solucoes/automacoes", "/solucoes/sites", "/solucoes/integracoes",
  "/nexya-auto", "/projetos", "/projetos/nexya-auto", "/projetos/garagem-mendes", "/projetos/dra-camila-bioclass", "/projetos/enrico", "/projetos/site-nexya-tech",
  "/sobre", "/processo", "/contato", "/privacidade",
] as const;

const accessibilityRoutes = ["/", "/solucoes", "/solucoes/sistemas", "/nexya-auto", "/projetos", "/projetos/nexya-auto", "/sobre", "/processo", "/contato", "/privacidade"] as const;

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
  // A variante de logo do outro tema fica oculta (display: none) e nunca carrega; só as visíveis contam.
  for (const image of await page.locator("main img:visible").all()) {
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
  await page.getByRole("navigation", { name: "Navegação móvel" }).getByRole("link", { name: /Soluções/ }).click();
  await expect(page).toHaveURL(/\/solucoes$/);
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
  const image = page.getByRole("img", { name: /conta de demonstração, com dados fictícios/ }).first();
  await image.scrollIntoViewIfNeeded();
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute("src", /images%2Fdemo%2F|\/images\/demo\//);
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
  await expect(page.getByLabel(/^Como podemos ajudar/)).toHaveValue("sistema");
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
    await expect(page.getByRole("link", { name: /Conversar pelo WhatsApp/ })).toHaveAttribute("href", /^https:\/\/wa\.me\/5541997830046(\?text=.+)?$/);
    await page.screenshot({ path: testInfo.outputPath("contact-no-javascript.png"), fullPage: true });
    await page.getByRole("link", { name: "Sistemas sob medida", exact: true }).click();
    await expect(page).toHaveURL(/\/solucoes\/sistemas$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  } finally {
    await context.close();
  }
});

test("reduced motion skips the opening and keeps the complete experience (silk only as a slow drift)", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await expect(page.getByTestId("satin-still")).toBeAttached();
  await expect(page.locator(".nx-logo")).toHaveAttribute("data-intro", "done");
  await expect(page.getByRole("img", { name: /NEXYA — Tecnologia/ }).first()).toBeVisible();
  // Duas versões da logo (claro/escuro); só a do tema atual fica visível.
  await expect(page.locator(".nx-logo img:visible")).toHaveJSProperty("complete", true);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sites, landing pages e sistemas com padrão de marca grande.");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.waitForLoadState("networkidle");
  expect(await page.locator("canvas").count()).toBeLessThanOrEqual(1);
  await expect(page.getByRole("link", { name: "Vamos construir juntos" })).toBeAttached();
});

test("title and calls to action are visible on the first frame while the logo opening runs", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "commit" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /Pedir orçamento no WhatsApp/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Ver projetos/ }).first()).toBeVisible();
  await expect(page.locator(".nx-logo")).toHaveAttribute("data-intro", "done", { timeout: 4000 });
  expect(await page.evaluate(() => sessionStorage.getItem("nx:intro-seen"))).toBe("1");
});

test("WebGL initialization failure falls back to the static satin image without losing content or navigation", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    sessionStorage.setItem("nx:intro-seen", "1");
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
  await page.mouse.move(200, 200);
  await expect.poll(() => page.evaluate(() => window.nexyaBlockedWebglAttempts ?? 0)).toBeGreaterThan(0);
  await expect(page.locator(".satin")).toHaveAttribute("data-state", "static");
  await expect(page.getByTestId("satin-still")).toBeAttached();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("webgl-fallback.png"), animations: "disabled" });
  await page.getByRole("link", { name: /Ver projetos/ }).first().click();
  await expect(page).toHaveURL(/\/projetos$/);
});

test("satin background renders behind the content without intercepting clicks", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => sessionStorage.setItem("nx:intro-seen", "1"));
  await page.goto("/", { waitUntil: "networkidle" });
  await page.mouse.move(400, 300);
  await expect(page.locator(".satin")).toHaveAttribute("data-state", "live");
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator(".satin")).toHaveCSS("pointer-events", "none");
  await page.screenshot({ path: testInfo.outputPath("home-satin.png"), animations: "disabled" });
  await page.mouse.wheel(0, 600);
  await expect(page.locator(".site-header")).toHaveAttribute("data-scrolled", "true");
});

test("projects without link and authorization are not published", async ({ page }) => {
  for (const slug of ["ang", "veia-criativa"]) {
    const response = await page.goto(`/projetos/${slug}`);
    expect(response?.status(), slug).toBe(404);
  }
  await page.goto("/projetos", { waitUntil: "networkidle" });
  await expect(page.getByText(/em preparação|em breve|Veia Criativa|\bANG\b/i)).toHaveCount(0);
});

test("/portfolio redirects with 301 to /projetos, keeping the slug", async ({ request }) => {
  for (const [from, to] of [["/portfolio", "/projetos"], ["/portfolio/nexya-auto", "/projetos/nexya-auto"]]) {
    const response = await request.get(from, { maxRedirects: 0 });
    expect(response.status(), from).toBe(301);
    expect(response.headers().location, from).toBe(to);
  }
});

test("/projetos shows the five authorized cases in order, with external links, no iframes and the final WhatsApp card", async ({ page }, testInfo) => {
  await page.goto("/projetos", { waitUntil: "networkidle" });
  await expect(page.getByText("Projetos / Selecionados")).toBeVisible();
  const order = ["nexya-auto", "garagem-mendes", "dra-camila-bioclass", "enrico", "site-nexya-tech"];
  expect(await page.locator("#cases > div > section[id]").evaluateAll((els) => els.map((el) => el.id))).toEqual(order);
  await expect(page.getByRole("navigation", { name: "Índice dos cases" }).getByRole("link")).toHaveCount(5);
  for (const slug of order) {
    const section = page.locator(`section#${slug}`);
    await expect(section.getByRole("link", { name: /Ver case/ })).toHaveAttribute("href", `/projetos/${slug}`);
    await expect(section.locator('a[tabindex="-1"][aria-hidden="true"]')).toHaveAttribute("href", `/projetos/${slug}`);
    // Textos de "Desafio/O que construímos" só aparecem depois da aprovação.
    await expect(section.getByText("Desafio", { exact: true })).toHaveCount(0);
  }
  for (const [slug, url] of [["garagem-mendes", "https://garagemmendes.com.br/"], ["dra-camila-bioclass", "https://www.dracamilabioclass.com/"], ["enrico", "https://nexyadev.github.io/enrico/"]]) {
    const link = page.locator(`section#${slug}`).getByRole("link", { name: /Ver site/ });
    await expect(link).toHaveAttribute("href", url);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
  await expect(page.locator("section#enrico").getByText("Protótipo")).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.locator("section#nexya-auto").getByRole("list", { name: "Stack" }).getByRole("listitem")).toHaveText(["TypeScript", "React", "Next.js", "Tailwind CSS", "Node.js", "Prisma", "PostgreSQL"]);
  await expect(page.getByRole("heading", { name: "O próximo case pode ser o da sua empresa." })).toBeAttached();
  await expect(page.getByRole("link", { name: /Conversar no WhatsApp/ })).toHaveAttribute("href", /^https:\/\/wa\.me\/\d+\?text=/);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("projetos.png"), fullPage: true, animations: "disabled" });
});

test("marquees (animated): loop clones are inert and hidden, the real links and stack names stay accessible", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "no-preference", viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto("/projetos", { waitUntil: "networkidle" });
  const band = page.getByRole("region", { name: "Projetos em destaque" });
  // Só a sequência real é acessível; o clone do laço (e repetições) ficam aria-hidden + inert.
  await expect(band.getByRole("link")).toHaveCount(5);
  expect(await band.locator('[aria-hidden="true"][inert]').count()).toBeGreaterThanOrEqual(1);
  const stack = page.getByRole("region", { name: "Tecnologias usadas nestes projetos" });
  for (const name of ["TypeScript", "PostgreSQL", "HTML", "Three.js", "Playwright"]) await expect(stack.locator("[data-seq]").getByText(name, { exact: true })).toHaveCount(1);
  await band.getByRole("link").first().focus();
  await expect(band.getByRole("link").first()).toBeFocused();
  await context.close();
});

test("reduced motion: marquees keep moving slowly with inert clones, videos stay on the poster", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/projetos", { waitUntil: "networkidle" });
  const band = page.getByRole("region", { name: "Projetos em destaque" });
  await expect(band.locator("[data-track]")).toHaveCount(1);
  await expect(band.getByRole("link")).toHaveCount(5);
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(600);
  expect(await page.locator("video").evaluateAll((vs) => vs.filter((v) => !(v as HTMLVideoElement).paused).length)).toBe(0);
  await context.close();
});

test("at most two case videos play at the same time and none preload", async ({ page }) => {
  await page.goto("/projetos", { waitUntil: "networkidle" });
  for (const video of await page.locator("video").all()) await expect(video).toHaveAttribute("preload", "none");
  let maxPlaying = 0;
  for (let y = 0; y < 14; y++) {
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(250);
    maxPlaying = Math.max(maxPlaying, await page.locator("video").evaluateAll((vs) => vs.filter((v) => !(v as HTMLVideoElement).paused).length));
  }
  expect(maxPlaying).toBeLessThanOrEqual(2);
});

test("every case page has its own H1, canonical and sitemap entry", async ({ page, request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const [slug, title] of [["nexya-auto", "NEXYA Auto"], ["garagem-mendes", "Garagem Mendes"], ["dra-camila-bioclass", "Dra. Camila Bioclass"], ["enrico", "En.r.ico"], ["site-nexya-tech", "Site NEXYA Tech"]]) {
    await page.goto(`/projetos/${slug}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page).toHaveTitle(new RegExp(title.replace(/[.]/g, "\.")));
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/projetos/${slug}$`));
    await expect(page.locator("iframe")).toHaveCount(0);
    expect(sitemap, slug).toContain(`/projetos/${slug}`);
  }
});

test("NEXYA Auto images never show real customer data (only the demo account)", async ({ page }) => {
  for (const route of ["/", "/nexya-auto", "/projetos", "/projetos/nexya-auto"]) {
    await page.goto(route, { waitUntil: "networkidle" });
    const sources = await page.locator("img").evaluateAll((imgs) => imgs.map((img) => decodeURIComponent((img as HTMLImageElement).currentSrc || img.getAttribute("src") || "")));
    for (const src of sources.filter((value) => /nexya-auto/.test(value))) expect(src, route).toMatch(/\/images\/demo\//);
    expect(sources.join(" "), route).not.toMatch(/nexya-auto-dashboard|nexya-auto-service-order/);
  }
});

test("case page for NEXYA Auto: demo CTA, trial link, features and a disabled video placeholder", async ({ page }) => {
  await page.goto("/projetos/nexya-auto", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1, name: "NEXYA Auto" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Pedir demonstração/ }).first()).toHaveAttribute("href", /^https:\/\/wa\.me\/\d+\?text=.*demonstra/);
  await expect(page.getByRole("link", { name: /Testar grátis por 7 dias/ })).toHaveAttribute("href", "https://nexyaauto.com/register");
  await expect(page.getByRole("heading", { level: 3 })).toHaveCount(9);
  await expect(page.getByRole("button", { name: "Reproduzir vídeo" })).toBeDisabled();
  await expect(page.getByText("Vídeo em breve")).toBeAttached();
  await expect(page.locator("video")).toHaveCount(0);
});

test("process steps are not links and have no arrows; solution cards are a single link each", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const steps = page.locator(".home-process-list li");
  await expect(steps).toHaveCount(4);
  await expect(steps.locator("a")).toHaveCount(0);
  await expect(steps).not.toContainText(["↗"]);
  const cards = page.locator(".solutions-grid a.solution-card");
  await expect(cards).toHaveCount(4);
  await expect(page.locator(".solutions-grid")).not.toContainText("Explorar solução");
  for (const card of await cards.all()) await expect(card.locator("a")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Todas as soluções/ })).toBeVisible();
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

test("main menu links to pages (no anchors), marks the active page and is reachable by keyboard", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Desktop navigation is hidden below the breakpoint; the mobile menu has its own test.");
  await page.goto("/solucoes/sistemas", { waitUntil: "networkidle" });
  const nav = page.getByRole("navigation", { name: "Navegação principal" });
  const links = nav.getByRole("link");
  await expect(links).toHaveText(["Home", "Soluções", "Projetos", "NEXYA Auto", "Contato"]);
  for (const href of await links.evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""))) expect(href).not.toContain("#");
  await expect(nav.getByRole("link", { name: "Soluções" })).toHaveAttribute("aria-current", "page");
  await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
  const first = links.first();
  for (let i = 0; i < 12 && !(await first.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/solucoes$/);
});
