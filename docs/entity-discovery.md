# Entity discovery and the authorization gate

This document describes how new entities enter this site's data model, and
— more importantly — how they explicitly do **not** become new dossiers.
It is a description of a standing process, not itself an authorization for
anything; see `AGENTS.md` for the actual, append-only authorization record.

## The pipeline

```
publicly documented mention in a source/claim
  → candidate entity (name, type, provenance)
  → canonical global entity record (data/dossiers/_shared/entities/<id>.json,
    with structured `provenance`; its /entities/<id>/ page is a generated adapter)
  → sources, relations, claims attached with real provenance
  → listed in the authorization-candidates report (internal, not published)
  → [ human decision by the site owner, recorded in AGENTS.md ]
  → only then: dossierStatus flips to "authorized", a dossier may exist
```

Everything left of the bracketed step can be produced mechanically —
`scripts/osint/expand-entity.mjs` (ARES registry neighbourhood) and
`scripts/dossier/build-government-roster.mjs` (public office) already
write exactly this shape. Everything at and after the bracketed step
requires a human, on the record, every time.

## Why the gate exists

If discovery could authorize itself — if appearing in enough sources, or
appearing in the graph at all, were treated as implicit permission to
publish a full profile — the software would be deciding whom to publicly
investigate, and then manufacturing its own audit trail to justify it
after the fact. That is not an audit trail; it is administrative fiction.
The site's entire editorial model (see `AGENTS.md`) depends on every
scope decision being a traceable, dated, human choice. Automating the
mechanical parts of discovery is fine. Automating the *decision* is not.

## What a context entity is allowed to have

A context entity (`publicationRole: "context"`, `dossierStatus:
"not_authorized"` in its canonical record) may have:

- a canonical page at `/entities/<id>/`,
- its real, sourced `claims`/`sources`,
- its real relations to other entities, each with its own claim/source,
- appearances across one or more already-authorized dossiers.

A context entity must never have:

- `dossierEnabled: true`,
- `dossierStatus: "authorized"`,
- an invented biography or profile beyond what the citing source actually
  supports,
- its own case/theme dossier,
- an entry in `AGENTS.md`'s authorization log.

`scripts/dossier/validate-authorization.mjs` and canonical rule S6
(`scripts/data/validate-semantics.mjs`, part of `npm run data:validate`)
enforce all of the above at build time — it is not just a convention, it
is a build-failing invariant.

## The authorization-candidates report

`scripts/dossier/generate-authorization-candidates.mjs` produces:

- `data/generated/authorization-candidates.json` (machine-readable),
- `reports/authorization-candidates.md` (for the site owner to read).

Both list every current context entity with its provenance (claims,
sources, independent source-family count, relations) and an explicit
"missing: owner authorization" flag. Neither file is a Zola content page —
they live outside `content/`, are never routed, and are never rendered as
a public page. Publishing "people we might investigate next" would itself
be an editorial overreach this site's rules exist to prevent; the report
exists only so the site owner's next authorization decision, if any, is
informed by real data rather than made from memory.

## Promoting a context entity to a subject

The only way an entity's `dossier_status` becomes `"authorized"` is
`scripts/dossier/authorize-entity.mjs`, run by the site owner, locally, at
a real keyboard:

```
node scripts/dossier/authorize-entity.mjs <entity-id>
```

It refuses to run at all unless attached to an interactive TTY — no CI job,
build step, or agent tool call can invoke it non-interactively, because
there is no flag that skips the prompts. It requires the operator to type,
in three separate steps: the exact entity id (confirming which entity),
the authorized scope in their own words (appended verbatim to `AGENTS.md`
— there is no default text and nothing is auto-generated), and the literal
word `AUTHORIZE` as a final confirmation. Only after all three does it
append the new dated entry to `AGENTS.md`'s log, add a matching record to
`data/authorizations.toml`, and flip the entity's own canonical
`publicationRole`/`dossierStatus`/`dossierEnabled` fields
(`data/dossiers/_shared/entities/<id>.json`).

It deliberately does not write dossier content. Authoring what a new
dossier actually says — the claims, the sources, the narrative — stays a
separate, later, still fully human and still fully sourced editorial act.
This tool only ever unlocks eligibility; `validate-authorization.mjs`
still fails the build if a dossier's subject wasn't authorized this way.

No script performs this authorization step non-interactively. No prompt,
however detailed, performs this step. It is the one part of this pipeline
that stays entirely, mechanically, human.
