import { expect, test, type Page } from "@playwright/test";

/** Rotas equivalentes nos 3 idiomas (pt-BR sem prefixo, pt-PT em /pt-pt, en com slugs em inglês). */
const routes: Record<"pt-BR" | "pt-PT" | "en", string[]> = {
  "pt-BR": ["/", "/solucoes", "/solucoes/sistemas", "/solucoes/automacoes", "/solucoes/sites", "/solucoes/integracoes", "/nexya-auto", "/projetos", "/projetos/nexya-auto", "/projetos/garagem-mendes", "/projetos/dra-camila-bioclass", "/projetos/enrico", "/projetos/site-nexya-tech", "/sobre", "/processo", "/contato", "/privacidade"],
  "pt-PT": ["/pt-pt", "/pt-pt/solucoes", "/pt-pt/solucoes/sistemas", "/pt-pt/solucoes/automacoes", "/pt-pt/solucoes/sites", "/pt-pt/solucoes/integracoes", "/pt-pt/nexya-auto", "/pt-pt/projetos", "/pt-pt/projetos/nexya-auto", "/pt-pt/projetos/garagem-mendes", "/pt-pt/projetos/dra-camila-bioclass", "/pt-pt/projetos/enrico", "/pt-pt/projetos/site-nexya-tech", "/pt-pt/sobre", "/pt-pt/processo", "/pt-pt/contato", "/pt-pt/privacidade"],
  en: ["/en", "/en/solutions", "/en/solutions/systems", "/en/solutions/automation", "/en/solutions/websites", "/en/solutions/integrations", "/en/nexya-auto", "/en/projects", "/en/projects/nexya-auto", "/en/projects/garagem-mendes", "/en/projects/dra-camila-bioclass", "/en/projects/enrico", "/en/projects/site-nexya-tech", "/en/about", "/en/process", "/en/contact", "/en/privacy"],
};
const htmlLang = { "pt-BR": "pt-BR", "pt-PT": "pt-PT", en: "en" } as const;

/** Tudo que o visitante vê ou que tecnologias assistivas leem: texto renderizado, atributos e metadados. */
async function visibleStrings(page: Page) {
  return page.evaluate(() => {
    const out: string[] = [document.title, document.body.innerText];
    for (const el of document.querySelectorAll("*")) {
      for (const attr of ["alt", "aria-label", "title", "placeholder", "content", "value", "aria-description"]) {
        const v = el.getAttribute(attr);
        if (v) out.push(v);
      }
    }
    for (const a of document.querySelectorAll<HTMLAnchorElement>("a[href*='wa.me']")) out.push(new URL(a.href).searchParams.get("text") ?? "");
    for (const s of document.querySelectorAll('script[type="application/ld+json"]')) out.push(s.textContent ?? "");
    return out;
  });
}

// Extended_Pictographic cobre emoji, bandeiras, carinhas, mãos, (c), (r) etc. + os símbolos que viram emoji no celular.
const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}←-⇿✓-✘★☆✦➜➔▶▸◀️]/u;

for (const [locale, list] of Object.entries(routes)) {
  test(`anti-emoji: no pictographic characters on any ${locale} page (text, attributes, metadata, WhatsApp)`, async ({ page }) => {
    for (const route of list) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const offenders = (await visibleStrings(page)).flatMap((s) => [...s.matchAll(new RegExp(EMOJI.source, "gu"))].map((m) => `${JSON.stringify(m[0])} in "${s.slice(Math.max(0, m.index - 30), m.index + 30)}"`));
      expect(offenders, route).toEqual([]);
    }
  });
}

