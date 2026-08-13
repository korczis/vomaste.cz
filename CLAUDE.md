# CLAUDE.md

@AGENTS.md

Výše importovaný `AGENTS.md` je **kanonický**: datový model, redakční
pravidla a append-only autorizační log pro obsah o skutečných lidech.
Tenhle soubor ho neopakuje. Drží jen to, co platí **vždy a pro každého**,
a rozcestník k tomu ostatnímu.

## Co tenhle repozitář je

Statický web (Zola) postavený nad obecným rámcem pro neutrální,
zdrojovaná „dossiery" o veřejně reportovaných kauzách veřejných osob.
Které dossiery existují, se **nepíše do prózy** — kanonický dataset je
`data/dossiers/**/*.json` a adresář s `dossier.json` *je* registrace.
Živý seznam je na `/dossiers/`.

Projekt je Open Intelligence Commons: závazné invarianty shrnuje
`AGENTS.md`, plné znění je
`docs/constitution/OPEN_INTELLIGENCE_COMMONS.md`.

## Nepodkročitelné

1. **`data/` je kanonické, `content/` je generovaný adaptér.** Ruční
   editace generované stránky není oprava — uprav `data/dossiers/**`
   a spusť `npm run data:build`. Sync uvnitř `npm run build` běží dřív
   než paritní brána, takže se ruční zásah do těla stránky **tiše
   přepíše**; ohlásí ho jen samostatné
   `npm run data:check-generated:content`.
2. **Objevit vazbu ≠ publikovat tvrzení.** Kontextová entita
   (`publicationRole: "context"`, bez tvrzení) autorizaci nepotřebuje.
   Tvrzení o člověku a otevření dossieru se řídí rozsahem v `AGENTS.md`.
   Když nevíš, který z těch dvou děláš, děláš ten druhý — zastav se
   a zeptej.
3. **Autorizační log je append-only.** Existující záznam se neupravuje
   ani neodstraňuje, ani kvůli překlepu. Nová autorizace je vždy nová
   datovaná podsekce. Kanonický zapisovatel je
   `scripts/dossier/authorize-entity.mjs`; mechanicky hlídá
   `npm run verify:authorization-log`, ale ten pozná jen změněný
   existující záznam — pravidlo samo si musíš přečíst a použít.
   **Žádný nástroj v tomhle repozitáři autorizaci neuděluje.**
4. **Zone B nikdy nevstoupí do Gitu.** Nepublikované podněty, citlivé
   důkazy, materiál identifikující zdroj. Žádné výjimky, žádné
   „dočasně" — Git nezapomíná.
5. **Neinzeruj schopnost, kterou nic nevynucuje.** Konstituce §8 platí
   na dokumentaci, UI i na popisy vlastního toolingu.
6. **Brána kvality je `npm run build`, ne pre-commit.** Nic neohlašuj
   jako hotové, dokud neskončí s exit 0. Pre-commit je rychlá
   podmnožina a záměrně neobsahuje všechno.

## Na master commit = deploy

`.githooks/post-commit` a `.githooks/post-merge` sdílejí jednu rutinu
(`.githooks/lib/auto-push-master.sh`): po **každém** commitu i mergi
přímo na `master` proběhne fetch → rebase na `origin/master` → **plný**
`npm run build` → `git push origin master`. Push na `master` je živý
GitHub Pages deploy.

Důsledek: mezi „commitnuto" a „nasazeno" **není pauza na rozmyšlenou**.
Než commitneš přímo na `master` cokoli, co má někdo napřed vidět, sežeň
potvrzení. `COOP_NO_AUTOPUSH=1 git commit …` vyřadí jeden commit;
ve worker worktree na větvi `task/T-###` je hook no-op.

Podmínky odstoupení (konflikt rebase, červený build) a recept na
konflikty generovaných souborů: `docs/coop/PROTOCOL.md`, „Automatický
push po commitu a mergi".

## Archivace úředních podkladů

