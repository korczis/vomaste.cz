# Working in this repository

A Zola static site whose core feature is a general framework for neutral,
source-cited "dossiers" about publicly reported controversies of public
figures — currently instantiated with one dossier (Petr Macinka, Filip
Turek). Read this in full before changing content, templates, the dossier
data model, or scope.

## Dossier framework (general — applies to any current or future dossier)

### Data model: three linked registries

Every dossier page (`content/dossier/_index.md`, or a future
`content/<dossier>/_index.md`) is built on three cross-referenced
registries:

- **Claims registry (`CLM-##`)** — the main table on the dossier page. Each
  row: an anchor (`<a id="clm-NN"></a>`), the claim text, a status badge,
  and a link to one or more sources (`SRC-##`). Statuses:
  - `status-corroborated` ("CORROBORATED") — independently confirmed by
    multiple outlets
  - `status-quote` ("CITACE") — a direct quote from the subject, presented
    as a quote, not this site's own assessment
  - `status-disputed` ("SPORNÉ") — open, unconfirmed, or contested claim
  - `status-opinion` ("NÁZOR") — authored commentary, kept structurally
    separate from reporting
- **Sources registry (`SRC-##`)** — one page per source under
  `content/dossier/zdroje/src-NN.md`. Front matter: `src_id`, `outlet`,
  `src_type`, `url`, `retrieved`, `published`, `claims` (the CLM-## it
  supports). The registry index (`content/dossier/zdroje/_index.md`) notes
  which sources share a publisher ("source family" — not independent
  corroboration) versus which are genuinely independent outlets.
- **Gaps registry (`GAP-##`)** — one page per open question under
  `content/dossier/mezery/gap-NN.md`. Front matter: `gap_id`, `priority`
  (`vysoká`/`nízká`), `checked` (last-verified date), `claims`. Being
  listed as open is not a finding either way — it means the cited sources
  don't yet support a conclusion.

Registries are bidirectionally linked (CLM ↔ SRC, GAP → CLM), and every
anchor/link is enforced by two build-time scripts:

- `scripts/dossier/validate-dossier.mjs` — checks the source Markdown:
  every CLM-##/GAP-## row has a real anchor, every SRC-##/CLM-## reference
  resolves, no duplicate IDs.