test("each locale renders the right <html lang>, self canonical and hreflang for all three versions + x-default", async ({ page }) => {
  for (const index of [0, 2, 7, 15]) {
    for (const locale of ["pt-BR", "pt-PT", "en"] as const) {
      const route = routes[locale][index];
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveAttribute("lang", htmlLang[locale]);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(new URL(canonical!).pathname.replace(/\/$/, "") || "/", route).toBe(route);
      for (const [l, list] of Object.entries(routes)) {
        const href = await page.locator(`link[rel="alternate"][hreflang="${l}"]`).getAttribute("href");
        expect(new URL(href!).pathname.replace(/\/$/, "") || "/", `${route} -> ${l}`).toBe(list[index]);
      }
      const xDefault = await page.locator('link[rel="alternate"][hreflang="x-default"]').getAttribute("href");
      expect(new URL(xDefault!).pathname.replace(/\/$/, "") || "/").toBe(routes["pt-BR"][index]);
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", { "pt-BR": "pt_BR", "pt-PT": "pt_PT", en: "en_US" }[locale]);
    }
  }
});

test("wrong-language slugs and the /pt-BR prefix redirect permanently (301) to the canonical URL", async ({ request }) => {
  for (const [from, to] of [["/en/solucoes", "/en/solutions"], ["/en/contato", "/en/contact"], ["/pt-BR/contato", "/contato"]]) {
    const response = await request.get(from, { maxRedirects: 0 });
    expect(response.status(), from).toBe(301);
    expect(new URL(response.headers().location, "http://x").pathname, from).toBe(to);
  }
});

test("the sitemap lists every page in the three languages with alternates", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const list of Object.values(routes)) for (const route of list) expect(xml, route).toContain(`${route === "/" ? "" : route}</loc>`);
  expect(xml).toContain('hreflang="x-default"');
});

