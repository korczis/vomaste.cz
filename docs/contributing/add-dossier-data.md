# Jak přidat data do dossieru (krok za krokem)

Praktický průvodce redakční prací nad kanonickým JSON datasetem
(mise T-028). Závazný rámec: [AGENTS.md](../../AGENTS.md) (redakční
pravidla + append-only autorizační log),
[CONTRIBUTING.md](../../CONTRIBUTING.md), plný kontrakt
[docs/data-contract.md](../data-contract.md). Pro práci přes Claude Code
existuje skill `dossier-entry`, který tyhle kroky vede interaktivně.

**Zlaté pravidlo**: veškerý obsah se edituje výhradně v
`data/dossiers/**/*.json`. Nikdy needituj `content/dossiers/**` ani
`content/entities/*.md` — jsou generované a lint tě zastaví.

## Krok 0 — autorizační brána (vždy, bez výjimky)

Otevři `AGENTS.md`, sekci „Content about real parties", a najdi
konkrétní datovaný záznam, který autorizuje **přesně tuto osobu a přesně
toto téma**. Pokud takový záznam není, STOP — obsah se nepíše a scope se
neodhaduje; zeptej se vlastníka webu. Nový subjekt autorizuje jen člověk
interaktivním `npm run authorize:entity` (zapíše log + transkripci do
`data/authorizations.toml`); žádná automatika a žádný prompt to
neobchází. Kontextová entita (záznam rejstříkové vazby bez tvrzení)
autorizaci nepotřebuje — viz [entity-discovery](../entity-discovery.md).

## Workflow v kostce

```
$EDITOR data/dossiers/<slug>/…                       # 1. uprav/založ JSON
npm run data:validate -- --file <upravený-soubor>    # 2. rychlá tvarová kontrola
npm run data:validate                                # 3. celý dataset (reference + sémantika)
npm run data:build                                   # 4. kompilace + regenerace content adaptérů
npm run build                                        # 5. plná brána před review/merge
```

Změněné soubory k commitu jsou pak kanonický JSON **plus** regenerované
adaptéry/exporty z kroku 4 — commituj obojí společně.

## Entita (globální registr)

Kanonický záznam: `data/dossiers/_shared/entities/<id>.json`. Vzor:
libovolný existující záznam (např. `pavel.json`). Povinné: `entityId`,
`title`, `entityType` (enum — `person`, `company`, `public_institution`,
…), `publicationRole`, `dossierEnabled`, `dossierStatus`,
`coverageState`, `dossiers` (slugy dossierů, kde vystupuje).

- **Kontextová entita** (bez autorizace):
  `publicationRole: "context"`, `dossierEnabled: false`,
  `dossierStatus: "not_authorized"`, žádná tvrzení. Rejstříkové okolí
  firmy umí vygenerovat `node scripts/osint/expand-entity.mjs --ico=…
  --write` (nikdy nepřepíše existující záznam; datum narození a adresy
  nepřebírá; kolizi jmenovce hlásí člověku).
- **Subjekt dossieru**: `publicationRole: "subject"` — jen pro osoby
  s autorizačním záznamem; pravidlo S6 shodí build, kdyby se kontextová
  entita „povýšila" sama.

## Nový dossier (scaffold)

Po autorizaci subjektu:

```bash
npm run dossier:scaffold -- --slug=jana-novakova --title="Jana Nováková" \
  --subject=novakova --authorization-record-id=AUTH-2026-08-01-X
```

Vytvoří `data/dossiers/jana-novakova/` (validní `dossier.json` + prázdné
registry `claims/ sources/ cases/ gaps/ relations/ updates/`). Bez
odpovídajícího záznamu v `data/authorizations.toml` skript odmítne
běžet:

```
scaffold-dossier: BLOCKED — autorizační záznam "AUTH-…" v …/data/authorizations.toml neexistuje.
```

Placeholder pro neautorizovaný subjekt je stejně out of scope jako jeho
claims — to je smysl brány, ne obtíž. Pak doplň TODO úvodní blok
v `dossier.json` a pokračuj záznamy níže.

## Zdroj (SRC-##)

`data/dossiers/<slug>/sources/src-NN.json` — vzor:
`data/dossiers/petr-pavel/sources/src-01.json`. Pravidla:

1. Cituj jen zdroj, který jsi **skutečně otevřel/a** — nikdy snippet.
2. `@id` = `https://vomaste.cz/id/dossiers/<slug>/sources/SRC-NN`;
   `identifier` = `SRC-NN`; `claims` = idRef na tvrzení, která dokládá.
3. `sourceFamily`: zdroje téhož vydavatele / převzatá agenturní zpráva =
   táž rodina — nepočítají se jako nezávislé potvrzení (pravidlo S2).
4. Povinná redakční poznámka v `content` bloku (co dokládá, nezávislost,
   limity) — pravidlo T7 vyžaduje ≥ 150 znaků.

## Tvrzení (CLM-##)

Tvrzení žije **dvakrát** — a obojí edituje redaktor:

1. kanonický záznam `claims/clm-NN.json` (`text`, `status`,
   `statusLabel`, `sources`, `subjects`, `order`, `content`);
2. řádka v tabulce „Registr tvrzení" (markdown blok v `dossier.json`):
   kotva `<a id="clm-NN"></a>`, odkaz na detail
   `[CLM-NN](@/dossiers/<slug>/claims/clm-NN.md)`, text tvrzení,
   status badge, odkazy na zdroje.

