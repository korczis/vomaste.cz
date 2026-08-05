#!/usr/bin/env node
/*
 * Renders the Open Graph / LinkedIn preview cards into static/images/og/.
 *
 * Run manually after changing the card design or adding a dossier:
 *
 *   npm i --no-save playwright            # into node_modules, NOT into package.json
 *   npx playwright install chromium       # once per machine
 *   node scripts/og/build-og-images.mjs
 *
 * Deliberately NOT part of `npm run build`: it needs a headless browser, which
 * would add ~100 MB and a browser install step to CI for assets that change a
 * few times a year. The rendered JPEGs are committed instead, and every card
 * is reproducible from this file — no design tool, no external service.
 *
 * Cards are data-driven: the site card comes from config.toml, the dossier
 * cards from data/dossiers.toml + each dossier's generated stats.toml, so a
 * new dossier gets a card without editing this script.
 */
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT_DIR = join(ROOT, "static/images/og");
mkdirSync(OUT_DIR, { recursive: true });

const readToml = (p) => readFileSync(join(ROOT, p), "utf8");
const field = (text, key) => (text.match(new RegExp(`^${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m")) ?? [])[1] ?? null;

const config = readToml("config.toml");
const siteTitle = field(config, "title") ?? "vomaste.cz";

// T-028 fáze H: registr i počty jdou z kanonického datasetu (dřívější
// data/dossiers.toml + stats.toml zanikly).
const { loadDossierRegistry } = await import("../dossier/lib/dossier-registry.mjs");
const { readDossierStats } = await import("../dossier/lib/record-tables.mjs");
const dossiers = loadDossierRegistry().map((d) => ({ slug: d.slug, title: d.title, type: d.dossierType }));

const stats = (slug) => {
  const s = readDossierStats(ROOT, slug);
  return s ? { claims: s.claims, sources: s.sources, cases: s.cases, gaps: s.gaps } : null;
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* One card template for everything: kicker, title, subtitle, optional chips,
   and a footer strip with the domain. No screenshot, no UI chrome, generous
   safe margins so LinkedIn's rounded crop never clips the text. */
function cardHtml({ kicker, title, subtitle, chips = [], footer }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#000;color:#fff;
       font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;
       display:flex;flex-direction:column;justify-content:center;
       padding:76px 88px;position:relative;overflow:hidden}
  /* subtle structure: a faint grid + a warm glow, nothing that competes with text */
  .grid{position:absolute;inset:0;
        background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),
                         linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);
        background-size:60px 60px}
  .glow{position:absolute;width:820px;height:820px;right:-260px;top:-320px;border-radius:50%;
        background:radial-gradient(circle,rgba(243,229,192,.13) 0%,rgba(0,0,0,0) 68%)}
  .inner{position:relative;z-index:1}
  .kicker{font-size:22px;font-weight:800;letter-spacing:.32em;text-transform:uppercase;
          color:#f3e5c0;display:flex;align-items:center;gap:20px}
  .kicker::after{content:"";height:2px;flex:1;background:linear-gradient(90deg,rgba(243,229,192,.55),transparent)}
  h1{font-size:${title.length > 26 ? 82 : 104}px;font-weight:900;letter-spacing:-.025em;line-height:1;margin-top:30px}
  p{font-size:31px;line-height:1.4;color:rgba(255,255,255,.82);margin-top:26px;max-width:930px}
  .chips{display:flex;gap:14px;margin-top:34px;flex-wrap:wrap}
  .chip{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.05);
        border-radius:11px;padding:11px 19px;font-size:22px;color:rgba(255,255,255,.85)}
  .chip b{color:#f3e5c0;font-weight:800}
  footer{position:absolute;left:88px;right:88px;bottom:52px;display:flex;
         justify-content:space-between;align-items:center;font-size:23px;
         color:rgba(255,255,255,.55);border-top:1px solid rgba(255,255,255,.12);padding-top:24px;z-index:1}
  .domain{color:#f3e5c0;font-weight:800;letter-spacing:.01em}
  </style></head><body>
  <div class="grid"></div><div class="glow"></div>
  <div class="inner">
    <div class="kicker">${esc(kicker)}</div>
    <h1>${esc(title)}</h1>
    <p>${esc(subtitle)}</p>
    ${chips.length ? `<div class="chips">${chips.map((c) => `<span class="chip"><b>${esc(c.value)}</b> ${esc(c.label)}</span>`).join("")}</div>` : ""}
  </div>
  <footer><span class="domain">vomaste.cz</span><span>${esc(footer)}</span></footer>
  </body></html>`;
}

const systemChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch(existsSync(systemChrome) ? { executablePath: systemChrome } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

async function render(html, file) {
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({ path: join(OUT_DIR, file), type: "jpeg", quality: 88 });
  console.log(`  wrote static/images/og/${file}`);
}

console.log("Rendering OG cards:");
await render(
  cardHtml({
    kicker: "Open Intelligence Commons",
    title: siteTitle,
    subtitle: "Otevřený, Git-native systém dohledatelných dossierů ve veřejném zájmu. Nevěřte autorovi — zkontrolujte data, zdroje a historii změn.",
    footer: "public domain · zdrojováno · verzováno v Gitu",
  }),
  "site.jpg",
);

for (const d of dossiers) {
  const s = stats(d.slug);
  const isEntity = d.type === "entity";
  await render(
    cardHtml({
      kicker: isEntity ? "Dossier" : "Generovaný společný pohled",
      title: d.title,
      subtitle: isEntity
        ? "Zdrojovaný přehled veřejně řešených kauz. Každé tvrzení nese stav ověřenosti a odkaz na citovaný zdroj."
        : "Průnik nad samostatnými dossiery — ne samostatný předmět navíc. Každý záznam patří do registru některého z nich.",
      chips: s
        ? [
            { value: s.claims, label: "tvrzení" },
            { value: s.sources, label: "zdrojů" },
            { value: s.cases, label: "kauz" },
            { value: s.gaps, label: "otevřených mezer" },
          ]
        : [],
      footer: "fakt · citace · sporné · názor — vždy odlišeno",
    }),
    `${d.slug}.jpg`,
  );
}

await browser.close();
console.log(`Done — ${1 + dossiers.length} card(s) in static/images/og/.`);
