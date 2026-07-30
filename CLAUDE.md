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
  skill (`.claude/skills/adr/`) — measured-scale, not speculative. For
  the commit itself, `commit` (`.claude/skills/commit/`) — message
  format, which gate actually applies, and the right coop-bus report.
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
  `scripts/dossier/scaffold-entity-dossier.mjs` (`npm run scaffold:dossier`)
  generates a new dossier's placeholder file structure afterward, and
  itself refuses to run for anyone without a matching `AGENTS.md` entry —
  scaffolding "just a placeholder" for an unauthorized subject is exactly
  as out of scope as writing their claims directly.
- Before reporting any dossier edit as done, run `npm run build`
  (`validate:dossier` → `css:build` → `js:build` → `zola build` →
  `verify:anchors`) and confirm it exits clean. The validator and
  anchor-checker are the actual spec for this content, not a formality —
  a passing build is the bar, not a nice-to-have.
- `npm run dev` starts `zola serve` as a long-running process (it never
  exits on its own). Run it with a background-capable tool and watch its
  log for "Web server is available" rather than waiting on it
  synchronously.
- Adding a new CLM/SRC/GAP item touches three places that must stay
  consistent: the front-matter schema of that content type, the
  corresponding template, and the checks in `scripts/dossier/`. A new
  front-matter field with no template reading it, or a template field with
  no validator coverage, is a half-finished change — finish all three
  before calling it done.
- When in doubt about whether a piece of content falls inside the
  currently authorized scope, stop and ask — do not extend coverage to a
  new person, company, or controversy on your own judgment.
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
- **Why 4 skills and not a large agent/command ecosystem**: this repo's
  Claude Code tooling (`.githooks/pre-commit`, `scripts/setup/`, the 4
  skills above) is deliberately scaled to what a small, single-purpose
  Zola static site actually needs — not a port of a large platform's
  agent/command registry. That would be exactly the "doctrine/agent
  sprawl" the constitution's operational-discipline invariants warn
  against (`docs/constitution/OPEN_INTELLIGENCE_COMMONS.md`), adding
  maintenance surface with no measured need. If a genuine new need shows
  up, add the smallest thing that addresses it (another skill, another
  validator) — not a framework in anticipation of needs this repo
  doesn't have yet. Same reasoning `adr` asks you to apply to a
  dependency, applied to this repo's own tooling.
