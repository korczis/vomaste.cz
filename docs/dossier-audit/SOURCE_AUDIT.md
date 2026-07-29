# Source registry audit (2026-07-29)

Internal control document. Full audit of all 52 sources under
`content/dossiers/macinka-turek/sources/`, the sources index, and the
claims-table cross-check. Liveness probe run against every unique URL.

## Summary

- 52 unique URLs; 0 duplicates after normalization; 0 http:// links;
  0 impossible/inverted dates; all `src_id`s unique; `subjects` on all 52.
- Liveness: 50/52 return 200. Only the two iROZHLAS URLs (src-08, src-12)
  return 403 — known bot-block false positive (documented in `config.toml`),
  not dead links. **No dead links in the registry.**
- No article cited under two IDs; no syndicated copy counted as independent.

## P1 — single-source claims labeled CORROBORATED

The registry's own definition (AGENTS.md + on-page legend) says
CORROBORATED = independently confirmed by multiple outlets. These claims
cite exactly one source (one publisher family):

CLM-07 (SRC-15, Deník N — self-proving "Deník N published X", judgment
call), CLM-10 (SRC-02 Echo24 — the accident itself), CLM-16 (SRC-19
Blesk.cz), CLM-18 (SRC-20 Česká justice), CLM-19 (SRC-21 Deník.cz), CLM-20
(SRC-23 Hlídač státu), CLM-21 (SRC-25), CLM-22 (SRC-24), CLM-23 (SRC-26),
CLM-24 (SRC-27), CLM-27 (SRC-31 ČT24 — **the DV/rape-complaint closure,
most sensitive record on the site, single-sourced**), CLM-28 (SRC-32
Deník.cz), CLM-30 (SRC-33 Blesk.cz), CLM-32 (SRC-36 Aktuálně.cz), CLM-34
(SRC-38 Blesk.cz).

SRC-07's own body already concedes the standard for another fact
("jednozdrojové, ne CORROBORATED") — the standard exists; it wasn't applied
to these 15.

**Remediation chosen (2026-07-29 round):** introduce an honest
single-source status (`status-single`, label "1 ZDROJ") in schema +
template legend + validator, relabel the affected claims, and have
`validate-dossier.mjs` enforce ≥2 sources from ≥2 publisher families for
`status-corroborated` going forward. Adding second sources remains the
preferred upgrade path per claim (tracked in OPEN_QUESTIONS.md).

## P2 (documented, partially deferred)

1. Missing `published` on living-page sources src-23..27, 40, 41 —
   `retrieved` is the snapshot date; a `published_state = "living-page"`
   marker would make the omission machine-checkably deliberate. Deferred.
2. Fragile URLs: src-19 (bare-ID Blesk URL), src-14 (short-ID Deník N),
   src-52 (Deník N "minuta" live-blog entry — least durable). All 200 today.
   Deferred; upgrade to canonical/slugged URLs when re-verifying.
3. URL hygiene: src-48 `?lp=1` tracking param; src-24 has
   `?aktualnost=Libovolny` while its Turek counterpart src-23 does not
   (scoping asymmetry between the two Hlídač státu "vazby" snapshots —
   affects CLM-20 vs CLM-22 comparability); minor path-case inconsistency.
4. `src_type` free-text drift: 16 distinct values; Blesk typed two ways,
   Deník N typed two ways. Needs a controlled vocabulary + validator check.
   Deferred.
5. Aggregator-vs-primary: src-23..27, 41 (Hlídač státu) aggregate
   or.justice.cz / UDHPSH data; index already labels them one data family.
   GAP-04 work (commit 565d798) already verifies against primary ARES/ČÚZK.
6. Deliberately claim-less context/opinion sources (src-03, 05, 09, 10)
   are documented in body text; a `role = "context"` field would make this
   validator-distinguishable from an orphan. Deferred.
7. Sources index independence note incomplete: names Deník N / Hlídač
   státu / part of Deník.cz families, but omits Blesk.cz ×6, full Deník.cz
   ×7, Seznam Zprávy ×4, ČT24 ×3, Echo24 ×2, iROZHLAS ×2, and — most
   importantly — that **Aktuálně.cz and HN.cz are both Economia** (one
   family across two domains). Fix in this round.
8. Independence caveat: CLM-11 rests on ČT24 + ČeskéNoviny (ČTK network);
   ČT24 often draws on the ČTK wire, so independence is plausible, not
   self-evident. Footnote-worthy.

## Publisher families (>1 source)

| Family | SRC IDs | n |
|---|---|---|
| Deník.cz (VLM) | 16, 21, 28, 32, 44, 46, 49 | 7 |
| Blesk.cz (CNC) | 04, 19, 29, 33, 38, 51 | 6 |
| Hlídač státu | 23, 24, 25, 26, 27, 41 | 6 |
| Economia (Aktuálně.cz + HN.cz) | 13, 36, 43, 48 / 30, 45 | 6 |
| Deník N | 14, 15, 47, 52 | 4 |
| Seznam Zprávy | 11, 18, 22, 39 | 4 |
| ČT24 | 05, 06, 31 | 3 |
| Echo24 | 01, 02 | 2 |
| iROZHLAS | 08, 12 | 2 |
