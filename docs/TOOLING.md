<!-- GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`. -->

# Tooling — co který příkaz dělá

Publikovaná podoba: [/dokumentace/prikazy/](https://vomaste.cz/dokumentace/prikazy/).

178 příkazů celkem: 105 npm skriptů, 40 skills, 6 subagentů, 11 workflow, 16 just receptů. 55 z nich může shodit běh, 46 jsou krokem `npm run build` a 11 běží v pre-commit hooku.

**Pravidlo, které z katalogu plyne**: příkaz se přidává do `package.json` (nebo do `justfile` či `.claude/skills/`) a zároveň do `data/tooling/`. Bez záznamu build spadne — dokumentace tak nemůže zaostat za kódem.

## npm skript (105)

| Příkaz | Kategorie | Vynucuje | Pipeline | Pre-commit |
|---|---|---|---|---|
| [`npm run archive:check`](/dokumentace/prikazy/archive-check/) | validace vstupů | ano | build, dev, check | ano |
| [`npm run data:compile`](/dokumentace/prikazy/data-compile/) | validace vstupů | ano | — | — |
| [`npm run data:validate`](/dokumentace/prikazy/data-validate/) | validace vstupů | ano | build, dev, check | ano |
| [`npm run check:workflow-parity`](/dokumentace/prikazy/check-workflow-parity/) | validace vstupů | ano | check | — |
| [`npm run intake:validate-form`](/dokumentace/prikazy/intake-validate-form/) | validace vstupů | ano | — | — |
| [`npm run intake:validate-workflow`](/dokumentace/prikazy/intake-validate-workflow/) | validace vstupů | ano | — | — |
| [`npm run lint:component-reuse`](/dokumentace/prikazy/lint-component-reuse/) | validace vstupů | ano | build, check | ano |
| [`npm run lint:hardcoded-records`](/dokumentace/prikazy/lint-hardcoded-records/) | validace vstupů | ano | build, check | — |
| [`npm run lint:historical-coupling`](/dokumentace/prikazy/lint-historical-coupling/) | validace vstupů | ano | — | — |
| [`npm run lint:source-outlets`](/dokumentace/prikazy/lint-source-outlets/) | validace vstupů | ano | check | — |
| [`npm run validate:authorization`](/dokumentace/prikazy/validate-authorization/) | validace vstupů | ano | build, dev, check | ano |
| [`npm run validate:claude-tooling`](/dokumentace/prikazy/validate-claude-tooling/) | validace vstupů | ano | build, check | ano |
| [`npm run validate:concepts`](/dokumentace/prikazy/validate-concepts/) | validace vstupů | ano | build, check | — |
| [`npm run validate:dossier-types`](/dokumentace/prikazy/validate-dossier-types/) | validace vstupů | ano | build, dev, check | ano |
| [`npm run validate:entity-types`](/dokumentace/prikazy/validate-entity-types/) | validace vstupů | ano | build, check | — |
| [`npm run validate:learning`](/dokumentace/prikazy/validate-learning/) | validace vstupů | ano | build, check | — |
| [`npm run validate:media`](/dokumentace/prikazy/validate-media/) | validace vstupů | ano | build, check | — |
| [`npm run verify:authorization-log`](/dokumentace/prikazy/verify-authorization-log/) | validace vstupů | ano | build, check | ano |
| [`npm run build:data-exports`](/dokumentace/prikazy/build-data-exports/) | generování | ano | build, dev | — |
| [`npm run build:entity-type-sections`](/dokumentace/prikazy/build-entity-type-sections/) | generování | — | build, dev | — |
| [`npm run build:government-roster`](/dokumentace/prikazy/build-government-roster/) | generování | — | build | — |
| [`npm run build:graph-projections`](/dokumentace/prikazy/build-graph-projections/) | generování | — | build, dev | — |
| [`npm run build:jsonld-exports`](/dokumentace/prikazy/build-jsonld-exports/) | generování | — | build, dev | — |
| [`npm run build:navigation`](/dokumentace/prikazy/build-navigation/) | generování | — | build, dev | ano |
| [`npm run build:routes`](/dokumentace/prikazy/build-routes/) | generování | — | build, dev | ano |
| [`npm run build:search-index`](/dokumentace/prikazy/build-search-index/) | generování | — | build, dev | — |
| [`npm run build:source-catalog`](/dokumentace/prikazy/build-source-catalog/) | generování | — | build, dev | — |
| [`npm run build:tooling-catalog`](/dokumentace/prikazy/build-tooling-catalog/) | generování | ano | build, dev | — |
| [`npm run css:build`](/dokumentace/prikazy/css-build/) | generování | — | build, dev | — |
| [`npm run data:generate-content`](/dokumentace/prikazy/data-generate-content/) | generování | — | build, dev | — |
| [`npm run data:metrics`](/dokumentace/prikazy/data-metrics/) | generování | — | build, dev | — |
| [`npm run data:sync-content`](/dokumentace/prikazy/data-sync-content/) | generování | — | build, dev | — |
| [`npm run data:views`](/dokumentace/prikazy/data-views/) | generování | — | build, dev | — |
| [`npm run generate:candidates`](/dokumentace/prikazy/generate-candidates/) | generování | — | build, dev | — |
| [`npm run generate:discovery-log`](/dokumentace/prikazy/generate-discovery-log/) | generování | — | build, dev | — |
| [`npm run intake:index`](/dokumentace/prikazy/intake-index/) | generování | — | — | — |
| [`npm run js:build`](/dokumentace/prikazy/js-build/) | generování | — | build, dev | — |
| [`npm run report:evidence-plan`](/dokumentace/prikazy/report-evidence-plan/) | generování | — | build | — |
| [`npm run archive:check-private`](/dokumentace/prikazy/archive-check-private/) | kontrola výstupů | ano | — | — |
| [`npm run data:check-generated`](/dokumentace/prikazy/data-check-generated/) | kontrola výstupů | ano | — | — |
| [`npm run data:check-generated:content`](/dokumentace/prikazy/data-check-generated-content/) | kontrola výstupů | ano | build | — |
| [`npm run intake:e2e-fixture`](/dokumentace/prikazy/intake-e2e-fixture/) | kontrola výstupů | — | — | — |
| [`npm run intake:fixture`](/dokumentace/prikazy/intake-fixture/) | kontrola výstupů | — | — | — |
| [`npm run intake:match-fixture`](/dokumentace/prikazy/intake-match-fixture/) | kontrola výstupů | — | — | — |
| [`npm run intake:preflight-fixture`](/dokumentace/prikazy/intake-preflight-fixture/) | kontrola výstupů | — | — | — |
| [`npm run intake:publish-fixture`](/dokumentace/prikazy/intake-publish-fixture/) | kontrola výstupů | — | — | — |
| [`npm run intake:validate`](/dokumentace/prikazy/intake-validate/) | kontrola výstupů | ano | — | — |
| [`npm run lint:generated-content`](/dokumentace/prikazy/lint-generated-content/) | kontrola výstupů | ano | build, check | — |
| [`npm run test`](/dokumentace/prikazy/test/) | kontrola výstupů | ano | build | — |
| [`npm run test:e2e`](/dokumentace/prikazy/test-e2e/) | kontrola výstupů | — | — | — |
| [`npm run test:e2e:benchmark`](/dokumentace/prikazy/test-e2e-benchmark/) | kontrola výstupů | — | — | — |
| [`npm run test:e2e:desktop`](/dokumentace/prikazy/test-e2e-desktop/) | kontrola výstupů | — | — | — |
| [`npm run test:intake`](/dokumentace/prikazy/test-intake/) | kontrola výstupů | ano | — | — |
| [`npm run test:intake:e2e`](/dokumentace/prikazy/test-intake-e2e/) | kontrola výstupů | ano | — | — |
| [`npm run test:intake:form`](/dokumentace/prikazy/test-intake-form/) | kontrola výstupů | ano | — | — |
| [`npm run test:intake:github`](/dokumentace/prikazy/test-intake-github/) | kontrola výstupů | ano | — | — |
| [`npm run test:intake:matching`](/dokumentace/prikazy/test-intake-matching/) | kontrola výstupů | ano | — | — |
| [`npm run test:intake:preflight`](/dokumentace/prikazy/test-intake-preflight/) | kontrola výstupů | ano | — | — |
| [`npm run test:intake:risk`](/dokumentace/prikazy/test-intake-risk/) | kontrola výstupů | ano | — | — |
| [`npm run validate:directory-index`](/dokumentace/prikazy/validate-directory-index/) | kontrola výstupů | ano | build | — |
| [`npm run validate:graph-projections`](/dokumentace/prikazy/validate-graph-projections/) | kontrola výstupů | ano | build, dev | — |
| [`npm run validate:navigation`](/dokumentace/prikazy/validate-navigation/) | kontrola výstupů | ano | build, dev | ano |
| [`npm run validate:navigation-metrics`](/dokumentace/prikazy/validate-navigation-metrics/) | kontrola výstupů | ano | build, dev | — |
| [`npm run verify:anchors`](/dokumentace/prikazy/verify-anchors/) | kontrola výstupů | ano | build | — |
| [`npm run verify:export`](/dokumentace/prikazy/verify-export/) | kontrola výstupů | ano | build | — |
| [`npm run verify:full-pages`](/dokumentace/prikazy/verify-full-pages/) | kontrola výstupů | ano | build | — |
| [`npm run verify:jsonld`](/dokumentace/prikazy/verify-jsonld/) | kontrola výstupů | ano | build | — |
| [`npm run verify:navigation-counts`](/dokumentace/prikazy/verify-navigation-counts/) | kontrola výstupů | ano | build | — |
| [`npm run verify:og`](/dokumentace/prikazy/verify-og/) | kontrola výstupů | ano | build | — |
| [`npm run verify:source-catalog`](/dokumentace/prikazy/verify-source-catalog/) | kontrola výstupů | ano | — | ano |
| [`npm run verify:table-responsive`](/dokumentace/prikazy/verify-table-responsive/) | kontrola výstupů | ano | build | — |
| [`npm run verify:tooling-catalog`](/dokumentace/prikazy/verify-tooling-catalog/) | kontrola výstupů | ano | build | — |
| [`npm run archive:refresh-private`](/dokumentace/prikazy/archive-refresh-private/) | rešerše | ano | — | — |
| [`npm run archive:refresh-public`](/dokumentace/prikazy/archive-refresh-public/) | rešerše | ano | — | — |
| [`npm run media:fetch`](/dokumentace/prikazy/media-fetch/) | rešerše | ano | — | — |
| [`npm run prismatic:diff`](/dokumentace/prikazy/prismatic-diff/) | rešerše | — | — | — |
| [`npm run prismatic:drift`](/dokumentace/prikazy/prismatic-drift/) | rešerše | — | — | — |
| [`npm run prismatic:enrich-all`](/dokumentace/prikazy/prismatic-enrich-all/) | rešerše | — | — | — |
| [`npm run prismatic:import`](/dokumentace/prikazy/prismatic-import/) | rešerše | — | — | — |
| [`npm run prismatic:plan`](/dokumentace/prikazy/prismatic-plan/) | rešerše | — | — | — |
| [`npm run prismatic:probe`](/dokumentace/prikazy/prismatic-probe/) | rešerše | — | — | — |
| [`npm run prismatic:promote`](/dokumentace/prikazy/prismatic-promote/) | rešerše | — | — | — |
| [`npm run prismatic:review`](/dokumentace/prikazy/prismatic-review/) | rešerše | — | — | — |
| [`npm run prismatic:run`](/dokumentace/prikazy/prismatic-run/) | rešerše | — | — | — |
| [`npm run prismatic:status`](/dokumentace/prikazy/prismatic-status/) | rešerše | — | — | — |
| [`npm run prismatic:verify`](/dokumentace/prikazy/prismatic-verify/) | rešerše | — | — | — |
| [`npm run screening:public-money`](/dokumentace/prikazy/screening-public-money/) | rešerše | — | — | — |
| [`npm run sources:detect-family`](/dokumentace/prikazy/sources-detect-family/) | rešerše | — | — | — |
| [`npm run authorization:anchor`](/dokumentace/prikazy/authorization-anchor/) | provoz | — | — | — |
| [`npm run authorize:entity`](/dokumentace/prikazy/authorize-entity/) | provoz | — | — | — |
| [`npm run benchmark:graph`](/dokumentace/prikazy/benchmark-graph/) | provoz | — | — | — |
| [`npm run build`](/dokumentace/prikazy/build/) | provoz | ano | — | — |
| [`npm run css:watch`](/dokumentace/prikazy/css-watch/) | provoz | — | — | — |
| [`npm run data:build`](/dokumentace/prikazy/data-build/) | provoz | — | — | — |
| [`npm run dev`](/dokumentace/prikazy/dev/) | provoz | — | — | — |
| [`npm run dossier:next-id`](/dokumentace/prikazy/dossier-next-id/) | provoz | ano | — | — |
| [`npm run dossier:scaffold`](/dokumentace/prikazy/dossier-scaffold/) | provoz | ano | — | — |
| [`npm run generate:all`](/dokumentace/prikazy/generate-all/) | provoz | — | — | — |
| [`npm run hooks:install`](/dokumentace/prikazy/hooks-install/) | provoz | — | — | — |
| [`npm run check`](/dokumentace/prikazy/check/) | provoz | ano | — | — |
| [`npm run intake:github-event`](/dokumentace/prikazy/intake-github-event/) | provoz | — | — | — |
| [`npm run intake:process`](/dokumentace/prikazy/intake-process/) | provoz | — | — | — |
| [`npm run preflight`](/dokumentace/prikazy/preflight/) | provoz | — | — | — |
| [`npm run serve`](/dokumentace/prikazy/serve/) | provoz | — | — | — |
| [`npm run test:update-golden`](/dokumentace/prikazy/test-update-golden/) | provoz | — | — | — |

## Claude skill (40)

| Volání | Persona | Riziko | Zapisuje | Rozsahová brána |
|---|---|---|---|---|
| [`/a11y-review`](/dokumentace/prikazy/skill-a11y-review/) | vývojář, recenzent, údržbář | jen čte | ne | — |
| [`/authorization-check`](/dokumentace/prikazy/skill-authorization-check/) | rešeršista, editor, recenzent, údržbář | jen čte | ne | ano |
| [`/build`](/dokumentace/prikazy/skill-build/) | editor, vývojář, recenzent, údržbář, orchestrátor | jen čte | ne | — |
| [`/diagnose`](/dokumentace/prikazy/skill-diagnose/) | čtenář, ověřovatel, přispěvatel zdrojem, rešeršista, editor, vývojář, recenzent, údržbář, orchestrátor | jen čte | ne | — |
| [`/docs-sync`](/dokumentace/prikazy/skill-docs-sync/) | vývojář, editor, údržbář | jen čte | ne | — |
| [`/editorial-review`](/dokumentace/prikazy/skill-editorial-review/) | editor, recenzent, údržbář | jen čte | ne | — |
| [`/quality`](/dokumentace/prikazy/skill-quality/) | editor, vývojář, recenzent, údržbář | jen čte | ne | — |
| [`/review-claim`](/dokumentace/prikazy/skill-review-claim/) | ověřovatel, editor, recenzent, údržbář | jen čte | ne | — |
| [`/review-gap`](/dokumentace/prikazy/skill-review-gap/) | ověřovatel, editor, recenzent, údržbář | jen čte | ne | — |
| [`/review-pr`](/dokumentace/prikazy/skill-review-pr/) | recenzent, editor, údržbář, orchestrátor | jen čte | ne | — |
| [`/review-source`](/dokumentace/prikazy/skill-review-source/) | ověřovatel, editor, recenzent, údržbář | jen čte | ne | — |
| [`/seo-review`](/dokumentace/prikazy/skill-seo-review/) | vývojář, údržbář | jen čte | ne | — |
| [`/source-family`](/dokumentace/prikazy/skill-source-family/) | ověřovatel, rešeršista, editor, recenzent | jen čte | ne | — |
| [`/test`](/dokumentace/prikazy/skill-test/) | vývojář, údržbář | jen čte | ne | — |
| [`/ui-review`](/dokumentace/prikazy/skill-ui-review/) | vývojář, recenzent, údržbář | jen čte | ne | — |
| [`/evidence-packet`](/dokumentace/prikazy/skill-evidence-packet/) | přispěvatel zdrojem, rešeršista, editor | bezpečný zápis | ano | — |
| [`/find-source`](/dokumentace/prikazy/skill-find-source/) | ověřovatel, přispěvatel zdrojem, rešeršista | jen čte | ne | — |
| [`/investigate`](/dokumentace/prikazy/skill-investigate/) | rešeršista, editor, údržbář | vyžaduje review | ano | ano |
| [`/prismatic-bootstrap`](/dokumentace/prikazy/skill-prismatic-bootstrap/) | rešeršista, údržbář | jen čte | ne | — |
| [`/prismatic-drift-audit`](/dokumentace/prikazy/skill-prismatic-drift-audit/) | údržbář | jen čte | ne | — |
| [`/prismatic-enrich-all`](/dokumentace/prikazy/skill-prismatic-enrich-all/) | rešeršista, údržbář | bezpečný zápis | ano | ano |
| [`/prismatic-promote`](/dokumentace/prikazy/skill-prismatic-promote/) | editor, údržbář | vyžaduje review | ano | ano |
| [`/research-question`](/dokumentace/prikazy/skill-research-question/) | rešeršista, editor, přispěvatel zdrojem | jen čte | ne | — |
| [`/verify-source`](/dokumentace/prikazy/skill-verify-source/) | ověřovatel, přispěvatel zdrojem, rešeršista, editor | jen čte | ne | — |
| [`/academy-lesson`](/dokumentace/prikazy/skill-academy-lesson/) | editor, vývojář, údržbář | vyžaduje review | ano | — |
| [`/adr`](/dokumentace/prikazy/skill-adr/) | vývojář, údržbář | bezpečný zápis | ano | — |
| [`/bootstrap`](/dokumentace/prikazy/skill-bootstrap/) | čtenář, ověřovatel, přispěvatel zdrojem, rešeršista, editor, vývojář, recenzent, údržbář, orchestrátor | jen čte | ne | — |
| [`/commit`](/dokumentace/prikazy/skill-commit/) | editor, vývojář, údržbář, orchestrátor | údržbář | ano | — |
| [`/coop-status`](/dokumentace/prikazy/skill-coop-status/) | vývojář, editor, údržbář, orchestrátor | jen čte | ne | — |
| [`/correction`](/dokumentace/prikazy/skill-correction/) | přispěvatel zdrojem, editor, údržbář | vyžaduje review | ano | — |
| [`/data-model`](/dokumentace/prikazy/skill-data-model/) | rešeršista, editor, vývojář, údržbář | jen čte | ne | — |
| [`/diff-explain`](/dokumentace/prikazy/skill-diff-explain/) | přispěvatel zdrojem, editor, vývojář, recenzent, údržbář | jen čte | ne | — |
| [`/dossier-entry`](/dokumentace/prikazy/skill-dossier-entry/) | rešeršista, editor | vyžaduje review | ano | ano |
| [`/explain`](/dokumentace/prikazy/skill-explain/) | čtenář, ověřovatel, přispěvatel zdrojem, rešeršista, editor, vývojář, recenzent | jen čte | ne | — |
| [`/guide`](/dokumentace/prikazy/skill-guide/) | čtenář, ověřovatel, přispěvatel zdrojem, rešeršista, editor, vývojář, recenzent, údržbář, orchestrátor | jen čte | ne | — |
| [`/kb-entry`](/dokumentace/prikazy/skill-kb-entry/) | rešeršista, editor, vývojář, údržbář | vyžaduje review | ano | — |
| [`/pr`](/dokumentace/prikazy/skill-pr/) | vývojář, editor, údržbář | vyžaduje review | ano | — |
| [`/project-tour`](/dokumentace/prikazy/skill-project-tour/) | čtenář, ověřovatel, přispěvatel zdrojem, rešeršista, editor, vývojář, recenzent, údržbář | jen čte | ne | — |
| [`/schema-change`](/dokumentace/prikazy/skill-schema-change/) | vývojář, údržbář | údržbář | ano | — |
| [`/task`](/dokumentace/prikazy/skill-task/) | přispěvatel zdrojem, rešeršista, editor, vývojář, recenzent, údržbář | jen čte | ne | — |

## Claude subagent (6)

| Volání | Persona | Riziko | Zapisuje | Rozsahová brána |
|---|---|---|---|---|
| [`agent claim-reviewer`](/dokumentace/prikazy/agent-claim-reviewer/) | ověřovatel, editor, recenzent, údržbář | jen čte | ne | — |
| [`agent docs-auditor`](/dokumentace/prikazy/agent-docs-auditor/) | vývojář, údržbář, recenzent | jen čte | ne | — |
| [`agent editorial-reviewer`](/dokumentace/prikazy/agent-editorial-reviewer/) | editor, recenzent, údržbář | jen čte | ne | — |
| [`agent ui-reviewer`](/dokumentace/prikazy/agent-ui-reviewer/) | vývojář, recenzent, údržbář | jen čte | ne | — |
| [`agent source-verifier`](/dokumentace/prikazy/agent-source-verifier/) | ověřovatel, přispěvatel zdrojem, rešeršista, editor | jen čte | ne | — |
| [`agent repository-explorer`](/dokumentace/prikazy/agent-repository-explorer/) | čtenář, rešeršista, vývojář, recenzent, údržbář | jen čte | ne | — |

## Claude workflow (11)

| Volání | Persona | Riziko | Zapisuje | Rozsahová brána |
|---|---|---|---|---|
| [`workflow review-a-dossier`](/dokumentace/prikazy/workflow-review-a-dossier/) | editor, recenzent, údržbář | jen čte | ne | — |
| [`workflow verify-a-claim`](/dokumentace/prikazy/workflow-verify-a-claim/) | ověřovatel, editor, recenzent | jen čte | ne | — |
| [`workflow research-a-topic`](/dokumentace/prikazy/workflow-research-a-topic/) | rešeršista, editor | vyžaduje review | ano | ano |
| [`workflow submit-a-source`](/dokumentace/prikazy/workflow-submit-a-source/) | přispěvatel zdrojem, ověřovatel, rešeršista | bezpečný zápis | ano | — |
| [`workflow first-code-contribution`](/dokumentace/prikazy/workflow-first-code-contribution/) | vývojář | vyžaduje review | ano | — |
| [`workflow first-session`](/dokumentace/prikazy/workflow-first-session/) | čtenář, ověřovatel, přispěvatel zdrojem, rešeršista, editor, vývojář, recenzent, údržbář, orchestrátor | jen čte | ne | — |
| [`workflow fix-a-published-error`](/dokumentace/prikazy/workflow-fix-a-published-error/) | editor, přispěvatel zdrojem, údržbář | vyžaduje review | ano | — |
| [`workflow fix-a-site-bug`](/dokumentace/prikazy/workflow-fix-a-site-bug/) | vývojář, údržbář | vyžaduje review | ano | — |
| [`workflow change-a-schema`](/dokumentace/prikazy/workflow-change-a-schema/) | údržbář, vývojář | údržbář | ano | — |
| [`workflow prepare-a-pull-request`](/dokumentace/prikazy/workflow-prepare-a-pull-request/) | vývojář, editor, údržbář | vyžaduje review | ano | — |
| [`workflow work-a-coop-task`](/dokumentace/prikazy/workflow-work-a-coop-task/) | orchestrátor, vývojář, editor, údržbář | údržbář | ano | — |

## just recept (16)

| Příkaz | Kategorie | Vynucuje | Pipeline | Pre-commit |
|---|---|---|---|---|
| [`just doctor`](/dokumentace/prikazy/just-doctor/) | kontrola výstupů | ano | — | — |
| [`just check`](/dokumentace/prikazy/just-check/) | kontrola výstupů | ano | — | — |
| [`just test`](/dokumentace/prikazy/just-test/) | kontrola výstupů | — | — | — |
| [`just ares *args`](/dokumentace/prikazy/just-ares/) | rešerše | — | — | — |
| [`just expand ico *args`](/dokumentace/prikazy/just-expand/) | rešerše | — | — | — |
| [`just authorize entity`](/dokumentace/prikazy/just-authorize/) | provoz | — | — | — |
| [`just build`](/dokumentace/prikazy/just-build/) | provoz | — | — | — |
| [`just clean`](/dokumentace/prikazy/just-clean/) | provoz | — | — | — |
| [`just coop`](/dokumentace/prikazy/just-coop/) | provoz | — | — | — |
| [`just default`](/dokumentace/prikazy/just-default/) | provoz | — | — | — |
| [`just dev`](/dokumentace/prikazy/just-dev/) | provoz | — | — | — |
| [`just hooks`](/dokumentace/prikazy/just-hooks/) | provoz | — | — | — |
| [`just inbox`](/dokumentace/prikazy/just-inbox/) | provoz | — | — | — |
| [`just regen`](/dokumentace/prikazy/just-regen/) | provoz | — | — | — |
| [`just scaffold slug title subject auth_record_id`](/dokumentace/prikazy/just-scaffold/) | provoz | — | — | — |
| [`just setup`](/dokumentace/prikazy/just-setup/) | provoz | — | — | — |

## Co která brána shodí

### `npm run archive:check`

- Chybějící ARES nebo sanitizovaný Justice záznam pro podporovanou entitu s ověřeným IČO.
- Hash drift, nesanitizovaný veřejný Justice index, nezatříděná spisová značka nebo neprázdná nerevidovaná odpověď soudní vývěsky.
- Soubor Zone B či .part sledovaný Gitem, chybějící archivní doktrínu v AGENTS.md/README.md/CLAUDE.md nebo její odpojení z pipeline a pre-commit hooku.
- Naplánovaný workflow bez review PR, s přímým pushem do masteru nebo s pokusem stáhnout či uploadovat Zone B.

### `npm run data:compile`

- Nenačtitelný nebo nevalidní kanonický dataset (tytéž chyby jako data:validate — sdílí runCheck).

### `npm run data:validate`

- Kanonický soubor, který neodpovídá schématu podle svého recordType (včetně pole navíc — schémata mají additionalProperties: false).
- R1–R8: unikátnost @id, unikátnost identifieru v dossieru, soulad cesty souboru s @id, existence cílů všech referencí uvnitř téhož dossieru, existence entit vztahů, ≥1 existující zdroj u tvrzení mimo status-opinion, integrita kurátorované grafové vrstvy, obousměrnost vazby claim↔source.
- S1–S10: doložení tvrzení (single/corroborated přes nezávislé rodiny zdrojů), autorizační pravidla S5/S6, subjektové uzly grafu S7, souvislost grafu S8, a S10 — týž vydavatel nikdy nezakládá nezávislé doložení.
- T1–T8: parita ručně psané tabulky „Registr tvrzení“ s kanonickými claim záznamy (kotvy, 1:1 množiny, byte-verná shoda textu/statusu/zdrojů, uzavřený slovník statusů, dedup URL u corroborated, plnostránková doktrína zdroje).
- Neplatná JSON-LD expanze datasetu.

### `npm run check:workflow-parity`

- Workflow, který přestal volat `npm run build`.
- Workflow, který začal znovu vyjmenovávat kroky pipeline jednotlivě.

### `npm run intake:validate-form`

- Nevalidní YAML nebo tabulátory v šabloně.
- Neunikátní id polí.
- Pole bez atributů, které jeho typ vyžaduje.
- Vadný tvar config.yml.

### `npm run intake:validate-workflow`

- Porušení kterékoli bezpečnostní invarianty, které intake workflow musí splňovat (oddělení oprávnění, tvar kroků).

### `npm run lint:component-reuse`

- Obsahová top-level šablona, která nezavolá žádnou sdílenou komponentu ui_* (page_header, breadcrumb, stat_tile, registry-card, empty_state, back_link_footer…).
- Šablona s vlastním <table> mimo macros/table.html, která nepoužije párovou komponentu table_advanced_table.

### `npm run lint:hardcoded-records`

- Identifikátor záznamu (CLM/SRC/CASE/GAP-##) v šabloně mimo komentář.
- Slug dossieru z kanonického registru v cestě `@/dossiers/<slug>/`.
- Slug dossieru jako řetězcový literál kdekoli v šabloně.
- Natvrdo zapsaný počet ve stat dlaždici (stat_tile(value=<číslo>)) — počet musí jít z dat.

### `npm run lint:historical-coupling`

- Identifikátor historického seed subjektu (jména a odvozené slugy) ve STRUKTURÁLNÍ části zdroje: šablony, navigační data, skripty, styly, JS moduly, konfigurace, CI.

### `npm run lint:source-outlets`

- Aliasing outletu: týž vydavatel zapsaný dvěma způsoby (například „ČT24“ vs „ČT24 (Česká televize)“) — jinak by tvrzení citující obojí vypadalo jako dvě nezávislé rodiny.

### `npm run validate:authorization`

- Dossier odkazující na autorizační záznam, který v data/authorizations.toml neexistuje.
- Subjektová entita dossieru, která není publicationRole = "subject" a dossierEnabled = true.
- Kontextová entita označená jako dossierEnabled nebo authorized.
- Subjekt bez dossierStatus = "authorized"; kontext s coverageState ve stavu developing nebo full.
- Entita bez provenance.discoveredAt (chybí auditní stopa objevení).
- Dossier citující autorizační záznam, jehož subjekty se s jeho vlastními nepřekrývají.

### `npm run validate:claude-tooling`

- CT1 — pravidlo v .claude/rules/ má parsovatelný frontmatter a neprázdné položky v paths
- CT2 — cesta uvedená v backticích v CLAUDE.md, pravidle nebo schopnosti existuje
- CT3 — markdownový odkaz vede na existující soubor
- CT4 — zmíněný `npm run <x>` je v package.json
- CT5 — odkaz na skill vede na existující .claude/skills/<jméno>/SKILL.md
- CT6 — skill uvádí, kdy se NEMÁ použít
- CT7 — jméno se neopakuje mezi skillem, agentem a workflow
- CT8 — workflow deklaruje jen existující skilly a agenty, personu ze závazného slovníku a cíl
- CT9 — zapisující skill, který mění sdílený stav nebo se dotýká rozsahu pokrytí, má disable-model-invocation

### `npm run validate:concepts`

- Koncept bez polí dlaždice (extra.tile_title / tile_summary / bullets) — jinak by na úvodní stránce tiše vznikl prázdný klikatelný box.
- Koncept v neznámé skupině — jinak by z úvodní stránky tiše zmizel úplně.

### `npm run validate:dossier-types`

- Entitní dossier, který vlastní byť jediný fyzický per-record soubor — každý registr, který ukazuje, musí být filtrovaná projekce, nikdy duplikát.

### `npm run validate:entity-types`

- Typ entity použitý v datech, který ve slovníku nemá záznam — jinak by skupina v registru entit nesla syrovou hodnotu místo názvu.
- Záznam ve slovníku, který v datech nikdo nepoužívá (mrtvý překlad).

### `npm run validate:learning`

- Rozbitý řetěz `next` nebo `next_route` — čtenář by skončil ve slepé uličce uprostřed kurzu.
- Prerekvizita na neexistující nebo cizí lekci, kterou šablona nedohledá.
- Duplicitní `lesson_id` a kód lekce neodpovídající kódu své úrovně.
- Nedosažitelná lekce — nevede na ni žádný `next` ani učební cesta.
- Učební cesta jmenující lekci, která neexistuje.
- Odkaz `related_kb` na neexistující stránku konceptu (a prefix `@/`, který get_page() nepřijímá).
- Cvičná data bez označení `synthetic` a cvičné URL mimo rezervovaný jmenný prostor (RFC 2606).
- Odpověď klasifikačního cvičení neodpovídající žádnému skutečnému stavu tvrzení.
- Cvičný identifikátor vyskytující se v data/dossiers/** — výuka nesmí být zadními vrátky k rozšíření rozsahu.

### `npm run validate:media`

- M1 — odkazovaný soubor v repozitáři skutečně existuje a není prázdný; mrtvá cesta by se vykreslila jako rozbitý rámeček v každém sociálním náhledu.
- M2 — licence je na seznamu svobodných licencí (scripts/media/lib/licences.mjs) a autor i datum stažení jsou vyplněné; u CC BY / BY-SA je uvedení autora podmínkou licence, ne zdvořilostí.
- M3 — sourceUrl vede na stránku souboru s licencí, ne na samotné bajty; rozhoduje hostitel a cesta, ne přípona (stránka na Commons se legitimně jmenuje File:Něco.JPG).
- M4 — žádný soubor v static/images/{people,logos,media} neleží v repozitáři bez záznamu, který by se k němu hlásil.

### `npm run verify:authorization-log`

- Editace nebo smazání existujícího záznamu logu proti merge-base s origin/master (fallback origin/main, pak HEAD).
- Ukotvený záznam, který v AGENTS.md už není byte-verně přítomen (hash-kotva data/authorizations-log-anchor.json).
- Záznam v logu, který v kotvě není — nový záznam vyžaduje vědomé ukotvení přes authorization:anchor (fail-closed).
- Neznámý tvar ### nadpisu v území logu (tiché ignorování je zakázané).

### `npm run build:data-exports`

- Tvar exportu proti schematům schemas/*.schema.json — brána běží uvnitř tohohle kroku (lib/export-schemas.mjs), aby se tvar veřejných exportů nemohl změnit bez vědomé úpravy schématu.

### `npm run build:tooling-catalog`

- G1–G6 stejně jako verify:tooling-catalog — audit běží v obou režimech, takže ani generátor nedoběhne nad katalogem, který neodpovídá repozitáři.
- Záznam v data/tooling/, který neodpovídá schematu tooling-command, nebo jehož identifier se liší od názvu souboru.

### `npm run archive:check-private`

- Chybějící nebo neúplný inventory.sha256, hash mismatch, chybějící manifestový soubor, nevalidní manifest nebo zbylý .part soubor.

### `npm run data:check-generated`

- C1 — kanonický záznam s routou bez právě jednoho staging stubu a právě jednoho view modelu; chybějící strukturální _index stuby a souhrnné view modely.
- C2 — sirotčí soubor: staging stub nebo view model, kterému neodpovídá záznam ani očekávaný strukturální soubor.
- C3 — stub bez extra.generated = true, s record_id ≠ @id záznamu nebo s view_model ukazujícím na neexistující soubor.
- C4 — routa staging stubu, která se neshoduje s dnešním data/generated/routes.json (rozdíly se vypisují oběma směry).
- C5 — top-level alias content souboru, který v odpovídajícím stubu chybí.

### `npm run data:check-generated:content`

- C1–C5 stejně jako data:check-generated.
- C6 — ruční drift content/**: soubor v pokrytém scope, který se liší od stagingu, nebo který ve stagingu nemá protějšek. Content je pro tyhle cesty generovaný artefakt, ruční edit je chyba brány.

### `npm run intake:validate`

- Manifest, který neodpovídá schématu intake manifestu.

### `npm run lint:generated-content`

- L1 — soubor v generovaném scope bez `generated = true` v [extra] (ručně vytvořená stránka).
- L2 — front matter klíč mimo povolenou obálku; doménová pole (status, sources, subjects, depth…) žijí výhradně v kanonických datech a view modelech.
- L3 — chybějící povinná obálková pole (generated, view_model), bez kterých šablona nemá datový vstup.

### `npm run test`

- Jakýkoli padlý test v uvedených adresářích. Několik validátorů (validate-issue-forms, validate-intake-workflow) je do sady zapojených přes vlastní test soubor právě proto, aby nemusely být samostatným krokem pipeline.

### `npm run test:intake`

- Padlý test kdekoli v intake pipeline.

### `npm run test:intake:e2e`

- Odchylka od očekávaných výsledků na matici golden fixtures.

### `npm run test:intake:form`

- Rozejití skutečné .github/ISSUE_TEMPLATE/navrh-dossieru.yml s parserem — chyba se pak neprojeví až na podání skutečného člověka.
- Povolené blank issues, contact_links slibující důvěrnost nebo anonymitu, obsahový formulář bez varování o veřejnosti a bez povinného potvrzovacího checkboxu.

### `npm run test:intake:github`

- Padlý test v GitHub vrstvě intake pipeline.

### `npm run test:intake:matching`

- Padlý test párování entit.

### `npm run test:intake:preflight`

- Padlý test preflightu URL, včetně SSRF politiky.

### `npm run test:intake:risk`

- Padlý test klasifikace rizika.

### `npm run validate:directory-index`

- Prázdné pole navíc v indexu (index tvrdí víc, než má obsah).
- Počet, který se neshoduje s compiled kanonickým modelem — tedy ručně dopsané číslo.
- Routa registru, která se neshoduje s navigačním manifestem.

### `npm run validate:graph-projections`

- Payload, který v manifestu chybí, nebo záznam manifestu bez souboru.
- Nesouhlasící hash payloadu.
- Referenční nekonzistence uvnitř projekcí a nepokrytí registrové vrstvy.

### `npm run validate:navigation`

- Osoba jako top-level položka sidebaru — skelet musí zůstat bez slugu, bez osoby a bez ručně psané per-dossier registry položky.
- Agregátní dossier s vlastním rozbalovacím podstromem (smí být jen jeden zřetelně označený odkaz, aby nešel splést s třetí osobou).
- Odkaz na něco, co na disku neexistuje.

### `npm run validate:navigation-metrics`

- Rozdíl mezi přepočítanými metrikami a data/generated/navigation-metrics.json — tedy zastaralý manifest.

### `npm run verify:anchors`

- Kotva clm-## nebo gap-## zapsaná v kanonickém těle dossieru, která v postaveném HTML není.
- case.anchor nebo kotva položky časové osy, které v postavené stránce neexistují jako id.
- Odkaz na #clm-## / #gap-##, který se v postavené stránce na žádné id nerozřeší.

### `npm run verify:export`

- Export z manifestu, který neexistuje nebo jehož bajty se nehašují na zapsanou sha256.
- Export, který neparsuje jako JSON nebo nenese @context a @graph.
- Uzel s markupem soudícím pravdivost (ClaimReview, Rating, reviewRating…).
- Claim uzel s prázdným `appearance`; duplicitní @id uvnitř dokumentu.
- vomaste:citationFingerprint, který se nepřepočítá z viditelných polí uzlu (url + vomaste:retrieved + publisher.name).

### `npm run verify:full-pages`

- Stránka tvrzení bez sekce citovaných zdrojů (id="clm-sources-h") nebo bez odkazu na Git provenance.
- Stránka zdroje bez metadatové tabulky (řádek „Odkaz“), bez sekce podporovaných tvrzení (id="src-claims-h") — s výjimkou záměrně kontextových zdrojů bez tvrzení — nebo bez odkazu na Git provenance.

### `npm run verify:jsonld`

- Blok application/ld+json, který neparsuje jako JSON.
- Jakýkoli ClaimReview, Rating/AggregateRating nebo klíč reviewRating/ratingValue — mechanická podoba redakčních pravidel 3 a 7: statusy webu popisují zdrojování, ne rozsouzenou pravdu.
- Stránka tvrzení bez Claim uzlu s neprázdným `appearance`; hlavní stránka entitního dossieru bez právě jednoho Person uzlu; Person na agregátním dossieru; chybějící povinná pole podle @type.
- `appearance` tvrzení, které neodpovídá přesně zdrojům deklarovaným tímtéž tvrzením uvnitř jeho vlastního dossieru — cizí záznam je chyba.
- Postavená stránka bez jediného JSON-LD bloku (jedinou výjimkou jsou alias přesměrování).

### `npm run verify:navigation-counts`

- Odznak v HTML s jinou hodnotou, než jakou nese data/generated/navigation-metrics.json.
- Odznak u navigační položky, která nemá přiřazenou metriku.

### `npm run verify:og`

- Chybějící nebo prázdná značka z enforce.required_og / enforce.required_twitter v data/seo.toml.
- og:url, které se neshoduje s <link rel="canonical"> — nebo kanonická URL na stránce, která ji podle enforce.without_canonical mít nemá.
- Relativní og:image, obrázek chybějící ve vydaném stromu, a twitter:image nebo og:image:secure_url mířící jinam než og:image.
- Titulek nebo popis mimo meze limits.* — včetně prázdného.
- Rozchod og:title / og:description s name / description stránkového uzlu JSON-LD (do T-076 se lišily na 2 246, resp. 463 stránkách).
- og:type mimo slovník seo.page_types, a nesoulad mezi record_type v content/** a klíči seo.page_types v OBOU směrech.

### `npm run verify:source-catalog`

- Rozdíl mezi vygenerovaným katalogem a tím, co leží v repozitáři — tedy zastaralé stránky /zdroje/ nebo docs/osint/SOURCE_CATALOG.md. Náprava: `npm run build:source-catalog`.

### `npm run verify:table-responsive`

- Tabulka v hotovém HTML bez předka .dossier-prose ani overflow-x-auto — na mobilu by se hroutila místo scrollování.

### `npm run verify:tooling-catalog`

- G1 — npm skript v package.json (mimo npm lifecycle hooky) bez záznamu v data/tooling/, a záznam ukazující na skript, který v package.json není.
- G2 — adresář .claude/skills/<name>/ se souborem SKILL.md bez záznamu, a záznam ukazující na skill, který neexistuje.
- G3 — recept v justfile bez záznamu, a záznam ukazující na recept, který v justfile není.
- G4 — identifier záznamu, který neodpovídá dvojici kind+name (slug ukazující na jiný příkaz, než jaký popisuje).
- G5 — deklarovaný sourceFile, který neexistuje, nebo který příkazová řádka npm skriptu vůbec nevolá.
- G6 — npm skript, který spouští soubor repozitáře jako svůj program, ale záznam sourceFile neuvádí.
- G7 — rozdíl mezi commitnutými stránkami / docs/TOOLING.md a tím, co by z dat vzniklo. Náprava: `npm run build:tooling-catalog`.

### `npm run archive:refresh-private`

- Selhání downloadu, chybný typ nebo velikost souboru, hash mismatch, zbylý .part soubor nebo jedinou indexovanou listinu chybějící v soukromém archivu.

### `npm run archive:refresh-public`

- Neúspěšný síťový dotaz, neočekávaný tvar odpovědi, neprázdnou soudní vývěsku bez individuálního review nebo následně červenou offline archivní bránu.

### `npm run media:fetch`

- Licence se čte ze strojových metadat zdroje PŘED stažením; soubor s nesvobodnou licencí se nestahuje vůbec.
- Identita subjektu se rozhoduje přes Wikidata (jen lidé, P31=Q5, obrázek z P18), ne fulltextem — hledání „Karel Havlíček“ na Commons vrací portrét Havlíčka Borovského.
- Bajty jdou do repozitáře, ne hotlink: cizí CDN se přeuspořádá a náhled se tiše rozbije.
- Když volný obrázek neexistuje, entita zůstane bez obrázku — žádný placeholder.

### `npm run build`

- Nenulový exit kteréhokoli kroku pipeline okamžitě zastaví běh — pipeline nepokračuje a vypíše, který krok selhal a s jakým kódem.

### `npm run dossier:next-id`

- Rozdíl mezi nejvyšším ID v lokálním working tree a na origin/master se ohlásí, ne přejde.

### `npm run dossier:scaffold`

- Odmítne běžet, pokud data/authorizations.toml nemá záznam s id == --authorization-record-id, jehož subjects zahrnují --subject. Placeholder pro neautorizovaný subjekt je stejně mimo hranice jako jeho tvrzení.

### `npm run check`

- Nenulový exit kteréhokoli z jeho kroků. Post-build brány sem nepatří — potřebují public/.

### `just doctor`

- Skončí nenulově, když node je starší než deklarovaná hlavní verze, zola neodpovídá deklarované vedlejší verzi, nebo chybí node_modules. Nenastavené git hooky se hlásí, ale exit kód neovlivňují.

### `just check`

- Nenulový exit kteréhokoli rychlého validátoru z pre-commit hooku — přesně toho, který by zablokoval commit.

## Příkazy podle kategorie

- **validace vstupů** (18): `npm run archive:check`, `npm run data:compile`, `npm run data:validate`, `npm run check:workflow-parity`, `npm run intake:validate-form`, `npm run intake:validate-workflow`, `npm run lint:component-reuse`, `npm run lint:hardcoded-records`, `npm run lint:historical-coupling`, `npm run lint:source-outlets`, `npm run validate:authorization`, `npm run validate:claude-tooling`, `npm run validate:concepts`, `npm run validate:dossier-types`, `npm run validate:entity-types`, `npm run validate:learning`, `npm run validate:media`, `npm run verify:authorization-log`
- **generování** (20): `npm run build:data-exports`, `npm run build:entity-type-sections`, `npm run build:government-roster`, `npm run build:graph-projections`, `npm run build:jsonld-exports`, `npm run build:navigation`, `npm run build:routes`, `npm run build:search-index`, `npm run build:source-catalog`, `npm run build:tooling-catalog`, `npm run css:build`, `npm run data:generate-content`, `npm run data:metrics`, `npm run data:sync-content`, `npm run data:views`, `npm run generate:candidates`, `npm run generate:discovery-log`, `npm run intake:index`, `npm run js:build`, `npm run report:evidence-plan`
- **kontrola výstupů** (58): `npm run archive:check-private`, `npm run data:check-generated`, `npm run data:check-generated:content`, `npm run intake:e2e-fixture`, `npm run intake:fixture`, `npm run intake:match-fixture`, `npm run intake:preflight-fixture`, `npm run intake:publish-fixture`, `npm run intake:validate`, `npm run lint:generated-content`, `npm run test`, `npm run test:e2e`, `npm run test:e2e:benchmark`, `npm run test:e2e:desktop`, `npm run test:intake`, `npm run test:intake:e2e`, `npm run test:intake:form`, `npm run test:intake:github`, `npm run test:intake:matching`, `npm run test:intake:preflight`, `npm run test:intake:risk`, `npm run validate:directory-index`, `npm run validate:graph-projections`, `npm run validate:navigation`, `npm run validate:navigation-metrics`, `npm run verify:anchors`, `npm run verify:export`, `npm run verify:full-pages`, `npm run verify:jsonld`, `npm run verify:navigation-counts`, `npm run verify:og`, `npm run verify:source-catalog`, `npm run verify:table-responsive`, `npm run verify:tooling-catalog`, `/a11y-review`, `/authorization-check`, `/build`, `/diagnose`, `/docs-sync`, `/editorial-review`, `/quality`, `/review-claim`, `/review-gap`, `/review-pr`, `/review-source`, `/seo-review`, `/source-family`, `/test`, `/ui-review`, `agent claim-reviewer`, `agent docs-auditor`, `agent editorial-reviewer`, `agent ui-reviewer`, `workflow review-a-dossier`, `workflow verify-a-claim`, `just doctor`, `just check`, `just test`
- **rešerše** (30): `npm run archive:refresh-private`, `npm run archive:refresh-public`, `npm run media:fetch`, `npm run prismatic:diff`, `npm run prismatic:drift`, `npm run prismatic:enrich-all`, `npm run prismatic:import`, `npm run prismatic:plan`, `npm run prismatic:probe`, `npm run prismatic:promote`, `npm run prismatic:review`, `npm run prismatic:run`, `npm run prismatic:status`, `npm run prismatic:verify`, `npm run screening:public-money`, `npm run sources:detect-family`, `/evidence-packet`, `/find-source`, `/investigate`, `/prismatic-bootstrap`, `/prismatic-drift-audit`, `/prismatic-enrich-all`, `/prismatic-promote`, `/research-question`, `/verify-source`, `agent source-verifier`, `workflow research-a-topic`, `workflow submit-a-source`, `just ares *args`, `just expand ico *args`
- **provoz** (52): `npm run authorization:anchor`, `npm run authorize:entity`, `npm run benchmark:graph`, `npm run build`, `npm run css:watch`, `npm run data:build`, `npm run dev`, `npm run dossier:next-id`, `npm run dossier:scaffold`, `npm run generate:all`, `npm run hooks:install`, `npm run check`, `npm run intake:github-event`, `npm run intake:process`, `npm run preflight`, `npm run serve`, `npm run test:update-golden`, `/academy-lesson`, `/adr`, `/bootstrap`, `/commit`, `/coop-status`, `/correction`, `/data-model`, `/diff-explain`, `/dossier-entry`, `/explain`, `/guide`, `/kb-entry`, `/pr`, `/project-tour`, `/schema-change`, `/task`, `agent repository-explorer`, `workflow first-code-contribution`, `workflow first-session`, `workflow fix-a-published-error`, `workflow fix-a-site-bug`, `workflow change-a-schema`, `workflow prepare-a-pull-request`, `workflow work-a-coop-task`, `just authorize entity`, `just build`, `just clean`, `just coop`, `just default`, `just dev`, `just hooks`, `just inbox`, `just regen`, `just scaffold slug title subject auth_record_id`, `just setup`