- `scripts/dossier/verify-anchors.mjs` — runs after `zola build`; checks
  that every anchor and every `extra.cases`/`extra.timeline` reference in
  the source actually resolves to a real `id` in the built HTML (Zola's
  own link checker doesn't validate hand-written `id="..."` attributes).

Both run as part of `npm run build` (the exact sequence CI runs too).
Never wave past a failure here — a broken anchor or an unsourced claim is
a real defect, not lint noise.

### Templates

- `templates/index.html` — landing page
- `templates/dossier.html` — main dossier page (claims table, relationship
  graph, timeline)
- `templates/dossier-source.html` / `dossier-sources-index.html` — one
  source page + its index
- `templates/dossier-gap.html` / `dossier-gaps-index.html` — one gap page +
  its index
- `templates/base.html` — shared layout; all `<meta>` (title, description,
  canonical, Open Graph) is declared once in front matter and rendered
  once here — do not hand-write `<meta>` tags elsewhere.
- `data/navigation.toml` — data-driven primary navigation (mobile
  bottom-nav + desktop sidebar), shared by `base.html`.

### Editorial rules (binding for any dossier, present or future)

1. Every factual claim must cite a named, reputable, independent, dated
   source with a direct URL. If it can't be sourced, cut it.
2. Direct quotes are marked and attributed as quotes — never restated or
   softened/sharpened in a way that reads as this site's own assessment.
3. Procedural outcomes (case dropped, statute of limitations, non-final
   ruling) are distinguished from a substantive finding of guilt/truth
   **every time they're mentioned**, not once in a footnote.
4. Opinion/commentary is labeled as opinion and kept structurally separate
   from the factual claims table.
5. Unnamed third parties (e.g. an accuser not named in the cited
   reporting) stay unnamed here, always.
6. Gaps in coverage are stated explicitly (a "what this overview did not
   examine" section) rather than implied to be exhaustive.
7. The site does not adjudicate guilt or innocence, and does not treat one
   side's claim as fact merely because it's louder or more convenient to
   report.
8. No speculation or hedged guessing where sources are silent — that
   belongs in the gaps registry, not the claims registry.

## Authorizing a new dossier subject or expanding scope

The default is to cover no one. Adding a new subject, or expanding an
existing subject's scope to a new controversy, requires an explicit,
dated authorization from the site owner, recorded in this file — never
assumed silently, and never inferred just because a topic is "publicly
interesting." An authorization must state exactly: who, which specific
controversies/topics, and that coverage is limited to what named,
reputable, independent sources have already published. It never
automatically extends to further named third parties beyond what the
cited reporting itself discloses.

**Process for the next authorization**: when the site owner authorizes a
new subject or scope extension on the record, append a new dated
subsection to the "Content about real parties" log below — do not edit or
remove prior entries. Each entry is a permanent, auditable record of what
was actually approved and when.

## Content about real parties

The default is self-only unless explicitly extended. It has been
extended. The subsections below are an append-only, chronological
authorization log — do not edit or delete existing entries; add new ones
as new dated subsections at the end.

### Authorized subject: Petr Macinka and Filip Turek (on the record)

Authorized by the site owner (korczis@gmail.com), **explicitly and on the
record, 2026-07-21**: `/dossier/` (source `content/dossier/_index.md`) may carry a
neutral, source-cited overview of the public political controversy
surrounding **Petr Macinka** (chairman of Motoristé sobě, member of
government) and **Filip Turek** (MP, at the time government commissioner for
the Green Deal), specifically the traffic accident involving Turek's car and
an ambulance, the political fallout, and Macinka's public defense of Turek.
Both subjects are public officials acting in their public capacity; the
dossier covers only reporting already published by mainstream Czech media
(ČT24, Blesk, Echo24, Info.cz, ČeskéNoviny.cz, iRozhlas.cz, HlídacíPes.org,
Život v Česku) and cites each claim to its source.

Rules for this dossier:

- Every factual claim must cite a named, reputable, independent public
  source with a direct URL. If a claim cannot be sourced, cut it.
- Direct quotes are marked as quotes and attributed; they are not endorsed
  or restated as this site's own assessment.
- Opinion/commentary pieces (e.g. the HlídacíPes column) are labeled as
  opinion, not fact, and kept visually/structurally separate from the
  factual timeline.
- The outcome of the police investigation into the accident was not
  determined at time of writing. The dossier does not assert guilt or
  wrongdoing — it reports what has been publicly reported, including the
  fact that the matter is unresolved.
- `updated` / `reviewed_at` in `content/dossier/_index.md` front matter should only
  be bumped when the page has actually been re-checked against current
  reporting — this is an active, developing story.

### Scope extension, 2026-07-21: broader political profile

Authorized by the site owner, on the record, in the same session: the
dossier may also cover Turek's and Macinka's public political careers
(electoral history, party role) and two earlier, separately-reported public
controversies — the 2024 photograph/candlestick-collection controversy, and
the October 2025 Deník N investigation alleging deleted, racist/homophobic
Facebook posts attributed to Turek. The same sourcing rules below apply.
The October 2025 posts controversy is treated strictly as a **reported,
disputed allegation**, not a proven fact: authenticity is contested, Turek
denies authorship of the most serious posts, and this must stay visible in
the text rather than be resolved one way or the other by this site.

This authorization does **not** extend to any further named subject beyond
Macinka and Turek in the scope of these specific, cited controversies,
without a new, separate, on-record owner decision.

### Scope extension, 2026-07-22: additional controversies

Authorized by the site owner, on the record, 2026-07-22, after the owner was
explicitly asked and confirmed each item: the dossier may also cover, for
Turek specifically —

- the criminal complaint (rape / years of domestic violence, threats with a
  firearm) filed by a former partner, its 2026-05 closure by police on
  statute-of-limitations grounds, and Turek's denial;
- the 2017 incident in which Turek left a gallows drawing and a rifle
  cartridge on a Saudi embassy employee's car, and its resolution as a minor
  administrative offense;
- the 2026 fines for two unauthorized structures ("černé stavby") on his
  property in Prague-Dubeč;
- his company Zapper Club and its marketing of medically unproven devices,
  and the Ministry of Health's public warning against them;
- the disproportion between his self-presented racing career and the
  documented record of starts/results (sparsely attended events, several
  solo or single-opponent races);
- brief mention of criticism over meetings with diplomats from
  authoritarian-labelled states, sourced to the same roundup piece.

Every item above keeps the same sourcing discipline as the rest of this
dossier — named source, status label, fact separated from allegation. The
rape/domestic-violence item is the most legally and reputationally
consequential thing on this site and must be handled with the most care of
anything here:

- Never state or imply guilt. The statute-of-limitations closure is a
  **procedural** outcome — it made prosecution legally impossible due to
  time elapsed, and explicitly is **not** a finding on whether the
  allegations are true or false. Both facts must appear together, every
  time this is mentioned, not just once in a footnote.
- Never minimize or editorialize the accuser's allegations either — report
  what she alleged and what the record shows, without a thumb on the scale
  in either direction.
- Turek's denial is quoted, not summarized in a way that reads as more or
  less serious than what he actually said.
- If the accuser is unnamed in the source reporting, she stays unnamed here.

This extension does **not** authorize adding the accuser as a named subject,
nor any further named third party (e.g. the Saudi embassy employee) beyond
what the cited reporting itself already discloses. It does not authorize any
topic beyond the six items listed above without a further, separate,
on-record decision.

## Metadata

Metadata (title, description, canonical, Open Graph) is declared once in
front matter and rendered once in `templates/base.html`. Do not hand-write
`<meta>` tags in other templates.
