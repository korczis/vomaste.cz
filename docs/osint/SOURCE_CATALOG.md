<!-- GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`. -->

# Katalog zdrojů — kde pátrat

Odpovídá na otázku „kam se podívat a čemu z toho věřit". Publikovaná podoba: [/zdroje/](https://vomaste.cz/zdroje/).

**Pravidlo, které z katalogu plyne**: doklad je vždy primární registr. Agregátor je rozcestník — ukáže, kde hledat, ale cituje se ten registr, na který ukazuje.

## Registry a nástroje

| Zdroj | Typ | Přístup | Kde |
|---|---|---|---|
| [ARES — Administrativní registr ekonomických subjektů](/zdroje/ares/) | primární registr | veřejně dostupný | https://ares.gov.cz/ekonomicke-subjekty |
| [Registr smluv (ISRS)](/zdroje/registr-smluv/) | primární registr | veřejně dostupný | https://smlouvy.gov.cz/vyhledavani |
| [Věstník veřejných zakázek (VVZ)](/zdroje/vestnik-verejnych-zakazek/) | primární registr | veřejně dostupný | https://vvz.nipez.cz/verejne-zakazky |
| [Sbírka listin veřejného rejstříku](/zdroje/justice-sbirka-listin/) | primární listina | veřejně dostupný | https://or.justice.cz/ias/ui/rejstrik |
| [Katastr nemovitostí (ČÚZK)](/zdroje/katastr-nemovitosti/) | primární registr | omezený přístup | https://nahlizenidokn.cuzk.cz/ |
| [Hlídač státu](/zdroje/hlidac-statu/) | agregátor | veřejně dostupný | https://www.hlidacstatu.cz/ |
| [Podnikatel.cz — rejstříkové profily](/zdroje/podnikatel-cz-rejstrik/) | agregátor | veřejně dostupný | https://www.podnikatel.cz/rejstrik/ |
| [Informační systém datových schránek (ISDS)](/zdroje/datove-schranky/) | primární registr | omezený přístup | https://www.mojedatovaschranka.cz/ |
| [ČTK — Česká tisková kancelář](/zdroje/ctk/) | média | omezený přístup | https://www.ctk.cz/ |
| [Poslanecká sněmovna Parlamentu ČR](/zdroje/psp-cz/) | primární listina | veřejně dostupný | https://www.psp.cz/ |
| [Vláda České republiky](/zdroje/vlada-cz/) | primární listina | veřejně dostupný | https://vlada.gov.cz/ |
| [Seznam Zprávy](/zdroje/seznam-zpravy/) | média | veřejně dostupný | https://www.seznamzpravy.cz/ |
| [Deník N](/zdroje/denik-n/) | média | veřejně dostupný | https://denikn.cz/ |
| [iROZHLAS / Český rozhlas](/zdroje/irozhlas/) | média | veřejně dostupný | https://www.irozhlas.cz/ |
| [Česká televize / ČT24](/zdroje/ceska-televize/) | média | veřejně dostupný | https://ct24.ceskatelevize.cz/ |

## Pasti, na které se už najelo

- **ARES — Administrativní registr ekonomických subjektů — Dva různé významy odpovědi 404**: `{"kod":"NENALEZENO","subKod":"VYSTUP_SUBJEKT_NENALEZEN"}` znamená, že subjekt v tomto sub-registru zapsán není — je to řádná odpověď, ne porucha. Naproti tomu `{"status":404,"error":"Not Found","path":…}` znamená, že neexistuje sám endpoint. Sloučení obojího do „nenalezeno" vede k závěru, že sub-registr neexistuje, ačkoli jen daný subjekt v něm není zapsán.
- **ARES — Administrativní registr ekonomických subjektů — Dva různé významy odpovědi 400**: `VYSTUP_PRILIS_MNOHO_VYSLEDKU` znamená přes tisíc výsledků, tedy „zpřesni dotaz". `VSTUP_PRAZDNY` znamená, že se na dané pole vůbec neindexuje. První je obchodní odpověď, druhý konstrukční omezení dotazu.
- **ARES — Administrativní registr ekonomických subjektů — Desetinný oddělovač je středník**: Částky přicházejí jako `"390000000;00"`, tisíce oddělené nezlomitelnou mezerou (U+00A0) nebo úzkou nezlomitelnou mezerou (U+202F). Naivní `parseFloat` vrátí řádově jinou hodnotu.
- **ARES — Administrativní registr ekonomických subjektů — Dvojí časová platnost ve VR**: `datumZapisu`/`datumVymazu` je platnost ZÁZNAMU, `clenstvi.vznikClenstvi`/`zanikClenstvi` je platnost ČLENSTVÍ. Přeregistrace vytvoří nový záznam, aniž by členství skončilo — kdo počítá záznamy, napočítá víc funkčních období, než jich bylo.
- **ARES — Administrativní registr ekonomických subjektů — „Nenastaveno" je prázdný objekt**: Sub-registr ROS zanořuje skaláry jako `%{"hodnota" => …}`, data jako `%{"datum" => …}` a pro nevyplněné pole vrací `{}`, ne `null`.
- **Registr smluv (ISRS) — Služba ignoruje tiše, a ne jednou**: Ověřeno 5. 8. 2026 na živé službě, čtyři různé případy: `format=json` vrátí HTTP 200 a HTML; vlastní parametr `page` vrátí znovu první stránku; `export=xml` i `export=csv` vrátí tutéž HTML stránku o 38 125 bajtech jako dotaz bez nich; a Nette signál `do=exportCsv` skončí 403. Ani jeden z nich nevrátí chybu. Klient, který výstup nekontroluje, dostane nulu výsledků nebo N-krát tentýž vzorek a nepozná to.
- **Registr smluv (ISRS) — Stránkování nepřežije holý GET**: Vyhledávání je formulářová aplikace na Nette. Stránkování jede přes signály `searchResultList-offset` / `searchResultList-limit` s `do=searchResultList-setOffset`, a ty potřebují kompletní sadu parametrů formuláře. Vlastní `&page=N` se **tiše ignoruje** a vrátí znovu první stránku — kdo si nehlídá duplicitu, stáhne tutéž stránku N-krát a vydá to za N-krát větší vzorek.
- **Registr smluv (ISRS) — Protistrana není publikující subjekt**: `party_idnum` hledá IČO protistrany (typicky dodavatele), `subject_idnum` IČO zveřejňujícího subjektu (typicky úřadu). Záměna vrátí prázdný výsledek u firmy, která ve skutečnosti stovky smluv má.
- **Registr smluv (ISRS) — Per-subjektový export neexistuje**: Výsledek dotazu nelze stáhnout jako data. Souhrn za jeden subjekt proto vyžaduje průchod hromadnými dávkami registru, ne vyhledávací formulář — a dokud neproběhne, je poctivější uvést počet, který registr sám hlásí, než dopočítanou částku.
- **Věstník veřejných zakázek (VVZ) — Vyhledávací endpoint TIŠE IGNORUJE nepodporované filtry**: Dotaz na zakázky jednoho zadavatele vrátí tutéž nefiltrovanou stránku jako dotaz bez filtru — a ta míchá zadavatele dohromady. Ověřeno proti živé službě. Filtr na dodavatele, zadavatele, CPV kód ani název tedy **nelze použít**: výsledek vypadá jako nález, ale je to náhodný výřez všeho. Fungují jen `data.evCisloZakazkyVvz`, `variableId`, `publicId` a `page`.
- **Věstník veřejných zakázek (VVZ) — Jedna zakázka není jeden záznam**: Číslo zakázky (`Z2022-009997`) pojmenovává několik formulářů, číslo formuláře (`F2022-015377`) jeden. Kdo z čísla zakázky vezme první formulář, zahodí zbytek historie, aniž by to bylo vidět.
- **Věstník veřejných zakázek (VVZ) — Starý věstník už neexistuje**: Doména `vestnikverejnychzakazek.cz` se nepřekládá. Kód, který na ni míří, hlásí poruchu navždy — a pokud má náhradní data, vydává za výsledek smyšlenku.
- **Sbírka listin veřejného rejstříku — Listiny jsou skeny, ne data**: Většina dokumentů je PDF sken bez textové vrstvy. Strojové čtení vyžaduje OCR a jeho výstup je nutné před citací ověřit okem.
- **Sbírka listin veřejného rejstříku — Osobní údaje v listinách**: Listiny běžně obsahují rodná čísla a adresy bydliště. Slouží k rozlišení osob při rešerši; do publikovaného dossieru se nepřebírají.
- **Katastr nemovitostí (ČÚZK) — Dálkový přístup k vlastníkům je placený a chráněný captchou**: Bezplatné nahlížení ukazuje parcelu, ne úplný list vlastnictví s osobními údaji. Neexistuje veřejné strojové rozhraní, které by vrátilo vlastníka podle jména.
- **Katastr nemovitostí (ČÚZK) — Vyhledávání podle osoby veřejně neexistuje**: Katastr neumožňuje veřejně zjistit „co všechno vlastní osoba X". Kdo takový výstup nabízí, čerpá z jiného, obvykle komerčního zdroje — a ten je nutné uvést místo katastru.
- **Hlídač státu — Webové API vyžaduje token**: Neautentizované volání vrací 404, ne 401 — vypadá to jako neexistující endpoint, ne jako chybějící oprávnění.
- **Hlídač státu — Shoda jména není shoda osoby**: Agregované profily spojují záznamy podle jména. U běžných jmen slučují víc osob dohromady; použij je jako stopu, ne jako doklad.
- **Podnikatel.cz — rejstříkové profily — Profil může mísit jmenovce**: Jediná stránka může nést role několika různých lidí téhož jména. Před převzetím role ji ověř v ARES podle IČO subjektu.
- **Podnikatel.cz — rejstříkové profily — Sdílí rodinu s ARES, takže ho nepotvrzuje**: V datasetu je tento agregátor i ARES veden pod touž rodinou `cz-verejny-rejstrik`, protože obojí čerpá z týchž veřejných rejstříků. Citace obou tedy NEJSOU dvě nezávislá doložení a tvrzení opřené o ně zůstává 1 ZDROJ, i když jde o dva různé vydavatele a dvě různé domény.
- **Informační systém datových schránek (ISDS) — Zpětné vyhledání neexistuje**: Veřejná služba, která by k IČO vrátila ID schránky, není k dispozici. Údaj o schránce se získává jako součást rejstříkového výpisu (ARES ROS), ne samostatným dotazem.
- **Informační systém datových schránek (ISDS) — Osmimístné ID schránky se plete s IČO**: Obojí je osmiznakový řetězec. Kdo rozlišuje regulárním výrazem podle délky, pošle IČO do větve pro ID schránky a zpět dostane nesmysl.
- **ČTK — Česká tisková kancelář — Přebírání vypadá jako shoda**: Právě kvůli tomuhle existuje pole `sourceFamily`. Bez něj se pět vydání téže zprávy počítá jako pět nezávislých redakcí a tvrzení dostane CORROBORATED, které si nezaslouží. Revize T-056 takto musela srazit 55 tvrzení zpět na 1 ZDROJ.
- **ČTK — Česká tisková kancelář — Kredit je jen v metadatech a patičce**: Zmínka „řekl ČTK" uprostřed textu je běžná i ve vlastním zpravodajství a původ nedokládá. Rozhoduje `<meta name="author">`, podpisový blok nebo patička „Zdroj: …".
- **Poslanecká sněmovna Parlamentu ČR — Volební období mění čísla**: Tisky a hlasování jsou číslovány v rámci volebního období. URL bez období vede po volbách na jiný dokument.
- **Poslanecká sněmovna Parlamentu ČR — Stenozáznam je autorizovaný přepis, ne přepis doslovný do písmene**: Řečník má právo úpravy. Pro citaci je použitelný, ale rozdíl proti audiu není chyba webu.
- **Vláda České republiky — Doména se změnila**: Starší odkazy míří na `vlada.cz`; kanonická doména je dnes `vlada.gov.cz`. Odkaz je nutné ověřit, ne mechanicky přepsat.
- **Vláda České republiky — Tisková zpráva není usnesení**: Usnesení má číslo a datum a je dohledatelné v databázi; tisková zpráva je jeho výklad. Tvrzení má citovat usnesení.
- **Seznam Zprávy — Byline rozhoduje o nezávislosti, ne logo**: Tentýž web vydává vlastní zpravodajství i přebrané agenturní zprávy. O tom, zda jde o nezávislé doložení, rozhoduje kredit u konkrétního článku, ne vydavatel. Bez ověřeného kreditu je verdikt `unknown` a rodina se nevyplní — `unknown` NENÍ „vlastní zpravodajství".
- **Deník N — Byline rozhoduje o nezávislosti, ne logo**: Tentýž web vydává vlastní zpravodajství i přebrané agenturní zprávy. O tom, zda jde o nezávislé doložení, rozhoduje kredit u konkrétního článku, ne vydavatel. Bez ověřeného kreditu je verdikt `unknown` a rodina se nevyplní — `unknown` NENÍ „vlastní zpravodajství".
- **Deník N — Paywall brání ověření kreditu**: Detektor rodin skončí na uzavřeném textu verdiktem `unknown`. To není důvod rodinu odhadnout; je to důvod ji nevyplnit a tvrzení nepovyšovat.
- **iROZHLAS / Český rozhlas — Byline rozhoduje o nezávislosti, ne logo**: Tentýž web vydává vlastní zpravodajství i přebrané agenturní zprávy. O tom, zda jde o nezávislé doložení, rozhoduje kredit u konkrétního článku, ne vydavatel. Bez ověřeného kreditu je verdikt `unknown` a rodina se nevyplní — `unknown` NENÍ „vlastní zpravodajství".
- **Česká televize / ČT24 — Byline rozhoduje o nezávislosti, ne logo**: Tentýž web vydává vlastní zpravodajství i přebrané agenturní zprávy. O tom, zda jde o nezávislé doložení, rozhoduje kredit u konkrétního článku, ne vydavatel. Bez ověřeného kreditu je verdikt `unknown` a rodina se nevyplní — `unknown` NENÍ „vlastní zpravodajství".
- **Česká televize / ČT24 — Text k reportáži není reportáž**: Doprovodný článek bývá zkrácením odvysílaného. Cituje-li se výrok, musí být zřejmé, zda pochází z textu, nebo z vysílání.

## Skutečně použité zdroje v datasetu

Dopočítáno z `data/dossiers/**/sources/**`, 640 záznamů v 102 rodinách/outletech.

| Rodina / outlet | Záznamů | Dossierů | Popsaný v katalogu |
|---|---:|---:|---|
| ctk | 290 | 21 | [ano](/zdroje/ctk/) |
| seznam-zpravy | 34 | 13 | [ano](/zdroje/seznam-zpravy/) |
| Vláda České republiky (vlada.gov.cz) | 23 | 17 | [ano](/zdroje/vlada-cz/) |
| Poslanecká sněmovna Parlamentu ČR | 21 | 15 | [ano](/zdroje/psp-cz/) |
| FORUM 24 | 19 | 9 | — |
| denik-n | 16 | 9 | [ano](/zdroje/denik-n/) |
| ČT24 (Česká televize) | 15 | 7 | [ano](/zdroje/ceska-televize/) |
| Echo24 | 13 | 9 | — |
| denik-cz | 11 | 6 | — |
| Aktuálně.cz | 11 | 6 | — |
| Česká justice | 11 | 6 | — |
| Ekonomický deník | 9 | 5 | — |
| Novinky.cz | 9 | 8 | — |
| hlidac-statu | 8 | 3 | [ano](/zdroje/hlidac-statu/) |
| irozhlas | 8 | 6 | [ano](/zdroje/irozhlas/) |
| Blesk.cz | 5 | 3 | — |
| e15.cz | 4 | 2 | — |
| HlídacíPes.org | 4 | 4 | — |
| Hospodářské noviny | 4 | 3 | — |
| Ministerstvo dopravy ČR | 4 | 1 | — |
| Reflex | 4 | 4 | — |
| Respekt | 4 | 3 | — |
| Zdravé zprávy | 4 | 2 | — |
| CNN Prima News | 3 | 3 | — |
| Investigace.cz | 3 | 3 | — |
| Ministerstvo financí ČR | 3 | 1 | — |
| Ministerstvo školství, mládeže a tělovýchovy ČR | 3 | 1 | — |
| Ministerstvo zemědělství ČR | 3 | 1 | — |
| Národní rozpočtová rada | 3 | 1 | — |
| Tiscali.cz | 3 | 3 | — |
| Transparency International ČR | 3 | 2 | — |
| Úřad pro ochranu osobních údajů | 3 | 1 | — |
| cz-verejny-rejstrik | 2 | 1 | [ano](/zdroje/ares/) |
| ARES — Administrativní registr ekonomických subjektů (Ministerstvo financí ČR) | 2 | 2 | [ano](/zdroje/ares/) |
| CZDEFENCE | 2 | 1 | — |
| Fakultní nemocnice Olomouc (oficiální web) | 2 | 1 | — |
| Médiář | 2 | 1 | — |
| Ministerstvo průmyslu a obchodu (MPO) | 2 | 2 | — |
| Ministerstvo životního prostředí ČR | 2 | 1 | — |
| NašeTéma.cz | 2 | 2 | — |
| Nejvyšší kontrolní úřad (nku.cz) | 2 | 1 | — |
| Olomoucký deník | 2 | 1 | — |
| Pražský deník | 2 | 1 | — |
| Ústavní soud ČR | 2 | 2 | — |
| idnes-dividenda-2026-07 | 1 | 1 | — |
| ACRI — Asociace podniků českého železničního průmyslu | 1 | 1 | — |
| Agrofert (agrofert.cz) | 1 | 1 | — |
| AutoRevue.cz | 1 | 1 | — |
| Centrum veřejných financí (Univerzita Karlova) | 1 | 1 | — |
| Česká infrastruktura | 1 | 1 | — |
| Česká obchodní inspekce | 1 | 1 | — |
| Česká školní inspekce | 1 | 1 | — |
| ČKAIT (Česká komora autorizovaných inženýrů a techniků) | 1 | 1 | — |
| CNCB / BRKI a NRKI | 1 | 1 | — |
| Demagog.cz | 1 | 1 | — |
| Deník Alarm | 1 | 1 | — |
| Deník Referendum | 1 | 1 | — |
| Deník VEKTOR | 1 | 1 | — |
| Dopravní noviny | 1 | 1 | — |
| e-Sbírka (Ministerstvo vnitra ČR) | 1 | 1 | — |
| EDUin | 1 | 1 | — |
| Ekonews | 1 | 1 | — |
| Ekonom | 1 | 1 | — |
| EV Magazín | 1 | 1 | — |
| Evropský parlament | 1 | 1 | — |
| Extra.cz | 1 | 1 | — |
| Finmag.cz — přepis obchodního rejstříku | 1 | 1 | — |
| Hanácká Drbna | 1 | 1 | — |
| Heroine.cz | 1 | 1 | — |
| Info.cz | 1 | 1 | — |
| iportal24.cz | 1 | 1 | — |
| Jezdci.cz | 1 | 1 | — |
| Kurzy.cz | 1 | 1 | — |
| Lupa.cz | 1 | 1 | — |
| Manipulátoři.cz | 1 | 1 | — |
| MHD86 | 1 | 1 | — |
| Ministerstvo spravedlnosti ČR | 1 | 1 | — |
| Motoristé sobě (motoristesobe.cz/udhpsh) | 1 | 1 | — |
| Nejvyšší správní soud | 1 | 1 | — |
| Neovlivní.cz | 1 | 1 | — |
| Novinky.cz / Právo | 1 | 1 | — |
| ParlamentníListy.cz | 1 | 1 | — |
| Podnikatel.cz | 1 | 1 | [ano](/zdroje/podnikatel-cz-rejstrik/) |
| Podpůrný a garanční rolnický a lesnický fond (PGRLF) | 1 | 1 | — |
| Průmyslová automatizace | 1 | 1 | — |
| RAILTARGET | 1 | 1 | — |
| Refresher.cz | 1 | 1 | — |
| Romea.cz | 1 | 1 | — |
| Security magazín | 1 | 1 | — |
| silnice-zeleznice.cz | 1 | 1 | — |
| Společnost pro obranu svobody projevu | 1 | 1 | — |
| Taneční aktuality | 1 | 1 | — |
| TN.cz (TV Nova) | 1 | 1 | — |
| Transport a logistika | 1 | 1 | — |
| Transport Minutes | 1 | 1 | — |
| Uměleckohistorická společnost (UHS) | 1 | 1 | — |
| Úřad evropského veřejného žalobce (EPPO) | 1 | 1 | — |
| Vrchní soud v Praze | 1 | 1 | — |
| YouControl | 1 | 1 | — |
| Zdopravy.cz | 1 | 1 | — |
| Život v Česku | 1 | 1 | — |
| smlouvy-gov-cz | 1 | 1 | [ano](/zdroje/registr-smluv/) |

## Chybí popis

Tyhle zdroje dataset používá aspoň pětkrát, ale katalog k nim nemá záznam s mezemi a pastmi:

- FORUM 24 (19×)
- Echo24 (13×)
- denik-cz (11×)
- Aktuálně.cz (11×)
- Česká justice (11×)
- Ekonomický deník (9×)
- Novinky.cz (9×)
- Blesk.cz (5×)

