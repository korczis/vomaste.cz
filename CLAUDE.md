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
- `git commit` runs `.githooks/pre-commit` (installed automatically by
  `npm ci`/`npm install` via `scripts/setup/install-git-hooks.mjs`, or
  manually: `npm run hooks:install`) — a fast, pure-data validator subset.
  This is a convenience, not the real gate: it does **not** replace the
  full `npm run build` requirement below, and does not include
  `lint:historical-coupling` (still red during the in-progress
  de-specialization migration, see `docs/coop/TASKS.md` T-001).
- Treat the "Content about real parties" log in `AGENTS.md` as append-only
  and load-bearing: never edit or remove an existing entry, even to "clean
  up" wording or fix a typo. A new scope extension is always a brand-new
  dated subsection, added only after the site owner has explicitly
  authorized it on the record in the current conversation — not inferred
  from a request to "add more detail" or "cover X too." This applies at
  any scale: a request to authorize many subjects at once (e.g. "the
  whole cabinet", "everyone in party X") is the same rule, not a bulk
  exception — every one of them needs their own named, dated, topic-
  specific entry, never a blanket one. `scripts/dossier/authorize-entity.mjs`
  (interactive-only, human-typed scope text, no non-interactive/CI path)
  is the only thing that writes a new authorization entry;
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
    `AGENTS.md`, written by a human through `authorize-entity.mjs`. No
    automation may create one, and "the registry is public" is not a
    substitute for it.
  When in doubt about which of the two you are doing, you are writing a
  claim — stop and ask. Personal data (dates of birth, home addresses) is
  never copied out of a registry in either case.
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
- **Why 5 skills and not a large agent/command ecosystem**: this repo's
  Claude Code tooling (`.githooks/pre-commit`, `scripts/setup/`, the 5
  skills above) is deliberately scaled to what a small, single-purpose
  Zola static site actually needs — not a port of a large platform's
  agent/command registry. That would be exactly the "doctrine/agent
  sprawl" the constitution's operational-discipline invariants warn
  against (`docs/constitution/OPEN_INTELLIGENCE_COMMONS.md`), adding
  maintenance surface with no measured need. If a genuine new need shows
  up, add the smallest thing that addresses it (another skill, another
  validator) — not a framework in anticipation of needs this repo
  doesn't have yet. `investigate` is the worked example: a 2026-07-30
  request to import Prismatic's AIAD framework (549 agents, 234
  commands, 1,636 files — see `docs/adr/aiad-and-agent-tooling-import.md`
  for the measured comparison) was evaluated and declined on exactly this
  reasoning, and the smallest thing that addressed the actual need — one
  more skill — was added instead. Same reasoning `adr` asks you to apply
  to a dependency, applied to this repo's own tooling.
