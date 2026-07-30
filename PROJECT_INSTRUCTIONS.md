# vomaste.cz — instrukce pro ChatGPT projekt

## Účel

vomaste.cz je statický web provozující **obecnou platformu pro neutrální,
zdroji podložené „dossiery“** o veřejně řešených kauzách veřejně činných
osob v ČR. Není to zpravodajský web ani blog s názory — je to strukturovaný,
auditovatelný registr toho, co bylo o dané osobě ve veřejné funkci nezávisle
publikováno, s explicitním rozlišením faktu, citace, sporného tvrzení a
názoru. Které dossiery zrovna existují, tady schválně nestojí — jsou
záznamem v `data/dossiers.toml` a řídí se jím šablony, validátory i
navigace; číslo v textu by byla konstanta, kterou nikdo nepřepočítá. Živý
seznam je na `/dossiers/`, autorizovaný rozsah v append-only logu v
`AGENTS.md`. Ale
datový model, šablony i redakční pravidla jsou navržené obecně — pro
libovolný další případ, pokud ho vlastník webu explicitně a na záznam
autorizuje (viz níže).

## Datový model dossieru

Každý dossier stojí na třech provázaných registrech:

- **Registr tvrzení (CLM-##)** — hlavní tabulka na stránce dossieru. Řádek:
  kotva `<a id="clm-NN">`, text tvrzení, stav ověřenosti, odkaz na zdroj/e
  (SRC-##). Stavy:
  - `CORROBORATED` — nezávisle potvrzeno více zdroji/redakcemi
  - `CITACE` — přímý výrok osoby, uveden jako citace, ne jako hodnocení webu
  - `SPORNÉ` — neuzavřené, nepotvrzené nebo protichůdné tvrzení
  - `NÁZOR` — autorský komentář/analýza, strukturně oddělený od zpravodajství
- **Registr zdrojů (SRC-##)** — vlastní stránka na zdroj: vydavatel, typ
  média, přímý odkaz, datum publikace i získání, podporovaná CLM-##. Zdroje
  téhož vydavatele se v poznámce k nezávislosti vedou jako jedna „zdrojová
  rodina“ — nepočítají se jako dvě nezávislá potvrzení.
- **Registr mezer (GAP-##)** — otevřené otázky: priorita, datum poslední
  kontroly, související CLM-##, co přesně chybí a proč. Zařazení mezi
  „otevřené“ není nález žádným směrem — jen že dostupné zdroje k danému
  datu neumožňují závěr.

Registry jsou obousměrně provázané (CLM ↔ SRC, GAP → CLM). Integrita odkazů
a kotev se ověřuje automaticky při buildu (`scripts/dossier/validate-dossier.mjs`,
`scripts/dossier/verify-anchors.mjs`) — build padá na první chybějící odkaz,
duplicitní ID nebo osiřelou kotvu.

## Redakční principy (závazné pro jakýkoli obsah)

1. Žádné tvrzení bez jmenovaného, dohledatelného, nezávislého zdroje s
   přímým odkazem. Bez zdroje se tvrzení neuvádí, nebo se škrtá.
2. Citace se uvádí jako citace (uvozovky, atribuce) a nikdy se
   neparafrázuje způsobem, který by ji zjemnil, zdramatizoval nebo vydával
   za hodnocení webu.
3. Procesní výsledky (odložení věci, promlčení, nepravomocné rozhodnutí) se
   striktně a **opakovaně** odlišují od věcného posouzení viny/pravdivosti —
   nikdy jen jednou v poznámce pod čarou, ale při každé zmínce.
4. Názor a komentář jsou vizuálně i strukturně oddělené od faktografické
   části a vždy jasně označené jako názor.
5. U neanonymizovaných třetích osob (např. oznamovatelka trestného činu) se
   nikdy nedoplňuje jméno, které samo citované zdroje neuvádí.
6. Nedostatky pokrytí se přiznávají otevřeně (sekce „co tento přehled
   nezkoumal“) — nikdy se nepředstírá vyčerpávající pokrytí.
7. Web nehodnotí vinu ani nevinu a nepřebírá tvrzení jedné strany jako fakt
   jen proto, že je hlasitější nebo mediálně pohodlnější.
8. Žádné spekulace, domněnky ani „pravděpodobně“ tam, kde zdroje mlčí — v
   takovém případě patří téma do registru mezer, ne do registru tvrzení.

## Proces rozšíření rozsahu (nový předmět nebo nová kauza)

Výchozí stav je **nepokrývat nikoho**. Rozšíření na nový předmět (osobu)
nebo novou kauzu u existujícího předmětu vyžaduje explicitní, datovanou
autorizaci vlastníka webu zaznamenanou v `AGENTS.md` — ne mlčky
předpokládanou, ne odvozenou z toho, že je téma „veřejně zajímavé“. Taková
autorizace musí uvést přesně: koho, jaké konkrétní kauzy/témata, a že
pokrytí se drží toho, co už zveřejnily jmenované, renomované, nezávislé
zdroje. Autorizace nikdy automaticky nerozšiřuje pokrytí na další jmenované
třetí strany nad rámec toho, co citované zdroje samy zveřejňují. Nikdy
sám nenavrhuj ani nepiš obsah o novém předmětu bez této autorizace — v
případě pochybnosti se nejdřív zeptej.

## Technický stack a struktura repozitáře

- [Zola](https://www.getzola.org/) — generátor statického webu; obsah v
  Markdown + TOML front matter (`content/`), šablony v Tera (`templates/`)
- Tailwind CSS (CLI build z `static/css/input.css`) + Flowbite aplikační
  shell (navbar + Drawer sidebar, `data-drawer-*` atributy) sbalené
  esbuildem (`assets/js/app.js` → `static/js/app.js`)
- Alpine.js — cílená závislost pro skutečně interaktivní UI (filtrovací
  lišty, chipy a detail panel grafu vztahů), používaná stejně jako
  Chart.js/Sigma.js níže — ne jako celoplošný framework
- Sigma.js + Graphology (bundlované) pro graf vztahů, Chart.js (CDN, jen na
  stránce dossieru) — graf stavu
  tvrzení a interaktivní graf vztahů mezi osobami, institucemi a kauzami
- `data/navigation.toml` — datově řízená navigace, vykreslená
  `templates/base.html` jako Flowbite aplikační shell (navbar + sidebar
  jako skutečný Flowbite Drawer, doklopený na desktopu, mimo obrazovku na
  mobilu)
- Klíčové šablony: `index.html` (landing), `dossier.html`,
  `dossier-source.html` + `dossier-sources-index.html`, `dossier-gap.html`
  + `dossier-gaps-index.html`

## Vývojový a nasazovací workflow

- `npm run dev` — jednorázový build CSS/JS + `zola serve` (živý reload,
  `http://127.0.0.1:1111`)
- `npm run build` — plná produkční sekvence: `validate:dossier` → CSS → JS
  → `zola build` → `verify:anchors`; přesně tuto sekvenci spouští i CI
- Nasazení: push do `master` → GitHub Actions → `zola check` → `zola
  build` → `actions/deploy-pages` na GitHub Pages. Deploy jede na
  vestavěném OIDC tokenu GitHub Actions, bez osobního přístupového tokenu
  nebo jiného secretu.
- `base_url` je `https://vomaste.cz` (vlastní doména Pages: apex A/AAAA na
  GitHub Pages IP v Route 53, `www` CNAME na `korczis.github.io`). Mění se
  vždy současně se `static/CNAME` — viz komentář v `config.toml`.

## Jak se mnou pracovat na tomto projektu

- Piš/uprav obsah dossieru striktně podle redakčních principů výše — každé
  nové tvrzení potřebuje zdroj a stav ověřenosti.
- Při změně datového modelu (nová šablona, nové pole front matter) drž
  konzistenci mezi `content/`, `templates/` a validačními skripty v
  `scripts/dossier/` — pole, které nečte žádná šablona, ani pole bez
  pokrytí ve validátoru, je vada, ne detail.
- Než cokoli prohlásíš za hotové, over `npm run build` bez chyb — validátor
  a anchor-checker jsou skutečná specifikace, ne formalita.
- Jazyk obsahu webu je čeština, neutrální publicistický až encyklopedický
  tón; žádné emotivní zabarvení, řečnické otázky ani zabarvené přídavné
  jméno tam, kde stačí fakt.
- Autorizační záznamy v `AGENTS.md` (kdo, kdy, co přesně schválil) se
  nikdy neupravují ani nemažou — jsou to auditovatelné záznamy na záznam.
  Nové rozšíření rozsahu se vždy přidává jako nová, datovaná sekce.
- Pokud si nejsi jistý, jestli je něco v rámci autorizovaného rozsahu,
  zeptej se, než něco napíšeš nebo navrhneš zveřejnit.
