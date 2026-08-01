*Historický dokument — popisuje stav před JSON-first migrací (T-028).*

# Audit historické vazby Macinka–Turek v architektuře (2026-07-29)

Kompletní inventura všech výskytů historické dvojice v repozitáři ke
commitu `e3c25ea`, klasifikovaná podle taxonomie de-specializační mise
(A–G). Automatická kontrola: `npm run lint:historical-coupling`
(k datu auditu ~132 strukturálních nálezů, musí klesnout na 0 +
zdůvodněný allowlist). Kategorie A (doménová data) a B (historická
dokumentace) se NEodstraňují.

## C. Neplatná strukturální vazba (odstranit/generalizovat)

| Kde | Co | Cílová akce |
|---|---|---|
| `data/navigation.toml` (17 z 21 položek, 74 nálezů) | Ručně vypsané stromy `petr-macinka` + 7 registrů, `filip-turek` + 7 registrů, `macinka-turek-aggregate`; jména i v hlavičkových komentářích | Generovat per-dossier navigaci z `data/dossiers.toml` (slug/title/`show_in_primary_navigation`/`dossier_type`) + fixní šablona seznamu registrů; ručně kurátorované zůstávají jen 4 generické položky (Domů, Dossiery, Entity, Globální mapa) |
| `templates/dossier.html:15–49` | Agregátní blok hardcoduje oba slugy: odkazové karty, `load_data` stats obou dossierů, dlaždice „Jen Petr Macinka"/„Jen Filip Turek", proměnné `macinka_stats`/`turek_stats` | Smyčka přes `source_dossiers` agregátu; texty i statistiky per iteraci z registru |
| `templates/entity-dossier.html:26` | Hardcodovaný titul „společném přehledu Petr Macinka a Filip Turek" | `get_section(canonical_slug)`.title |
| `tag-subjects.mjs:32`, `migrate-claims/cases/graph-to-pages.mjs` | Default slug `"macinka-turek"` v argumentu | Vyžadovat explicitní slug nebo iterovat kanonické dossiery přes `lib/dossier-registry.mjs` |
| `add-namespace-frontmatter.mjs`, `migrate-to-dossiers-namespace.mjs` | Dokončené jednorázové migrace s konstantním slugem | Smazat nebo přesunout do `scripts/archive/` mimo skenovaný strom |
| Komentáře jmenující dvojici: `validate-dossier-types.mjs:4–18`, `validate-navigation.mjs:7`, `generate-stats.mjs:64`, `build-route-manifest.mjs:88`, `entity-dossier*.html:4–5`, docstring `tag-subjects.mjs` | Kosmetické | Přeformulovat genericky |

Pojmenování šablon: dualita `dossier-*` (kanonický vlastník) vs.
`entity-dossier-*` (projekce) je architektonické echo splitu — jména
osob neobsahuje; při migraci zvážit přejmenování na `canonical-*` /
`projected-*` nebo sjednocení.

## D. Neplatná prezentační vazba

1. `templates/dossier.html:19–23` — próza agregátní notice jmenuje oba
   a fixuje „právě dva" → formulovat „nad {{ n }} dossiery" + smyčka
   titulů.
2. `templates/dossier.html:26/:30/:44–45` — popisky karet a dlaždic se
   jmény → `title` zdrojového dossieru z registru.
3. `data/navigation.toml:206` — label „Společný přehled (Macinka +
   Turek)" prosakuje do SiteNavigationElement JSON-LD (base.html
   serializuje labely navigace) — vyřeší se registrově řízenou navigací.
4. `templates/dossier-sources-index.html:53` — placeholder vyhledávání
   „např. Deník N, SRC-14, Turek…" → generický příklad.
5. Čisté: `base.html`, `index.html`, `dossiers-index.html`,
   `config.toml`, `macros/ui.html`, `map.html`.

## E. Validátory/testy

Logika validátorů je už registrově řízená (žádný neasserta „existují
právě tyto dossiery"); zbývají jen komentáře (viz C) a mrtvý no-op blok
`validate-navigation.mjs:57–60` (smazat). Skutečné riziko: úplnost
`tag-subjects.mjs` nikdo nevaliduje — drift CLM-45/edge-trestniozn-
policie opraven 2026-07-29 přímo v tomto commitu; systémové řešení viz F1.

## F. Datový model

1. **F1 `tag-subjects.mjs`** — editorská klasifikace subjektů žije
   v kódu (uzavřený dvouprvkový slovník `M`/`T`, mapy CLM/entit/hran,
   `DOSSIER_SLUG_FOR_SUBJECT`). Cíl: zdrojem pravdy má být stampnutý
   `subjects` front matter (s validátorem úplnosti), případně
   `data/dossiers/<canonical>/subjects.toml`; mapování subjekt↔slug
   odvozovat z pole `subject` v `data/dossiers.toml`.
2. `subject_entities` — pole samo je generické (ids globálních entit);
   hodnoty jsou data. Bez akce.
3. 16 sekčních stránek entity dossierů duplikuje
   `canonical_dossier`/`subject`/`dossier` z registru — zvážit čtení
   registru přes `load_data` místo zrcadlení.
4. `data/dossiers.toml` — kanonický registr; TADY dvojice legitimně
   žije jako data (`source_dossiers` je seznam, ne „právě dva").
   Čtečka `lib/dossier-registry.mjs` je plně generická.

## G. Generovaná rezidua (po migraci jen přegenerovat)

`data/dossiers/*/stats.toml`, `data/generated/routes.json`,
`global-graph.json`, `authorization-candidates.json`, `reports/*`,
`data/discovery-log.jsonl` (záměrně verzovaná historie),
`static/search-index.json`, bundly `static/js|css`.

## A/B. Legitimní výskyty (zůstávají)

- A: kanonické záznamy pod `content/dossiers/macinka-turek/` (45 CLM,
  54 SRC, 4 CASE, 6 GAP, 31 REL), prózy entity dossierů, 23 záznamů
  `content/entities/`, `data/dossiers/macinka-turek/graph.toml`,
  `updates.toml`, `data/authorizations.toml`.
- B: append-only autorizační log v AGENTS.md (**nedotknutelný**),
  historické zmínky v README/PROJECT_INSTRUCTIONS/TODO (přeformulovat
  rámování „web = tato dvojice" při migraci, záznamy historie zachovat).

## Explicitní odpovědi

- `config.toml` i `templates/base.html` jsou už generické; jediná cesta
  jmen do base.html výstupu je přes labely `data/navigation.toml` (D3).
- Žádný CSS selektor ani JS identifikátor pojmenovaný po subjektech
  neexistuje; jediné kódové identifikátory jsou Tera proměnné
  `macinka_stats`/`turek_stats` v `dossier.html` (C2).
