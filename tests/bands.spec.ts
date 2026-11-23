import { expect, test, type Browser, type Page } from "@playwright/test";

/**
 * Prova de movimento das faixas (projetos e Stack) e das fitas WebGL.
 * Contextos próprios em 390, 768, 1440 e 1920, com reducedMotion "no-preference" e "reduce".
 * (Roda só no projeto "desktop" da config; os contextos já cobrem as larguras.)
 */
const widths = [390, 768, 1440, 1920] as const;
const motions = ["no-preference", "reduce"] as const;
const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

async function open(browser: Browser, width: number, motion: (typeof motions)[number], js = true) {
  const mobile = width < 900;
  const ctx = await browser.newContext({ baseURL: base, viewport: { width, height: 900 }, isMobile: mobile, hasTouch: mobile, reducedMotion: motion, colorScheme: "light", locale: "pt-BR", javaScriptEnabled: js });
  const page = await ctx.newPage();
  if (js) await page.addInitScript(() => sessionStorage.setItem("nx:intro-seen", "1"));
  return { ctx, page };
}

const bands = (page: Page) => page.locator("[data-marquee]");

/** transform de cada trilho, largura do trilho e se cada linha tem todos os itens no mesmo offsetTop. */
const measure = (page: Page, i: number) => bands(page).nth(i).evaluate((root) => {
  const tracks = [...root.querySelectorAll<HTMLElement>("[data-track]")];
  return tracks.map((t) => {
    const items = [...t.querySelectorAll<HTMLElement>("[data-seq] > *")];
    const pills = [...t.querySelectorAll<HTMLElement>("[data-seq] > * , [data-seq] > * > *")].filter((el) => el.matches("span"));
    return {
      transform: getComputedStyle(t).transform,
      trackWidth: t.scrollWidth,
      oneLine: new Set(items.map((el) => el.offsetTop)).size === 1,
      fullWidthPill: pills.some((el) => el.offsetWidth >= innerWidth - 2),
      duration: Number(t.getAnimations()[0]?.effect?.getTiming().duration ?? 0),
    };
  });
});

for (const motion of motions) {
  for (const width of widths) {
    test(`bands move sideways (${motion}, ${width}px)`, async ({ browser }) => {
      const { ctx, page } = await open(browser, width, motion);
      await page.goto("/projetos", { waitUntil: "networkidle" });
      await expect(bands(page)).toHaveCount(2);
      for (let i = 0; i < 2; i++) {
        await bands(page).nth(i).scrollIntoViewIfNeeded();
        await page.mouse.move(1, 1);
        const t0 = await measure(page, i);
        await page.waitForTimeout(1500);
        const t1 = await measure(page, i);
        expect(t0.length, "linhas da faixa").toBe(i === 0 ? 1 : 2);   // projetos: 1 linha; Stack: 2 linhas opostas
        t0.forEach((row, r) => {
          expect(row.transform, `faixa ${i} linha ${r} parada`).not.toBe(t1[r].transform);
          expect(row.trackWidth, "trilho mais largo que a tela").toBeGreaterThan(width);
          expect(row.oneLine, "itens na mesma linha").toBe(true);
          expect(row.fullWidthPill, "pílula de largura total").toBe(false);
        });
        if (motion === "reduce") {
          // ~2,5x mais lenta que no modo completo (duração declarada no CSS).
          const full = await page.evaluate((n) => {
            const el = document.querySelectorAll("[data-marquee]")[n] as HTMLElement;
            return parseFloat(getComputedStyle(el).getPropertyValue("--dur")) * 1000;
          }, i);
          expect(t0[0].duration).toBeCloseTo(full * 2.5, -1);
        }
      }
      await ctx.close();
    });
  }
}

