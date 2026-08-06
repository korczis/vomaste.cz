# Návrhy zdrojových rodin

> **Generováno** `npm run sources:detect-family` — needitovat ručně.
> Vygenerováno: 2026-08-06T00:17:55.212Z

Tenhle report je **návrh, ne zápis**. Detekce sama nic do
`data/dossiers/**` nezapisuje; rodinu vyplní až vědomý krok
`node scripts/osint/detect-source-family.mjs --apply data/generated/source-family-proposals.json`,
a to **jen u verdiktu `ctk`**.

**Co verdikt znamená**

| Verdikt | Význam | Zapisuje `--apply`? |
|---|---|---|
| `ctk` | doložený kredit ČTK v metadatech, podpisu nebo patičce | ano, do prázdného pole |
| jiná rodina | doložený jiný původ (přetisk cizí redakce/agentury) | ne — rozhoduje člověk |
| `own` | jmenovitý autor bez agenturní značky ⇒ rodina se **nevyplňuje** (fallback na outlet je správný) | ne |
| `unknown` | nezjištěno (paywall, 403, chybějící podpis) ⇒ rodina se **nevyplňuje** | ne |

## Souhrn

| Verdikt | Počet |
|---|---|
| `unknown` | 13 |
| `own` | 8 |
| **celkem zpracováno** | **21** |

## Verdikt `ctk` (0)

_(žádný)_

## Jiné navržené rodiny (0)

_(žádná)_

## Verdikt `own` — vlastní zpravodajství, rodina se nevyplňuje (8)

| Dossier | ID | Outlet | Jistota | Evidence |
|---|---|---|---|---|
| adam-vojtech | SRC-06 | Aktuálně.cz | high | JSON-LD author (@type Person): Veronika Rodriguez |
| adam-vojtech | SRC-10 | Reflex | high | JSON-LD author (@type Person): Jiří Sezemský |
| adam-vojtech | SRC-12 | Echo24 | medium | podpis: „Jiří Peňás" |
| adam-vojtech | SRC-17 | Olomoucký deník | high | JSON-LD author (@type Person): Daniela Tauberová |
| adam-vojtech | SRC-24 | Podnikatel.cz | high | <meta name="author" content="Daniel Morávek"> |
| adam-vojtech | SRC-27 | CNN Prima News | high | JSON-LD author (@type Person): Karolína Neubergerová |
| adam-vojtech | SRC-35 | Olomoucký deník | high | JSON-LD author (@type Person): Daniela Tauberová |
| adam-vojtech | SRC-39 | Aktuálně.cz | high | <meta content="Josef Veselka" name="author" /> |

## Verdikt `unknown` — nezjištěno, rodina se nevyplňuje (13)

| Dossier | ID | Outlet | HTTP | Důvod |
|---|---|---|---|---|
| adam-vojtech | SRC-01 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| adam-vojtech | SRC-15 | Hanácká Drbna | 200 | credits-inconclusive |
| adam-vojtech | SRC-22 | Zdravé zprávy | 200 | credits-inconclusive |
| adam-vojtech | SRC-23 | Zdravé zprávy | 404 | fetch-failed: HTTP 404 |
| adam-vojtech | SRC-30 | Zdravé zprávy | 200 | credits-inconclusive |
| adam-vojtech | SRC-34 | Poslanecká sněmovna Parlamentu ČR | 200 | no-credit |
| adam-vojtech | SRC-41 | Fakultní nemocnice Olomouc (oficiální web) | 200 | credits-inconclusive |
| adam-vojtech | SRC-42 | Fakultní nemocnice Olomouc (oficiální web) | 200 | credits-inconclusive |
| adam-vojtech | SRC-43 | Poslanecká sněmovna Parlamentu ČR | 200 | no-credit |
| adam-vojtech | SRC-44 | Poslanecká sněmovna Parlamentu ČR | 200 | no-credit |
| adam-vojtech | SRC-45 | Ministerstvo zdravotnictví ČR | 200 | no-credit |
| adam-vojtech | SRC-46 | Policie České republiky — Krajské ředitelství policie Olomouckého kraje | 200 | no-credit |
| adam-vojtech | SRC-50 | Zdravé zprávy | 200 | credits-inconclusive |
