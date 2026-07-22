# VOMASTE.CZ: PLNÁ NAVIGAČNÍ SÍŤ — OBOUSMĚRNÉ, DRILL-DOWN, IZOLOVANÉ A OVĚŘENÉ PROPOJENÍ

## MISE

Pracuj v repozitáři `/Users/korczis/dev/vomaste.cz`. Dovrš dossier do stavu, kdy je
**každá entita** (tvrzení, zdroj, mezera, kauza, bod časové osy, uzel grafu vztahů,
zdrojová rodina) samostatně routovatelná stránka, a **každá reference** mezi nimi
je klikatelná **oběma směry** — nejde jen o rozšíření obsahu, jde o dokončení
navigační architektury nad obsahem, který už existuje.

Toto není planning-only úkol. Po auditu pokračuj implementací, validací, browser
ověřením a deployem. Ptej se jen na skutečně blokující rozhodnutí.

Platí všechna pravidla z předchozích misí v tomto repozitáři (nekontaminovat
z jiné investigace, nic nevymýšlet, žádné destruktivní git operace, respektovat
souběžnou práci jiné session, jeden koordinující proces = jeden vlastník zápisu
do sdílených souborů v daném okamžiku).

---

## 1. CO ZNAMENÁ „KAŽDÝ LINK A KAŽDÁ REFERENCE"

Konkrétní entity v tomto dossieru a jejich očekávaný navigační stav:

| Entita | Dnešní stav (ověř, nepředpokládej) | Cílový stav |
|---|---|---|
| `CLM-##` (registr tvrzení) | řádek v tabulce na `/dossier/#registr-tvrzeni`, ne vlastní route | stabilní `id="clm-##"` anchor, viditelný v URL (`#clm-01`), odkazovatelný odkudkoliv |
| `SRC-##` (zdroj) | vlastní route `/dossier/zdroje/src-##/` | zachovat; doplnit prev/next a zpětné odkazy na všechna CLM, která podporuje |
| Zdrojová rodina (`family`) | pole ve front matter + sekce „Stejná zdrojová rodina" | ověř, že to funguje pro všechny rodiny, ne jen pro dvě otestované; zvaž Zola taxonomii |
| `GAP-##` (mezera) | řádek v tabulce, bez ID/anchoru | stabilní `id="gap-##"` anchor + odkaz na související CLM-## (pokud existuje) a zpět |
| Kauza (`extra.cases`) | karta odkazující na `#anchor` sekce | sekce musí mít nahoře odkaz zpět na svou kartu / na `#cases-heading` |
| Bod časové osy (`extra.timeline`) | odkaz na `#anchor` sekce | totéž — cílová sekce ví, že na ni časová osa odkazuje, a nabízí cestu zpět |
| Uzel grafu vztahů (Cytoscape) | vizuální, needitovatelný přes klik | klik na uzel/hranu odpovídající kauze naviguje na její sekci v dossieru (progressive enhancement, graf zůstává funkční i bez JS jako fallback text) |
| Osoba (Macinka, Turek) | zmíněni v textu, ne jako routovatelná entita | zvaž `/dossier/osoby/` sekci analogickou `/dossier/zdroje/`, pokud to dává smysl vzhledem k objemu vazeb — jinak zdůvodni, proč ne |

Pokud tabulka výše neodpovídá realitě repozitáře, over ji auditem (viz §2) a oprav —
nespoléhej na tento popis jako na fakt.

---

## 2. AUDIT PŘED ZÁSAHEM

```bash
cd /Users/korczis/dev/vomaste.cz
git status --short --branch
git fetch origin -q && git rev-parse HEAD origin/master
npm run validate:dossier
zola check
```

Zmapuj:
- aktuální počet SRC/CLM/GAP/cases/timeline položek (ze skutečných dat, ne z paměti);
- které z nich už mají stabilní `id` atribut použitelný jako anchor;
- které šablony renderují který typ entity (`templates/dossier*.html`);
- co dělá `scripts/dossier/validate-dossier.mjs` dnes a co v něm chybí vzhledem
  k požadavkům níže.

