# Bezpečnost

## Hlášení zranitelností

Zranitelnost v kódu, buildu, CI nebo nasazení tohoto projektu hlaste
**soukromě** přes GitHub „Report a vulnerability":
<https://github.com/korczis/vomaste.cz/security/advisories/new>
(private vulnerability reporting je pro tento repozitář zapnuté).

**Nehlaste zranitelnosti veřejnou issue ani pull requestem** — obojí je
okamžitě veřejné.

Podporovaná verze je vždy aktuální `master` (= nasazená produkce;
statický web nemá starší podporované větve).

## Co sem naopak NEpatří

- **Věcná oprava obsahu** (chybný údaj, mrtvý zdroj, právo na odpověď)
  → veřejný PR/issue nebo corrections@vomaste.cz, viz
  [CONTRIBUTING.md](CONTRIBUTING.md).
- **Citlivé podněty, důkazy, whistleblowing** → tento projekt zatím
  **nemá žádný důvěrný intake kanál**. Ani formulář pro hlášení
  zranitelností není určen pro citlivé podklady ke kauzám a neposkytuje
  ochranu zdroje. Neposílejte nepublikovaný citlivý materiál žádným
  kanálem tohoto projektu; poctivé vysvětlení limitů viz
  [konstituce](docs/constitution/OPEN_INTELLIGENCE_COMMONS.md), § 4–5.

## Hranice hrozeb statického webu

Web je statický (Zola → GitHub Pages): žádný backend, databáze ani
přihlašování; build běží v GitHub Actions s least-privilege OIDC (bez
PAT). Hlavní reálná rizika jsou proto supply-chain (npm závislosti,
Actions), XSS přes obsah šablon, integrita DNS/TLS domény a kompromitace
účtů správců — hlášení k nim jsou vítaná. GitHub Pages hosting sám
o sobě rizika neodstraňuje a projekt nic takového netvrdí.

## Zásady

Žádná odměna (bounty) není vypsána. Dobrověrné hlášení nebude stíháno
ani veřejně skandalizováno; dostane odpověď a kredit v changelogu,
pokud o něj stojíte.