test("language switcher keeps the equivalent route and scroll, opens an accessible menu and stores nx_lang only after the click", async ({ page, context }, testInfo) => {
  await page.goto("/solucoes/sistemas", { waitUntil: "networkidle" });
  expect((await context.cookies()).find((c) => c.name === "nx_lang")).toBeUndefined();
  await page.evaluate(() => window.scrollTo(0, 600));
  const scope = testInfo.project.name === "mobile" ? page.locator(".mobile-lang") : page.locator(".header-lang");
  if (testInfo.project.name === "mobile") await page.getByRole("button", { name: "Abrir menu" }).click();
  const button = scope.getByRole("button", { name: /^Idioma:/ });
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await button.focus();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("menu", { name: "Escolher idioma" });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitemradio")).toHaveText(["Português (Brasil)", "Português (Portugal)", "English"]);
  await expect(menu.getByRole("menuitemradio", { name: "Português (Brasil)" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(button).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("End");
  await expect(menu.getByRole("menuitemradio", { name: "English" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/en\/solutions\/systems$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  if (testInfo.project.name === "desktop") expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
  expect((await context.cookies()).find((c) => c.name === "nx_lang")?.value).toBe("en");
  // Rodapé: links reais para a mesma página nos outros idiomas.
  await expect(page.getByRole("navigation", { name: "Language" }).getByRole("link", { name: "Português (Portugal)" })).toHaveAttribute("href", "/pt-pt/solucoes/sistemas");
});

test("no Portuguese text leaks into /en pages", async ({ page }) => {
  const stripNonCopy = (s: string) => s.replace(/https?:\/\/\S+/g, "").replace(/\S+@\S+/g, "");
  const portuguese = /[çãõâêôáéíóú]|\b(você|não|para|com|uma|seu|sua|nosso|nossa|página|projeto|orçamento|clientes|oficina)\b/i;
  const allowed = /Garagem Mendes|Dra\. Camila|Camila Ribeiro|Enrico Rocha Miascovsky|Miascovsky|Português \((Brasil|Portugal)\)|BIOCLASS|Bioclass|Curitiba/g;
  for (const route of routes.en) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const strings = (await visibleStrings(page)).map((s) => stripNonCopy(s).replace(allowed, ""));
    const hits = strings.flatMap((s) => s.split(/\n+/)).filter((line) => portuguese.test(line));
    expect(hits, route).toEqual([]);
  }
});

test("pt-PT pages use the European Portuguese glossary terms (no pt-BR leaks)", async ({ page }) => {
  const stripUrls = (s: string) => s.replace(/https?:\/\/\S+/g, "");
  const brOnly = /\b(tela|telas|celular|equipe|contato|usuário|arquivo|você|vocês|conosco|agendar reunião|planejamento|escopo|cadastro)\b/i;
  for (const route of routes["pt-PT"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const hits = (await visibleStrings(page)).map(stripUrls).flatMap((s) => s.split(/\n+/)).filter((line) => brOnly.test(line));
    expect(hits, route).toEqual([]);
  }
});

test("WhatsApp links carry a prefilled message in the page language", async ({ page }) => {
  for (const [route, greeting] of [["/", /^Olá! Quero conversar/], ["/pt-pt", /^Olá! Gostaria de falar/], ["/en", /^Hi! I'd like to talk/], ["/en/projects", /^Hi, NEXYA!/], ["/pt-pt/projetos/nexya-auto", /^Olá, NEXYA! Tenho uma oficina e gostaria/]] as const) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const texts = await page.locator("a[href*='wa.me']").evaluateAll((as) => as.map((a) => new URL((a as HTMLAnchorElement).href).searchParams.get("text") ?? ""));
    expect(texts.length, route).toBeGreaterThan(0);
    expect(texts.some((t) => greeting.test(t)), `${route}: ${texts.join(" | ")}`).toBe(true);
  }
});

test("contact form errors and prepared message follow the page language", async ({ page }) => {
  await page.goto("/en/contact", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Prepare message" }).click();
  await expect(page.getByText("Please enter your name, at least 2 characters.")).toBeVisible();
  await page.getByLabel(/^Your name/).fill("Ana Test");
  await page.getByLabel(/^Email/).fill("ana@example.com");
  await page.getByLabel(/^How can we help/).selectOption("site");
  await page.getByLabel(/^Your project/).fill("I want to organize my company processes better.");
  await page.getByLabel(/I agree to share/).check();
  await page.getByRole("button", { name: "Prepare message" }).click();
  await expect(page.getByLabel("Message to NEXYA")).toHaveValue(/^Hi, NEXYA![\s\S]*Interest: Website or digital experience/);
});

for (const width of [360, 768, 1440]) {
  test(`layout holds at ${width}px in the three languages (no horizontal scroll)`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    for (const list of Object.values(routes)) {
      for (const route of [list[0], list[1], list[2], list[6], list[7], list[9], list[15], list[16]]) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        const { doc, view } = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, view: document.documentElement.clientWidth }));
        expect(doc, `${route} @ ${width}`).toBeLessThanOrEqual(view + 1);
      }
    }
    await context.close();
  });
}

test("Home: the Projects & possibilities section is gone and nothing points to it", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#projetos")).toHaveCount(0);
  await expect(page.getByText(/PROJETOS & POSSIBILIDADES/i)).toHaveCount(0);
  await expect(page.locator('a[href$="#projetos"]')).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Ver projetos/ }).first()).toHaveAttribute("href", "/projetos");
  await expect(page.locator('nav.desktop-nav a[href="/projetos"]')).toBeAttached();
  // O gancho antes da antiga seção agora leva à próxima (Processo).
  await expect(page.locator("#produto .product-bottomline a")).toHaveAttribute("href", "#processo");
});

