# ADR: Claude Code jako samoobslužné pracovní rozhraní pro přispěvatele

**Datum**: 2026-08-13.
**Stav**: rozhodnuto — přijato, s explicitními mezemi růstu.
**Navazuje na**: [`aiad-and-agent-tooling-import.md`](aiad-and-agent-tooling-import.md)
(2026-07-30) a [`prismatic-platform-integration.md`](prismatic-platform-integration.md)
(2026-08-05).

## Otázka

Vlastník webu zadal: přispěvatel má být schopen naklonovat repozitář,
spustit Claude Code, nechat se nabootovat, vybrat si roli a samostatně
provést bezpečný příspěvek — **bez** znalosti layoutu repozitáře, bez
memorování příkazů, bez čtení desítek interních dokumentů, bez ručního
skládání promptů a bez slepé důvěry v to, co AI provedla.

Devět skillů, které dnes existují, tohle neumožňuje. Otázka tedy zní:
kolik dalších schopností přidat, jaké, a jak zabránit tomu, aby se
z toho stal ekosystém, který si předchozí ADR změřilo a odmítlo.

## Co říkalo dřívější rozhodnutí a proč bylo správné

ADR z 2026-07-30 odmítlo import Prismatic `.aiad`/`.claude` stromu
(1 636 souborů, 549 agentů, 234 příkazů) do tohoto repozitáře. Důvody
byly čtyři a **žádný z nich dnes neplatí míň**:

1. framework psaný pro 96-aplikační Elixir umbrellu je architektonicky
   nekompatibilní s Node.js + Zola;
2. jeho konfigurace hardcoduje branding a autoritu jiné instance, což
   porušuje forkovatelnost (konstituce §3);
3. neexistovala měřená potřeba;
4. duplikoval by schopnost, kterou nativní Claude Code mechanismus už má.

To rozhodnutí se **nemění a nepřehodnocuje**. Tohle ADR neimportuje
z Prismaticu nic.

## Co se změnilo — měřeno, ne odhadem

Předchozí ADR si samo stanovilo revizní práh:

> „this repo's governance moves from a single owner/reviewer to multiple
> independent maintainers whose work genuinely needs cross-contributor
> orchestration, not just review"

a druhý:

> „vomaste.cz's editorial workload grows to multiple concurrent,
> genuinely disjoint investigation workflows"

Obojí nastalo. Čísla čtená přímo z repozitáře, 2026-08-13, vedle čísel
z ADR 2026-07-30:

Sloupec 2026-07-30 uvádí jen to, co si tehdejší ADR skutečně změřilo;
kde nic neuvádělo, je pomlčka a nedopočítává se zpětně.

| | 2026-07-30 | 2026-08-13 | |
|---|---:|---:|---|
| Skills v `.claude/skills/` | 4 | **9** | +125 % |
| Markdown v `content/` | 1 596 | **5 416** | 3,4× |
| Skripty (bez testů) | 36 | **191** | 5,3× |
| Kroků v `npm run build` | 26 | **43** | +65 % |
| Dossiery | — | **202** | |
| Entity v registru | — | **681** | |
| npm skripty | — | **105** | |
| Testové soubory | — | **108** | |
| Řádků `AGENTS.md` | — | **5 241** | |
| Souběžných worktree | — | **7** | |

Za dva týdny. To není růst, který by šel obsloužit tím, že si nový
člověk přečte `AGENTS.md` — sám o sobě má 5 241 řádků a je z většiny
append-only autorizační log.

**Druhá, důležitější změna je kvalitativní.** Autorizační model se
2026-08-05 a 2026-08-10 posunul z per-subjektového schvalování na
standing scope s devíti publikačními branami a rekurzivním rozšiřováním.
Tím se těžiště přesunulo z „vlastník rozhoduje, koho pokrýt" na
„přispěvatel musí u každého záznamu projít devíti branami". Devět bran
je přesně ten druh opakované, mechanicky ověřitelné procedury, kterou
buď někdo umí zpaměti, nebo mu ji musí připomenout nástroj. Dneska ji
zpaměti umí jeden člověk.

