# Entity discovery and the authorization gate

This document describes how new entities enter this site's data model, and
— more importantly — how they explicitly do **not** become new dossiers.
It is a description of a standing process, not itself an authorization for
anything; see `AGENTS.md` for the actual, append-only authorization record.

## The pipeline

```
publicly documented mention in a source/claim
  → candidate entity (name, type, provenance)
  → canonical global entity page (content/entities/<id>.md)
  → sources, relations, claims attached with real provenance
  → listed in the authorization-candidates report (internal, not published)
  → [ human decision by the site owner, recorded in AGENTS.md ]
  → only then: dossier_status flips to "authorized", a dossier may exist
```

Everything left of the bracketed step can be produced mechanically —
`scripts/dossier/migrate-graph-to-pages.mjs` already does this for every
node in a dossier's `graph.toml`. Everything at and after the bracketed
step requires a human, on the record, every time.

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

A context entity (`publication_role = "context"`, `dossier_status =
"not_authorized"`) may have:

- a canonical page at `/entities/<id>/`,
- its real, sourced `claims`/`sources`,
- its real relations to other entities, each with its own claim/source,
- appearances across one or more already-authorized dossiers.

A context entity must never have:

- `dossier_enabled = true`,
- `dossier_status = "authorized"`,
- an invented biography or profile beyond what the citing source actually
  supports,
- its own case/theme dossier,
- an entry in `AGENTS.md`'s authorization log.

`scripts/dossier/validate-authorization.mjs` enforces all of the above at
build time — it is not just a convention, it is a build-failing invariant.

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

When the site owner decides to authorize a new dossier (whether for a
brand-new subject or extending an existing one), the process is exactly
what `AGENTS.md` already describes: a new, dated subsection appended to
its authorization log, stating who, which topics, and the sourcing
boundary. Only after that record exists does an entity's
`dossier_status`/`dossier_enabled`/`publication_role` change, and only
then does a new dossier's content get authored. No script performs this
step. No prompt, however detailed, performs this step. It is the one part
of this pipeline that stays entirely human.
