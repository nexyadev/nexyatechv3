import { chromium } from 'file:///C:/Users/ledinelson/Desktop/nexya-tech/node_modules/@playwright/test/index.mjs';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'msedge' });
const shots = [['desktop', { width: 1440, height: 900 }, 2, ['/dashboard', '/service-orders', '/budgets']], ['mobile', { width: 390, height: 844 }, 3, ['/dashboard', '/service-orders']]];
for (const [kind, viewport, dpr, routes] of shots) {
  const ctx = await b.newContext({ viewport, deviceScaleFactor: dpr, isMobile: kind === 'mobile', hasTouch: kind === 'mobile' });
  await ctx.addCookies([{ name: 'nexya_session', value: 'demo', domain: '127.0.0.1', path: '/' }]);
  const p = await ctx.newPage();
  for (const r of routes) {
    await p.goto('http://127.0.0.1:3340' + r, { waitUntil: 'networkidle' });
    await p.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${out}/${kind}${r.replace('/', '-')}.png` });
  }
  await ctx.close();
}
await b.close();
