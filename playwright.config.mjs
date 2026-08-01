// Konfigurace prohlížečových testů (coop T-021, slice: infrastruktura +
// pokrytí tabulek z T-019).
//
// Do teď v repozitáři neexistoval ŽÁDNÝ test na úrovni prohlížeče —
// `npm test` pokrývá jen čisté funkce v Node. Znamenalo to, že o všem,
// co se děje až po spuštění skriptu (řazení, filtr, dropdown, export,
// přístupnost, přetékání na mobilu), se dalo jen tvrdit, ne to doložit.
//
// PROČ SYSTÉMOVÝ CHROME: Playwright na macOS 13 odmítá stáhnout vlastní
// build („does not support chromium on mac13"). Vývojářský stroj tenhle
// systém má, takže se použije nainstalovaný Chrome přes channel. V CI
// (ubuntu) je chování stejné, jen se tam Chrome instaluje krokem
// workflow — proto se prohlížeč nikde nepředpokládá jako daný.
//
// PROČ NENÍ SOUČÁSTÍ `npm run build`: plný build trvá přes šest minut a
// je bránou před každým commitem. Prohlížečové testy potřebují hotové
// `public/`, takže by běh prodloužily ještě víc a zpomalily každý commit,
// který se HTML netýká. Spouští se samostatně (`npm run test:e2e`) a v CI
// jako oddělený krok po buildu.

import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 4173);

export default defineConfig({
  testDir: "./tests/e2e",
  // Synthetický 10k-uzlový benchmark (T-027, mission § 17.4) je záměrně
  // MIMO výchozí běh — negeneruje CI signál (žádné pevné ms prahy, jen
  // reportované časy), a jeho příprava dat trvá desítky sekund. Spouští
  // se výslovně: `npm run test:e2e:benchmark`.
  testIgnore: process.env.RUN_GRAPH_BENCHMARK ? [] : ["**/graph-benchmark.spec.mjs"],
  // Testy čtou hotový statický web; nic nemutují, takže můžou běžet paralelně.
  fullyParallel: true,
  // V CI nesmí projít test označený .only — jinak by se tiše přeskočil zbytek.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // Statický server nad public/. Web je čistě statický, takže žádný
  // build-server ani framework dev-server není potřeba — a testuje se tím
  // přesně to, co se nasazuje na GitHub Pages, ne vývojová varianta.
  webServer: {
    command: `npx --yes http-server public -p ${PORT} -s --silent`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },

  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
    {
      // Mobil není kosmetika: přetékání do strany je na tabulkách nejčastější
      // regrese a na desktopu se nepozná.
      name: "mobile",
      use: { ...devices["Pixel 5"], channel: "chrome" },
    },
  ],
});
