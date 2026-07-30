# schemas/ — strojově čitelný datový kontrakt

JSON Schema (draft 2020-12) pro kanonické záznamy platformy — workbench
mise Fáze 1 (`docs/missions/2026-07-30-workbench-master-prompt.md` § 5.3,
task T-017). Validují se **normalizované řádky** z
`scripts/dossier/lib/record-tables.mjs` (jediný parser front matter,
sdílený flat JSON exporty i JSON-LD exporty) a bloky `graph.toml` —
tedy přesně ta reprezentace, kterou konzumují všechny generátory.

Pravidla (z master promptu, vynucovaná recenzí):

- schéma popisuje jen **skutečně používaná pole** — žádné pole bez
  uživatele, žádné pole v šabloně bez pokrytí validátorem;
- **dělba práce**: schémata vynucují tvar (typy, povinnost, formáty ID,
  URL vzory); *sémantiku* (referenční integrita CLM↔SRC, povolené typy
  vztahů, autorizace subjektů) vynucují stávající validátory
  `validate:dossier`, `validate:graph`, `validate:authorization` —
  jedno pravidlo má právě jednoho vlastníka, nikdy dva;
- enum se do schématu zapisuje jen tam, kde je množina hodnot uzavřená
  redakčním modelem (claim `status`); otevřené množiny (typy vztahů,
  typy entit) drží pattern + sémantický validátor.

Spouští se přes `npm run validate:schemas`
(`scripts/dossier/validate-schemas.mjs`, AJV) — součást `npm run build`.