Pokud právě běží souběžná session (zkontroluj `git log` časová razítka, `git diff`
na sdílených souborech), neházej si s ní zápisy do stejného souboru najednou —
počkej na klidový bod (jako v předchozích misích) nebo pracuj na jasně odděleném
souboru.

---

## 3. POŽADAVKY NA PROPOJENÍ

### 3.1 Obousměrnost (back-and-forth)

Pro každý pár entit, kde A odkazuje na B, musí existovat cesta z B zpět na A —
ne nutně identický odkaz, ale funkční navigace. Konkrétně:

- `CLM-##` → `SRC-##`: **hotovo**, ověř že žádný `CLM-##` nemá nulový počet zdrojů.
- `SRC-##` → `CLM-##`: **hotovo** (odkaz na `#registr-tvrzeni`), ale zpřesni:
  odkaz musí mířit na **konkrétní** `#clm-##` anchor, ne jen na začátek sekce
  (viz §3.2 — to vyžaduje, aby CLM řádky měly `id`).
- `GAP-##` → `CLM-##` (tam kde existuje vazba, např. „viz CLM-27"): doplň
  skutečný odkaz místo textové zmínky.
- Kauza-karta → sekce: **hotovo**. Sekce → karta: doplň buď kotvu „↑ zpět na
  přehled kauz", nebo alespoň to, že karta i sekce sdílí viditelně stejný název,
  aby čtenář poznal spojitost i bez JS.
- Zdrojová rodina: `SRC-##` → sourozenci: **hotovo pro denik-n a
  hlidac-statu**. Over, že žádná další skupina zdrojů se stejným původem dat
  nezůstala neoznačená (např. pokud přibudou další zdroje).

### 3.2 Drill-down a rekurzivní navigovatelnost

Čtenář musí být schopen z jakéhokoliv bodu dossieru „vrtat dolů" až
k primárnímu zdroji a zase zpět nahoru, bez slepé uličky:

```
Homepage → Dossier → Kauza (karta) → Sekce kauzy → CLM řádek (#clm-##)
  → SRC odkaz → SRC detail → (pokud family) sourozenecký SRC
  → zpět na SRC detail → zpět na Registr zdrojů → zpět na Dossier → Homepage
```

Ověř tuto cestu ručně (Playwright) alespoň pro tři různé kauzy, ne jen pro
jednu — každá kauza je jiný „nejhorší případ" (nejvíc zdrojů, nejvíc sporných
tvrzení, nejnovější přidaná).

### 3.3 Self-contained, ale routovatelné

Každá stránka (`/dossier/`, `/dossier/zdroje/`, `/dossier/zdroje/src-##/`)
musí dávat smysl **sama o sobě** při přímém vstupu (sdílený odkaz, vyhledávač,
sitemap) — ne jen v kontextu prokliku z domovské stránky:

- breadcrumb na každé úrovni (`Dossier / Registr zdrojů / SRC-14`);
- `<title>` a `description` per-page (ověř přes `templates/base.html`, že se
  nedědí nesmyslně);
- žádná stránka, která vyžaduje JS jen k tomu, aby se dalo zjistit, kde na
  webu jsem.

### 3.4 Izolace a routovatelnost zároveň

„Izolované" = každá entita má vlastní stabilní identifikátor a URL/anchor,
který nezávisí na pořadí v souboru ani na tom, co se přidá později. Konkrétně:
- `CLM-##` a `GAP-##` anchor `id` musí být generováno z ID, ne z pořadí
  (`id="clm-{{ n }}"`, ne automatický Zola slug z nadpisu, který se může
  změnit přeuspořádáním).
- Nová položka přidaná uprostřed číslování nesmí rozbít existující odkazy
  zvenčí (sdílené URL, případně budoucí zpětné odkazy z jiných webů).

### 3.5 Enforced (vynucené, ne jen konvence)

Rozšiř `scripts/dossier/validate-dossier.mjs` tak, aby vynucoval:

1. každé `CLM-##` v tabulce má odpovídající `id="clm-##"` v HTML výstupu
   (over přes vygenerovaný `public/dossier/index.html` po `zola build`, ne
   jen přes zdrojový markdown — anchor musí reálně existovat ve výstupu);
