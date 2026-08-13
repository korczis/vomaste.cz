---
name: project-tour
description: Vysvětlí, jak tenhle repozitář funguje — čtením skutečného stromu, ne opakováním statického tutoriálu. Použij ho, když někdo poprvé přijde do vomaste.cz a ptá se „jak to tady funguje", „kde jsou data", „co je to za projekt", „jak se to staví", nebo když se má vysvětlit konkrétní vrstva (data, redakce, frontend, validace, Claude tooling).
argument-hint: "[volitelně: data | redakce | frontend | validace | claude]"
---

Prohlídka projektu. **Čte skutečný repozitář** a vysvětluje, co v něm
opravdu je — ne co v něm bylo, když někdo psal tenhle text.

## Kdy ho použít

- Někdo je v repozitáři poprvé.
- Někdo zná jednu vrstvu a potřebuje pochopit sousední.
- Před větší změnou, aby bylo jasné, čeho se dotkne.

## Kdy ho NEPOUŽÍT

- **Na konkrétní otázku.** „Co znamená 1 ZDROJ" nebo „proč padá tenhle
  validátor" jsou dotazy na vysvětlení jedné věci; prohlídka je na to
  příliš široká.
- **Jako náhradu za `AGENTS.md`.** Prohlídka ukazuje strukturu.
  Závazná pravidla jsou tam a musí se přečíst, ne shrnout.
- **Když už uživatel ví, co hledá.** Pak je rychlejší jít rovnou tam.

## Postup

### 1. Zjisti, co má být prohlídka pokrýt

Bez argumentu dej **přehled celku** (níže). S argumentem jdi do hloubky
jen v té vrstvě.

### 2. Čti realitu, nikdy nediktuj z paměti

Každé číslo a každý název v odpovědi musí pocházet z běhu nebo ze
souboru. Užitečné zdroje pravdy:

| Otázka | Odkud |
|---|---|
| kolik čeho je | `npm run data:compile` (počty po typech) |
| co který příkaz dělá | `docs/TOOLING.md` (generovaný) |
| co se zrovna staví | `scripts/build/pipeline.mjs` (`MODES`) |
| co hlídají validátory | hlavičkové komentáře v `scripts/data/`, `scripts/dossier/` |
| jaké dossiery existují | adresáře v `data/dossiers/` s `dossier.json` |
| kde stojí důkazní práce | `reports/evidence-plan.md` (generovaný) |
| jak vypadá stránka | `templates/` + view modely v `data/generated/views/` |

Když se realita rozchází s tím, co čekáš, **vyhrává realita** a je to
nález, ne chyba prohlídky.

### 3. Vysvětli v tomhle pořadí

Pořadí není libovolné — každý krok dává smysl jen díky předchozímu.

## Přehled celku

**1. Kanonická data.** Jediný zdroj pravdy je
`data/dossiers/**/*.json`. Adresář s `dossier.json` *je* registrace
dossieru; žádný ručně udržovaný seznam neexistuje. Každý záznam je
zároveň platný JSON-LD s globálním `@id`.

**2. Validace.** `npm run data:validate` spouští čtyři nezávislé vrstvy:
tvar (JSON Schema), referenční integritu (R1–R8), redakční sémantiku
(S1–S10) a paritu tabulky tvrzení (T1–T8). Každé pravidlo má **jednoho**
vlastníka — tabulka je v `.claude/rules/data-model.md`.

**3. Generování.** `npm run data:build` z kanonických dat vyrobí view
modely a **adaptéry v `content/`**. Zola potřebuje ke vzniku routy
soubor, proto `content/` existuje — ale je to výstup, ne vstup.

**4. Šablony.** `templates/` čtou view modely, nikdy ručně psaný
frontmatter. Žádná šablona nezná slug dossieru; sourozenecké cesty se
skládají z front matteru.

**5. Postavený web.** `zola build`, a po něm kontroly nad hotovým HTML:
kotvy, JSON-LD, Open Graph, plnohodnotnost stránek, responzivita tabulek.

**6. Brána.** `npm run build` je celý ten řetěz. Je to jediná věc, která
se počítá jako „hotovo".

Nad tím vším stojí dvě věci, které nejsou technické: **autorizační
rozsah** (kdo smí být pokrytý) a **devět publikačních bran** (co smí být
publikováno). Ty vlastní `AGENTS.md`.

## Hloubkové varianty

**`data`** — kanonický model, čtyři registry (CLM/SRC/CASE/GAP) plus
entity a relace, rozdíl mezi přidáním *záznamu* (čistě datová operace)
a přidáním *pole* (tři místa musí zůstat konzistentní).

**`redakce`** — stavy tvrzení a co znamenají, nezávislost zdrojové
rodiny, procesní versus věcný výsledek, mezera místo spekulace, devět
publikačních bran.

**`frontend`** — application shell, komponentová brána, tabulková
komponenta, metadata jako data (`data/seo.toml`), generovaná navigace,
graf vztahů.

**`validace`** — co která brána shodí, rozdíl mezi pre-commit sadou
a plnou bránou, proč sync běží před paritní kontrolou a co to znamená
pro ruční editaci `content/`.

**`claude`** — tři vrstvy schopností, katalog a jeho obousměrná brána,
path-scoped pravidla, co smí a nesmí automatizace.

## Co prohlídka NEUDĚLÁ

- Nezmění nic. Je to čtení.
- Nerozhodne, jestli je změna dobrá.
- Nenahradí přečtení `AGENTS.md` před prací s obsahem o lidech.

## Příklady

**Základní.** „Jak tenhle projekt funguje?" → šest kroků přehledu, každý
s odkazem na skutečný soubor, plus dvě netechnické vrstvy nad nimi.

**Realistický.** „Chci přidat sloupec do tabulky zdrojů." →
`project-tour data` ukáže, že jde o **přidání pole**, tedy tři místa:
schéma, builder view modelů, šablona. A že `additionalProperties: false`
shodí build, dokud schéma nezná nové pole — což je záměr, ne překážka.

**Selhání.** „Kde je seznam dossierů?" → Odpověď je, že **neexistuje
a nemá**: registrací je adresář s `dossier.json`. Prohlídka nesmí
vymyslet soubor, který by ten seznam „měl" držet — to je přesně ta
chyba, kterou datový model vylučuje.

## Související

`/guide` (nevím, co dál), `/diagnose` (prostředí), `docs/TOOLING.md`
(úplný katalog příkazů), `docs/data-contract.md` (plný datový kontrakt).
