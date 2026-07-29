# ADR: on-site rendering of repo Markdown docs, and whether to adopt Mermaid.js

**Status**: accepted (Markdown viewer), deferred (Mermaid) — revisit at the threshold below.
**Date**: 2026-07-30.

## Measured current scale

```
Mermaid code fences (```mermaid) anywhere in the repo:      0
Markdown files outside content/ (AGENTS.md, README.md,
CONTRIBUTING.md, LICENSE.md, SECURITY.md, docs/**):         20+
Current static/js/app.js bundle (Alpine + Flowbite +
all site JS incl. graph-view.js):                           ~181 KB
Runtime devDependencies today:                               6
  (alpinejs, autoprefixer, esbuild, flowbite, postcss, tailwindcss)
Client-side diagram/markdown libraries used today:            0
```

Checked directly: `grep -rn '```mermaid' --include='*.md' .` (excluding
`node_modules/`, `public/`, worktrees) returns zero matches anywhere in
this repository, in any branch of the main checkout, right now.

## Question asked

Site owner asked to "properly integrate mermaid.js + markdown.js or the
best alternatives" so that "markdowns and mermaids render correctly",
and to document the decision in `AGENTS.md` and its related docs.

This is actually two separate, differently-justified decisions, and
this ADR treats them separately rather than as one bundled adoption —
same reasoning as `docs/adr/graph-renderer.md`'s objection to bundling
unrelated technology adoptions into one decision.

## Decision

**Markdown rendering: adopt, but not a client-side library.** This
project's governance docs (`AGENTS.md`, `README.md`, `CONTRIBUTING.md`,
`LICENSE.md`, `SECURITY.md`, `docs/constitution/`, `docs/adr/`) are
readable on GitHub but were not reachable as real pages on
`vomaste.cz` itself. Zola already has a build-time Markdown renderer —
that is its core function for `content/`. The fix is to point that same
renderer at these root/`docs/` files too, via Zola's `load_data(path=…,
format="plain")` + the built-in `markdown` Tera filter, in a new
`docs-viewer` template and a new `/dokumentace/` content section. Zero
new npm dependencies, zero new client-side JS, works with JavaScript
disabled (this project's stated no-JS-fallback principle for critical
content), and the rendered page's source is always exactly the same
file GitHub renders — no second, driftable copy.

**Mermaid.js: not adopted now.** Zero measured need — no document in
this repository contains a Mermaid diagram today. Adding a client-side
diagram-rendering library (Mermaid's bundle is itself in the hundreds of
KB) for content that doesn't exist yet is exactly the "considered future
requirements the current task doesn't have" pattern this project's own
conventions (and `docs/adr/graph-renderer.md`) warn against. See
"Revisit threshold" for the concrete, cheap adoption path for when a
real diagram need shows up.

## Reasoning

**Why not a client-side Markdown library (e.g. `marked`, `markdown-it`)
for the viewer**: it would duplicate a capability Zola already has at
build time, add a new runtime dependency and a client-side fetch step,
and — critically — break with no JavaScript, which this project treats
as a hard requirement for anything that isn't genuinely interactive
(README: "Statický web nemá žádný běhový backend; kritický obsah má
no-JS fallback"). A governance document is exactly "critical content."
The build-time approach has none of these costs and reuses
infrastructure this project already depends on.

**Why not adopt Mermaid speculatively**: same reasoning as the graph
renderer ADR — real, ongoing maintenance surface (a new dependency, a
new bundle to keep updated, a new thing every future template has to
consider) for zero content that needs it today. If/when a doc needs a
diagram, Zola's default code-fence handling already degrades safely: a
```mermaid fence renders today as an inert, readable plain-text code
block (no error, no broken page) — there is no "unrendered mess" to fix
urgently.

**Why this isn't the same collision-risk category as the landing-page
work happening concurrently**: this decision adds a wholly new content
section and template (`content/dokumentace/`, `templates/docs-viewer.html`)
rather than editing `templates/index.html`, `templates/base.html`, or
`config.toml` — the specific files another concurrent session is
actively working on right now (confirmed via `docs/coop/TASKS.md` /
coop bus before starting this ADR and its implementation).

## What this enables concretely

A new `/dokumentace/` section listing and rendering, as real Zola pages
with normal navigation/breadcrumbs/JSON-LD like any other page:
`AGENTS.md`, `CONTRIBUTING.md`, `README.md`, `LICENSE.md`,
`SECURITY.md`, `docs/constitution/OPEN_INTELLIGENCE_COMMONS.md`, and
`docs/coop/PROTOCOL.md`. Each page's front matter names the one source
file it renders (`extra.source_file`) — the template does the rendering,
so there is exactly one canonical copy of each document's text, same as
this project's existing single-source-of-truth rule for claims/cases.

Not included in this round (kept minimal, see coop bus note before this
ADR): a `data/navigation.toml` primary-nav entry — that file's own
validator (`validate-navigation.mjs`) enforces specific invariants about
entity/aggregate dossiers being its only tree, and adding an unrelated
item there deserves its own considered pass rather than being folded
into this change. The new section is reachable and linked contextually
from `CONTRIBUTING.md`/`README.md` "Hlubší dokumentace" in the meantime.

**Known minor gap, honestly noted rather than silently left**: the
site-wide "✎ Navrhnout opravu této stránky" footer link
(`templates/base.html`) points at `content/dokumentace/<slug>.md` — the
thin wrapper page, not the real source file (`AGENTS.md`,
`CONTRIBUTING.md`, etc.) that actually needs editing to change the
rendered text. Fixing this means editing `templates/base.html`'s
edit-link logic to special-case `page.extra.source_file` when present —
deliberately not done in this change since `base.html` is a file another
concurrent session is actively editing right now (confirmed on the coop
bus); folding an unrelated edit into that file mid-flight would risk
exactly the kind of collision this project's coop protocol exists to
prevent. Tracked as a small follow-up, not silently shipped as if it
weren't a gap.

## Revisit threshold

- **Mermaid.js**: reconsider the first time an actual `docs/**` or
  root-level Markdown file gains a real ` ```mermaid ` diagram someone
  wants rendered — at that point, add the Mermaid CDN script scoped to
  only the `docs-viewer` template (the same CDN-only-where-needed
  pattern already used for Chart.js/Cytoscape.js, per README's Stack
  section), not a global site-wide bundle addition. That is a
  single-line template change once the actual need exists — cheap to
  defer, not cheap to justify speculatively today.
- **`data/navigation.toml` entry for `/dokumentace/`**: reconsider once
  the section has real traffic/interest, or the site owner asks for it
  in primary nav — not bundled into this change.
