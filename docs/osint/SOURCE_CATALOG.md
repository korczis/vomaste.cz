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
| [ÚDHPSH — Úřad pro dohled nad hospodařením politických stran a politických hnutí](/zdroje/udhpsh/) | primární registr | veřejně dostupný | https://zpravy.udh.gov.cz/ |
| [ČTK — Česká tisková kancelář](/zdroje/ctk/) | média | omezený přístup | https://www.ctk.cz/ |
| [Poslanecká sněmovna Parlamentu ČR](/zdroje/psp-cz/) | primární listina | veřejně dostupný | https://www.psp.cz/ |
| [Vláda České republiky](/zdroje/vlada-cz/) | primární listina | veřejně dostupný | https://vlada.gov.cz/ |
| [Seznam Zprávy](/zdroje/seznam-zpravy/) | média | veřejně dostupný | https://www.seznamzpravy.cz/ |
| [Deník N](/zdroje/denik-n/) | média | veřejně dostupný | https://denikn.cz/ |
| [iROZHLAS / Český rozhlas](/zdroje/irozhlas/) | média | veřejně dostupný | https://www.irozhlas.cz/ |
| [Česká televize / ČT24](/zdroje/ceska-televize/) | média | veřejně dostupný | https://ct24.ceskatelevize.cz/ |
| [Novinky.cz](/zdroje/novinky-cz/) | média | veřejně dostupný | https://www.novinky.cz/ |
| [Aktuálně.cz](/zdroje/aktualne-cz/) | média | veřejně dostupný | https://www.aktualne.cz/ |
| [FORUM 24](/zdroje/forum24/) | média | veřejně dostupný | https://www.forum24.cz/ |
| [Echo24](/zdroje/echo24/) | média | veřejně dostupný | https://www.echo24.cz/ |
| [Deník.cz](/zdroje/denik-cz/) | média | veřejně dostupný | https://www.denik.cz/ |
| [Česká justice](/zdroje/ceska-justice/) | média | veřejně dostupný | https://www.ceska-justice.cz/ |
| [Ekonomický deník](/zdroje/ekonomicky-denik/) | média | veřejně dostupný | https://ekonomickydenik.cz/ |
| [Blesk.cz](/zdroje/blesk-cz/) | média | veřejně dostupný | https://www.blesk.cz/ |

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
- **ÚDHPSH — Úřad pro dohled nad hospodařením politických stran a politických hnutí — „Úplná" není „zkontrolovaná"**: Přehled zpráv uvádí u každého subjektu řádek „výsledek kontroly: zpráva je úplná *". Slovo „kontrola" je v označení řádku, ale hvězdička odkazuje na vysvětlivku Úřadu na téže stránce: „Výroční finanční zpráva je dle zákona úplná, obsahuje-li všechny požadované náležitosti a je-li předložena na předepsaném formuláři s přílohami. **Nejedná se o výsledek kontroly správnosti údajů.**" Přečteno obráceně by z formální kompletnosti vzniklo doložení věcné správnosti, které úřad výslovně odmítá. Doloženo v `richard-chlad/SRC-07`.
- **ÚDHPSH — Úřad pro dohled nad hospodařením politických stran a politických hnutí — Hlídač státu registr reprodukuje, nepotvrzuje ho**: Profil sponzoringu na Hlídači státu přebírá položky z výroční finanční zprávy včetně jejich vlastního znění („propůjčení vozů Bugatti na akci", „výroba a instalace Billboardu, pronájem rekl.plochy"). Registr a jeho zrcadlo proto nejsou dva nezávislé hlasy — právě proto nese `richard-chlad/SRC-01` rodinu `udhpsh`, přestože jeho outlet je Hlídač státu. Navíc agregátor zobrazuje obě kategorie pod nadpisem „Přehled jednotlivých darů", zatímco zpráva tytéž položky vede jako bezúplatná plnění. Citovat se má registr, ne zrcadlo.
- **ÚDHPSH — Úřad pro dohled nad hospodařením politických stran a politických hnutí — Jmenovci se liší jen ročníkem narození**: Ve zprávě za rok 2024 jsou u hnutí Motoristé sobě vedeny dva peněžité dary po 50 000 Kč od dárce „Chlad, Richard 27.05.1992", zatímco pětice bezúplatných plnění ve zprávě za rok 2025 patří Ing. Richardu Chladovi s ročníkem 1962. Bez porovnání data narození by se dvě různé osoby slily do jedné a součet by vznikl napříč nimi. Doloženo v `richard-chlad/SRC-06`.
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
- **Novinky.cz — V podpisu stojí instituce vedle lidí**: JSON-LD pole `author` nese jak jmenovité redaktory (`Karolina Brodníčková` u `igor-cerveny/SRC-24`), tak institucionální „autory" s vlastním rozcestníkem: `Novinky` (`/autor/novinky-302`), `Právo` (`/autor/pravo-303`, tedy přetisk tištěného deníku vydavatele Borgis — `james-quick/SRC-17`) a `ČTK` (`/autor/ctk-304`, u `andrej-babis/SRC-61` uvedená hned vedle „autora" `Novinky`). Podpis tedy sám o sobě neříká, že text je vlastní práce Novinek — říká jen, ke které značce je připsán.
- **Novinky.cz — Přebírka bývá přiznaná až v těle textu**: U `zuzana-mrazova/SRC-28` je v podpisu jmenovaný redaktor, ale článek uvnitř výslovně uvádí, že reprodukuje „zjištění serveru Seznam Zprávy". Rodina `seznam-zpravy` sem proto byla doplněna ručně (oprava z 3. 8. 2026); `detect-source-family.mjs` ji najít nemohl, protože tělo článku záměrně nečte — zmínka uprostřed textu je běžná i ve vlastním zpravodajství. U textu, který se opírá o cizí investigaci, tedy nestačí přečíst podpis.
- **Novinky.cz — Fotokredity vypadají jako autoři**: Stránka nese desítky dalších výskytů klíče `author` pocházejících z fotografických kreditů (`Petr Horník`, `Michal Šula`, `archiv autora`). Strojové čtení, které bere první nebo libovolnou shodu, dostane fotografa místo autora textu. Rozhoduje `author` v JSON-LD uzlu článku, ne kdekoli na stránce.
- **Aktuálně.cz — Rubrika je zapsaná jako autor**: JSON-LD u `andrej-babis/SRC-50` uvádí `"author":[{"@type":"Person","name":"Domácí"},{"@type":"Person","name":"ČTK"}]` — název rubriky je označen jako osoba a stojí v podpisu **před** agenturním kreditem. Čtení, které vezme první autora, dostane „Domácí" a text vyhodnotí jako vlastní zpravodajství. Rozhoduje celý seznam autorů, ne jeho první položka; pro srovnání `macinka-turek/SRC-36` nese jediného autora `Viet Tran`.
- **Aktuálně.cz — Názorová subdoména je týž vydavatel**: Komentáře vycházejí na `nazory.aktualne.cz` a zpravodajství na `zpravy.aktualne.cz` (viz `adam-vojtech/SRC-39` proti `adam-vojtech/SRC-06`). Registrovaná doména je v obou případech `aktualne.cz`, takže pravidlo S10 je správně spojí do jednoho hlasu — ale odlišná adresa i odlišný žánr svádí k tomu vést je jako dva zdroje. Komentář navíc není zjištění, i kdyby vydavatel byl jiný.
- **FORUM 24 — ČTK je v podpisu vedena jako osoba**: U přebraných zpráv obsahuje JSON-LD `"author":[{"@type":"Person","name":"ČTK","url":"https://www.forum24.cz/autor/ctk"}]` — agentura má vlastní autorský rozcestník a v podpisu vypadá přesně jako jmenovaný redaktor (`karel-havlicek/SRC-02`). Vedle toho stojí texty s běžným autorem (`Jiří Sezemský` u `karel-havlicek/SRC-04`, `Adam Opatrný` u `zuzana-mrazova/SRC-10`) ve zcela stejném tvaru. Rozdíl je jen ve jméně, ne ve struktuře — kdo kontroluje jen přítomnost autora, přebírku nepozná.
- **FORUM 24 — Týž vydavatel dvakrát vypadal jako dvě potvrzení**: U `karel-havlicek/CLM-05` stojí vedle sebe `SRC-02` (rodina `ctk`) a `SRC-04` (bez rodiny) — oba FORUM 24. Než platilo pravidlo S10, počítaly se jako dvě nezávislé redakce právě proto, že jeden z nich měl vyplněnou rodinu a druhý spadl na fallback přes outlet. Jedna redakce ale nepotvrzuje sama sebe; tvrzení proto zůstává na stavu „1 ZDROJ". Totéž je vidět u `zuzana-mrazova/CLM-12` a `ales-juchelka/CLM-22`, kde druhý nezávislý hlas přinášejí až jiní vydavatelé.
- **Echo24 — Agenturní kredit není ve strojových metadatech**: U `adam-vojtech/SRC-11` obsahuje podpisový blok dva odkazy vedle sebe — `<a rel="author" href="/author/dominik-stein">Dominik Stein</a>` a `<a rel="author" href="/author/ctk">čtk</a>` — ale `<meta name="author">` nese jen prvního z nich, tedy `Dominik Stein`. Kdo se opře o strojová metadata, dostane text jako vlastní zpravodajství; společné autorství s agenturou je vidět jen v podpisovém bloku. Proto je verdikt u takových textů opřený o odkaz na rozcestník `/author/ctk` a nese nižší jistotu.
- **Echo24 — Redakční zkratka není jmenovitý autor**: `adam-vojtech/SRC-12` je podepsán `jkr` — redakční zkratkou, ne jménem ani agenturní značkou. Takový podpis nedokládá vlastní zpravodajství o nic víc než chybějící podpis; je to `unknown`, ne `own`. Zkratky (`jkr`, `red`, `jas`) proto nesmí sloužit jako důkaz samostatného hlasu.
- **Echo24 — Patička webu odkazuje na ČTK vždy**: V patičce každé stránky stojí „Copyright © Echo Media, a.s. © ČTK". To je licenční doložka celého webu, ne kredit článku — pro určení původu je bezcenná a nesmí se zaměnit s patičkou „Zdroj: …" pod konkrétním textem.
- **Echo24 — Přebírá se i mimo agenturu**: `andrej-babis/SRC-15` nese rodinu `idnes-dividenda-2026-07`, tedy převzetí zjištění jiné redakce. Kontrola zaměřená jen na ČTK by ho vyhodnotila jako vlastní zpravodajství a tvrzení by dostalo nezávislé doložení, které nemá.
- **Deník.cz — Agentura je podepsaná jako redaktor**: U přebraných zpráv nese JSON-LD `"author": [{"@type":"Person","name":"ČTK","url":"https://www.denik.cz/autori/ctk/"}]` — agentura má vlastní autorský profil ve stejném tvaru jako lidé. Vlastní text má navíc `jobTitle: "Redaktor"` (`Jiří Janda` u `robert-plaga/SRC-10`), agenturní zápis ne. Rozdíl mezi `robert-plaga/SRC-09` a `SRC-10` je jen ve jméně v podpisu; podle vzhledu stránky se nepozná.
- **Deník.cz — Krajské mutace vypadají jako různí vydavatelé**: V datech se týž vydavatel vyskytuje pod třemi názvy — „Deník.cz (VLTAVA LABE MEDIA)", „Kolínský deník (Deník.cz)" a „Ústecký deník (Deník.cz)". Pravidlo S10 je spojí přes registrovanou doménu `denik.cz` (subdomény typu `prazsky.denik.cz` se skládají do ní), takže dvě mutace nikdy nedají korroboraci. Bez toho by regionální přetisk téže agenturní zprávy vypadal jako druhá redakce.
- **Deník.cz — Dva zdejší texty vedle sebe nestačí**: `robert-plaga/CLM-16` cituje `SRC-09` (rodina `ctk`) i `SRC-10` (rodina `denik-cz`) — dva různé texty, dvě různé rodiny, jeden vydavatel. Stav CORROBORATED tomu tvrzení náleží až díky třetímu zdroji, kterým je oznámení Ministerstva školství (`SRC-11`). Bez něj by šlo o jeden hlas se dvěma URL.
- **Česká justice — První `<meta name="author">` je vydavatel, ne autor**: Stránka nese dvě značky `<meta name="author">` v tomto pořadí: `Media Networks` (vydavatelský systém) a teprve pak skutečného autora — `ČTK` u `andrej-babis/SRC-01`, `Alžběta Vejvodová` u `karel-havlicek/SRC-07`. Čtení, které vezme první shodu, dostane u každého článku totéž jméno a původ nikdy nerozliší. Rozhoduje druhá značka, respektive JSON-LD uzel `author`.
- **Česká justice — Tři domény, jeden vydavatel**: Patička webu uvádí doslova: „Vydavatelem zpravodajských portálů Ekonomický deník, Zdravotnický deník a Česká justice je Media Network s.r.o." Pravidlo S10 porovnává outlet a registrovanou doménu, takže `ceska-justice.cz`, `ekonomickydenik.cz` a `zdravotnickydenik.cz` mu projdou jako tři nezávislí vydavatelé, přestože jsou jeden. Tvrzení opřené o dva z těchto portálů proto není potvrzené dvěma redakcemi a musí se posoudit ručně.
- **Česká justice — Odborný web nese agenturní texty**: Patička uvádí, že „Portál Česká justice využívá zpravodajství ČTK". V datasetu má většina záznamů z tohoto vydavatele rodinu `ctk` — u `andrej-babis/SRC-01` je kredit `<meta name="author" content="ČTK" />`, u dalších jen odkaz na autorský rozcestník `/author/ctk/`. Odbornost webu tedy neznamená, že text vznikl v jeho redakci.
- **Ekonomický deník — První `<meta name="author">` je vydavatel, ne autor**: Stránka nese dvě značky `<meta name="author">`: nejprve `Media Networks` (vydavatelský systém), teprve pak skutečného autora — `Jana Bartošová` u `ivan-bednarik/SRC-02`, `Tereza Čapková` u `karel-havlicek/SRC-10`. Čtení první shody dostane u každého článku totéž jméno. Rozhoduje druhá značka nebo JSON-LD uzel `author`. Web sdílí tuto vlastnost s Českou justicí, protože jde o tentýž redakční systém.
- **Ekonomický deník — Tři domény, jeden vydavatel**: Patička webu uvádí doslova: „Vydavatelem zpravodajských portálů Ekonomický deník, Zdravotnický deník a Česká justice je Media Network s.r.o." Pravidlo S10 porovnává outlet a registrovanou doménu, takže tyto tři portály mu projdou jako tři nezávislí vydavatelé. Tvrzení opřené o dva z nich není potvrzené dvěma redakcemi.
- **Ekonomický deník — Odborný web nese agenturní texty**: Patička uvádí, že „Portál Ekonomický deník využívá zpravodajství ČTK", a část záznamů z tohoto vydavatele má v datasetu rodinu `ctk`. Zaměření na hospodářství tedy nedokládá, že text vznikl v jeho redakci.
- **Blesk.cz — První `<meta name="author">` je vydavatel**: Stránka nese dvě značky `<meta name="author">`: nejprve `CZECH NEWS CENTER a. s.`, teprve pak skutečný podpis — `ČTK` u `igor-cerveny/SRC-02`, `Tomáš Belica,Magdalena Škapová` u `boris-stastny/SRC-08`. Rozhoduje druhá značka, respektive `article:author`. Kredit bývá i smíšený (`ČTK,Jaroslav Šimáček`, `Magdalena Škapová,ČTK`) — jedno jméno v podpisu tedy nevylučuje agenturní původ.
- **Blesk.cz — JSON-LD označuje za autora sám web**: I u textu, jehož metadata uvádějí autora `ČTK`, obsahuje JSON-LD uzel `"author":{"@type":"NewsMediaOrganization","name":"BLESK.cz"}`. Kdo čte jen JSON-LD, dostane vydavatele a agenturní původ mu unikne. Patička článku přitom rozdíl přiznává: „Zdroj: ČTK / Blesk Zprávy" u přebírky proti „Zdroj: Vera Renovica/Blesk" u vlastního textu.
- **Blesk.cz — Formát není důvod zdroj vyřadit ani povýšit**: Dossiery vedou tento zdroj jako **tabloid** — je to typ zdroje, ne hodnocení. Doslovná citace úředního vyjádření z něj má tutéž důkazní hodnotu jako odjinud (`macinka-turek/SRC-19`, stanovisko policejní mluvčí). Zároveň se ale nepočítá jako další redakční potvrzení téže kvality jako vlastní zpravodajství jiné redakce (`macinka-turek/SRC-04`). Past je v obou směrech: vyřadit ho kvůli formátu, nebo ho započítat jako plnohodnotné druhé ověření.

