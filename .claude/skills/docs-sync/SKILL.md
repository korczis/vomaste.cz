---
name: docs-sync
description: Zjistí, kterou dokumentaci, lekci nebo referenci zasáhla provedená změna, a projde je — aby text nezůstal popisovat stav, který už neplatí. Použij ho po změně schématu, redakčního pravidla, npm příkazu, architektury nebo po přidání schopnosti, a když se někdo ptá „co ještě musím aktualizovat".
argument-hint: "[changed | <co se změnilo>]"
---

Dopadová analýza na dokumentaci. **Read-only** — vrací seznam míst
k projití, změny dělá člověk.

Zastaralá technická lekce je horší než žádná: čtenář podle ní pracuje
a neví, že popisuje stav, který už neplatí.

## Kdy ho použít

- Po změně, která se dotkla něčeho popsaného jinde.
- Před `/quality`, protože dokumentační drift je běžný nález.
- Při přidání schopnosti, příkazu nebo pravidla.

## Kdy ho NEPOUŽÍT

- **Na změnu bez vnějšího projevu.** Refaktor uvnitř skriptu, který
  nemění chování ani rozhraní, dokumentaci nezasahuje.
- **K psaní dokumentace.** Tenhle skill říká **kde**, ne **co**.

## Co se NIKDY nepíše ručně

Nejdřív vylouči generované soubory — jejich „aktualizace" je spuštění
generátoru:

| Soubor | Generuje |
|---|---|
| `docs/TOOLING.md` | `npm run build:tooling-catalog` |
| `docs/osint/SOURCE_CATALOG.md` | `npm run build:source-catalog` |
| `reports/evidence-plan.md` | `npm run report:evidence-plan` |
| `content/dokumentace/prikazy/**` | `npm run build:tooling-catalog` |
| `content/zdroje/**` | `npm run build:source-catalog` |

Katalog příkazů se **neopisuje** do lekcí ani do README. Odkazuje se
na něj.

## Mapa dopadů

| Změna | Projít |
|---|---|
| **stav tvrzení** (nový, přejmenovaný, změněný význam) | `content/koncepty/stav-*.md`, `/prirucka/ref-stavy-tvrzeni/`, lekce A104, Bootcamp 01, cvičná data (kontrola L12 to vynutí) |
| **schéma záznamu** | `/prirucka/ref-povinna-pole/`, lekce úrovně A5 a příklady v ní, `docs/data-contract.md` |
| **npm příkaz** (nový, přejmenovaný) | `data/tooling/` záznam (jinak build spadne), `/prirucka/jak-validovat-a-buildnout/`, `/prispet/chci-programovat/`, A602 |
| **redakční pravidlo nebo publikační brána** | `AGENTS.md`, `.claude/rules/editorial.md`, Bootcamp, úroveň A3, A308, `/prispet/chci-editovat/` |
| **autorizační model** | `AGENTS.md`, `.claude/rules/authorization.md`, A308, A701, `/prirucka/jak-zkontrolovat-rozsah/`, Bootcamp 05 |
| **architektura nebo pipeline** | úroveň A6, `/prirucka/problemy-buildu/`, `docs/architecture/**` |
| **skill, agent nebo workflow** | `data/tooling/` záznam, persona a riziko, katalog (generovaný), lekce Claude Code úrovně |
| **UI komponenta nebo doktrína** | `.claude/rules/ui.md`, `docs/dossier-audit/FLOWBITE_PLAN.md` |
| **Claude Code capability** | `docs/claude-code/compatibility.md` — verze i datum ověření |

Tabulka je zkratka. Kanonická verze je v `AGENTS.md`, sekce
„Vzdělávací vrstva: kdo co vlastní", a v `.claude/rules/learning.md`.

## Postup

1. **Zjisti, co se změnilo** (`git diff --name-only`).
2. **Zařaď** podle mapy výše.
3. **Vylouči generované** — u nich spusť generátor.
4. **Otevři každé zasažené místo** a ověř, jestli pořád platí. Neměň
   text, u kterého jsi neověřil, že je špatně.
5. **Zkontroluj kanonické definice**: pojem vlastní
   `content/koncepty/*`. Když se změnil význam, mění se **tam**, a
   ostatní místa ho jen aplikují.
6. **Spusť validátory dokumentace**: `npm run validate:claude-tooling`,
   `npm run validate:learning`, `npm run verify:tooling-catalog`.

## Výstup

```
ZMĚNA:       <co se změnilo>
ZASAŽENO:
  [generované] <soubor> → spusť <generátor>
  [k projití]  <soubor nebo lekce> → <co ověřit>
  [beze změny] <co bylo prověřeno a je v pořádku>
KANONICKÁ DEFINICE: <mění se pojem? kde?>
VALIDÁTORY:  <příkaz → výsledek>
ZBÝVÁ:       <co musí projít člověk>
```

## Co skill NEUDĚLÁ

- Nepřepíše dokumentaci bez ověření, že je špatně.
- Nezmění kanonickou definici pojmu jako vedlejší efekt.
- Nepřepíše historii — u ADR a implementačních reportů se **původní
  rozhodnutí zachovává** a doplňuje se odkaz na aktuální stav.

## Příklady

**Základní.** Přejmenovaný npm skript → záznam v `data/tooling/`
(jinak build spadne), příručka, jedna lekce. Katalog se přegeneruje.

**Realistický.** Změna významu `sourceFamily`. Zasáhne kanonický koncept,
příručku, dvě lekce, cvičná data a `.claude/rules/evidence.md`. Klíčové:
**definice se mění v konceptu**, ostatní místa se opraví tak, aby ho
aplikovala, ne aby ho definovala znovu.

**Selhání.** Změna popsaná v ADR z loňska. Skill **nesmí** ADR přepsat.
Historické rozhodnutí zůstává; přidá se odkaz na nový stav, stejně jako
to udělal ADR o importu agent frameworku.

## Související

`/schema-change` (fan-out změny schématu), `/academy-lesson`,
`/kb-entry`, `.claude/rules/learning.md`, `.claude/rules/documentation.md`.
