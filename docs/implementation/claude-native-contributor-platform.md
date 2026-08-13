# Claude Code jako contributor interface — implementační report

**Datum:** 2026-08-13
**Větev:** `task/T-091-claude-native-env`
**Rozhodnutí:** [`docs/adr/claude-native-contributor-operating-environment.md`](../adr/claude-native-contributor-operating-environment.md)
**Plán a průběh:** [`docs/missions/2026-08-13-claude-native-operating-environment-plan.md`](../missions/2026-08-13-claude-native-operating-environment-plan.md)

## Stav

**PARTIAL** — tooling, brány, vzdělávací vrstva a dokumentace jsou
hotové a zelené; část zadaného rozsahu vědomě nevznikla a je vyjmenovaná
níž v „Co nevzniklo".

| Brána | Příkaz | Výsledek |
|---|---|---|
| testy | `npm test` | **1073 / 1073**, exit 0 |
| plná brána | `npm run build` | **47 / 47 kroků**, exit 0, 173,1 s |
| integrita Claude toolingu | `npm run validate:claude-tooling` | OK, 73 souborů |
| katalog | `npm run verify:tooling-catalog` | OK, beze změny |
| vzdělávací vrstva | `npm run validate:learning` | OK |

Rozsah změny: 25 commitů, 344 souborů, +13 887 / −561 řádků.

## Co bylo předtím

9 skillů, žádní agenti, žádná workflow vrstva, `CLAUDE.md` o 316
řádcích, katalog toolingu hlídající npm skripty, just recepty a skilly
(brány G1–G7). Vzdělávací vrstva bez zmínky o Claude Code.

Práce s repozitářem přes Claude Code fungovala, ale předpokládala, že
uživatel zná pravidla, umí najít validátor a ví, kterým postupem začít.

## Co vzniklo

### Schopnosti — 57

| Vrstva | Počet |
|---|---|
| skills | 40 |
| subagenti | 6 |
| workflow cesty | 11 |

Podle rizika: 37 jen čte · 4 bezpečný zápis · 12 vyžaduje review ·
4 údržbář. Persony mají pokrytí od 7 (reader) po 45 (maintainer)
schopností.

Úplný, vždy aktuální seznam **není v tomhle reportu** — je generovaný:
[`docs/TOOLING.md`](../TOOLING.md), `/dokumentace/prikazy/`,
`data/generated/tooling-catalog.json`.

### Pravidla

14 modulů v `.claude/rules/`, 1 087 řádků včetně `CLAUDE.md`. Z toho se
**při startu načte 58 řádků** (slovník person a rizik); zbytek je
path-scoped a objeví se u odpovídajících souborů.

`CLAUDE.md` zhubl z 316 na 147 řádků.

### Brány

Rozšíření existujícího katalogu o čtyři kontroly a nový validátor
o devět:

| Brána | Co shodí build |
|---|---|
| G8 / G9 | agent nebo workflow bez záznamu, a mrtvý záznam bez souboru |
| G10 | schopnost bez persony, rizika nebo `writes`; „jen čte" spolu se zápisem |
| G11 | subagent bez `name`, `description` nebo bez vyjmenovaných `tools` |
| CT1–CT5 | rozbitý frontmatter pravidla, neexistující cesta, odkaz, npm příkaz nebo skill |
| CT6 | skill neuvádí, kdy se NEMÁ použít |
| CT7 | jméno se opakuje mezi skillem, agentem a workflow |
| CT8 | workflow ukazuje na neexistující schopnost, neznámou personu nebo nemá cíl |
| CT9 | zapisující schopnost měnící sdílený stav nebo dotýkající se rozsahu nemá zámek proti spuštění mimoděk |

`validate:claude-tooling` je krok `npm run build`, `npm run check`
i pre-commit hooku.

### Hooky

| Událost | Co dělá | Testy |
|---|---|---|
| `SessionStart` | orientace do pěti řádků: větev, čistota stromu, chybějící prerekvizity, a na `master` věta o tom, že commit nasazuje | 9 |
| `PreToolUse` | blokuje editaci uvnitř append-only autorizačního logu (P1) a zápis do generovaného obsahu (P2) | 14 |

Oba při nečitelném vstupu **povolují**. Blokovat kvůli tomu, že si hook
nerozuměl se svým vstupem, by bylo horší než ho nemít.

### Vzdělávací vrstva

- Akademie: nová úroveň **C1**, 12 lekcí (58 → 70 lekcí celkem).
- Bootcamp: 3 praktické úkoly v terminálu (9 → 12).
- Příručka: postup „jak začít" a slovník pojmů (16 → 18).
- `/start/` a `/prispet/`: rozcestník ke Claude Code s tím, že
  AI-asistovaný příspěvek má stejnou laťku jako ručně psaný.

### UI

Komponenta příkazového bloku s pěti variantami (terminál, Claude Code,
schopnost, vlastními slovy, výstup), viditelným textovým štítkem
a kopírovacím tlačítkem se `aria-live` zpětnou vazbou. Katalog schopností
má sloupce Persona a Riziko, filtrovatelné existujícím vyhledáváním
v tabulce.

## Bezpečnostní review

Ověřeno spuštěním, ne tvrzeno.