2. každé `GAP-##`, které textově zmiňuje „viz CLM-XX", má u toho i skutečný
   markdown odkaz;
3. žádný `SRC-##` není osamocený ostrov — buď má `claims` neprázdné, nebo je
   explicitně `claims = []` a je odkazovaný z prózy (to už `validate-dossier.mjs`
   částečně hlídá — rozšiř, ať kontroluje i směr SRC→CLM anchor, ne jen
   existenci SRC souboru);
4. žádný `#anchor` použitý v `extra.cases`/`extra.timeline` neukazuje na
   neexistující nadpis v těle dokumentu (parsuj vygenerované `id` atributy
   z buildu, porovnej se seznamem použitých kotev);
5. exit kód ≠ 0 při jakékoliv porušené vazbě, s přesným souborem/ID ve
   výpisu — stejná disciplína jako dosavadní validátor.

### 3.6 Compliant (v souladu s existujícími pravidly repozitáře)

- Žádná fabrikace: nové odkazy vznikají jen tam, kde vazba už fakticky
  existuje v datech (např. GAP textově zmiňuje CLM — pak z toho udělej
  odkaz; nevymýšlej novou vazbu, která v textu není).
- CZE jazyková politika pro `/dossier/*`: zůstává čeština, identifikátory
  (`CLM-##`, `SRC-##`, `GAP-##`) zůstávají v aktuálním formátu.
- Žádný nový inline `<style>` blok (viz předchozí audit) — pokud navigace
  potřebuje nový CSS, patří do `static/css/input.css`.

### 3.7 Plné využití Zola funkcí

Aktuální implementace používá Zola sekce, `get_url`, interní `@/...` odkazy
a `get_section`. Prověř a doplň, kde to reálně přidá hodnotu (ne kvůli
"použij všechno", ale kvůli konkrétnímu UX zlepšení):

- **Taxonomie** (`taxonomies` v `config.toml`): zvaž zavedení taxonomie
  `zdrojova-rodina` a/nebo `typ-zdroje` nad `content/dossier/zdroje/*.md` —
  Zola pak automaticky vygeneruje `/dossier/zdroje/zdrojova-rodina/denik-n/`
  jako hotovou, cachovatelnou, no-JS stránku rodiny, místo ruční `get_section`
  smyčky v šabloně. Pokud to zavedeš, **nahraď** tím současnou JS-based
  filtraci rodin jako fallback bez JS, neduplikuj logiku na dvou místech.
- **`page.lower`/`page.higher`** nebo ruční `weight`-based prev/next: přidej
  na `dossier-source.html` navigaci „← předchozí zdroj / další zdroj →" podle
  `weight`, ať drill-down není jen stromový, ale i lineární.
- **`sitemap.xml`** (Zola generuje automaticky): ověř, že všech 43+ SRC
  stránek + `/dossier/` + `/dossier/zdroje/` je v sitemapě a má správný
  `lastmod` — pokud `updated`/`retrieved` nejsou mapované do front matter
  `date`, Zola nemá z čeho `lastmod` odvodit; over a případně doplň `date`
  do front matteru tam, kde dává smysl.
- **`get_taxonomy_url`/`get_page`** pro robustní interní odkazy místo
  ručně skládaných cest, kde je to k dispozici.
- Nezaváděj Zola funkci jen proto, že existuje — každé použití zdůvodni
  v commit message jednou větou.

---

## 4. IMPLEMENTACE

Pořadí doporučené, ne závazné — přizpůsob realitě repozitáře:

1. Přidej stabilní `id="clm-##"` a `id="gap-##"` do řádků obou tabulek
   v `content/dossier/_index.md` (přes raw HTML `<a id="clm-01"></a>` před
   řádkem, nebo úpravou šablony, pokud tabulky přejdou na jiný rendering —
   over, co je méně invazivní vzhledem k tomu, že markdown tabulky nejdou
   snadno editovat po řádcích v Tera).
2. Projdi `GAP-##` řádky a `CLM-##` textové zmínky v tělových odstavcích;
   kde chybí odkaz na existující anchor, dopiš ho.