<!-- DOCUMENT_ARCHIVE_DOCTRINE_V1 --> Povinná pro každou změnu dossieru
a entity. `npm run archive:check` je offline vlastník a běží v
pre-commit hooku i ve všech režimech pipeline. **Zone A** (veřejný Git
a UI `/dokumenty/`) nese jen sanitizovaná data a jednotlivě revidované
dokumenty; **Zone B** (raw Justice metadata, originální listiny,
neprázdné odpovědi vývěsek) žije mimo Git pod `~/dev/vomaste-archive`
nebo `VOMASTE_JUSTICE_ARCHIVE_ROOT`. IČO se nikdy nehádá, soudní
vývěska se nikdy nehledá podle jména, negativní odpověď znamená jen
„v den dotazu nebylo aktivní vyvěšení". Plné znění: `AGENTS.md`
a `.claude/rules/archive.md`.

## Kde co najít

| Chci | Kde |
|---|---|
| začít session | skill `/bootstrap` |
| nevím, co dál | skill `/guide` |
| ověřit prostředí | skill `/diagnose` |
| co který příkaz dělá | `docs/TOOLING.md` (generovaný) |
| pravidla pro část stromu | `.claude/rules/` (path-scoped, načtou se samy) |
| datový kontrakt | `docs/data-contract.md` |
| kde stojí důkazní práce | `reports/evidence-plan.md` (generovaný) |
| kam se dívat při rešerši | `docs/osint/SOURCE_CATALOG.md` (generovaný) |
| souběžná práce víc instancí | `docs/coop/PROTOCOL.md` |
| fakta o Claude Code | `docs/claude-code/compatibility.md` |

`.claude/rules/` se načítají samy, když sáhneš na odpovídající soubory —
nemusíš je hledat. Vždy načtený je jen slovník person a úrovní rizika
(`.claude/rules/personas.md`).

Dvě věci, které se **nikdy nepíšou ručně**, i když to tak vypadají:
`docs/TOOLING.md` a `docs/osint/SOURCE_CATALOG.md`. Obojí generuje
build a paritní brána shodí commit, který je rozejde s daty.

## Tooling `.claude/`

Skills, subagenti a workflow jsou tři vrstvy jedné věci: skill je
postup, agent specialista v izolovaném kontextu, workflow uživatelská
cesta. Katalog je **generovaný a obousměrně hlídaný** — schopnost bez
záznamu v `data/tooling/` shodí build, a stejně tak mrtvý záznam.

Než přidáš další, přečti `.claude/rules/claude-tooling.md`: pět otázek,
při první „ne" schopnost nevzniká. Nejdůležitější z nich je čtvrtá —
**pravidlo, které jde vynutit kódem, se nevynucuje promptem.**

Proč tahle vrstva vůbec existuje, jaké má meze růstu a proč se
neimportoval cizí agent framework:
`docs/adr/claude-native-contributor-operating-environment.md`
a `docs/adr/aiad-and-agent-tooling-import.md`.

## Souběžná práce

Když repozitář zpracovává víc instancí, platí `docs/coop/PROTOCOL.md`:
`scripts/coop/coop.sh status` na začátku session (vypisuje ho
SessionStart hook), hlášení přes sběrnici `coop.sh send`, a pravidlo
jednoho zapisovatele — `docs/coop/TASKS.md` edituje, merguje a pushuje
**jen ORCH** (hlavní checkout na `master`). Workeři žijí
v `~/dev/vomaste-worktrees/T-###` na větvích `task/T-###`, jeden úkol
na instanci, a merge žádají jen s čistým `npm run build`.

## Prismatic

`~/dev/prismatic-platform` je autorizovaný lokální upstream pro rešerši
a obohacování (`AUTH-2026-08-05-PLATFORM-SCOPE`, architektura
`docs/adr/prismatic-platform-integration.md`). **Nikdy není citovatelný
zdroj**: může najít kandidáta nebo ukázat, kde hledat — citace pak míří
na registr.

Skutečné a otestované: `prismatic:status`, `prismatic:probe`,
`prismatic:plan` (poslední úzce omezený na jednu auditovanou schopnost —
ARES dohledání u entit bez `externalIds.ico`; nový typ úlohy tam
nepřidávej, dokud se nepodíváš do
`docs/audits/2026-08-05-prismatic-capability-map.md`). **Stále stuby**:
`run`, `import`, `diff`, `review-report`, `promote`, `verify`, `drift`,
`enrich-all`. Než něco ohlásíš jako hotové z Prismaticu, přečti
`SKILL.md` toho skillu a ověř, že chybějící kus pipeline skutečně
existuje. Veřejný build na Prismaticu nestojí a musí fungovat i s úplně
chybějícím sousedním repozitářem.
