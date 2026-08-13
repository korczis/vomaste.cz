# Claude-native operating environment — plán a postup (T-091)

Rozklad zadání „Self-Service Claude Code Tooling + Skills + Agents +
Workflows + Academy + Bootcamp + Knowledge Base" na atomické, samostatně
commitovatelné kroky.

**Větev:** `task/T-091-claude-native-env`
**Worktree:** `~/dev/vomaste-worktrees/T-091`
**Zahájeno:** 2026-08-13

Tento soubor je **pracovní plán**, ne dokumentace výsledku. Výsledek
popisuje `docs/implementation/claude-native-operating-environment.md`
(vzniká v poslední fázi). Stav kroků se v tomto souboru průběžně
aktualizuje — je to jediné místo, kde se dá zjistit, kde práce stojí.

---

## Zjištění fáze 0, která mění návrh oproti zadání

Zadání psal někdo, kdo repozitář neviděl. Tři věci už existují a
navrhované řešení se jim musí přizpůsobit, ne je duplikovat:

1. **Katalog toolingu už existuje a je obousměrně hlídaný.**
   `scripts/build/build-tooling-catalog.mjs` (`npm run build:tooling-catalog`,
   brána `verify:tooling-catalog`) čte `data/tooling/*.json` + skutečnost
   (package.json, pipeline, pre-commit, justfile, `.claude/skills/*/SKILL.md`)
   a generuje `docs/TOOLING.md`, `content/dokumentace/prikazy/**` a
   `data/generated/tooling-catalog.json`. Kontrola G2 už dnes shodí build,
   když vznikne skill bez záznamu.
   → **Zadáním navrhovaný `.claude/capabilities.toml` se NEZAVÁDÍ.**
   Rozšiřuje se existující katalog o `kind: agent` a `kind: workflow`
   a o pole persona/risk. Druhý registr by byl přesně ten drift, proti
   kterému celý repozitář stojí.

2. **Persona a riziko patří do `data/tooling/*.json`, ne do frontmatteru.**
   `metadata` v `SKILL.md` je sice legální free-form pole, ale Claude
   Code na ně nesahá — runtime by to nepřineslo nic — a subagenti mají
   uzavřenou sadu polí frontmatteru, takže by pro ně stejně musel vzniknout
   druhý mechanismus. Jedno místo pro všechny tři vrstvy.
   → Rozhodnutí a jeho zdůvodnění: `docs/adr/claude-native-contributor-operating-environment.md`.

3. **Vzdělávací vrstva už existuje** (`data/learning.toml`,
   `/start/`, `/bootcamp/`, `/akademie/`, `/prirucka/`, `/prispet/`,
   brána `npm run validate:learning`).
   → Claude Code track se přidává **do ní**, ne vedle ní. Kanonické
   definice pojmů dál vlastní `content/koncepty/*`.

---

## Pravidla postupu

- Jeden krok = jeden commit. Zpráva v conventional formátu.
- Po každém kroku: relevantní rychlý validátor. Plný `npm run build`
  na konci fáze, ne po každém kroku (trvá ~8 minut).
- Mechanika před obsahem: brána vzniká dřív než to, co má hlídat.
  Skill bez záznamu v katalogu shodí build — proto se rozšíření
  katalogu dělá jako fáze B, ne až na konci.
- Žádný skill, který je jen název. Žádná dokumentovaná schopnost bez
  implementace. Žádný hook bez testu.

---

## Fáze a kroky

Legenda stavu: ` ` čeká · `~` běží · `x` hotovo · `!` blokováno

### Fáze A — ověření reality a rozhodnutí

- [x] **A1** `docs/claude-code/compatibility.md` — ověřená fakta
      o Claude Code (skills/agents/hooks/rules), verze, datum ověření,
      co je volitelné a co experimentální.
- [x] **A2** ADR `docs/adr/claude-native-contributor-operating-environment.md`
      — proč se mění dřívější rozhodnutí „5 skillů záměrně", jaký nový
      měřitelný požadavek vznikl, a pravidla proti tooling sprawl.

### Fáze B — registr a brána (mechanika první)

- [x] **B1** Rozšířit `schemas/canonical/tooling-command.schema.json`:
      `kind` o `agent`/`workflow`, nová pole `personas`, `riskLevel`,
      `writes`, `requiresAuthorization`.
- [x] **B2** `build-tooling-catalog.mjs`: číst `metadata` z frontmatteru
      SKILL.md, přidat obousměrnou bránu pro `.claude/agents/*.md`
      a `.claude/workflows/*.md`, kontrolu parity metadat.
- [x] **B3** Testy nových bran (`scripts/build/build-tooling-catalog.test.mjs`).
- [x] **B4** Doplnit persona/risk metadata do 9 existujících skillů
      a jejich katalogových záznamů.

### Fáze C — pravidla a zhubnutí CLAUDE.md

- [x] **C1** `.claude/rules/` — rozdělení závazných pravidel do modulů
      (odkazují na `AGENTS.md`, nekopírují ho).
- [x] **C2** `CLAUDE.md` zkrátit na identitu + invarianty + rozcestník.
- [x] **C3** Validátor: každý odkaz z rules a z CLAUDE.md ukazuje na
      existující soubor/příkaz.