## Rozhodnutí

**Přijato**: `.claude/` se rozšiřuje z devíti skillů na tři vrstvy
schopností — skills (postupy), agents (specialisté v izolovaném
kontextu), workflows (uživatelské cesty) — a napojuje se na
už existující vzdělávací vrstvu a katalog toolingu.

**Nepřijato** (a explicitně vyjmenováno, aby to nebylo tiché):

- žádný `.claude/capabilities.toml` ani jiný nový registr — rozšiřuje se
  ten, který už je (viz níže);
- žádný LLM backend router, lineage tracker, self-optimization smyčka,
  Prolog vrstva;
- žádná povinná MCP závislost;
- žádná agent-teams orchestrace nad rámec `docs/coop/PROTOCOL.md`;
- žádný skill pro personu, kterou nikdo neobsazuje.

## Princip: capability-driven expansion

Schopnost vzniká, jen když projde všemi pěti otázkami. Když neprojde
byť jednou, nevzniká:

1. **Řeší to už něco, co existuje?** (Když ano, rozšiř to, nezakládej
   druhé.)
2. **Je za tím opakovaná práce?** Konkrétně: musí někdo třikrát vložit
   stejný dlouhý prompt, nebo zaplaví hlavní kontext padesáti dokumenty,
   nebo opakuje dvanáctikrokový postup?
3. **Dá se to otestovat?** Ne text skillu — jeho metadata, odkazy,
   podpůrné skripty, přítomnost povinných klauzulí.
4. **Je to skill, nebo dokumentace?** Fakt patří do `CLAUDE.md`,
   znalost do reference, postup do skillu, specialista do agenta,
   cesta do workflow, **záruka do validátoru**.
5. **Je pro to persona?** Schopnost bez persony je schopnost bez
   uživatele.

Otázka 4 je nejdůležitější a v praxi nejčastěji přehlížená:
**pravidlo, které jde vynutit kódem, se nevynucuje promptem.** Konstituce
§8 to říká z druhé strany — politika, kterou nic nevynucuje, se nepočítá
za implementovanou. Tady platí obrácená verze: prompt, který jde nahradit
validátorem, je slabší varianta téhož.

## Proč se nezavádí druhý registr

Zadání navrhovalo `.claude/capabilities.toml`. Nezavádí se, protože
ekvivalent už existuje a je **obousměrně hlídaný**:

`scripts/build/build-tooling-catalog.mjs` čte ručně psané záznamy
`data/tooling/*.json` a proti nim **skutečnost** (`package.json`,
`scripts/build/pipeline.mjs`, `.githooks/pre-commit`, `justfile`,
`.claude/skills/*/SKILL.md`), a generuje `docs/TOOLING.md`,
`content/dokumentace/prikazy/**` a `data/generated/tooling-catalog.json`.
Kontrola G2 už dnes shodí build, když vznikne skill bez záznamu —
a stejně tak když záznam ukazuje na skill, který zanikl.

Druhý registr by znamenal, že „jaké schopnosti existují" je zapsáno na
dvou místech. To je přesně ten drift, kvůli kterému má tenhle repozitář
kanonický datový model a generované adaptéry. Rozšiřuje se proto
existující katalog o `kind: agent` a `kind: workflow` a o pole
`personas` / `riskLevel` / `writes` / `requiresAuthorization`.

**Kde persona a riziko žijí — a proč ne ve frontmatteru.** Během
implementace se zvažovalo zapsat je do pole `metadata` ve frontmatteru
`SKILL.md` (ověřeně legální free-form pole, viz
[`../claude-code/compatibility.md`](../claude-code/compatibility.md)).
Zamítnuto ze dvou důvodů. Claude Code na `metadata` nesahá, takže by to
runtime nic nepřineslo — jediným čtenářem by byl stejně katalog. A hlavně:
subagenti v `.claude/agents/*.md` mají uzavřenou sadu polí frontmatteru,
takže by pro ně stejně musel existovat druhý mechanismus. Jednotné
řešení pro všechny tři vrstvy je jedno místo: `data/tooling/*.json`,
kde už schéma i brána existují.

