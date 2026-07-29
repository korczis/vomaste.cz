// Visual validation of the deployed site on the custom domain.
// Two passes:
//   1. strict TLS  — reproduces what a real browser does today (cert mismatch)
//   2. lenient TLS — renders the site anyway, proving the content/deploy is sound
//                    and that only the edge certificate name is wrong
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = process.argv[2];
const BASE = process.argv[3] ?? 'https://vomaste.cz';
const ROUTES = [
  ['home', '/'],
  ['dossiers', '/dossiers/'],
  ['macinka', '/dossiers/petr-macinka/'],
  ['turek', '/dossiers/filip-turek/'],
  ['aggregate', '/dossiers/macinka-turek/'],
];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();

// --- pass 1: strict TLS, what a visitor sees right now -----------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  try {
    const res = await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    console.log(`strict-tls: LOADED status=${res?.status()}`);
  } catch (err) {
    console.log(`strict-tls: BLOCKED ${err.message.split('\n')[0]}`);
  }
  await page.screenshot({ path: `${OUT}/00-strict-tls.png` });
  await ctx.close();
}

// --- pass 2: ignore cert name mismatch, validate the actual site -------------
const ctx = await browser.newContext({
  ignoreHTTPSErrors: true,
  viewport: { width: 1440, height: 900 },
});
const consoleErrors = [];
const failedRequests = [];
ctx.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200));
});
ctx.on('requestfailed', (r) => failedRequests.push(`${r.failure()?.errorText} ${r.url()}`));

const page = await ctx.newPage();
page.on('response', (r) => {
  if (r.status() >= 400) failedRequests.push(`HTTP ${r.status()} ${r.url()}`);
});

for (const [name, route] of ROUTES) {
  const res = await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 });
  const title = await page.title();
  const h1 = (await page.locator('h1').first().textContent().catch(() => null))?.trim();
  // Tailwind actually applied? (unstyled page = CSS 404 = base_url mismatch)
  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const canonical = await page
    .locator('link[rel=canonical]')
    .getAttribute('href')
    .catch(() => null);
  const navLinks = await page.locator('nav a, aside a').count();
  console.log(
    `${name.padEnd(10)} ${res?.status()} bg=${bodyBg} nav=${navLinks} canonical=${canonical}\n` +
      `           title="${title}"\n           h1="${h1}"`,
  );
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
}

// mobile viewport on the home page — the Flowbite drawer is off-canvas there
const mobile = await ctx.newPage();
await mobile.setViewportSize({ width: 390, height: 844 });
await mobile.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 });
await mobile.screenshot({ path: `${OUT}/home-mobile.png` });

console.log(`\nconsole errors (${consoleErrors.length}):`);
consoleErrors.slice(0, 10).forEach((e) => console.log('  ' + e));
console.log(`failed/4xx requests (${failedRequests.length}):`);
[...new Set(failedRequests)].slice(0, 10).forEach((e) => console.log('  ' + e));

await browser.close();
