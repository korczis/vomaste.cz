# CLAUDE.md

This is Claude Code's entry point for this repository. The full rules —
the dossier data model, editorial rules, and the append-only authorization
log for content about real people — live in `AGENTS.md`. Read it in full
before touching `content/`, `templates/`, or `scripts/dossier/`. The
append-only-ness of that log is now also mechanically checked
(`npm run verify:authorization-log`, part of the pre-commit hook and
`npm run build`) — but the check only catches an edited/removed prior
entry; it does not replace reading and applying the rule.

@AGENTS.md

## Claude-Code-specific notes

- **New session in this repo? Run the `bootstrap` skill first**
  (`.claude/skills/bootstrap/`) — it walks through reading the rules
  above, checking co-op status, verifying prerequisites, and picking a
  role (direct/ORCH vs. worker worktree) before you touch anything. For
  adding a specific CLM/SRC/CASE/GAP/relation once you're oriented, use
  the `dossier-entry` skill (`.claude/skills/dossier-entry/`) — it
  encodes the authorization-scope gate and the regeneration/validation
  steps below as a single guided flow. For a significant/debatable
  technical decision (new dependency, renderer swap, etc.), use the `adr`
  skill (`.claude/skills/adr/`) — measured-scale, not speculative. To run
  a whole authorized investigation end-to-end (scope check → branch →
  manifest → sourced research → PR, never auto-publish), use the
  `investigate` skill (`.claude/skills/investigate/`) — it orchestrates
  the steps above as one flow rather than duplicating them; see
  `docs/adr/aiad-and-agent-tooling-import.md` for why this is one skill
  and not an imported agent framework. For the commit itself, `commit`
  (`.claude/skills/commit/`) — message format, which gate actually
  applies, and the right coop-bus report.
- **Prismatic Platform integration (2026-08-05, scaffolded, not
  functional)**: `~/dev/prismatic-platform` is authorized as a local
  upstream research/enrichment capability provider
  (`AUTH-2026-08-05-PLATFORM-SCOPE` in `AGENTS.md`, "Standing scope
  authorization and publication gates"; architecture in
  `docs/adr/prismatic-platform-integration.md`). Four skills exist —
  `prismatic-bootstrap`, `prismatic-enrich-all`, `prismatic-promote`,
  `prismatic-drift-audit` (`.claude/skills/prismatic-*/`) — and eleven
  `prismatic:*` npm scripts (`scripts/prismatic/*.mjs`), but every one of
  them is currently a stub that prints "not implemented" and exits
  non-zero: there is no export contract, no identity resolution, no
  staging/review/promotion logic yet. Read each skill's own `SKILL.md`
  before invoking it — do not report Prismatic-sourced research as done
  unless you actually built and ran the missing pipeline first. Full
  build plan (explicitly unstarted beyond the governance/ADR/scaffolding
  landed so far):
  `docs/missions/2026-08-05-prismatic-platform-integration-master-prompt.md`
  + its companion checklist in the same directory. The public Zola build
  has no dependency on any of this and must keep working with the
  sibling repo entirely absent.