Dělba práce v katalogu tedy zůstává původní: **ručně se píše jen to, co
se ze zdrojů odvodit nedá** (próza, persona, riziko), **strojová fakta se
dopočítávají ze skutečnosti** (příkazová řádka, zařazení do pipeline,
frontmatter skillu, nástroje subagenta).

## Meze růstu — co brání sprawlu

Předchozí ADR mělo pravdu, že bez brzdy tahle vrstva zbytní. Brzdy jsou
tři a všechny jsou mechanické, ne dobrovolné:

1. **Obousměrná brána katalogu.** Nový skill/agent/workflow bez záznamu
   shodí build. Mrtvý záznam bez odpovídajícího souboru taky. Přidat
   schopnost tedy stojí i její popis, personu a riziko — nedá se to
   „udělat rychle a zdokumentovat potom".
2. **`npm run validate:claude-tooling`.** Duplicitní jména, chybějící
   povinná metadata, neznámá persona, odkaz na neexistující workflow či
   agenta, rozbitý odkaz v příkladu — všechno shodí build.
3. **Reportovaný rozpočet.** Katalog vypisuje počty skillů, agentů
   a workflow. Tvrdý strop se nezavádí (byl by libovolný), ale číslo je
   vidět v každém buildu — sprawl se nedá provést nepozorovaně.

Co se **nezavádí jako brzda**: schvalovací ceremonie. Kdo přidá
schopnost, která projde pěti otázkami výše a všemi třemi branami, ji
přidal správně.

## Důsledky

**Pozitivní**

- Nový přispěvatel se dostane k první bezpečné práci bez vedení autora.
- Devět publikačních bran přestává být znalostí jednoho člověka.
- Rešeršní práce, která dnes zaplavuje hlavní kontext, jde do izolovaných
  read-only agentů.
- Katalog schopností se generuje ze skutečnosti, takže dokumentace
  nemůže tvrdit schopnost, která neexistuje.

**Negativní, přiznaně**

- `.claude/` je nově údržbová plocha srovnatelná se `scripts/dossier/`.
  Každá změna datového modelu se musí promítnout i sem — `/docs-sync`
  a `/schema-change` na to upozorňují, ale nevynucují to za člověka.
- Startovní kontext každé session povyroste o popisy skillů. Mitigace:
  tělo skillu se načítá až při použití, popisy jsou stropované na
  1 536 znaků, a pravidla, která neplatí vždy, jsou path-scoped.
- Riziko, že se schopnost dokumentuje dřív, než funguje. Proti tomu
  stojí pravidlo, které tohle ADR přijímá jako závazné:
  **žádný skill, který je jen název; žádná dokumentovaná schopnost bez
  implementace; žádný hook bez testu.**

**Neutrální, ale je to potřeba říct**

- Tahle vrstva **nemění rozsah pokrytí osob ani jedinou položku**
  autorizačního logu. Je operační. V otázkách rozsahu vítězí log,
  přesně jako dosud.
- Claude Code se tím nestává zdrojem, autoritou ani arbitrem pravdy.
  Zůstává navigátorem, rešeršním asistentem, validátorem a mechanickým
  operátorem uvnitř pravidel projektu.

## Revizní práh

Přehodnotit, až bude měřitelně platit některé z:

- schopnost, kterou nikdo za tři měsíce nepoužil (katalog má persony —
  nepoužívanost jde doložit, ne odhadnout);
- startovní kontext session vzroste natolik, že se zhorší dodržování
  `CLAUDE.md` (dokumentace uvádí 200 řádků jako hranici, kde to začíná);
- Claude Code zruší pole, na kterém stojí některá brána (postup je
  v [`../claude-code/compatibility.md`](../claude-code/compatibility.md));
- počet schopností přeroste to, co se dá projít při onboardingu za
  deset minut — což je kritérium, kvůli kterému tohle ADR vzniklo.