Parita T1–T8 vynucuje byte-shodu textu, statusu i množiny zdrojů — když
se rozejdou, build spadne (viz Běžné chyby). Status volitelný poctivě:

- `status-corroborated` („CORROBORATED") — S2: ≥ 2 zdroje z ≥ 2
  nezávislých rodin;
- `status-single` („1 ZDROJ") — S1: přesně 1 zdroj; povýšení = nový
  nezávislý zdroj, nikdy přeznačení;
- `status-quote` („CITACE") — dokládá, že výrok padl, ne že platí;
- `status-disputed` („SPORNÉ"), `status-opinion` („NÁZOR").

Procesní výsledek (odložení, promlčení, nepravomocné rozhodnutí) se od
meritorního rozhodnutí odlišuje **při každé zmínce**.

## Kauza (CASE-##)

`cases/case-NN.json`: `title`, `summary`, `period`, `status`,
`statusLabel`, `anchor`, `claims`, `sources`, `subjects`, `content`,
`order`. Narativ kauzy patří do markdown bloku `dossier.json`
(sekce s `{#kotvou}`); kauza na něj odkazuje polem `anchor` — citlivý
text tak existuje jen na jednom editovatelném místě.

## Mezera (GAP-##)

`gaps/gap-NN.json`: `title`, `description`, `priority`
(`vysoká`/`nízká`), `checked` (datum poslední kontroly), `claims`.
Neutrálně formulovaná otevřená otázka — ne insinuace, ne tvrzení
v přestrojení. Co nejde doložit, patří sem, ne do claims.

## Vztah (relation / hrana grafu)

Dvě místa, obě kanonická:

1. `relations/edge-*.json` — vzor
   `data/dossiers/petr-pavel/relations/edge-pavel-turek-nejmenovani.json`:
   `relationId`, `sourceEntity`/`targetEntity` (idRef na globální
   entity), `relationType`, `label`, `status`, `claims`, `sources`,
   `subjects`;
2. `graph` pole v `dossier.json` — uzly (entity + jejich lokální
   `claims`/`sources`) a `edges` (seznam relation id v redakčním
   pořadí).

R7 vynucuje: endpointy hrany = uzly grafu, `graph.edges` je 1:1
permutace relations dossieru, uzel = existující globální entita se
členstvím v dossieru. S3: ne-kontextová hrana potřebuje ≥ 1 claim
i zdroj. S7: uzel `subject: true` smí být jen autorizovaný subjekt
dossieru. S8: každý uzel musí mít cestu k subjektu.

## Update (historie revizí)

`updates/YYYY-MM-DD.json` (`date`, `summary`, odkazy na dotčené
záznamy) — append-only: zapisuj, co bylo skutečně ověřeno a změněno,
nikdy zpětně neupravuj.

## Validace a build

```bash
npm run data:validate -- --file data/dossiers/<slug>/claims/clm-07.json
npm run data:validate     # celý dataset: tvar → R1–R7 → S1–S10 → T1–T8 → JSON-LD
npm run data:build        # + view modely, content adaptéry, parity brána
npm run build             # plná brána (testy, autorizace, navigace, zola, verify:*)
```

## Běžné chyby a co znamenají

Hlášky vždy nesou cestu k souboru / id záznamu:

| Hláška (zkráceně) | Příčina a oprava |
|---|---|
| `(root) must have required property 'subjects'` | Záznamu chybí povinné pole — doplň podle schématu (`schemas/canonical/<typ>.schema.json`). |
| `(root) must NOT have additional properties (cizí pole "…")` | Překlep v názvu pole, nebo pole, které model v1 nezná — schválně tvrdá chyba. |
| `CLM-07: text řádky se neshoduje byte-verně s claim.text (rozjetá kopie)` | Tabulka v `dossier.json` a kanonický záznam se rozešly (T3) — uprav jedno či druhé do shody. |
| `CLM-07: řádka tabulky nemá kanonický claim záznam` | Řádka bez souboru `claims/clm-07.json` (T2) — chybí záznam, nebo má špatné id. |
| `status-single cituje 2 zdrojů — „1 ZDROJ" znamená přesně jeden` | S1 — buď odeber zdroj, nebo (jsou-li nezávislé rodiny) povyš status na corroborated. |
| `status-corroborated cituje 2 zdroj(e) z 1 source family/families` | S2 — dvě citace z téže vydavatelské rodiny nejsou nezávislé potvrzení. |
| `reference … na neexistující záznam` / `cross-dossier` | R4 — odkazovaný SRC/CLM neexistuje, nebo odkazuješ do cizího dossieru (i když cíl existuje, je to chyba). |
| `authorization.records odkazuje na "AUTH-…", který v data/authorizations.toml neexistuje` | S5 — dossier bez skutečné autorizace; viz Krok 0. |
| `data:check-generated:content` hlásí drift | Ruční edit generovaného `content/**` souboru — vrať změnu do JSON a spusť `npm run data:build`. |
| `verify:anchors` po buildu | Kotva/`anchor` odkazuje na neexistující `{#id}` v markdown bloku — oprav kotvu v `dossier.json`. |

Červená brána nikdy není „lint noise" — je to specifikace obsahu.
