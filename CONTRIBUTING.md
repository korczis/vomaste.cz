# Jak přispívat do vomaste.cz

vomaste.cz je Open Intelligence Commons — příspěvky jsou vítané a
projekt je stavěný tak, aby zodpovědné přispění bylo snadné a
nezodpovědná publikace obtížná. Tento dokument je závazný spolu s
[konstitucí](docs/constitution/OPEN_INTELLIGENCE_COMMONS.md) a
redakčními pravidly v [AGENTS.md](AGENTS.md); kde by se zdály v
rozporu, vítězí konstituce a autorizační log.

> ⚠️ **Než cokoli pošlete**: všechny kanály tohoto projektu (issues,
> pull requesty, e-mail, Git historie) jsou **veřejné a trvalé**.
> Nevkládejte sem důvěrné dokumenty, identitu zdrojů, osobní kontakty
> ani nepublikovaný citlivý materiál. Projekt zatím **nemá** důvěrný
> intake kanál — smazaný commit přežívá ve forcích a cache a ochranu
> zdroje nelze po veřejné expozici obnovit.

## Co lze přispět hned

- **Opravy a tooling** (kód, validátory, šablony, dokumentace,
  přístupnost, překlepy) — standardní fork → větev → pull request.
- **Opravy faktů a zdrojů** v existujícím obsahu: mrtvý odkaz, přesnější
  metadata zdroje, doplnění druhého nezávislého zdroje k tvrzení se
  stavem „1 ZDROJ", zpřesnění procesního stavu. Na každé stránce webu je
  v patičce odkaz „✎ Navrhnout opravu této stránky" vedoucí na přesný
  zdrojový soubor.
- **Reakce subjektů a protidůkazy** — subjekty dossierů mohou žádat
  opravu, dodat vyjádření nebo protidůkazy (veřejně přes PR/issue, nebo
  e-mailem na corrections@vomaste.cz — také veřejný kanál). Podání samo
  dataset nemění; projde přezkumem. Subjekty nemají redakční veto.

## Co přispět NELZE bez předchozí autorizace

Jakýkoli **nový subjekt, nová kauza nebo nová jmenovaná třetí osoba**.
Rozsah pokrytí reálných osob určuje výhradně append-only autorizační
log v AGENTS.md — pull request rozšiřující pokrytí bez záznamu v logu
bude zamítnut bez ohledu na kvalitu zdrojů. „Je to veřejně zajímavé"
ani „už to někde vyšlo" není důvod. Návrh nového dossieru otevřete
nejdřív jako issue s odůvodněním veřejného zájmu.

## Pravidla pro obsahové příspěvky (závazná)

1. Cituj jen zdroj, který jsi skutečně otevřel/a — nikdy snippet
   z vyhledávače. Každé tvrzení = jmenovaný, datovaný zdroj s URL.
2. Jedno tvrzení = jeden ověřitelný výrok; stav podle skutečné síly
   důkazu (CORROBORATED vyžaduje ≥ 2 nezávislé redakce; tentýž vydavatel
   se nepočítá dvakrát — viz „vydavatelské rodiny" v registru zdrojů).
3. Procesní výsledek (odložení, promlčení, nepravomocné rozhodnutí) se
   pokaždé odlišuje od rozhodnutí o vině; citace ověřuje, že výrok padl,
   ne že platí.
4. Nejmenované třetí osoby zůstávají nejmenované; žádné soukromé adresy,
   kontakty, údaje o obětech či nezletilých. Každý nepříznivý záznam
   musí projít testem veřejného zájmu (viz konstituce, § 7).
5. Nejistota zůstává viditelná: co nejde doložit, patří do registru
   mezer, ne do tvrzení.

## Technický postup

```bash
# fork na GitHubu, potom:
git clone git@github.com:<vas-ucet>/vomaste.cz.git
cd vomaste.cz && npm ci
git switch -c oprava/<strucny-popis>
# ...úpravy...
npm run build        # plná kvalitní brána — MUSÍ projít
git commit && git push && # otevřít pull request
```

`npm run build` spouští všechny validátory (registry, graf, autorizace,
navigace, kotvy, JSON-LD) — červená brána znamená, že PR není hotový.
Detailní datový model a postup přidání zdroje/tvrzení/kauzy: README,
sekce „Přidání obsahu do dossieru". Generované soubory
(`static/css/main.css`, `static/js/app.js`, `data/generated/*`,
`data/dossiers/*/stats.toml`) needitujte ručně.

## Přezkum

Každý PR prochází lidským přezkumem (data / důkazy / redakce; u obsahu
o reálných osobách navíc kontrola proti autorizačnímu logu). Vysoce
rizikové změny — závažná obvinění, povyšování stavů tvrzení, cokoli
kolem citlivých kauz — se neslučují automaticky nikdy. Zamítnutí
dostane důvod. Věcné změny publikovaného obsahu se evidují v append-only
historii (`data/dossiers/<slug>/updates.toml`).

## Licence příspěvků

Přispěním souhlasíte s uvolněním svého původního příspěvku pod
[The Unlicense](LICENSE.md) (public domain). Nevkládejte cizí materiál,
který takto uvolnit nemůžete — citovaný obsah třetích stran se cituje
a odkazuje, nikdy nerelicencuje.

## Bezpečnostní problémy

Zranitelnosti nehlaste veřejnou issue — viz [SECURITY.md](SECURITY.md).
