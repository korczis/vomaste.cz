---
paths:
  - "docs/**"
  - "README.md"
  - "CONTRIBUTING.md"
---

# Dokumentace

## Co se nikdy nepíše ručně

Generované a hlídané paritní bránou — ruční editace se přepíše nebo
shodí build:

| Soubor | Generuje |
|---|---|
| `docs/TOOLING.md` | `npm run build:tooling-catalog` |
| `docs/osint/SOURCE_CATALOG.md` | `npm run build:source-catalog` |
| `reports/evidence-plan.md` | `npm run report:evidence-plan` |

Katalog příkazů se **neopisuje** do lekcí ani do README. Odkazuje se
na něj.

## ADR: kdy ano

Pro **podstatné a sporné** technické rozhodnutí — nová závislost, výměna
rendereru, přijetí či odmítnutí frameworku. Vzor, který tenhle
repozitář drží (`docs/adr/graph-renderer.md`): **měřená, ne
spekulativní** argumentace. Obě strany se změří přímo v repozitáři,
ne odhadem, a ADR si stanoví **revizní práh** — kdy se má rozhodnutí
znovu otevřít.

Na to je skill `/adr`.

## Konstituce §8 platí i na dokumentaci

Text nesmí inzerovat schopnost, kterou nic nevynucuje ani neimplementuje:
bezpečný intake, anonymita, příspěvkové CLI, federace. A obráceně: bránu
nepopisuj jako vynucení něčeho, co nikde není specifikováno — viz
poznámka o „Flowbite compliance" v [`ui.md`](ui.md).

Když si nejsi jistý, jestli něco funguje, spusť to. Dokumentace psaná
podle názvu příkazu je ta nejdražší chyba tohohle repozitáře.

## Jazyk

Řídící dokumenty jsou dvojjazyčné: české nadpisy a zdůvodnění,
anglické technické tělo. Anglicky vždy: identifikátory v kódu, názvy
balíčků, prefixy conventional commitů.

## Když měníš něco, co dokumentace popisuje

Tabulka „co při jaké změně projít" je v [`learning.md`](learning.md)
a v `AGENTS.md`. Projdi ji dřív, než změnu ohlásíš jako hotovou —
zastaralá lekce je horší než žádná, protože podle ní někdo pracuje.