- `git commit` runs `.githooks/pre-commit` (installed automatically by
  `npm ci`/`npm install` via `scripts/setup/install-git-hooks.mjs`, or
  manually: `npm run hooks:install`) — a fast, pure-data validator subset.
  This is a convenience, not the real gate: it does **not** replace the
  full `npm run build` requirement below, and does not include
  `lint:historical-coupling` (still red — currently 58 residual
  occurrences of seed-subject identifiers in structural code, e.g.
  `templates/entity-dossier.html`, `scripts/data/build-view-models.mjs`
  — outside the build gate on purpose. The migration that was tracked as
  `docs/coop/TASKS.md` T-001 is done/superseded — see T-028 there — but
  this specific cleanup has no open tracking task right now; run
  `npm run lint:historical-coupling` yourself to see current occurrences
  before assuming it's clean).
- **On `master`, a commit auto-pushes.** `.githooks/post-commit`
  (installed the same way as pre-commit, since 2026-08-05) runs fetch →
  rebase onto `origin/master` → the **full** `npm run build` → `git push
  origin master` automatically after every commit made directly on
  `master` — push to `master` is the live GitHub Pages deploy, so this
  means committing on `master` now typically deploys within seconds,
  not "commit now, push later after a review pause." It aborts cleanly
  (commit stays local, nothing pushed) on a rebase conflict or a red
  full build; see `docs/coop/PROTOCOL.md`, "Automatický push po
  commitu" for the exact bail-out conditions and the recipe for the
  generated-file conflicts (golden test snapshot, discovery log,
  reports) that commonly cause the rebase step to need manual
  resolution when several instances are active. Consequence for your
  own workflow: get confirmation *before* committing directly on
  `master` for anything that should be reviewed first — there is no
  longer a safe pause between `git commit` and the push actually going
  out. `COOP_NO_AUTOPUSH=1 git commit …` opts a single commit out (the
  hook is a no-op in worker worktrees on `task/T-###` branches anyway).
- Treat the "Content about real parties" log in `AGENTS.md` as append-only
  and load-bearing: never edit or remove an existing entry, even to "clean
  up" wording or fix a typo. A new scope extension is always a brand-new
  dated subsection, added only after the site owner has explicitly
  authorized it on the record in the current conversation. A clear request
  to create, add, investigate, deepen or cover a named subject counts; do
  not demand a magic phrase or a second confirmation. The agent may draft
  the concrete scope from the request and directly opened public sources.
  Bulk authorization is also valid when the owner clearly requests it, but
  each resulting subject still gets a named, dated audit record.
  `scripts/dossier/authorize-entity.mjs`
  is the canonical writer. It supports either human-typed interactive
  confirmation or an agent recording the site owner's explicit decision in
  the current conversation via `--owner-authorized-in-conversation` and a
  verbatim `--scope-file`; CI and inferred authorization remain forbidden.
  `scripts/data/scaffold-dossier.mjs` (`npm run dossier:scaffold`)
  generates a new dossier's canonical package (`data/dossiers/<slug>/`)
  afterward, and itself refuses to run for any subject without a matching
  record in `data/authorizations.toml` (the audited transcription of the
  `AGENTS.md` log) — scaffolding "just a placeholder" for an unauthorized
  subject is exactly as out of scope as writing their claims directly.
- Before reporting any dossier edit as done, run `npm run build`
  (`scripts/build/pipeline.mjs`: `data:validate` → view models →
  regenerated content adapters → tests + validators → generators →
  CSS/JS → `zola build` → `verify:anchors`/`verify:jsonld`/
  `verify:full-pages`) and confirm it exits clean. The canonical
  validators and post-build checks are the actual spec for this content,
  not a formality — a passing build is the bar, not a nice-to-have. For
  a fast edit loop on one record:
  `npm run data:validate -- --file data/dossiers/<slug>/claims/clm-NN.json`.
- `npm run dev` starts `zola serve` as a long-running process (it never
  exits on its own). Run it with a background-capable tool and watch its
  log for "Web server is available" rather than waiting on it
  synchronously.
- Adding a new CLM/SRC/GAP **record** is a pure data operation: write the
  canonical JSON file under `data/dossiers/<slug>/…`, run
  `npm run data:validate`, then `npm run data:build` to regenerate view
  models and content adapters — no template, schema or validator edit
  needed, and drift between table, detail page and exports is impossible
  by construction. Adding a new **field** to a record type still touches
  three places that must stay consistent: the canonical schema
  (`schemas/canonical/<kind>.schema.json`, `additionalProperties: false`
  fails the build otherwise, which is the point), the view-model builder
  (`scripts/data/build-view-models.mjs`) and the template/export that
  consumes it. A field no consumer reads, or a template field with no
  schema coverage, is a half-finished change — see
  `docs/data-contract.md` for the full contract.
- **`data/` is canonical, `content/` is a generated adapter, and every
  published page carries JSON-LD.** Never hand-edit a page in the
  generated scope (`isSyncedPath` in `scripts/data/sync-content.mjs`:
  `content/dossiers/<slug>/_index.md`,
  `content/dossiers/<slug>/{claims,sources,cases,gaps,relations}/*.md`,
  `content/entities/*.md`) — edit `data/dossiers/**` and run
  `npm run data:build`. Enforced by `npm run data:check-generated:content`
  (byte parity with the staging tree) and `npm run lint:generated-content`
  (envelope). One trap worth knowing: inside `npm run build` the sync step
  runs *before* the parity gate, so a hand edit is silently overwritten
  instead of reported — run `npm run data:check-generated:content` on its
  own when a `content/` diff looks suspicious. `npm run verify:jsonld`
  (post-build) requires at least one `application/ld+json` block on every
  built page (only Zola alias redirects are exempt) plus the per-type node
  shape; case/gap/relation/entity pages are machine-readable only as
  pages — their record nodes live in the `/data/*.jsonld` exports. Full
  rule with the list of legitimately hand-written pages: `AGENTS.md`,
  "Canonical data model: JSON-first (T-028)".
- **Where the evidence work stands is generated, not remembered.**
  `npm run report:evidence-plan` (in `data:build` and `build`) writes
  `reports/evidence-plan.md` + `data/generated/evidence-plan.json` — per
  dossier: claim counts by status and by evidence class, corroboration
  potential, gaps, a data-derived priority and a concrete next step. Read
  it instead of asking "what should I work on"; never hand-maintain a
  parallel todo list, it would be stale before the next commit.
- **Discovery is unblocked; publishing findings is not.** Since 2026-07-30
  these are two different acts and only the second is gated:
  - **Recording that a registry relation exists** — a context entity
    record (`data/dossiers/_shared/entities/<id>.json` with
    `publicationRole: "context"`, `dossierEnabled: false`,
    `dossiers: []`, no claims) for a company or person a public register
    or an already-cited source itself names — needs **no** authorization
    and no asking. `scripts/osint/expand-entity.mjs` writes these
    canonical JSON records from ARES (the `/entities/…` pages are
    regenerated adapters, `npm run data:build`);
    `build-government-roster.mjs` already did it for the cabinet.
    `validate-authorization.mjs` and canonical rule S6
    (`validate-semantics.mjs`) permit exactly this shape and block only
    the promotion of such an entity to a dossier subject.
  - **Writing claims about someone, or opening a dossier on them**, still
    requires an explicit, dated authorization from the site owner in
    `AGENTS.md`, recorded through `authorize-entity.mjs`. The owner may type
    it interactively or clearly request the dossier/investigation in the
    current conversation. The agent records a concrete scope and proceeds
    without another approval round. CI and background automation still
    cannot invent owner intent, and "the registry is public" alone is not
    an instruction to publish.
  When in doubt about which of the two you are doing, you are writing a
  claim — stop and ask. Personal data (dates of birth, home addresses) is
  never copied out of a registry in either case.
- **Než začneš hledat, přečti si katalog zdrojů** —
  `docs/osint/SOURCE_CATALOG.md` (publikovaná podoba `/zdroje/`). Odpovídá
  na otázku, kterou si rešerše klade jako první: který registr vůbec
  odpoví, co z jeho odpovědi lze citovat a na jaké pasti se v něm už
  najelo. Ušetří to opakované placení téhož poznatku — že ARES rozlišuje
  dva různé významy odpovědi 404, že registr smluv tiše ignoruje
  `format=json` i vlastní stránkování, že věstník veřejných zakázek vrací
  nefiltrovaná data na filtr, který neumí. Záznamy jsou
  `data/source-catalog/*.json`, stránky i markdown jsou generované
  (`npm run build:source-catalog`, kontrola driftu
  `npm run verify:source-catalog`) — neupravuj je ručně. Narazíš-li na
  nový zdroj nebo novou past, patří to jako záznam do katalogu, ne do
  commit zprávy, kde to najde jen ten, kdo ví, že to má hledat.
- Projekt je Open Intelligence Commons — přečti si a řiď se
  `docs/constitution/OPEN_INTELLIGENCE_COMMONS.md` (závazné invarianty
  shrnuty v AGENTS.md). Nad všemi kompromisy pohodlí dominují dvě
  pravidla: nic z chráněné intake zóny (nepublikované podněty, citlivé
  důkazy, materiál identifikující zdroj) nesmí nikdy vstoupit do tohoto
  veřejného repozitáře ani jeho Git historie; a žádný text v
  dokumentaci ani UI nesmí tvrdit bezpečnostní/příspěvkové schopnosti
  (bezpečný intake, anonymita, příspěvkové CLI), které nejsou skutečně
  implementované a vynucované.
- **UI component reuse is a real, enforced gate** —
  `npm run lint:component-reuse` (part of `npm run build`, pre-commit,
  and CI) fails if a content template doesn't import and use
  `macros/ui.html` (`page_header`, `breadcrumb`, `stat_tile`,
  `registry-card`, `empty_state`, `back_link_footer`). Be precise about
  what this actually checks: the owner asked for pages to "comply with
  flowbite.com/docs/getting-started/llm/" — that page and its linked
  `llms.txt`/`llms-full.txt` were fetched and read directly and contain
  no concrete, machine-checkable rules (a navigational index into
  Flowbite's docs, not a conformance spec). There is nothing there to
  honestly enforce. What IS real is this site's own established
  component-reuse convention, which this gate protects. Od 2026-07-30
  brána navíc vynucuje jednotnou tabulkovou komponentu: šablona
  obsahující `<table` mimo `macros/table.html` musí importovat
  `macros/table.html` a použít `table::advanced_table` (výjimky jen
  per-file s odůvodněním v `TABLE_EXEMPT`). Obal tabulky nese
  `data-record-type` provazující řádky s JSON-LD uzly stránky; DuckDB
  zdroj dat pro tabulky je jen plán, neimplementováno. Don't describe
  this gate as "Flowbite LLM page compliance" anywhere — that would be
  exactly the kind of claimed-but-not-real enforcement the constitution
  forbids (§8: a policy nothing enforces doesn't count as implemented —
  the same applies in reverse to a gate enforcing something that isn't
  actually specified anywhere).
- Multi-instance co-op: when several Claude Code instances work this repo
  in parallel, follow `docs/coop/PROTOCOL.md`. Check
  `scripts/coop/coop.sh status` at session start (a SessionStart hook
  prints it), report over the bus with `coop.sh send`, and respect the
  single-writer rule: only the ORCH instance (main checkout, `master`)
  edits `docs/coop/TASKS.md`, merges, and pushes. Workers live in
  `~/dev/vomaste-worktrees/T-###` on `task/T-###` branches, one task per
  instance, and merge-request only with a clean `npm run build`.
- **Why 9 skills and not a large agent/command ecosystem**: this repo's
  Claude Code tooling (`.githooks/pre-commit`, `scripts/setup/`, the 5
  core skills plus the 4 `prismatic-*` scaffolds) is deliberately scaled
  to what a small, single-purpose Zola static site actually needs — not a
  port of a large platform's agent/command registry. That would be
  exactly the "doctrine/agent sprawl" the constitution's
  operational-discipline invariants warn against
  (`docs/constitution/OPEN_INTELLIGENCE_COMMONS.md`), adding maintenance
  surface with no measured need. If a genuine new need shows up, add the
  smallest thing that addresses it (another skill, another validator) —
  not a framework in anticipation of needs this repo doesn't have yet.
  `investigate` is the worked example: a 2026-07-30 request to import
  Prismatic's AIAD framework (549 agents, 234 commands, 1,636 files — see
  `docs/adr/aiad-and-agent-tooling-import.md` for the measured
  comparison) was evaluated and declined on exactly this reasoning, and
  the smallest thing that addressed the actual need — one more skill —
  was added instead. The 4 `prismatic-*` skills added 2026-08-05 are the
  same reasoning applied a second time, after the owner explicitly lifted
  the earlier ban on using the platform itself (not on copying its
  tooling tree): four thin, repository-specific skills that call a
  versioned export contract, not the AIAD framework this ADR still
  declines. Same reasoning `adr` asks you to apply to a dependency,
  applied to this repo's own tooling.
