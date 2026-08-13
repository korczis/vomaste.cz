# Návrhy zdrojových rodin

> **Generováno** `npm run sources:detect-family` — needitovat ručně.
> Vygenerováno: 2026-08-06T07:50:34.801Z

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
| `own` | 12 |
| `unknown` | 7 |
| `ctk` | 1 |
| **celkem zpracováno** | **20** |

## Verdikt `ctk` (1)

| Dossier | ID | Outlet | Jistota | Evidence |
|---|---|---|---|---|
| jaromir-zuna | SRC-41 | CNN Prima News | high | JSON-LD author (@type Person): ČTK |

## Jiné navržené rodiny (0)

_(žádná)_

## Verdikt `own` — vlastní zpravodajství, rodina se nevyplňuje (12)

| Dossier | ID | Outlet | Jistota | Evidence |
|---|---|---|---|---|
| jaromir-zuna | SRC-02 | e15.cz | medium | podpis: „Viliam Buchert" |
| jaromir-zuna | SRC-06 | TN.cz (TV Nova) | high | JSON-LD author (@type Person): Tomáš Vašek |
| jaromir-zuna | SRC-09 | Echo24 | medium | podpis: „Jiří Peňás" |
| jaromir-zuna | SRC-15 | CZDEFENCE | high | JSON-LD author (@type Person): Tomáš Kolařík |
| jaromir-zuna | SRC-18 | e15.cz | medium | podpis: „Pavel Otto" |
| jaromir-zuna | SRC-22 | CZDEFENCE | high | JSON-LD author (@type Person): Katarina Přikrylová |
| jaromir-zuna | SRC-23 | Ekonomický deník | high | <meta name="author" content="Jan Hrbáček" /> |
| jaromir-zuna | SRC-24 | CNN Prima News | high | JSON-LD author (@type Person): Lukáš Cigánek |
| jaromir-zuna | SRC-25 | Security magazín | high | JSON-LD author (@type Person): Jakub Samek |
| jaromir-zuna | SRC-30 | Ekonomický deník | high | <meta name="author" content="Jan Hrbáček" /> |
| jaromir-zuna | SRC-35 | Aktuálně.cz | high | <meta content="Ondřej Stratilík" name="author" /> |
| jaromir-zuna | SRC-40 | Deník N | high | <meta name="author" content="Jan Tvrdoň"> |

## Verdikt `unknown` — nezjištěno, rodina se nevyplňuje (7)

| Dossier | ID | Outlet | HTTP | Důvod |
|---|---|---|---|---|
| jaromir-zuna | SRC-01 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| jaromir-zuna | SRC-16 | ČT24 (Česká televize) | — | fetch-failed: HTTP 503 |
| jaromir-zuna | SRC-20 | Vláda České republiky (vlada.gov.cz) | 200 | credits-inconclusive |
| jaromir-zuna | SRC-26 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| jaromir-zuna | SRC-34 | Poslanecká sněmovna Parlamentu ČR | 200 | no-credit |
| jaromir-zuna | SRC-38 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| jaromir-zuna | SRC-39 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
