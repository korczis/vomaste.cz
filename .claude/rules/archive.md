---
paths:
  - "data/document-archive.json"
  - "data/court-docket-inventory.json"
  - "scripts/osint/check-document-archive.mjs"
  - "scripts/osint/refresh-document-archive.mjs"
  - "content/dokumenty/**"
---

# Archivace úředních podkladů

<!-- DOCUMENT_ARCHIVE_DOCTRINE_V1 -->

Není to volitelný krok rešerše, je to část datového kontraktu. Závazné
znění: `AGENTS.md`, sekce „Povinná archivace úředních podkladů".

## Dvě zóny a mezi nimi zeď

**Zone A** — veřejný Git a UI `/dokumenty/`. Smí nést jen základní
obchodní identifikační data ARES, sanitizovaný index Sbírky listin
(bez adres fyzických osob, původních názvů souborů a interních document
ID), prázdné docket-only odpovědi vývěsek a **jednotlivě revidované**
bezpečné úřední dokumenty. Každý publikovaný soubor má původní URL,
datum pořízení a SHA-256.

**Zone B** — raw Justice metadata, originální listiny, neprázdné
odpovědi soudních vývěsek. **Nikdy Git, issue, PR, artifact ani veřejný
web.** Kořen `~/dev/vomaste-archive` nebo `VOMASTE_JUSTICE_ARCHIVE_ROOT`.
Stahuje se přes `.part`, po kontrole typu a velikosti atomicky
přejmenuje, každý manifest nese SHA-256, `inventory.sha256` pokrývá
všechny fyzické soubory.

**Povýšení ze Zone B do Zone A je vždy individuální.** Redakční důvod,
provenience, `reviewNote`, podle potřeby bezpečný derivát. Hromadné
publikování PDF, raw JSON nebo původních názvů souborů je zakázané
i tehdy, když je zdrojový registr veřejný.

## Co vyžaduje brána

`npm run archive:check` je **offline**, nic nezapisuje a běží v
pre-commit hooku i ve všech režimech pipeline:

- každá česká právnická osoba podporovaného typu s bezpečně ověřeným
  osmimístným IČO má hashovaný snapshot ARES **a** sanitizovaný index
  listin;
- každá strojově rozpoznaná spisová značka je v
  `data/court-docket-inventory.json` — buď s docket-only dotazem na
  správnou vývěsku, nebo s výslovným záznamem, že ji obsluhuje jiný
  oficiální systém (NALUS, vlastní systém NSS);
- žádná Zone B v Gitu.

## Tři věci, které se nesmějí

- **Hádat IČO.** Ani podle shody jména. Entita bez důvěryhodného IČO
  zůstává v seznamu `entitiesWithoutIco`.
- **Hledat na soudní vývěsce podle jména nebo data narození.** Dotaz je
  docket-only.
- **Číst negativní odpověď jako neexistenci.** Znamená jen „v den dotazu
  nebylo aktivní vyvěšení".

## Síťové běhy

`npm run archive:refresh-public` — ruční nebo týdenní workflow, které smí
pouze otevřít review PR. Nikdy nepushne `master` a nikdy nenahraje Zone B.

`npm run archive:refresh-private` — jen na důvěryhodném stroji
s perzistentním úložištěm. Selže, když chybí plné pokrytí. Přerušení,
nedostatek místa a neúplné pokrytí se hlásí výslovně; nesmějí se přepsat
na „hotovo".

Deterministický build sám na síť ani do soukromého archivu nesahá.