3. Rozšiř `dossier-source.html` o prev/next podle `weight`.
4. Zvaž a případně zaveď taxonomii pro zdrojové rodiny; pokud ano, přepiš
   `dossier-sources-index.html` tak, aby čerpala z taxonomie místo ruční
   Tera smyčky, a ponech JS filtr jen jako doplněk nad již vykresleným,
   plně funkčním HTML.
5. Rozšiř `scripts/dossier/validate-dossier.mjs` podle §3.5. Validátor musí
   běžet i nad vygenerovaným `public/` výstupem tam, kde kontroluje reálné
   HTML anchors (spusť `zola build` před touto částí validace).
6. Aktualizuj `package.json` `validate:dossier`/`build` skripty, pokud nový
   krok vyžaduje jiné pořadí (např. build před anchor-validací).

---

## 5. VALIDACE, BUILD, BROWSER OVĚŘENÍ

```bash
npm run validate:dossier
npm run build
git diff --check
```

Skutečné browser ověření (Playwright, Chrome extension pravděpodobně
nedostupná — nezastavuj se na tom):

- projdi ručně cestu z §3.2 pro 3 různé kauzy, klikáním přes skutečné odkazy
  (`page.click`, ne jen kontrola přítomnosti `href` v HTML);
- ověř, že `location.hash` po kliknutí na `SRC-##` → `#registr-tvrzeni`
  (nebo `#clm-##`, pokud implementuješ přesné kotvy) skutečně odpovídá
  a prohlížeč se na dané místo reálně scrolluje;
- ověř 390×844 i 1440×900, žádný horizontální scroll (stejná past jako
  minule s tabulkami — zkontroluj, jestli nové prvky prev/next nebo
  taxonomické karty nezpůsobí totéž);
- žádné console errors, žádné selhané requesty.

Pořiď screenshoty do scratchpadu, cesty ulož do závěrečné zprávy.

---

## 6. DEPLOY A LIVE OVĚŘENÍ

```bash
git fetch origin -q && git status --short
git add <konkrétní soubory, ne -A bez kontroly>
git commit -m "feat(dossier): bidirectional anchors, family taxonomy, drill-down nav"
git push origin master
gh run list --limit 3
```

Počkej na dokončení GitHub Actions běhu v rámci této session. Po úspěchu
ověř znovu Playwrightem na `https://korczis.github.io/vomaste.cz/...` —
HTTP 200 není vizuální ověření, stejné pravidlo jako v předchozích misích.

---

## 7. AKCEPTAČNÍ KRITÉRIA

- [ ] Každé `CLM-##` má stabilní `id`, dosažitelné přímým odkazem zvenčí.
- [ ] Každé `GAP-##`, které zmiňuje CLM, na něj skutečně odkazuje.
- [ ] Každý `SRC-##` odkazuje zpět na konkrétní tvrzení (ne jen na vrchol tabulky).
- [ ] Prev/next mezi SRC stránkami funguje a je viditelné.
- [ ] Rodiny zdrojů jsou konzistentně označené a procházitelné (taxonomie
      nebo rovnocenné řešení), nová položka do rodiny nevyžaduje ruční
      úpravu šablony.
- [ ] `validate-dossier.mjs` selže s nenulovým exit kódem na jakoukoliv
      rozbitou vazbu popsanou v §3.5, s přesným souborem/ID ve výstupu.
- [ ] `zola check`, `zola build`, `npm run validate:dossier`, `git diff --check`
      všechny prošly — se skutečně vloženým výstupem, ne tvrzením „PASS".
- [ ] Ruční drill-down cesta ověřena Playwrightem pro 3 různé kauzy.
- [ ] Žádný horizontální scroll na 390×844 a 1440×900.
- [ ] Nasazeno, live ověřeno stejným Playwright skriptem jako lokálně.
- [ ] Žádná fabrikace — každý nový odkaz odpovídá vazbě, která už v datech
      existovala, jen nebyla klikatelná.

## 8. ZÁVĚREČNÝ REPORT

Stejná struktura jako v předchozích misích v tomto repozitáři: audit,
implementace (seznam souborů), tabulka spuštěných příkazů s exit kódy,
browser ověření (lokální i live, s cestami ke screenshotům), git/deploy
detaily, a upřímný seznam toho, co zůstalo neúplné a proč.