| Otázka | Odpověď | Jak ověřeno |
|---|---|---|
| Může agent zapisovat? | Ne. Všech 6 má `tools: Read, Grep, Glob` (+ WebFetch/WebSearch u ověřovatele zdrojů). | výpis frontmatterů; brána G11 |
| Může skill udělit autorizaci? | Ne. Jediný, který se logu dotýká, ho čte. | grep + hook P1 |
| Může se riziková schopnost spustit mimoděk? | **Mohla. Opraveno.** 7 skillů dostalo zámek, z pravidla je brána CT9. | audit katalogu proti frontmatterům |
| Může se ztratit ruční editace? | Ano, tiše — proto to blokuje hook P2. | 14 testů hooku |
| Mohou hooky vypustit tajemství? | Ne. Sahají jen na `CLAUDE_PROJECT_DIR`. | grep `process.env` |
| Stojí build na Prismaticu nebo MCP? | Ne. | `pipeline.mjs` neobsahuje ani jedno |
| Může se výstup nástroje vydat za zdroj? | Zakázáno v pravidlech, ve všech rešeršních skillech i v agentovi. | ruční kontrola textů |

**Zbytkové riziko, přiznaně:** `disable-model-invocation` brání
automatickému spuštění, ne uživateli, který skill vyvolá vědomě. Poslední
pojistkou u commitu a nasazení zůstává člověk a git hook, ne tahle
vrstva.

## Persona walkthroughy

Ověřeno mechanicky v `scripts/lint/validate-claude-tooling.test.mjs`:

- každá z devíti person má aspoň jednu schopnost **a** aspoň jednu cestu;
- každá má aspoň jeden **read-only vstupní bod** — nikdo nemusí začínat
  zápisem;
- každá cesta vede přes schopnosti, které její personu skutečně
  obsluhují;
- žádná cesta se neoznačuje jako read-only, když vede přes zápis.

Tohle je všechno, co z „end-to-end journey" jde otestovat mechanicky.
Že je cesta **srozumitelná**, test neověří a report to netvrdí.

## Co nevzniklo, a proč

| Zadané | Rozhodnutí |
|---|---|
| `.claude/capabilities.toml` | **Nevzniklo.** Katalog už existoval a je obousměrně hlídaný; druhý registr by byl přesně ten drift, proti kterému repozitář stojí. Rozšířen o `kind: agent`/`workflow`. |
| `/help`, `/doctor` | **Přejmenováno** na `/guide` a `/diagnose`. Obojí je vestavěný příkaz Claude Code — skill toho jména by šel zdokumentovat, ale ne spustit. |
| agenti `code-reviewer`, `test-analyzer` | **Nevznikli.** Oba by potřebovali `Bash`, čímž by přestali být read-only, a oba pokrývá skill. Zdůvodnění v `.claude/README.md`. |
| Akademie C113–C115, C201–C210 | **Nevzniklo.** Napsáno 12 lekcí místo 25. Zbytek by opakoval metodiku, kterou vlastní úrovně A1–A7, nebo popisoval schopnosti, které nikdo nepoužil. |
| MCP integrace | **Nevzniklo jako závislost.** Popsáno jako volitelné v `compatibility.md`. Bootcamp nesmí být blokovaný instalací serverů. |
| `/public-repo-check`, `/update-claude-tooling` | **Nevzniklo.** První pokrývá `/quality` (kontrola nečekaných souborů) a nepředstíral by DLP; druhý je postup zapsaný v `compatibility.md`, ne opakovaná práce. |

## Co brány chytily na téhle práci samotné

Uvedeno proto, že je to jediný důkaz, že brány fungují:

1. mrtvý odkaz na `data/generated/global-graph.json` ve skillu `adr` —
   soubor zanikl při přechodu na graph projections;
2. **čtyřikrát** odkaz na skill, který ještě neexistoval — tedy přesně
   „dokumentovaná schopnost bez implementace", kterou ADR zakazuje;
3. devět skillů bez uvedené hranice použití;
4. testový helper katalogu, který nepředával agenty, takže brána G8
   viděla prázdný adresář;
5. nejednoznačný zástupný symbol `npm run X` v tabulce;
6. prázdné štítky příkazových bloků — `default` filtr v Teře neplatí na
   prázdný řetězec, takže barva zůstávala jediným nosičem informace;
7. jedenáct zapisujících skillů spustitelných mimoděk;
8. falešný poplach CT9 na `/authorization-check`, který vedl ke
   zpřesnění pravidla.

## Zbývající mezery

- **Vizuální kontrola v prohlížeči neproběhla.** Responzivita tabulek
  a přítomnost scroll kontextů jsou ověřené strojově
  (`verify:table-responsive`, 3 629 tabulek); vzhled nových
  příkazových bloků na skutečných šířkách ne.
- **Interaktivní běh skillů neproběhl.** Skilly jsou text, který čte
  Claude Code za běhu; ověřená je jejich struktura, odkazy a metadata,
  ne to, jak se chovají v session.
- **`lint:historical-coupling`** zůstává mimo bránu, beze změny oproti
  stavu před touto prací.
- **Akademie C1 nemá cvičná data** ve `learning-fixtures.toml` — lekce
  pracují s reálnými příkazy repozitáře, ne se syntetickými subjekty,
  takže kontrola L13 se jich netýká.

## Kdy tohle přehodnotit

Prahy jsou v ADR. Nejbližší praktický: **schopnost, kterou nikdo za tři
měsíce nepoužil.** Katalog má persony, takže nepoužívanost jde doložit,
ne odhadnout.
