# vomaste.cz — Open Intelligence Commons (konstituce)

Přijato na pokyn vlastníka webu, 2026-07-29 („prtav do README.md,
AGENTS.md, CLAUDE.md a následně se tím řiď"). Tento dokument je úplná
závazná konstituce; README.md nese veřejnou identitu, AGENTS.md závazné
invarianty pro agenty, CLAUDE.md sem odkazuje. Kdyby se tento dokument
kdykoli zdál v rozporu s append-only autorizačním logem v AGENTS.md,
vítězí rozsahová omezení logu — konstituce řídí *platformu*, nikdy
nerozšiřuje pokrytí žádné skutečné osoby.

## 1. Identita

vomaste.cz není web s několika dossiery. Je to **otevřený,
fork-friendly, Git-native systém komunitní veřejné inteligence**:
open-source investigativní datový systém, verzovaný dataset orientovaný
na JSON-LD, statická a plně inspektovatelná publikace a znovupoužitelný
dossierový toolkit.

**Není to**: drbárna, černá listina, skládka leaků, platforma pro
nepodložená obvinění, centrální autorita s nárokem na konečnou pravdu,
ani veřejné skladiště podezření.

Ústřední slib nezní „věřte nám". Zní: **„Prohlédni si zdroj, prohlédni
si tvrzení, prohlédni si historii, zreprodukuj build a zpochybni
výsledek."**

## 2. Poslání

Pomáhat komunitám postupně a ověřitelně dokumentovat neprůhledné,
rozporné, šedé až potenciálně protiprávní vazby a jednání podstatná pro
veřejný zájem — veřejné funkce a vliv, vlastnictví a ovládání firem,
veřejné zakázky, dotace, financování politiky, lobbing, střety zájmů,
selhání institucí, veřejné výroky a jejich rozpory.

„Šedá" nebo „černá" **nikdy není verdikt**. Vztah se stává
publikovatelným, protože je *doložený, atribuovaný, relevantní,
přiměřený, přezkoumatelný a jasně stavově označený* — nikdy proto, že
ho vyšetřující považuje za podezřelý.

## 3. Konstituční invarianty (trvalé)

1. **Vše veřejné je datově řízené.** Každý veřejný dossier, entita,
   tvrzení, zdroj, kauza, událost, vztah, mezera, oprava i revize je
   kanonický strukturovaný záznam. Narativ záznamy interpretuje; nikdy
   se nesmí stát paralelním úložištěm pravdy.
2. **Vše veřejné je trackované v Gitu.** Každá publikovaná revize
   odpovídá identifikovatelné Git revizi. Veřejná data se nikdy nemění
   potichu; každá mutace je dohledatelná ke commitu, přezkoumatelné
   změně, výsledku validace a nasazení.
3. **Každé podstatné tvrzení je inspektovatelné**: výrok, stav, zdroje,
   datum události, datum revize, podpůrné i protichůdné důkazy, reakce
   subjektů, historie změn a důvod přijetí.
4. **Forkovatelnost je vlastnost první třídy.** Třetí strana musí umět
   repozitář forknout a provozovat nezávislou instanci bez privátní
   infrastruktury, skrytých API, přihlašovacích údajů, placených
   závislostí a nezdokumentovaného build know-how.
5. **Přispívání musí být přístupné** — fork, bootstrap, strukturovaný
   příspěvek, validace, náhled, pull request. Netechnický přispěvatel
   má mít zdokumentovanou bezpečnou cestu bez nutnosti znát JSON-LD.
6. **Bezpečnost má přednost před pohodlím.** Ochrana soukromí, důkazní
   a právní pojistky se nikdy nesnižují kvůli snížení tření. Usnadňuj
   vyhovující příspěvky; nikdy neusnadňuj nepřezkoumanou publikaci.
7. **Žádný skrytý publikační stav.** Publikovaný veřejný stav je
   reprodukovatelný z verzovaného veřejného snapshotu a revize
   repozitáře.
8. **Nejistota zůstává viditelná.** Neznámé, tvrzené, sporné,
   vyvrácené, neověřené, procesní, zastaralé, odvozené i otevřená
   otázka jsou odlišné stavy — nikdy se neslévají do generických
   „faktů".

## 4. Architektura dvou zón

- **Zóna A — veřejný open-intelligence repozitář**: pouze materiál
  schválený k publikaci — veřejné strukturované záznamy, metadata
  zdrojů, zákonné výňatky, generované dossiery, opravy, metodika,
  schémata, tooling, testy, historie revizí, konfigurace nasazení.
  Forkovatelná a veřejně inspektovatelná.
- **Zóna B — chráněná intake/review karanténa**: nepublikované podněty,
  citlivé důkazy, metadata chránící zdroje. **Nikdy se neukládá do
  veřejného Git repozitáře.** Nikdy neprochází veřejnými GitHub issues,
  veřejnými pull requesty, statickými formuláři ani client-side
  logováním. Vyžaduje explicitní kontroly přístupu, retence, redakce,
  nakládání s malwarem, odstranění metadat, pseudonymizace, chain of
  custody, publikačního přezkumu, bezpečného mazání a incident
  response.

**Doplnění, 2026-08-08 (na pokyn vlastníka webu, on the record): zdroj
záznamu a bezpečnost jeho obsahu jsou dvě různé osy, ne jedna.** Že
dokument pochází z veřejné státní instituce (ARES, veřejný rejstřík,
soud) neznamená automaticky, že jeho obsah je publikačně bezpečný —
veřejná dostupnost registru chrání právo dohledat zápis, ne právo
kohokoli přetisknout cokoli, co registr obsahuje. Rozlišení:

- **Strukturovaná registrová data** (např. ARES JSON výpis: zapsané
  funkce, obchodní podíly, IČO, sídlo firmy) smí vstupovat do zóny A
  automaticky, bez per-záznamové autorizace — je to týž typ dat, jaký
  `scripts/osint/expand-entity.mjs` už dnes používá pro kontextové
  entity, a nástroje v repozitáři už osobní údaje (rodné číslo, adresu
  bydliště fyzické osoby) z něj strojově odstraňují
  (`stripPersonalData()`), ne konvencí.
- **Naskenované listiny a jiné nestrukturované dokumenty** (Sbírka
  listin, notářské zápisy, soudní vývěsky a podobně) **nikdy
  nevstupují do zóny A automaticky**, bez ohledu na to, že zdrojová
  instituce je veřejná. Běžně jmenují třetí osoby (spoluspolečníky,
  notáře, svědky) a nesou přesně ty osobní údaje, které bod 7 (test
  veřejného zájmu) a AGENTS.md (datová minimalizace) zakazují
  publikovat bez prokázaného veřejného zájmu u té konkrétní osoby.
  Zjištěno v praxi 2026-08-06/07 na dossieru martin-pavlik: notářský
  zápis z veřejného rejstříku, datovaný přesně na den zápisu
  autorizovaného podílu, zaznamenal především vstup jiné, jmenované
  fyzické osoby jako nového společníka — přesně to je záznam, který by
  automatické „zdroj je stát, tedy bezpečné" pravidlo nechalo projít.
  Takové dokumenty se smí stahovat a uchovávat (viz zóna B níže), ale
  do veřejného Git repozitáře vstupují jen jako publikačně bezpečný
  derivát po lidském přezkumu — stejné pravidlo, jaké tahle sekce už
  žádá pro podněty od zdrojů.

Koncepční intake pipeline: podnět → izolovaná karanténa → kontrola
malwaru a typů souborů → analýza metadat → posouzení rizika pro zdroj →
redakční pracoviště → záznam chain of custody → důkazní přezkum →
přezkum veřejného zájmu → přezkum soukromí a práva → publikačně
bezpečný derivát → strukturovaný příspěvkový balíček → Git review →
publikace. Do veřejného repozitáře vstupuje **pouze publikačně bezpečný
derivát**.

**Pravidlo poctivosti**: dokud není integrován auditovaný bezpečný
intake systém, projekt to musí říkat na rovinu, nesmí stavět klamavý
„bezpečný upload" formulář, nesmí vynalézat vlastní kryptografii a
nikdy nesmí naznačovat, že veřejná GitHub issue nebo běžný e-mail jsou
bezpečný whistleblower kanál. Zakázaný slovník: „zcela anonymní",
„nevystopovatelné", „military-grade", „100% bezpečné", „bez metadat",
„garantovaně důvěrné".

## 5. Ohleduplnost k whistleblowerům (implementovaná vlastnost, ne marketing)

Před jakýmkoli podáním projekt vysvětluje: co logují GitHub, e-mailoví
poskytovatelé, prohlížeče a sítě; že veřejné pull requesty odhalují
identitu a historii; že metadata dokumentů prozrazují autorství,
zařízení a časová pásma; že screenshoty prozrazují účty a notifikace;
že smazání commitu neodstraní obsah z forků a cache; že ochranu zdroje
nelze po veřejné expozici obnovit. Tři zřetelně oddělené cesty:
**veřejná** (materiál už bezpečně publikovatelný, tooling, opravy),
**důvěrná** (mimo GitHub, jen přes explicitně zdokumentovaný chráněný
kanál — dokud neexistuje, neexistuje), **pseudonymní** (poctivě
zdokumentovaná včetně limitů).

## 6. Výzkumné stopy vs. otevřené otázky vs. publikovaná tvrzení

- **Výzkumná stopa** smí být neúplná či spekulativní; není veřejným
  důkazem a nikdy se nesmí objevit jako obvinění.
- **Otevřená otázka** (GAP) je publikačně bezpečný, neutrálně
  formulovaný popis důkazní mezery bez implikovaného závěru.
- **Publikované tvrzení** je atomické, ozdrojované, stavově označené,
  přezkoumané a odůvodněné veřejným zájmem.

Tooling a schéma musí bránit náhodnému povýšení mezi úrovněmi. Interní
hypotézy se do veřejného výstupu dostanou jedině přes příspěvkový
workflow.

## 7. Test veřejného zájmu a anti-doxxing absolutna

Každý nepříznivý záznam musí odpovědět: jaká veřejná funkce, veřejný
zdroj, institucionální odpovědnost nebo podstatná veřejná
sebeprezentace je ve hře; proč je publikace přiměřená; jaká méně
invazivní podoba byla zvážena. „Ten člověk je zajímavý" není
odůvodnění.

Kategoricky odmítnuto: soukromé adresy (nad rámec přezkoumané nezbytné
míry veřejného zájmu), soukromá telefonní čísla a e-maily, doklady
totožnosti, irelevantní rodinné informace, identifikace obětí,
informace o nezletilých, zdravotní informace bez vztahu k veřejné
funkci, poloha v reálném čase, výzvy k obtěžování, nepodložené trestní
nálepky, obsah cílený na ponížení. Automatické detektory pomáhají;
nikdy nenahrazují lidský přezkum.

## 8. Důvěra bez „trust score"

Žádné neprůhledné číselné skóre pravdy, nikdy. Zveřejňují se
inspektovatelné dimenze: typ zdroje, dostupnost primárního zdroje,
nezávislé zdrojové skupiny, stav tvrzení, datum poslední revize, stav
rozporů, dostupnost zdrojů. Každá vypočtená metrika dokumentuje přesný
způsob odvození a nikdy potichu nepovyšuje tvrzení. Žádné žebříčky
obvinění, žádné pořadí „nejkontroverznějších osob", žádné odměny za
nepříznivá tvrzení.

## 9. Správa (governance)

Zdokumentované odpovědnosti správců, práva přispěvatelů, dimenze review
(data / důkazy / redakce / soukromí / bezpečnost / právní riziko /
technika), rizikově odstupňovaný přezkum (vysoce rizikové změny —
závažná obvinění, výňatky ze soukromých dokumentů, povyšování stavů —
nikdy auto-merge), deklarace střetů zájmů, dokumentované důvody
zamítnutí, veřejná historie oprav a dohledatelný férový mechanismus pro
subjekty (žádost o opravu, reakce, protidůkazy — bez redakčního veta).
Anti-capture: transparentní správa, provenance review, seskupování
nezávislých zdrojů, neměnná historie; limity se dokumentují, nezapírají.

## 10. Zakázané zkratky (trvalé)

Nikdy: neoznačovat projekt za „open source"/„whistleblower friendly"
nad rámec implementovaného; nepřijímat obvinění nekontrolovaným
formulářem; neukládat surové podněty do veřejného Gitu; nezaměňovat
validitu schématu s pravdou ani počet zdrojů s korroborací;
negamifikovat obvinění; nepublikovat stopy jako tvrzení; neslibovat
anonymitu; nehardcodovat branding instance do core toolingu;
nevyžadovat pro fork přístup k privátnímu backendu; potichu
nepřepisovat publikovaná data; nenechat výstup AI obejít lidský
přezkum; nepovažovat Git historii za bezpečný důvěrný archiv; nepsat
politiky, které žádný tooling ani review nevynucuje.

## 11. Stav implementace (poctivě, k 2026-07-29)

Už dnes platí: veřejný obsah je datově řízený a trackovaný v Gitu;
model tvrzení/zdrojů/kauz/mezer/vztahů s viditelnými stavy nejistoty
existuje a vynucují ho validátory (`npm run build`); každá publikovaná
revize odpovídá commitu nasazenému přes CI; opravy se evidují v
append-only historii aktualizací; anti-coupling linter
(`npm run lint:historical-coupling`) a de-specializační migrace
(generická multi-dossier architektura) běží na co-op boardu
(`docs/coop/TASKS.md`).

Zatím neimplementováno (roadmapa; neinzerovat jako existující):
příspěvkové balíčky a CLI, sémantický diff, fork starter kit a
clean-room test forku, JSON-LD releasy datasetu s checksumy, sada
politik CONTRIBUTING/GOVERNANCE/SECURITY/PRIVACY, privacy/secret
scanning brány, issue/PR šablony, provenance UI, federační tooling a
jakýkoli důvěrný intake kanál. Dokud sada politik nevznikne, je jediným
kanálem veřejný repozitář — a ten je veřejný.
