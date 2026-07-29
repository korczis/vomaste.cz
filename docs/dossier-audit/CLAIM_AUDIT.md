# Claim & narrative audit — findings and dispositions (2026-07-29)

Internal control document. Full editorial audit of the main dossier page,
all claim pages, case pages, and gap pages against the binding editorial
rules in AGENTS.md. Each finding lists its disposition in this round.

## P0 — publication integrity (2 found, 2 fixed)

1. **CASE-01 label "Uzavřeno bez trestu" was unsourced.** No claim or
   source documented any outcome of the 2024 photo/candlestick matter.
   → FIXED by sourcing the actual outcome: ČT24 (2024-11-08) reports
   police shelved the hajlování-photo case for promlčení (announced by
   prosecutor Jan Vychyta, OSZ Praha 4); the candlestick collection was
   not part of that decision. New SRC-53 + CLM-45 (status "1 ZDROJ"),
   case label now "Fotografie: odloženo pro promlčení", timeline entry
   added, prose paragraph added with the procedural-not-merits pairing.

2. **Vehicle-identity contradiction across sections** (ZZS "sanitka" in
   CLM-10/prose vs. Nemocnice Na Homolce biological-material transport in
   GAP-01/Turek's version). Cited sources genuinely differ.
   → FIXED by unifying on the neutral "zdravotnický vůz" and stating the
   source divergence explicitly in the accident section and GAP-01,
   rather than silently picking one description.

## P0-adjacent procedural accuracy (found by external verification)

3. **Wrong deciding authority on the DV-complaint shelving.** Dossier
   said "státní zastupitelství odložilo"; both ČT24 (SRC-31) and Echo24
   (new SRC-54) quote Vychyta: "Trestní věc byla skončena rozhodnutím
   policejního orgánu" — police shelved it; the prosecutor's office
   announced it and reviews the stížnost.
   → FIXED in CLM-27, prose, GAP-06, SRC-31's own description, timeline,
   and the relationship graph (edge remodeled into
   trestniozn→policie PROCEDURALLY_CLOSED_BY + trestniozn→
   statni-zastupitelstvi SUBJECT_OF_PROCEEDING). Note: AGENTS.md's
   authorization log had it right ("closure by police") all along.

## P1 — evidence integrity (10 found; 8 fixed, 2 deferred)

- Timeline mentions of both statute-of-limitations closures lacked the
  procedural/merits pairing → FIXED (appended qualifiers).
- 15 single-source claims carried CORROBORATED against the badge's own
  definition → FIXED structurally: new `status-single` ("1 ZDROJ")
  status across schema, legend, filter, CSS, charts, templates, and
  validator (now enforces ≥2 distinct sources for CORROBORATED, exactly
  1 for status-single). 14 claims relabeled; CLM-27 instead gained a
  genuinely independent second source (SRC-54, Echo24's own Vychyta
  quote) and stays CORROBORATED.
- CLM-40 stale present tense ("zastává roli zmocněnce") contradicting
  CLM-11 → FIXED (anchored past tense + cross-ref).
- CLM-33 "bagatelizovali" (site's own assessment inside a fact row) →
  FIXED to the neutral prose wording.
- CLM-37 characterization mislabeled as CITACE → FIXED: neutral
  restatement, status-single.
- CLM-36 presented the Chlad donation discrepancy the dossier itself had
  already resolved in GAP-05 (in-kind car loans) as an open contradiction
  → FIXED: explanation folded into the claim and prose.
- CASE-03 period "2025" contradicted its own 2026 claims → FIXED
  ("2025–2026").
- **DEFERRED**: compound-claim splits (CLM-03: four biography facts;
  CLM-18: immunity waiver + breath test + driver injuries). Both bundles
  cite one source of uniform strength, so no status overstatement remains
  after the relabel; splitting requires new IDs, bidirectional source
  remapping and subject retagging — scheduled for the physical-decoupling
  migration where records are rewritten anyway (see OPEN_QUESTIONS.md).

## P2 — comprehension (10 found; 9 fixed, 1 deferred)

Fixed: "nyní"→date-anchored (stížnost passage); "dnes ministr
zahraničí"→"od prosince 2025"; accident date now month-precise
(červenec 2026) in claim, case period, timeline; CLM-16's invertible
wording ("tvrzením o odbočovacím pruhu"→"tvrzením, že o odbočovací pruh
nešlo" — same fix in GAP-01); Turek "Kdo" bullet now cites CLM-02/11;
mismatched source note in the ministerial-nomination section; "Zvláštní
pozornost si zaslouží" editorial framing removed; stížnost/odvolání
terminology standardized; GAP-04 neighborhood-level residence detail
removed (data minimization).

Deferred: CLM-20/22 "je/byl" per-company current-vs-former resolution
(needs per-company registry re-verification; GAP-04's ARES check covers
part — MEAS Consulting "v likvidaci" already noted).

## Clean checks

No missing denials (every serious allegation has the subject's response
adjacent); no placeholder/TODO content; no unnamed third parties named;
right-of-reply intact throughout.
