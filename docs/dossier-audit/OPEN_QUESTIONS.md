# Open questions & backlog (2026-07-29)

Internal control document — editorial and engineering items that remain
open after the 2026-07-29 audit round, with priority and rationale.
Public-facing open questions live in the gaps registry (GAP-01…06);
this file tracks internal work items on top of them.

## Editorial (content)

1. **[P1] GAP-06 — outcome of the stížnost** against the May 2026
   shelving. A search-result summary twice asserted the prosecutor has
   already rejected it; **no inspectable article confirms this** — kept
   out of the dossier per the no-snippet-as-evidence rule. Re-check
   first on every future round (highest-priority currentness check).
2. **[P1] Compound-claim splits** — CLM-03 (four biography facts),
   CLM-18 (immunity waiver + breath test + injuries). Execute during the
   physical-decoupling migration while records are being rewritten;
   new IDs only, never recycled ones.
3. **[P2] Vychyta's differentiated explanation of the posts decision**
   (Deník N 2139584, 2026-07-28: some posts amoral-but-not-criminal,
   others criminally relevant but time-barred; headline "K tomu skutku
   došlo"). Single, partially paywalled source; the visible portion
   supports the distinction but not the headline's referent. Add only
   after full-article inspection or a second source carrying the quotes.
4. **[P2] CLM-20/22 "je/byl"** — resolve current-vs-former per company
   against ARES (GAP-04 groundwork exists).
5. **[P2] CLM-12 independence caveat** — ČT24 + iROZHLAS both relay
   Babiš's statement "dle zdrojů"; two newsrooms, but possibly one
   underlying source chain. Sources-index note covers the ČTK caveat
   generally; consider a claim-level note.
6. **[P2] Single-family graph edges** (5 WARN in validate-graph): either
   add second families per edge or introduce a graph-level single-source
   status analogous to status-single. Decide during decoupling.

## Engineering (registry hygiene, deferred from SOURCE_AUDIT.md)

7. **[P2]** `published_state = "living-page"` marker for src-23..27, 40,
   41 + validator awareness.
8. **[P2]** `src_type` controlled vocabulary + validator check (Blesk and
   Deník N currently typed inconsistently).
9. **[P2]** `role = "context"` front-matter for deliberately claim-less
   sources (src-03, 05, 09, 10) so the validator can tell them from
   orphans.
10. **[P3]** Canonical/slugged URL upgrades for src-14, src-19, src-52;
    strip `?lp=1` from src-48; reconcile the
    `?aktualnost=Libovolny` scoping asymmetry between src-23/src-24
    (affects CLM-20 vs CLM-22 comparability).

## Governance (owner decision required — do NOT act autonomously)

11. **Authorization-log coverage of the financing/assets layer.** The
    append-only log enumerates the accident + fallout, political careers,
    the 2024 photo case, the posts case, and the six 2026-07-22 items.
    The assets/donors/financing content (CLM-14/15, 20–24, 34–37: GMR
    GAS, registry ties, campaign donors incl. Chlad/Krejčíř mention,
    property purchases) and the ministerial-nomination thread (CLM-38–40,
    43–44) are not explicitly enumerated. They may be readable under
    "public political careers" + the GAP-04/05 research trail, but the
    log's own standard is explicit enumeration. Recommend the owner
    either append a confirming authorization entry or direct removal.
    This round deliberately made no scope decision either way: existing
    content was corrected, not extended.