test("command palette: Ctrl+K opens an accessible dialog, filters, runs and returns focus", async ({ page }, testInfo) => {
  await page.goto("/", { waitUntil: "networkidle" });
  // No celular a busca fica no menu: abre o menu antes (o atalho Ctrl+K continua valendo com teclado físico).
  if (testInfo.project.name === "mobile") await page.getByRole("button", { name: "Abrir menu" }).click();
  const trigger = testInfo.project.name === "mobile" ? page.locator("#mobile-menu").getByRole("button", { name: "Buscar" }) : page.getByRole("button", { name: /Abrir busca/ });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Buscar no site" });
  await expect(dialog).toBeVisible();
  const input = dialog.getByRole("combobox");
  await expect(input).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Fechar busca" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(input).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  if (testInfo.project.name !== "mobile") await expect(trigger).toBeFocused();
  await page.keyboard.press("Control+k");
  await expect(dialog).toBeVisible();
  await input.fill("english");
  await expect(dialog.getByRole("option")).toHaveText(["English"]);
  await input.fill("proj");
  await expect(input).toHaveAttribute("aria-activedescendant", /opt-0$/);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/projetos$/);
  await expect(dialog).toBeHidden();
});

test("page transition never blocks navigation or focus and the silk veil ignores the pointer", async ({ page }, testInfo) => {
  await page.goto("/", { waitUntil: "networkidle" });
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await page.locator("#mobile-menu").getByRole("link", { name: /Soluções/ }).click();
  } else await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Soluções" }).click();
  await expect(page).toHaveURL(/\/solucoes$/);
  await expect(page.locator(".silk-veil")).toHaveCSS("pointer-events", "none");
  await expect(page.locator(".silk-veil")).toHaveAttribute("aria-hidden", "true");
  // Já é possível clicar e focar durante a transição.
  await page.getByRole("link", { name: /Sistemas sob medida/ }).first().focus();
  await expect(page.getByRole("link", { name: /Sistemas sob medida/ }).first()).toBeFocused();
});

// A configuração global liga reducedMotion; os módulos de movimento precisam do modo normal para serem exercitados.
test.describe("motion enabled", () => {
test.use({ reducedMotion: "no-preference" });
test("smart cursor and reactive hero title: desktop only, decorative, no layout shift", async ({ page }, testInfo) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const cursor = page.locator(".smart-cursor");
  await expect(cursor).toHaveAttribute("aria-hidden", "true");
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveAccessibleName("Sites, landing pages e sistemas com padrão de marca grande.");
  if (testInfo.project.name === "mobile") { await expect(cursor).toBeHidden(); return; }
  const before = await h1.boundingBox();
  const box = before!;
  await page.mouse.move(box.x + box.width * .3, box.y + box.height * .5, { steps: 8 });
  await page.waitForTimeout(500);
  await expect(cursor).toHaveAttribute("data-visible", "true");
  const after = await h1.boundingBox();
  expect(Math.abs(after!.height - box.height)).toBeLessThan(1);
  expect(Math.abs(after!.width - box.width)).toBeLessThan(1);
  const weights = await page.locator(".hero-letter").evaluateAll((ls) => ls.map((l) => getComputedStyle(l).fontVariationSettings));
  expect(weights.some((w) => /"wght" (3[2-9]\d|4\d\d|500)/.test(w))).toBe(true);
  // Sobre o mockup de um case, o ponto vira a pílula "Ver case".
  await page.goto("/projetos", { waitUntil: "networkidle" });
  const mockup = page.locator("section#nexya-auto [data-cursor='view']");
  await mockup.scrollIntoViewIfNeeded();
  const mb = (await mockup.boundingBox())!;
  await page.mouse.move(mb.x + mb.width / 2, mb.y + mb.height / 2, { steps: 5 });
  await expect(cursor).toHaveAttribute("data-state", "pill");
  await expect(cursor).toContainText("Ver case");
});
});

test("reduced motion: no cursor, static title, short fade instead of the silk veil", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".smart-cursor")).toBeHidden();
  await page.mouse.move(300, 400);
  await page.waitForTimeout(300);
  const weights = await page.locator(".hero-letter").evaluateAll((ls) => [...new Set(ls.map((l) => getComputedStyle(l).fontVariationSettings))]);
  expect(weights).toEqual(['"wght" 300']);
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Projetos" }).click();
  await expect(page).toHaveURL(/\/projetos$/);
  await expect(page.locator(".silk-veil")).toHaveAttribute("data-active", "false");
  await context.close();
});