## Skutečně použité zdroje v datasetu

Dopočítáno z `data/dossiers/**/sources/**`, 685 záznamů v 115 rodinách/outletech.

| Rodina / outlet | Záznamů | Dossierů | Popsaný v katalogu |
|---|---:|---:|---|
| ctk | 290 | 21 | [ano](/zdroje/ctk/) |
| seznam-zpravy | 38 | 13 | [ano](/zdroje/seznam-zpravy/) |
| Poslanecká sněmovna Parlamentu ČR | 32 | 15 | [ano](/zdroje/psp-cz/) |
| Vláda České republiky (vlada.gov.cz) | 28 | 17 | [ano](/zdroje/vlada-cz/) |
| FORUM 24 | 19 | 9 | [ano](/zdroje/forum24/) |
| denik-n | 16 | 9 | [ano](/zdroje/denik-n/) |
| ČT24 (Česká televize) | 14 | 7 | [ano](/zdroje/ceska-televize/) |
| Echo24 | 13 | 9 | [ano](/zdroje/echo24/) |
| denik-cz | 11 | 6 | [ano](/zdroje/denik-cz/) |
| Aktuálně.cz | 11 | 6 | [ano](/zdroje/aktualne-cz/) |
| Česká justice | 11 | 6 | [ano](/zdroje/ceska-justice/) |
| Ekonomický deník | 9 | 5 | [ano](/zdroje/ekonomicky-denik/) |
| Novinky.cz | 9 | 8 | [ano](/zdroje/novinky-cz/) |
| irozhlas | 8 | 6 | [ano](/zdroje/irozhlas/) |
| hlidac-statu | 7 | 2 | [ano](/zdroje/hlidac-statu/) |
| udhpsh | 6 | 1 | [ano](/zdroje/udhpsh/) |
| Blesk.cz | 5 | 3 | [ano](/zdroje/blesk-cz/) |
| Zdravé zprávy | 5 | 2 | — |
| e15.cz | 4 | 2 | — |
| HlídacíPes.org | 4 | 4 | — |
| Hospodářské noviny | 4 | 3 | — |
| Ministerstvo dopravy ČR | 4 | 1 | — |
| Reflex | 4 | 4 | — |
| Respekt | 4 | 3 | — |
| Státní zemědělský intervenční fond | 4 | 1 | — |
| CNN Prima News | 3 | 3 | — |
| Investigace.cz | 3 | 3 | — |
| Ministerstvo financí ČR | 3 | 1 | — |
| Ministerstvo školství, mládeže a tělovýchovy ČR | 3 | 1 | — |
| Ministerstvo zemědělství ČR | 3 | 1 | — |
| Národní rozpočtová rada | 3 | 1 | — |
| Nejvyšší kontrolní úřad (nku.cz) | 3 | 2 | — |
| Tiscali.cz | 3 | 3 | — |
| Transparency International ČR | 3 | 2 | — |
| Úřad pro ochranu osobních údajů | 3 | 1 | — |
| cz-verejny-rejstrik | 2 | 1 | [ano](/zdroje/ares/) |
| ARES — Administrativní registr ekonomických subjektů (Ministerstvo financí ČR) | 2 | 2 | [ano](/zdroje/ares/) |
| CZDEFENCE | 2 | 1 | — |
| Fakultní nemocnice Olomouc (oficiální web) | 2 | 1 | — |
| Médiář | 2 | 1 | — |
| Ministerstvo průmyslu a obchodu (MPO) | 2 | 2 | — |
| Ministerstvo spravedlnosti ČR | 2 | 1 | — |
| Ministerstvo životního prostředí ČR | 2 | 1 | — |
| NašeTéma.cz | 2 | 2 | — |
| Nejvyšší správní soud | 2 | 2 | — |
| Olomoucký deník | 2 | 1 | — |
| Pražský deník | 2 | 1 | — |
| Registr lobbování (RELOB) | 2 | 1 | — |
| Ústavní soud ČR | 2 | 2 | — |
| Vrchní státní zastupitelství v Olomouci | 2 | 1 | — |
| ct24 | 1 | 1 | [ano](/zdroje/ceska-televize/) |
| eppo | 1 | 1 | — |
| idnes-dividenda-2026-07 | 1 | 1 | [ano](/zdroje/echo24/) |
| nssoud | 1 | 1 | — |
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
| Město Bílina (oficiální web) | 1 | 1 | — |
| MHD86 | 1 | 1 | — |
| Ministerstvo zdravotnictví ČR | 1 | 1 | — |
| Motoristé sobě (motoristesobe.cz/udhpsh) | 1 | 1 | — |
| Neovlivní.cz | 1 | 1 | — |
| Novinky.cz / Právo | 1 | 1 | [ano](/zdroje/novinky-cz/) |
| ParlamentníListy.cz | 1 | 1 | — |
| Podnikatel.cz | 1 | 1 | [ano](/zdroje/podnikatel-cz-rejstrik/) |
| Podpůrný a garanční rolnický a lesnický fond (PGRLF) | 1 | 1 | — |
| Policie České republiky — Krajské ředitelství policie Olomouckého kraje | 1 | 1 | — |
| Průmyslová automatizace | 1 | 1 | — |
| RAILTARGET | 1 | 1 | — |
| Refresher.cz | 1 | 1 | — |
| Romea.cz | 1 | 1 | — |
| Security magazín | 1 | 1 | — |
| Senát Parlamentu České republiky | 1 | 1 | — |
| Seznam Zprávy | 1 | 1 | [ano](/zdroje/seznam-zpravy/) |
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
| usoud | 1 | 1 | — |

## Chybí popis

Tyhle zdroje dataset používá aspoň pětkrát, ale katalog k nim nemá záznam s mezemi a pastmi:

- Zdravé zprávy (5×)