test("reduce: Pause makes a single static scrollable row without duplicates, remembered after reload; Resume restarts", async ({ browser }) => {
  for (const width of widths) {
    const { ctx, page } = await open(browser, width, "reduce");
    await page.goto("/projetos", { waitUntil: "networkidle" });
    expect(await page.evaluate(() => localStorage.getItem("nx-bands")), "nada salvo antes do clique").toBeNull();
    const stack = bands(page).nth(1);
    await stack.scrollIntoViewIfNeeded();
    const btn = stack.getByRole("button", { name: "Pausar faixas" });
    const box = (await btn.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await expect(btn).toHaveAttribute("aria-pressed", "false");
    await btn.click();
    await expect(stack.getByRole("button", { name: "Retomar faixas" })).toHaveAttribute("aria-pressed", "true");
    for (let i = 0; i < 2; i++) {
      const state = () => bands(page).nth(i).evaluate((root) => {
        const vp = root.querySelector<HTMLElement>("[data-viewport]")!;
        const visible = [...root.querySelectorAll<HTMLElement>("[data-seq] > *")].filter((el) => el.offsetParent !== null);
        return {
          transforms: [...root.querySelectorAll<HTMLElement>("[data-track]")].map((t) => getComputedStyle(t).transform).join("|"),
          clonesVisible: [...root.querySelectorAll<HTMLElement>("[data-clone]")].filter((el) => getComputedStyle(el).display !== "none").length,
          tops: new Set(visible.map((el) => Math.round(el.getBoundingClientRect().top))).size,
          texts: visible.map((el) => el.textContent?.trim()),
          overflowX: getComputedStyle(vp).overflowX, snap: getComputedStyle(vp).scrollSnapType,
          scrollable: vp.scrollWidth > vp.clientWidth,
        };
      });
      const a = await state();
      await page.waitForTimeout(1200);
      const b = await state();
      expect(a.transforms, "parada").toBe(b.transforms);
      expect(a.clonesVisible, "sem clones visíveis").toBe(0);
      expect(a.tops, "uma única linha").toBe(1);
      expect(new Set(a.texts).size, "sem duplicados").toBe(a.texts.length);
      expect(a.overflowX).toBe("auto");
      expect(a.snap).toContain("x");
      if (i === 1 || width < 1440) expect(a.scrollable, `linha rolável em ${width}px`).toBe(true);
    }
    expect(await page.evaluate(() => localStorage.getItem("nx-bands"))).toBe("paused");
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("data-bands", "paused");
    await bands(page).nth(1).getByRole("button", { name: "Retomar faixas" }).click();
    await page.mouse.move(1, 1);
    const t0 = await measure(page, 1);
    await page.waitForTimeout(1500);
    expect((await measure(page, 1))[0].transform, "retomou").not.toBe(t0[0].transform);
    await ctx.close();
  }
});

test("hover and keyboard focus pause the band", async ({ browser }) => {
  const { ctx, page } = await open(browser, 1440, "no-preference");
  await page.goto("/projetos", { waitUntil: "networkidle" });
  const band = bands(page).first();
  await band.scrollIntoViewIfNeeded();
  await band.locator("[data-viewport]").hover();
  await page.waitForTimeout(300);
  const a = await measure(page, 0);
  await page.waitForTimeout(1000);
  expect((await measure(page, 0))[0].transform).toBe(a[0].transform);
  await page.mouse.move(1, 1);
  await band.locator("[data-seq] a").first().focus();
  await page.waitForTimeout(300);
  const c = await measure(page, 0);
  await page.waitForTimeout(1000);
  expect((await measure(page, 0))[0].transform).toBe(c[0].transform);
  await ctx.close();
});

test("without JavaScript the bands still move (pure CSS)", async ({ browser }) => {
  for (const motion of motions) {
    const { ctx, page } = await open(browser, 1440, motion, false);
    await page.goto("/projetos", { waitUntil: "load" });
    for (let i = 0; i < 2; i++) {
      await bands(page).nth(i).scrollIntoViewIfNeeded();
      const a = await measure(page, i);
      await page.waitForTimeout(1500);
      const b = await measure(page, i);
      a.forEach((row, r) => expect(row.transform, `${motion} faixa ${i}`).not.toBe(b[r].transform));
    }
    await ctx.close();
  }
});

test("scroll enhancement: scrolling up reverses the projects band (full motion only)", async ({ browser }) => {
  const { ctx, page } = await open(browser, 1440, "no-preference");
  await page.goto("/projetos", { waitUntil: "networkidle" });
  const rate = () => page.evaluate(() => document.querySelector<HTMLElement>("[data-track]")!.getAnimations()[0].playbackRate);
  await page.mouse.move(1, 1);
  await page.mouse.wheel(0, 600); await page.waitForTimeout(400);
  expect(await rate()).toBeGreaterThan(1);
  await page.mouse.wheel(0, -500); await page.waitForTimeout(900);
  expect(await rate()).toBeLessThan(0);
  await ctx.close();
  const reduced = await open(browser, 1440, "reduce");
  await reduced.page.goto("/projetos", { waitUntil: "networkidle" });
  await reduced.page.mouse.wheel(0, 600); await reduced.page.waitForTimeout(300);
  await reduced.page.mouse.wheel(0, -500); await reduced.page.waitForTimeout(600);
  expect(await reduced.page.evaluate(() => document.querySelector<HTMLElement>("[data-track]")!.getAnimations()[0].playbackRate), "reduce: sem ligação com a rolagem").toBe(1);
  await reduced.ctx.close();
});

for (const motion of motions) {
  for (const width of widths) {
    test(`light ribbons canvas changes over time (${motion}, ${width}px)`, async ({ browser }) => {
      const { ctx, page } = await open(browser, width, motion);
      await page.goto("/", { waitUntil: "networkidle" });
      const canvas = page.locator("canvas.satin-canvas");
      await expect(page.locator(".satin")).toHaveAttribute("data-state", "live", { timeout: 20_000 });
      const a = await canvas.screenshot();
      await page.waitForTimeout(motion === "reduce" ? 2500 : 1200);
      const b = await canvas.screenshot();
      expect(Buffer.compare(a, b), "pixels iguais: fitas paradas").not.toBe(0);
      await ctx.close();
    });
  }
}
