# Implementační checklist — Prismatic Platform integrace

Companion to
[the master prompt](2026-08-05-prismatic-platform-integration-master-prompt.md).
Checked items are actually done and verified on disk as of 2026-08-05;
everything else is open follow-up work, not a claim about a finished
system.

## Governance

- [x] Obecná per-subject gate sekce v `AGENTS.md` nahrazena standing scope pravidly.
- [x] `AUTH-2026-08-05-PLATFORM-SCOPE` appendnut na konec logu.
- [x] Historické entries nezměněny.
- [ ] `validate:authorization` přepracován z per-name gate na publication-gate validátor.
- [x] Append-only verifier stále chrání historický log (rozšířen o nový tvar nadpisu).
- [x] Starý AIAD ADR označen jako částečně superseded.
- [x] Nový integrační ADR přidán.

## Audit

- [ ] Zaznamenán branch/HEAD/status obou rep.
- [ ] Měřená capability mapa Prismatic.
- [ ] Měřená baseline Vomaste datasetu.
- [ ] Ověřeny skutečné provider entry pointy a side effects.
- [ ] Ověřeno, že žádný dokumentovaný příkaz není jen starý návrh.

## Contract

- [ ] Verze contractu.
- [ ] JSON Schema.
- [ ] Fixtures.
- [ ] Unknown major rejection.
- [ ] Provider stdout je čistý machine stream.
- [ ] Logy jdou na stderr.
- [ ] Underlying source locator a provenance jsou povinné podle record type.
- [ ] Raw payload policy a redakce.

## Pipeline

- [ ] Config/path resolution.
- [ ] `status` (stub existuje, nefunkční).
- [ ] `probe` (stub existuje, nefunkční).
- [ ] `plan` (stub existuje, nefunkční).
- [ ] `run` (stub existuje, nefunkční).
- [ ] `import` (stub existuje, nefunkční).
- [ ] `diff` (stub existuje, nefunkční).
- [ ] `review-report` (stub existuje, nefunkční).
- [ ] `promote` (stub existuje, nefunkční).
- [ ] `verify` (stub existuje, nefunkční).
- [ ] `drift`.
- [ ] `enrich-all`.
- [ ] Resume a bounded concurrency.
- [ ] Raw/staging/review/canonical separation.
- [ ] Transactional or rollback-safe promotion.

## Data integrity

- [ ] Stable identity rules.
- [ ] Same-name collision does not auto-merge.
- [ ] Source-family dedupe.
- [ ] Aggregate dossiers stay derived.
- [ ] Bidirectional references remain valid.
- [ ] No generated file edited as SSoT.
- [ ] Run/contract/commit provenance on promoted records.

## Tests

- [ ] Config errors.
- [ ] Contract fixtures.
- [ ] Malformed JSONL.
- [ ] Interrupted/resumed run.
- [ ] Duplicate import.
- [ ] Identity collision.
- [ ] Same publisher false corroboration.
- [ ] Missing underlying source.
- [ ] Privacy rejection.
- [ ] Procedural framing.
- [ ] Idempotent promotion.
- [ ] Dry-run no-write.
- [ ] Rollback on failure.
- [x] Build without sibling Prismatic repo (trivially true today — nothing calls it yet).
- [ ] Optional local integration smoke.
- [ ] Full `npm run build` green with the new files present.

## Documentation and DX

- [x] README (light pointer added; full contributor-facing rewrite still open).
- [ ] CONTRIBUTING (light pointer added; not a full rewrite).
- [x] AGENTS.
- [x] CLAUDE.
- [ ] PROJECT_INSTRUCTIONS if authoritative.
- [ ] Data contract.
- [ ] Discovery docs.
- [ ] Runbook/troubleshooting.
- [x] `.claude/README.md`.
- [x] Four Prismatic skills (stubs; no working pipeline behind them yet).
- [ ] Portable SessionStart hook.
- [x] No committed `settings.local.json` (unchanged — this integration didn't touch it).

## First enrichment run

- [ ] Dry-run plan.
- [ ] Smoke run on representative dossier/entities.
- [ ] Review report inspected.
- [ ] All-entity plan generated.
- [ ] All-entity run completed/resumed.
- [ ] Candidates categorized.
- [ ] Review manifest written.
- [ ] Accepted batch promoted.
- [ ] Canonical diff reviewed.
- [ ] Build green.
- [ ] Final counts and known gaps reported.