### Fáze D — základní skills (orientace)

- [x] **D1** `/guide` — router podle záměru, ne seznam příkazů.
      (Ne `/help` — to je vestavěný příkaz Claude Code.)
- [x] **D2** `/diagnose` — diagnostika prostředí, PASS/WARN/FAIL + oprava.
      (Ne `/doctor` — vestavěný příkaz.)
- [x] **D3** `/project-tour` — vysvětlení projektu ze skutečného repa.
- [x] **D4** `/task` — dekompozice zadání na personu, rizika, workflow.
- [x] **D5** `bootstrap` 2.0 — argument persony, tři doporučené další kroky.

### Fáze E — rešerše a důkazy

- [x] **E1** `/authorization-check`
- [x] **E2** `/verify-source`
- [x] **E3** `/source-family`
- [x] **E4** `/find-source`
- [x] **E5** `/research-question`
- [x] **E6** `/evidence-packet`

### Fáze F — redakční review

- [x] **F1** `/review-claim`
- [x] **F2** `/review-source`
- [x] **F3** `/review-gap`
- [x] **F4** `/editorial-review`
- [x] **F5** `/correction`

### Fáze G — inženýrské skills

- [x] **G1** `/data-model`
- [x] **G2** `/schema-change`
- [x] **G3** `/test`
- [x] **G4** `/build`
- [x] **G5** `/quality`
- [x] **G6** `/ui-review`
- [x] **G7** `/a11y-review`
- [x] **G8** `/seo-review`

### Fáze H — dokumentace, git, co-op

- [x] **H1** `/docs-sync`
- [x] **H2** `/explain`
- [x] **H3** `/diff-explain`
- [x] **H4** `/pr`
- [x] **H5** `/review-pr`
- [x] **H6** `/coop-status`
- [x] **H7** `/academy-lesson` + `/kb-entry` (doplněno z navazujícího zadání)

### Fáze I — subagenti

- [x] **I1** `source-verifier` (read-only)
- [x] **I2** `claim-reviewer` (read-only)
- [x] **I3** `editorial-reviewer` (read-only)
- [x] **I4** `repository-explorer` (read-only)
- [x] **I5** `ui-reviewer` (read-only)
- [x] **I6** `docs-auditor` (read-only)

### Fáze J — hooks

- [x] **J1** SessionStart: rychlá orientace (identita, větev, role, stav).
- [x] **J2** PreToolUse guardrail: ochrana autorizačního logu a
      generovaných souborů — **včetně testů allowed/blocked/edge**.

### Fáze K — workflow vrstva

- [x] **K1** `.claude/workflows/` — schema + první tři cesty
      (first-session, verify-a-claim, submit-a-source).
- [x] **K2** Zbytek cest (research-topic, editorial-review, fix-site-bug,
      first-code-contribution, schema-change, correction, prepare-pr).

### Fáze L — validace a testy

- [x] **L1** `npm run validate:claude-tooling` — duplicity, chybějící
      metadata, neznámé persony/workflow/agenti, rozbité odkazy.
- [x] **L2** Golden-path testy pro tři persony.
- [x] **L3** Zapojení do `npm run build` a pre-commit.

### Fáze M — vzdělávací a UI integrace

- [ ] **M1** UI komponenta pro Claude Code volání (copy button, labely
      TERMINÁL / CLAUDE CODE / PROJECT SKILL).
- [ ] **M2** Akademie: úroveň Claude Code (C101–C110) v `data/learning.toml`.
- [ ] **M3** Bootcamp: praktické úkoly na syntetických datech.
- [ ] **M4** Příručka/KB: pojmy Skill, Agent, Workflow, Hook, riziko.
- [ ] **M5** `/start/` a `/prispet/` — rozcestník „chci pracovat s Claude Code".
- [ ] **M6** Veřejný katalog skillů/agentů/workflow (generovaný).

### Fáze N — vstupní dokumenty

- [ ] **N1** `docs/claude-code/README.md` — krátký rozcestník.
- [ ] **N2** `README.md` + `CONTRIBUTING.md` — sekce „Work with Claude Code".
- [ ] **N3** Troubleshooting (KB + odkazy z `/doctor`).

### Fáze O — uzavření

- [ ] **O1** Persona walkthroughs (reader, researcher, editor, developer).
- [ ] **O2** Bezpečnostní review toolingu.
- [ ] **O3** Plný `npm run build` zelený.
- [ ] **O4** `docs/implementation/claude-native-operating-environment.md`.

---

## Co se v tomto úkolu NEDĚLÁ

- Nezavádí se `.claude/capabilities.toml` (viz zjištění 1).
- Nezavádí se MCP jako povinná závislost — zůstává volitelná vrstva
  popsaná v dokumentaci, protože repozitář žádnou nepotřebuje.
- Nemění se autorizační log v `AGENTS.md` ani žádné jeho pravidlo.
  Tooling je operační vrstva; rozsah pokrytí osob se jím nemění.
- Nezavádí se agent teams / paralelní orchestrace nad rámec toho, co
  už `docs/coop/PROTOCOL.md` popisuje.
