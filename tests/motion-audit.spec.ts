import { expect, test, type Browser } from "@playwright/test";

/**
 * Auditoria de movimento: cada efeito roda em "no-preference" e tem versão suave (ou nenhuma, quando o efeito
 * é parallax/inclinação) em "reduce". Contextos próprios em 1440 (roda só no projeto "desktop").
 */
const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
async function open(browser: Browser, motion: "no-preference" | "reduce") {
  const ctx = await browser.newContext({ baseURL: base, viewport: { width: 1440, height: 900 }, reducedMotion: motion, colorScheme: "light", locale: "pt-BR" });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem("nx:intro-seen", "1"));
  return { ctx, page };
}

for (const motion of ["no-preference", "reduce"] as const) {
  test(`scroll reveals: ${motion === "reduce" ? "short fade, no displacement" : "fade + rise"}`, async ({ browser }) => {
    const { ctx, page } = await open(browser, motion);
    await page.goto("/sobre", { waitUntil: "networkidle" });
    // Amostra um bloco abaixo da dobra enquanto ele entra na tela.
    const samples = await page.evaluate(async () => {
      const el = [...document.querySelectorAll<HTMLElement>("[data-reveal]")].find((r) => r.getBoundingClientRect().top > innerHeight + 50)!;
      const target = el.querySelector<HTMLElement>("[data-reveal-item]") ?? el;
      el.scrollIntoView({ block: "center", behavior: "instant" });
      const out: { o: number; t: string }[] = [];
      const t0 = performance.now();
      while (performance.now() - t0 < 900) {
        const cs = getComputedStyle(target);
        out.push({ o: Number(cs.opacity), t: cs.transform });
        await new Promise((r) => requestAnimationFrame(r));
      }
      return out;
    });
    expect(samples.some((s) => s.o < 1), "houve fade").toBe(true);
    expect(samples.at(-1)!.o).toBe(1);
    const moved = samples.some((s) => s.t !== "none" && !/matrix\(1, 0, 0, 1, 0, 0\)/.test(s.t));
    expect(moved, "deslocamento vertical").toBe(motion === "no-preference");
    await ctx.close();
  });

  test(`process light rail (${motion})`, async ({ browser }) => {
    const { ctx, page } = await open(browser, motion);
    await page.goto("/", { waitUntil: "networkidle" });
    const rail = page.locator(".process-rail");
    await rail.scrollIntoViewIfNeeded();
    await expect(rail).toHaveAttribute("data-ready", "true");
    const lit = () => rail.locator('li[data-lit="true"]').count();
    if (motion === "reduce") {
      // Versão suave: todas as etapas acesas, sem preenchimento ligado à rolagem.
      expect(await lit()).toBe(await rail.locator("li").count());
    } else {
      await page.evaluate(() => document.querySelector(".process-rail")!.scrollIntoView({ block: "end", behavior: "instant" }));
      await page.waitForTimeout(500);
      const p1 = await rail.locator("[data-fill]").evaluate((el) => el.style.getPropertyValue("--p"));
      const l1 = await lit();
      await page.mouse.wheel(0, 500); await page.waitForTimeout(900);
      const p2 = await rail.locator("[data-fill]").evaluate((el) => el.style.getPropertyValue("--p"));
      expect(Number(p2)).toBeGreaterThan(Number(p1));
      expect(await lit()).toBeGreaterThanOrEqual(l1);
    }
    await ctx.close();
  });

  test(`hero mockup tilt follows the pointer only with full motion (${motion})`, async ({ browser }) => {
    const { ctx, page } = await open(browser, motion);
    await page.goto("/", { waitUntil: "networkidle" });
    const stage = page.locator(".devices-stage");
    const t0 = await stage.evaluate((el) => getComputedStyle(el).transform);
    await page.mouse.move(200, 200); await page.mouse.move(1300, 700, { steps: 12 });
    await page.waitForTimeout(700);
    const t1 = await stage.evaluate((el) => getComputedStyle(el).transform);
    if (motion === "reduce") expect(t1).toBe(t0); else expect(t1).not.toBe(t0);
    await ctx.close();
  });

  test(`solution card hover (${motion})`, async ({ browser }) => {
    const { ctx, page } = await open(browser, motion);
    await page.goto("/", { waitUntil: "networkidle" });
    const card = page.locator(".solution-card").first();
    await card.scrollIntoViewIfNeeded();
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + box.width * .85, box.y + box.height * .2, { steps: 6 });
    await page.waitForTimeout(500);
    const state = await card.evaluate((el) => ({ t: getComputedStyle(el).transform, glow: Number(getComputedStyle(el, "::before").opacity) }));
    expect(state.glow, "brilho da borda no hover").toBeGreaterThan(0);
    if (motion === "reduce") expect(state.t, "sem inclinação").toBe("none"); else expect(state.t, "inclina").not.toBe("none");
    await ctx.close();
  });
}
