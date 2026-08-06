# Implementační checklist — Prismatic Platform integrace

Companion to
[the master prompt](2026-08-05-prismatic-platform-integration-master-prompt.md).
Checked items are actually done and verified on disk (last updated
2026-08-06); everything else is open follow-up work, not a claim about a
finished system.

## Governance

- [x] Obecná per-subject gate sekce v `AGENTS.md` nahrazena standing scope pravidly.
- [x] `AUTH-2026-08-05-PLATFORM-SCOPE` appendnut na konec logu.
- [x] Historické entries nezměněny.
- [ ] `validate:authorization` přepracován z per-name gate na publication-gate validátor.
- [x] Append-only verifier stále chrání historický log (rozšířen o nový tvar nadpisu).
- [x] Starý AIAD ADR označen jako částečně superseded.
- [x] Nový integrační ADR přidán.

## Audit

- [x] Zaznamenán branch/HEAD/status obou rep (v audit dokumentu).
- [x] Měřená capability mapa Prismatic — [`docs/audits/2026-08-05-prismatic-capability-map.md`](../audits/2026-08-05-prismatic-capability-map.md), ~30 řádků, každý s ověřeným entry pointem nebo explicitním "not verified".
- [x] Měřená baseline Vomaste datasetu — v témže dokumentu (26 dossierů, 955 claims, 658 sources, 93 cases, 202 gaps, 334 relations, 527 entit).
- [x] Ověřeny skutečné provider entry pointy a side effects (per-row v audit dokumentu; síťové volání samotné NEbylo provedeno).
- [x] Ověřeno, že žádný dokumentovaný příkaz není jen starý návrh — audit našel přesně tento vzor u tří `mix prismatic.osint.*` příkazů (synthetic demo CLI) a zdokumentoval ho jako "traps" sekci.

## Contract

- [x] Verze contractu — `contract_version` pole, MAJOR.MINOR, `config/prismatic-integration.toml` drží podporovanou verzi.
- [x] JSON Schema — [`schemas/prismatic/export-contract.schema.json`](../../schemas/prismatic/export-contract.schema.json), Ajv 2020 strict.
- [x] Fixtures — `scripts/prismatic/fixtures/{valid-run,malformed,unknown-major-version}.jsonl`.
- [x] Unknown major rejection — `checkMajorVersion()` v `scripts/prismatic/lib/contract.mjs`, testováno.
- [ ] Provider stdout je čistý machine stream (žádný provider ještě nic nevolá).
- [ ] Logy jdou na stderr (totéž — čeká na `prismatic:run`).
- [ ] Underlying source locator a provenance jsou povinné podle record type (schema má pole připravená — `source_url`, `provenance_chain` — ale ne per-record-type `required`, viz schema's `$comment`).
- [ ] Raw payload policy a redakce (čeká na `prismatic:run`).

## Pipeline

- [x] Config/path resolution — `scripts/prismatic/lib/config.mjs`, testováno (env → local config → sibling default, Git validace).
- [x] `status` — reálná implementace, resolvuje cestu, commit SHA, contract verzi, počet předchozích běhů.
- [x] `probe` — reálná implementace, file-existence drift check proti auditovaným cestám, žádné síťové volání.
- [x] `plan` — reálná implementace, ale záměrně úzce scoped: jen `entity-ares-lookup` (company/organization entity bez `externalIds.ico`) + informativní `gap-stale-high-priority`. Ostatní capability z auditu (property, sanctions, EU institutions) záměrně NEnaplánované — audit je označil jako fabricated/broken/unverified.
- [ ] `run` (stub existuje, nefunkční — čeká na skutečný exportér na straně Prismatic).
- [ ] `import` (stub existuje, nefunkční).
- [ ] `diff` (stub existuje, nefunkční).
- [ ] `review-report` (stub existuje, nefunkční).
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
- [x] Config errors (config.test.mjs: bad path, non-git dir, missing platform).
- [x] Contract fixtures (contract.test.mjs, all 3 fixture files exercised).
- [x] Malformed JSONL (contract.test.mjs, malformed.jsonl fixture).
- [ ] Interrupted/resumed run.
- [ ] Duplicate import.
- [ ] Identity collision.
- [ ] Same publisher false corroboration.
- [ ] Missing underlying source.
- [ ] Privacy rejection.
- [ ] Procedural framing.
- [ ] Idempotent promotion.
- [ ] Dry-run no-write (plan.mjs is dry-run-only by construction today, but no `--dry-run` flag exists yet since there's nothing to write).
- [ ] Rollback on failure.
- [x] Build without sibling Prismatic repo (verified: status/probe/plan all handle "not available" as a normal state, exit 0).
- [ ] Optional local integration smoke.
- [x] Full `npm run build` green with the new files present.

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
