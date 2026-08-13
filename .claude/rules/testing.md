---
paths:
  - "scripts/**/*.test.mjs"
  - "tests/**"
  - "scripts/build/pipeline.mjs"
  - ".githooks/**"
---

# Testy a brány

## Tři úrovně, tři různé sliby

| Úroveň | Příkaz | Co slibuje |
|---|---|---|
| rychlá smyčka | `npm run data:validate -- --file <cesta>` | tvar jednoho záznamu |
| pre-commit | automaticky při `git commit` | rychlá podmnožina čistě datových validátorů |
| **plná brána** | `npm run build` | jediné, co se počítá |

Pre-commit je **pohodlí, ne brána**. Neobsahuje
`lint:historical-coupling` ani `data:check-generated:content`. Nic
neohlašuj jako hotové, dokud `npm run build` neskončí s exit 0.

`npm run check` je totéž bez `zola build` — na iteraci, kdy tě
nezajímá postavený web.

## Co se testuje a co ne

Testuje se **chování, které nese záruku**, ne pokrytí řádků. U brány
platí navíc jedno pravidlo: musí být otestované, že **skutečně padá**.
Brána, která nikdy nic neodmítne, je vynucení bez krytí.

U obousměrné brány se testují **obě strany**: chybějící záznam
i mrtvý záznam.

Když brána hlídá vrstvu, která zatím nemá obsah (nula agentů), testuje
se na fixture. Zelená proto, že není co kontrolovat, je falešná zelená.

## Hook bez testu neexistuje

Každý blokující hook potřebuje čtyři případy: **povolený**,
**zablokovaný**, **hraniční**, **selhání samotného hooku**. Selhání
hooku nesmí náhodně zablokovat celý repozitář.

## Deterministický build

`npm run build` nesahá na síť, nepotřebuje přihlašovací údaje ani
externí platformu. Test, který by to porušil, do buildu nepatří —
patří mezi ruční rešeršní nástroje.

E2E (`npm run test:e2e`, Playwright) není součástí `npm run build`.
Spouští se cíleně.

## Golden snapshoty

Generované snapshoty (`test:update-golden`, discovery log, reporty) se
běžně rozcházejí, když pracuje víc instancí zároveň. Recept na řešení
konfliktu je v `docs/coop/PROTOCOL.md`, sekce „Automatický push po
commitu a mergi" — ne v hlavě.
