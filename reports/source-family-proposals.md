# Návrhy zdrojových rodin

> **Generováno** `npm run sources:detect-family` — needitovat ručně.
> Vygenerováno: 2026-08-05T22:14:33.077Z

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
| `own` | 14 |
| `unknown` | 7 |
| **celkem zpracováno** | **21** |

## Verdikt `ctk` (0)

_(žádný)_

## Jiné navržené rodiny (0)

_(žádná)_

## Verdikt `own` — vlastní zpravodajství, rodina se nevyplňuje (14)

| Dossier | ID | Outlet | Jistota | Evidence |
|---|---|---|---|---|
| andrej-babis | SRC-06 | Česká justice | high | <meta name="author" content="David Tramba" /> |
| andrej-babis | SRC-13 | Investigace.cz | high | <meta name="author" content="Zuzana Šotová" /> |
| andrej-babis | SRC-21 | ČT24 (Česká televize) | high | <meta name="author" content="Milan Gerčák" data-next-head=""/> |
| andrej-babis | SRC-25 | Ekonom | high | <meta name="author" content="Martin Mařík"> |
| andrej-babis | SRC-26 | FORUM 24 | high | JSON-LD author (@type Person): Adam Opatrný |
| andrej-babis | SRC-30 | Novinky.cz | high | JSON-LD author (@type Person): Jaroslav Soukup |
| andrej-babis | SRC-31 | Tiscali.cz | medium | odkaz na autorský rozcestník /lukas-jirovec/ |
| andrej-babis | SRC-40 | Podpůrný a garanční rolnický a lesnický fond (PGRLF) | medium | odkaz na autorský rozcestník /senfeldovapgrlf-cz/ |
| andrej-babis | SRC-44 | ČT24 (Česká televize) | high | <meta name="author" content="Milan Gerčák" data-next-head=""/> |
| andrej-babis | SRC-49 | Aktuálně.cz | high | JSON-LD author (@type Person): Jan Horák |
| andrej-babis | SRC-56 | Aktuálně.cz | high | JSON-LD author (@type Person): Jakub Heller |
| andrej-babis | SRC-66 | FORUM 24 | high | JSON-LD author (@type Person): Johana Šafrová |
| andrej-babis | SRC-68 | Echo24 | medium | podpis: „Jiří Peňás" |
| andrej-babis | SRC-70 | Transparency International ČR | high | <meta name="author" content="David Kotora" /> |

## Verdikt `unknown` — nezjištěno, rodina se nevyplňuje (7)

| Dossier | ID | Outlet | HTTP | Důvod |
|---|---|---|---|---|
| andrej-babis | SRC-14 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| andrej-babis | SRC-18 | Evropský parlament | 202 | no-credit |
| andrej-babis | SRC-36 | Ministerstvo průmyslu a obchodu (MPO) | 200 | no-credit |
| andrej-babis | SRC-54 | Aktuálně.cz | 200 | credits-inconclusive |
| andrej-babis | SRC-75 | Vrchní soud v Praze | 200 | no-credit |
| andrej-babis | SRC-77 | Poslanecká sněmovna Parlamentu ČR | 200 | no-credit |
| andrej-babis | SRC-78 | Nejvyšší správní soud | 400 | fetch-failed: HTTP 400 |
