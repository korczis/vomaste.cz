# Claim-by-claim deepening TODO

Generated 2026-07-31. Jeden úkol na každé ze **813** tvrzení (`CLM-##`) fyzicky existujících napříč `content/dossiers/*/claims/`, seskupeno podle dossieru. Cíl: postupně dovést každé tvrzení, zdroj a dossier na plný rozsah toho, co dokládá už publikovaná zpravodajská a rejstříková reportáž — s pomocí OSINT/due-diligence funkcí `~/dev/prismatic-platform` jako **externího** nástroje (samostatná Elixir/OTP aplikace, žádný import kódu ani závislosti do tohoto repozitáře).

## Guardrail (stejný jako `PRISMATIC_SOURCING_TODO.md` — platí i tady, čti první)

- Každá položka smí sloužit **jen** k dohledání dalšího, nezávislého zdroje pro tvrzení, které je **už autorizované** (viz `AGENTS.md`, append-only log) — nikdy k otevření nového tématu, subjektu nebo jmenované třetí osoby nad rámec toho, co autorizace uvádí.
- Cokoliv, co nástroj najde mimo autorizovaný rozsah, je **kandidát pro vlastníka webu** k samostatnému on-record rozhodnutí — nikdy důvod to rovnou zapsat do dossieru.
- Dohledaný zdroj se **musí otevřít a přečíst přímo** před citací — strukturovaný výstup nástroje sám o sobě není citovatelný zdroj.
- Per-dossier příkazy (`mix investigate.person`, `mix prismatic.osint.*`, `mix dd.seed.*`) a jejich výjimky (např. Schillerová/Chlad — firemní vazby mimo scope) jsou v [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md) — tento soubor je nerozbíjí do jednotky per-claim, jen na ně odkazuje.
- Po každé změně stavu tvrzení (1 ZDROJ → CORROBORATED apod.) přes `dossier-entry` skill (scaffold + validace), nikdy ruční úpravou front matteru bez regenerace/`npm run build`.

## Souhrn podle stavu (výchozí akce, viz per-claim řádky níž)

| stav | počet | výchozí akce |
|---|---|---|
| 1 ZDROJ | 373 | najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním |
| CORROBORATED | 235 | již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet |
| CITACE | 204 | přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný |
| SPORNÉ | 1 | otevřené/sporné — sledovat vývoj, dohledat rozhodnutí/výsledek |

## Adam Vojtěch — `adam-vojtech` (50 tvrzení)

Per-dossier prismatic nástroje a výjimky: viz [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md#per-dossier-kroky).

- [ ] **CLM-01** (1 ZDROJ, zdroje: SRC-01, subjekty: vojtech): Adam Vojtěch je podle oficiálního seznamu členů vlády na webu Úřadu vlády ministrem zdravotnictví
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-02** (CORROBORATED, zdroje: SRC-02, SRC-03, subjekty: vojtech): Ministerstvo zdravotnictví podalo 17. března 2026 trestní oznámení Vrchnímu státnímu zastupitelství v Olomouci kvůli implantacím kardioverterů-defibrilátorů (ICD) na I. interní klinice — kardiologické Fakultní nemocnice Olomouc.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-03** (CORROBORATED, zdroje: SRC-02, SRC-03, SRC-06, subjekty: vojtech): Trestní oznámení míří na postupy Fakultní nemocnice Olomouc, respektive na zaměstnance její kardiologické kliniky (bez jmenovitého označení osob) — nikoli na ministra Vojtěcha osobně; ministr, resp. jeho resort, je stranou, která oznámení podala.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-04** (CORROBORATED, zdroje: SRC-02, SRC-03, subjekty: vojtech): Podstatou podezření je možné systémové obcházení indikačních kritérií při implantacích ICD, účelové úpravy zdravotnické dokumentace a nestandardní postupy při realizaci klinických studií.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-05** (CITACE, zdroje: SRC-02, SRC-03, subjekty: vojtech): Ministr Vojtěch k podání trestního oznámení uvedl: „Zjištění, která máme aktuálně k dispozici, jsou natolik závažná, že odůvodňují neprodlené prověření orgány činnými v trestním řízení.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-06** (CORROBORATED, zdroje: SRC-03, SRC-04, subjekty: vojtech): Policie v kauze prověřuje podezření z podvodu a těžkého ublížení na zdraví; prověřování se týká několika stovek pacientů a implantací provedených v období od roku 2015 do února 2025.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-07** (1 ZDROJ, zdroje: SRC-04, subjekty: vojtech): FN Olomouc se účastnila mezinárodní klinické studie PROFID EHRA, kterou opustila v únoru 2025; policie podle nemocnice prověřuje možné nesrovnalosti mezi zdravotnickou dokumentací pacientů a výsledky hlášenými zadavateli studie.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-08** (1 ZDROJ, zdroje: SRC-04, subjekty: vojtech): V únoru 2026 ministr Vojtěch uložil FN Olomouc zřídit informační linku pro pacienty s implantovanými defibrilátory a vyžádal si komplexní zprávu s časovou osou a stavem interní revize; řešení personální odpovědnosti odložil na později.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-09** (1 ZDROJ, zdroje: SRC-02, subjekty: vojtech): Podle zpravodajství Seznam Zpráv ministr Vojtěch ještě v únoru 2026 neviděl důvod k odvolání dlouholetého ředitele FN Olomouc Romana Havlíka a premiér Babiš tehdy ředitele veřejně podpořil; trestní oznámení resort podal až v polovině března.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-10** (CITACE, zdroje: SRC-05, subjekty: vojtech): Radek Kedroň v komentáři Seznam Zpráv (22. 3. 2026) ministrovi vytkl, že kolem kauzy dlouho „jen opatrně přešlapoval“, přehlédl varovné signály medializované už v prosinci a veřejně bránil vedení nemocnice („Stačilo číst noviny, pane ministre“). Jde o názorový text, hodnocení je autorovo.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-11** (1 ZDROJ, zdroje: SRC-07, subjekty: vojtech): Odborná komise (vzniklá z iniciativy FN Olomouc, vedená odborníkem pověřeným ministerstvem zdravotnictví) v předběžném stanovisku z července 2026 konstatovala, že v roce 2024 byly některým pacientům implantovány ICD, aniž byla zcela naplněna indikační kritéria.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-12** (1 ZDROJ, zdroje: SRC-06, subjekty: vojtech): Aktuálně.cz popsalo případ pacienta, jemuž byl ve FN Olomouc implantován defibrilátor, přestože byl téhož dne převezen do hospicu; citovaný zdravotník uvedl: „Lékaři věděli, že umírá a defibrilátor nepotřebuje, přesto mu ho voperovali.“
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-13** (1 ZDROJ, zdroje: SRC-08, subjekty: vojtech): Ministr Vojtěch navrhuje daňové zvýhodnění vybraných zdravotních benefitů hrazených zaměstnavateli — zrušení ročního limitu 50 000 Kč pro daňové osvobození u vybraných preventivních programů (screening onkologických, kardiovaskulárních onemocnění a diabetu, dobrovolné očkování).
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-14** (CORROBORATED, zdroje: SRC-08, SRC-22, subjekty: vojtech): Poslankyně Michaela Šebelová (STAN) v souvislosti s návrhem upozornila, že premiér Babiš vlastní zdravotnické kliniky, které by z opatření profitovaly; podle ní nejde formálně o střet zájmů, ale fakticky ano. Ptala se, zda změna není „šita na míru“ klinikám z holdingu spojeného s premiérem.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-15** (CITACE, zdroje: SRC-08, SRC-09, subjekty: vojtech): Vojtěch ve Sněmovně uvedl, že „vůbec netušil“, že by kliniky z holdingu spojeného s Babišem prováděly onkologické prohlídky; návrh hájí tím, že impuls přišel od zaměstnavatelských svazů, jde o soukromé peníze firem a nastavení má být nediskriminační s volbou poskytovatele.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-16** (CITACE, zdroje: SRC-10, subjekty: vojtech): Jiří Sezemský v komentáři Reflexu (12. 6. 2026) napsal, že ministr „si hraje na neználka“ — buď zvýhodňuje Babišovy kliniky vědomě, nebo je nekompetentní; uvádí, že holding SynBiol loni získal z veřejného zdravotního pojištění téměř tři miliardy Kč. Jde o komentář, tvrzení a hodnocení jsou autorova.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-17** (1 ZDROJ, zdroje: SRC-08, subjekty: vojtech): Návrh daňového zvýhodnění je předkládán jako poslanecký pozměňovací návrh, tedy mimo standardní vládní legislativní proces s meziresortním připomínkovým řízením.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-18** (CITACE, zdroje: SRC-11, subjekty: vojtech): Zdravotnický expert koaliční SPD Jan Síla kritizoval ministra Vojtěcha slovy, že si k prosazování národní očkovací strategie „opět přizval osoby odpovědné za zmatky v covidové pandemii“, což je podle SPD příčinou nedůvěry veřejnosti v očkování. Jde o pozici koaliční strany SPD, nikoli o nezávislé zjištění.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-19** (1 ZDROJ, zdroje: SRC-11, subjekty: vojtech): Koaliční SPD žádá revokaci národní očkovací strategie (doporučená dobrovolná očkování proti covidu, HPV a chřipce), která podle Echo24 počítá s náklady 2–3 miliardy Kč; ministr Vojtěch strategii hájí.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-20** (1 ZDROJ, zdroje: SRC-11, subjekty: vojtech): Vojtěch v reakci na kritiku odmítl, že by strategie zaváděla registr neočkovaných; tzv. signální kód pro vykazování odmítnutí povinného očkování podle něj existuje šest let a slouží jako ochrana lékařů.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-21** (CITACE, zdroje: SRC-12, subjekty: vojtech): Předseda koaliční SPD Tomio Okamura označil bonusy VZP zaměstnavatelům za proočkovanost zaměstnanců proti chřipce (projekt „Zdravá firma“) za „uplácení zaměstnavatelů“ a nepřímý nátlak na zaměstnance. Jde o atribuovanou pozici koaliční strany.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-22** (CORROBORATED, zdroje: SRC-13, SRC-16, subjekty: vojtech): RÁMCOVÉ UPOZORNĚNÍ: Trestní oznámení podané resortem zdravotnictví v březnu 2026 i navazující policejní šetření směřují na postupy na kardiologickém pracovišti Fakultní nemocnice Olomouc, nikoli na ministra Adama Vojtěcha osobně; ministr v kauze vystupuje jako představitel zřizovatele, který podnět podal.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-23** (CORROBORATED, zdroje: SRC-13, SRC-18, subjekty: vojtech): Odborná komise, jejíž předběžné stanovisko bylo zveřejněno v červenci 2026, pracovala pod vedením odborníka pověřeného ministerstvem zdravotnictví a zasedali v ní lékaři I. interní kliniky – kardiologické FN Olomouc a dva zástupci České asociace pro srdeční rytmus.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-24** (CORROBORATED, zdroje: SRC-13, SRC-14, subjekty: vojtech): Zjištění komise se vztahuje ke konkrétnímu posuzovanému roku 2024 a týká se implantací ICD u pacientů po infarktu nebo s jiným závažným kardiologickým nálezem, u nichž podle formulace komise „nebyla zcela naplněna indikační kritéria“.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-25** (CORROBORATED, zdroje: SRC-13, SRC-14, subjekty: vojtech): Vedení FN Olomouc označilo zjištění komise za závažná a své stanovisko předalo policii, s níž podle vlastního vyjádření spolupracuje.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-26** (CORROBORATED, zdroje: SRC-13, SRC-17, subjekty: vojtech): Vedení FN Olomouc podle svého prohlášení „jednoznačně vylučuje jakýkoliv ekonomický zájem FNOL v této věci“ a přislíbilo kompenzaci škod, pokud bude prokázáno poškození zdraví pacientů nebo újma veřejného zdravotního pojištění.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-27** (CORROBORATED, zdroje: SRC-13, SRC-17, subjekty: vojtech): Vedení nemocnice v červenci 2026 připsalo hlavní odpovědnost za sporné postupy bývalému přednostovi kardiologické kliniky Miloši Táborskému, kterého označilo za zastánce velmi včasné a s nižším prahem prováděné implantace ICD.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-28** (CORROBORATED, zdroje: SRC-13, SRC-18, subjekty: vojtech): Miloš Táborský si spolu s původním arytmologickým týmem za indikacemi léčby ICD nadále stojí a argumentuje tím, že časná léčba po infarktu může zachraňovat životy.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-29** (CORROBORATED, zdroje: SRC-13, SRC-15, subjekty: vojtech): Případ převzalo Vrchní státní zastupitelství, které možnou škodu vyčíslilo na více než 150 milionů korun.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-30** (CORROBORATED, zdroje: SRC-13, SRC-18, subjekty: vojtech): K datu zveřejnění závěrů komise (10.–11. července 2026) policie v kauze nikoho neobvinila; případ je nadále veden pro podezření z podvodu a těžkého ublížení na zdraví.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-31** (1 ZDROJ, zdroje: SRC-19, subjekty: vojtech): Všeobecná zdravotní pojišťovna zařadila kontrolu FN Olomouc do plánu kontrol a prověřuje stovky implantací defibrilátorů provedených u svých klientů v letech 2023–2025; mluvčí Viktorie Plívová uvedla, že předmětem kontroly je posouzení, zda k implantaci došlo na základě indikačních pravidel oprávněně. Předběžné výsledky pojišťovna očekávala na podzim 2026.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-32** (1 ZDROJ, zdroje: SRC-19, subjekty: vojtech): V květnu 2026 kriminalisté zasahovali také v Masarykově nemocnici v Ústí nad Labem, kde rovněž stoupl počet implantací a kde kardiologickou kliniku vede profesor Miloš Táborský — tentýž lékař, který do února 2025 řídil obdobné pracoviště v Olomouci.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-33** (1 ZDROJ, zdroje: SRC-20, subjekty: vojtech): Premiér Andrej Babiš 18. února 2026 při otevření nového onkologického pavilonu ve FN Olomouc vyjádřil řediteli Romanu Havlíkovi plnou důvěru slovy „Samozřejmě že má (ředitel) důvěru“ a označil jej za „jednoho z nejlepších, kterého v České republice máme“; uvedl též, že personální změny ve vedení nemocnice nejsou na pořadu dne.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-34** (1 ZDROJ, zdroje: SRC-26, subjekty: vojtech): Adam Vojtěch oznámil návrh na daňové vynětí vybraných preventivních programů 4. května 2026 na tiskové konferenci po jednání vlády; mimo limit 50 tisíc Kč mají spadat nadstandardní preventivní prohlídky, rozšířené onkologické screeningy, vyšetření kardiovaskulárního rizika, screening diabetu u rizikových skupin a vybraná očkování nehrazená z veřejného pojištění.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-35** (CITACE, zdroje: SRC-26, subjekty: vojtech): Vojtěch svůj návrh při oznámení charakterizoval slovy: „Nejde o rozšiřování benefitů jako takových, ale o jejich lepší zacílení.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-36** (1 ZDROJ, zdroje: SRC-23, subjekty: vojtech): Podle Vojtěcha je cílem zachovat obecný strop zhruba 50 tisíc Kč na zdravotní benefity a vydělit preventivní programy do zvláštního daňově uznatelného režimu; benefity bez limitu by platily od ledna 2027 a musely by být upraveny kolektivní smlouvou, vnitřním předpisem nebo pracovní smlouvou.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-37** (1 ZDROJ, zdroje: SRC-23, subjekty: vojtech): Rozpočtový výbor Sněmovny 13. července 2026 doporučil návrh na vynětí vybraných zdravotních benefitů z limitovaného daňového odpočtu ke schválení a zároveň odmítl konkurenční návrh skupiny poslanců ODS vedených Štěpánem Slovákem.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-38** (1 ZDROJ, zdroje: SRC-25, subjekty: vojtech): Sněmovna 15. července 2026 schválila novelu o elektronické evidenci tržeb, jejíž součástí je na návrh Adama Vojtěcha a ministryně financí Aleny Schillerové (oba ANO) nová příloha zákona o daních z příjmů osvobozující vyjmenované zdravotní služby; pro zákon jako celek hlasovalo 84 koaličních poslanců, proti 50 opozičních ze 159 přítomných. Norma míří do Senátu a k podpisu prezidenta.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-39** (1 ZDROJ, zdroje: SRC-21, subjekty: vojtech): Poslanec ODS Vojtěch Munzar podal při projednávání novely návrh na její zamítnutí.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-40** (CITACE, zdroje: SRC-21, subjekty: vojtech): Vojtěch obhajoval návrh tím, že impuls přišel od zaměstnavatelských svazů, a k podpoře prevence uvedl: „Skutečně nevidím v principu nic špatného.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-41** (1 ZDROJ, zdroje: SRC-22, subjekty: vojtech): Michaela Šebelová (STAN) kromě otázky střetu zájmů kritizovala i věcnou stránku návrhu — absenci dat prokazujících efektivitu vybraných služeb a chybějící ekonomické zdůvodnění; uvedla: „Mně chybí ta čísla, a to zdůvodnění.“
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-42** (1 ZDROJ, zdroje: SRC-22, subjekty: vojtech): Poslanec Václav Pláteník (KDU-ČSL) zrušení limitu podpořil, návrhu však vytkl absenci stomatologické péče a dentální hygieny; podle článku pojišťovny dentální hygienu klientům nehradí a jejich rozpočty z fondu prevence na tuto oblast rok od roku klesají.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-43** (1 ZDROJ, zdroje: SRC-24, subjekty: vojtech): Proti návrhu se postavili Tomáš Prouza (Svaz obchodu a cestovního ruchu ČR), Josef Jaroš (Asociace malých a středních podniků a živnostníků ČR) a Jiří Nesrovnal (Komora daňových poradců ČR) s argumentem, že vytvoří „další paralelní byrokracii“ a většina firem jej kvůli složitosti nevyužije; naopak Tomáš Kolář ze Svazu průmyslu a dopravy jej označil za „krok správným směrem“.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-44** (1 ZDROJ, zdroje: SRC-24, subjekty: vojtech): Ministerstvo financí původně navrhovalo zrušit limit pouze pro volnočasové benefity, čímž by zábava byla daňově výhodnější než zdravotní prevence; po kritice slíbil premiér Babiš nápravu, jejímž řešením byl pověřen ministr Vojtěch.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-45** (1 ZDROJ, zdroje: SRC-27, subjekty: vojtech): SPD otevřelo požadavek na revokaci a přepracování celé Národní očkovací strategie na koaliční radě s ANO a Motoristy sobě; kritizuje zejména rozšíření doporučených očkování proti chřipce, covidu a HPV. Za SPD téma vedou Jan Síla a Josef Nerušil. Vojtěch zrušení i přepracování odmítá s tím, že strategie vychází z jasných dat a vědeckých poznatků.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-46** (1 ZDROJ, zdroje: SRC-28, subjekty: vojtech): Jan Síla (SPD) kritizoval složení Vojtěchova vakcinačního týmu s tím, že si ministr přizval podle SPD zprofanované experty z doby covidové pandemie, jmenovitě bývalého ministra zdravotnictví Romana Prymulu.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-47** (1 ZDROJ, zdroje: SRC-31, subjekty: vojtech): Vojtěch 20. března 2026 po jednání s SPD za účasti premiéra Babiše uvedl, že státem placená kampaň na propagaci očkování v hodnotě 50 až 80 milionů korun nebude, protože ministerstvo takovým rozpočtem nedisponuje, a propagace poběží vlastními kanály resortu. Zároveň potvrdil, že strategie zůstává bez zásadních změn a úhrada nepovinného očkování ze zdravotního pojištění je zachována.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-48** (1 ZDROJ, zdroje: SRC-29, subjekty: vojtech): Na jednání sněmovního výboru 3. května 2026 Jan Síla (SPD) tvrdil, že zaznamenávání odmítnutí očkování vytváří „cejch“ a označuje člověka za osobu druhé kategorie; Vojtěch odpověděl, že záznam o odmítnutí se týká pouze povinného očkování, nikoli dobrovolného, a odmítl existenci registru odmítačů s odkazem na běžnou praxi v zemích jako Finsko.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-49** (1 ZDROJ, zdroje: SRC-29, subjekty: vojtech): Debatu o očkovací strategii ve sněmovním výboru inicializovali opoziční poslanci Michaela Šebelová (STAN), Eva Šrámková (Piráti), Tom Philipp (KDU-ČSL), Vlastimil Válek (TOP 09) a Zdenka Němečková Crkvenjaš (ODS), zatímco proti ministrovi z koaličních lavic vystoupili Jan Síla a Jindřich Rajchl (SPD/PRO) — spor tedy nekopíruje standardní dělení koalice a opozice.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-50** (CITACE, zdroje: SRC-30, subjekty: vojtech): Vojtěch 30. dubna 2026 na sněmovním zdravotnickém výboru uvedl: „Národní očkovací strategie, i kdyby chtěla, tak nemůže zavést žádné povinné očkování“ — zavedení povinnosti by podle něj vyžadovalo novelu zákona o ochraně veřejného zdraví.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný

## Alena Schillerová — `alena-schillerova` (40 tvrzení)

Per-dossier prismatic nástroje a výjimky: viz [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md#per-dossier-kroky).

- [ ] **CLM-01** (1 ZDROJ, zdroje: SRC-01, subjekty: —): Alena Schillerová zastává podle oficiálního profilu na webu Úřadu vlády funkci místopředsedkyně vlády a ministryně financí
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-02** (1 ZDROJ, zdroje: SRC-01, subjekty: —): Podle téhož profilu byla ministryní financí jmenována 17. 12. 2017 a místopředsedkyní vlády 30. 4. 2019; předtím působila jako náměstkyně ministra financí pro daně a celní správu (2016–2017) a ve Finanční správě od roku 1991
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-03** (1 ZDROJ, zdroje: SRC-02, subjekty: —): Národní rozpočtová rada v lednu 2026 uvedla, že návrh státního rozpočtu na rok 2026 je v rozporu se zákonem o pravidlech rozpočtové odpovědnosti, a označila situaci za bezprecedentní; podle rady měl být maximální schodek 247 miliard korun místo navržených 310 miliard. Jde o stanovisko nezávislého odborného orgánu, ne o soudní rozhodnutí
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-04** (CITACE, zdroje: SRC-02, subjekty: —): Schillerová podle citovaného zpravodajství namítla, že výdajové limity se vztahují jen na rozpočty projednávané v běžném září­ovém termínu, ne na přepracované verze po zamítnutí Sněmovnou; ministerstvo zároveň rozporovalo výpočet rady s tím, že obranné výdaje 55 miliard odůvodňují limit 292 miliard
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-05** (1 ZDROJ, zdroje: SRC-03, subjekty: —): Novela rozpočtových zákonů mění výpočet výdajových rámců z pravidla maximálního strukturálního deficitu na střednědobý růst čistých výdajů; podle citovaného zpravodajství by pozměňovací návrhy ministryně umožnily navýšit výdaje na strategickou infrastrukturu nad schválené limity a v některých případech obejít schválení Parlamentem, včetně navýšení až o 10 procent při bezpečnostních hrozbách
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-06** (CITACE, zdroje: SRC-03, subjekty: —): Schillerová novelu obhájila slovy „Neexistuje realistický scénář, jak za rok snížit deficit na 150 miliard korun bez kolapsu investic\" a argumentovala, že rozpočtová pravidla předchozí vlády vytvořila neřešitelnou situaci
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-07** (CITACE, zdroje: SRC-03, subjekty: —): Předseda ODS Martin Kupka označil novelu za „ústavní převrat na splátky\" s tím, že přesouvá moc z Parlamentu na exekutivu; Olga Richterová (Piráti) uvedla, že zákon může vést ke „kolapsu státu\". Jde o politické hodnocení oponentů, ne o zjištění kontrolního orgánu
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-08** (CORROBORATED, zdroje: SRC-04, SRC-20, subjekty: schillerova): Poslanecká sněmovna schválila novelu rozpočtových zákonů 15. května 2026 na mimořádné schůzi poměrem 91 hlasů pro a 68 proti; pro hlasovala vládní koalice, proti opozice.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-09** (1 ZDROJ, zdroje: SRC-19, subjekty: schillerova): Novela rozpočtových zákonů byla Poslanecké sněmovně předložena jako sněmovní tisk č. 90 dne 27. ledna 2026 a mění zákon č. 23/2017 Sb. o pravidlech rozpočtové odpovědnosti; jejím deklarovaným účelem je transpozice reformy Paktu stability a růstu z roku 2024.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-10** (1 ZDROJ, zdroje: SRC-19, subjekty: schillerova): Podle Centra veřejných financí Univerzity Karlovy umožňuje pozměňovací návrh č. 825 (§ 12 odst. 5) vládě vrátit si vlastní rozpočet k přepracování, přičemž při opětovném předložení by fakticky odpadla všechna pravidla rozpočtové odpovědnosti.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-11** (1 ZDROJ, zdroje: SRC-19, subjekty: schillerova): Centrum veřejných financí označilo za problematický i stoprocentní symetrický korekční faktor zaváděný pozměňovacím návrhem č. 825 v § 10 odst. 5, který by podle něj umožňoval navyšovat výdaje bez ohledu na jejich soulad s pravidly.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-12** (1 ZDROJ, zdroje: SRC-19, subjekty: schillerova): Pozměňovací návrh č. 826 rozšiřuje výjimky z rozpočtových pravidel také na platby za dostupnost v PPP projektech, což by podle Centra veřejných financí vedlo k dvojímu zohlednění investic v povoleném schodku a k porušení pravidel EU.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-13** (1 ZDROJ, zdroje: SRC-05, subjekty: schillerova): Senát novelu 17. června 2026 po více než tříhodinové debatě vrátil Sněmovně s pozměňovacími návrhy: snížil limit pro vyjmuté infrastrukturní výdaje ze 2 % na 1 % HDP a podmínil navyšování výdajů souhlasem rozpočtového výboru.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-14** (1 ZDROJ, zdroje: SRC-06, subjekty: schillerova): Senát chtěl novelou omezit pravomoc ministerstva financí upravovat rozpočty nezávislých institucí, mezi něž patří Kancelář prezidenta republiky, Ústavní soud a veřejný ochránce práv.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-15** (1 ZDROJ, zdroje: SRC-06, subjekty: schillerova): Sněmovna přehlasovala Senát v nočním hlasování v noci na 8. července 2026 a potvrdila svou verzi novely přesně 101 hlasy vládní koalice, tedy minimálním potřebným počtem; všichni přítomní opoziční poslanci hlasovali proti.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-16** (CITACE, zdroje: SRC-06, subjekty: schillerova): Schillerová odmítla senátní úpravy s odůvodněním, že by přinesly právní nejistotu, a vyzvala poslance k podpoře původní sněmovní verze.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-17** (CORROBORATED, zdroje: SRC-07, SRC-08, subjekty: schillerova): Prezident Petr Pavel novelu rozpočtových zákonů vetoval 22. července 2026 a vrátil ji Poslanecké sněmovně; rozhodnutí oznámil videem na sociální síti.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-18** (CORROBORATED, zdroje: SRC-07, SRC-08, subjekty: schillerova): Pavel své veto odůvodnil slovy, že zákon umožňuje vládě půjčovat si výrazně více, než je tomu dnes, a že o veřejných penězích má rozhodovat parlament, zatímco novela rozšiřuje prostor vlády navyšovat výdaje bez souhlasu Poslanecké sněmovny.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-19** (1 ZDROJ, zdroje: SRC-08, subjekty: schillerova): Podle prezidenta Pavla by novela umožnila vládě překročit vlastní schválený rozpočet až o deset procent na základě rozhodnutí pouze jejího vlastního poradního bezpečnostního orgánu, což podle ČT24 odpovídá zhruba 240 miliardám korun.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-20** (CITACE, zdroje: SRC-10, subjekty: schillerova): Schillerová označila prezidentovo veto na síti X za názorový veletoč s odůvodněním, že to byla právě prezidentská kancelář, kdo netransparentní rozpočtování minulé vlády Petra Fialy dlouhodobě ostře kritizoval.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-21** (CITACE, zdroje: SRC-08, subjekty: schillerova): Schillerová k vetu uvedla, že prezident vetoval hospodářský růst, obranyschopnost a výstavbu jaderných bloků.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-22** (CITACE, zdroje: SRC-10, SRC-08, subjekty: schillerova): Schillerová tvrdí, že bez přijetí novely by Česko hospodařilo se schodkem, který označila za devastační, přičemž uváděla částku 150 miliard korun.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-23** (1 ZDROJ, zdroje: SRC-09, subjekty: schillerova): Sněmovna má o prezidentském vetu hlasovat v úterý 25. srpna 2026; k přehlasování je potřeba nejméně 101 hlasů a vládní koalice jich má 108.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-24** (1 ZDROJ, zdroje: SRC-18, subjekty: schillerova): Ve svém vyjádření z 10. února 2026 rozložila NRR zákonný limit schodku na základní rámec 237 miliard korun odpovídající strukturálnímu schodku 1,75 % HDP plus navýšení o obranu ve výši 9 miliard korun, tedy celkem 246 miliard korun, což navrhovaný schodek 310 miliard překračuje o 64 miliard.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-25** (1 ZDROJ, zdroje: SRC-18, subjekty: schillerova): NRR výslovně odmítla argumentaci ministerstva financí, že se zákonná omezení nevztahují na rozpočet předkládaný opakovaně po vrácení Sněmovnou, s tím, že vláda je zákonem vázána předložit návrh rozpočtu v každém okamžiku v jeho mezích a limitech.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-26** (1 ZDROJ, zdroje: SRC-16, subjekty: schillerova): Ve stanovisku č. 1/2026 z 12. března 2026 NRR uvedla, že kapitola obrany obsahuje jen 154,8 miliardy korun, tedy 1,73 % HDP, což nenaplňuje zákonný závazek 2 % HDP, a že na podporu obnovitelných zdrojů je proti schválené podpoře 41,7 miliardy rozpočtováno jen 31,9 miliardy korun.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-27** (1 ZDROJ, zdroje: SRC-15, subjekty: schillerova): Ministerstvo financí ve své reakci z 12. března 2026 uvedlo, že obranné výdaje rozpočtovalo ve výši 184,6 miliardy korun, tedy 2,06 % HDP, protože započítalo i vybrané obranné výdaje mimo kapitolu ministerstva obrany, konkrétně Host Nation Support, příspěvky NATO a evropský obranný fond.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-28** (1 ZDROJ, zdroje: SRC-15, subjekty: schillerova): Ministerstvo financí v téže reakci zpochybnilo oprávnění NRR hodnotit makroekonomické prognózy slovy, že mu není známo, na základě čeho se Národní rozpočtová rada pasuje do role arbitra, a tuto roli přisoudilo výhradně Výboru pro rozpočtové prognózy.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-29** (1 ZDROJ, zdroje: SRC-15, subjekty: schillerova): Ministerstvo financí v reakci na stanovisko NRR připustilo, že situace v rozpočtové oblasti je napjatá již několik let a že sestavení rozpočtu bez dalších opatření bude pro roky 2027 a 2028 obtížné.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-30** (1 ZDROJ, zdroje: SRC-17, subjekty: schillerova): Ve stanovisku č. 4/2026 z 11. června 2026 NRR uvedla, že po schválení novel národní fiskální omezení v podstatě přestanou existovat, a označila změny za změnu fiskálního paradigmatu.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-31** (1 ZDROJ, zdroje: SRC-17, subjekty: schillerova): NRR ve stanovisku č. 4/2026 upozornila, že novela odklání vládu od dříve deklarovaného snížení strukturálního deficitu na 1,25 % HDP v roce 2027 a 1,00 % HDP od roku 2028, a že obranná výjimka se prodlužuje z roku 2033 na rok 2036.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-32** (1 ZDROJ, zdroje: SRC-17, subjekty: schillerova): NRR ve stanovisku č. 4/2026 odhadla, že schodek státního rozpočtu na rok 2027 může přesáhnout 350 miliard korun a že výnos desetiletého státního dluhopisu se blíží pětiprocentní hranici.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-33** (1 ZDROJ, zdroje: SRC-11, subjekty: schillerova): NRR varovala, že podle nových pravidel by mohl být legální deficit státního rozpočtu ve výši 400 miliard korun a deficit vládního sektoru přes 3 % HDP.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-34** (CITACE, zdroje: SRC-11, subjekty: schillerova): Schillerová obhajovala novelu tvrzením, že Česko chce jít cestou, kterou se vydalo například Německo, tedy vyjímat obranné a infrastrukturní výdaje z fiskálních pravidel.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-35** (CITACE, zdroje: SRC-12, subjekty: schillerova): Schillerová označila novelu za cestu z pasti rozpočtových triků, nikoli za cestu k bezbřehému zadlužování, a uvedla, že Česko zůstane mezi rozpočtově nejodpovědnějšími státy EU.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-36** (CITACE, zdroje: SRC-12, subjekty: schillerova): Schillerová kritizovala předchozí vládu Petra Fialy tvrzením, že prokazatelně plánovala hospodařit s deficitem skoro dvou procent HDP, zatímco do Bruselu slibovala deficit skoro čtyřikrát nižší.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-37** (1 ZDROJ, zdroje: SRC-14, subjekty: schillerova): Již 6. ledna 2026 v Interview ČT24 Schillerová avizovala vlastní verzi novely s odůvodněním, že současný zákon není v souladu s novým evropským Paktem stability, a odmítla novelu, kterou dosluhující vláda poslala dva dny před jejím jmenováním.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-38** (1 ZDROJ, zdroje: SRC-13, subjekty: schillerova): V rozhovoru pro Hospodářské noviny z 15. června 2026 Schillerová uvedla, že vláda v připravovaném fiskálně-strukturálním plánu počítá s deficitem 2,8 % HDP a postupnou konsolidací zhruba o půl procentního bodu ročně, a připustila, že nemůže vyloučit vyšší schodek než v roce 2026.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-39** (1 ZDROJ, zdroje: SRC-08, subjekty: schillerova): Opoziční politici na veto reagovali pochvalně: Martin Kupka (ODS) varoval před oslabením kontrolní role Sněmovny, Vít Rakušan (STAN) uvedl, že si vláda chtěla otevřít cestu k obcházení dluhových pravidel, Zdeněk Hřib (Piráti) mluvil o zaraženém vládním účetním podvodu a Jan Jakob (TOP 09) oznámil přípravu ústavní stížnosti.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-40** (CORROBORATED, zdroje: SRC-07, SRC-08, subjekty: schillerova): Premiér Andrej Babiš označil prezidentovo veto za velice nezodpovědné vůči občanům a tvrdil, že ohrožuje zdravotnictví, obranu a bezpečnost.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet

## Aleš Juchelka — `ales-juchelka` (46 tvrzení)

Per-dossier prismatic nástroje a výjimky: viz [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md#per-dossier-kroky).

- [ ] **CLM-01** (1 ZDROJ, zdroje: SRC-01, subjekty: —): Aleš Juchelka zastává podle oficiálního profilu na webu Úřadu vlády funkci ministra práce a sociálních věcí
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-02** (CORROBORATED, zdroje: SRC-02, SRC-03, subjekty: —): Poradkyně, kterou si Juchelka osobně vybral, dohlížela podle citovaného zpravodajství na dotační výzvy v objemu 17 miliard korun, přičemž její soukromá firma současně přijímala platby od žadatelů za pomoc se získáním týchž státních prostředků
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-03** (1 ZDROJ, zdroje: SRC-02, subjekty: —): Na konci dubna 2026 byly čtyři projekty spojené s firmou poradkyně vyřazeny z financování Evropské unie; ministerstvo tyto přislíbené prostředky nemůže čerpat, což podle citovaného zpravodajství vytváří rozpočtovou mezeru 63,8 milionu korun
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-04** (CITACE, zdroje: SRC-02, subjekty: —): Juchelka poradkyni nejprve hájil slovy, že je „normální ženská\" a „člověk na svém místě\", a kritiku odmítal; na dotaz, jak bude deficit řešen, odpověděl „Počkejte.\"
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-05** (1 ZDROJ, zdroje: SRC-02, subjekty: —): Ministerstvo podle citovaného zpravodajství neplánuje vymáhat po poradkyni náhradu škody s odůvodněním, že vyřazení z financování EU nelze automaticky označit za přímou škodu
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-06** (CORROBORATED, zdroje: SRC-03, SRC-08, SRC-10, SRC-11, subjekty: juchelka): Server Seznam Zprávy 19. března 2026 napsal, že tehdejší poradkyně ministra práce Aleše Juchelky Alexandra Semancová měla na ministerstvu vliv na dotační výzvy z Národního plánu obnovy v objemu asi 17 miliard korun a současně byla jedinou majitelkou soukromé firmy Siptrade, která žadatelům za provize pomáhala tytéž dotace získávat. Jde o reportovaný možný střet zájmů; Semancová je v tomto dossieru vedena pouze jako záznam pracovního vztahu k subjektu v rozsahu citovaného zpravodajství, není subjektem dossieru a nebyla z ničeho obviněna.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-07** (1 ZDROJ, zdroje: SRC-03, subjekty: juchelka): Podle zjištění Seznam Zpráv firma Siptrade v době reportáže nárokovala pro své klienty z evropských zdrojů více než 100 milionů korun; řízení firmy bylo formálně přepsáno na devatenáctiletou dceru majitelky, vlastnicky se ale nic nezměnilo.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-08** (1 ZDROJ, zdroje: SRC-04, subjekty: juchelka): Evropská komise si podle Seznam Zpráv koncem března 2026 dopisem vyžádala od českých úřadů vysvětlení: 'Obvinění prezentovaná v tisku vzbuzují závažné obavy ze střetu zájmů,' a dotazovala se, jaké kroky ministerstvo plánuje k ověření a prevenci možného střetu zájmů.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-09** (CORROBORATED, zdroje: SRC-04, SRC-10, SRC-11, subjekty: juchelka): Interní varování úředníků MPSV, o němž informovaly Seznam Zprávy, vyčíslilo riziko ztráty evropských prostředků kvůli možnému střetu zájmů poradkyně až na zhruba 100–103 milionů korun.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-10** (CORROBORATED, zdroje: SRC-05, SRC-06, subjekty: juchelka): Juchelka v dubnu 2026 poslancům oznámil, že Semancová po návratu z nemocenské ukončila působení na MPSV; podle ministra odešla dobrovolně a po vzájemné dohodě, aby neohrožovala čerpání z evropských fondů.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-11** (CORROBORATED, zdroje: SRC-07, SRC-10, SRC-11, SRC-12, subjekty: juchelka): MPSV v červenci 2026 rozhodlo, že čtyři projekty za 63,8 milionu korun nebude vykazovat vůči Evropské komisi k proplacení z Národního plánu obnovy a uhradí je ze státního rozpočtu; k tomu přibylo dalších 17,6 milionu korun z Operačního programu Zaměstnanost plus.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-12** (CORROBORATED, zdroje: SRC-07, SRC-12, subjekty: juchelka): Podle Forum24 není jasné, z jakých rozpočtových kapitol ministerstvo výpadek 63,8 milionu korun nahradí; MPSV podle Ekonomického deníku uvedlo, že konečnou sumu i případné porušení podmínek financování bude možné vyhodnotit až po dokončení administrativních a kontrolních postupů.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-13** (CORROBORATED, zdroje: SRC-08, SRC-09, SRC-11, SRC-14, subjekty: juchelka): Předseda opozičního hnutí STAN Vít Rakušan 23. července 2026 oznámil na síti X, že hnutí podává trestní oznámení kvůli případnému střetu zájmů při vyplácení unijních peněz z NPO na ministerstvu práce; oznámení podala místopředsedkyně sněmovního sociálního výboru Pavla Pivoňka Vaňková (STAN). Procesní stav: jde o podané trestní oznámení, tedy podnět k prověření — nikoli o zahájené trestní stíhání; nikdo v kauze nebyl obviněn ani odsouzen.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-14** (CORROBORATED, zdroje: SRC-09, SRC-14, subjekty: juchelka): Nejvyšší kontrolní úřad podle Forum24 zahrnul působení bývalé poradkyně do probíhající kontroly MPSV (od července 2026, s předpokládaným ukončením v polovině roku 2027) a ministerstva se dotazoval, zda zvažuje podat trestní oznámení pro možné spáchání trestného činu poškození finančních zájmů EU. Kontrola NKÚ je správní prověrka, nikoli trestní řízení.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-15** (1 ZDROJ, zdroje: SRC-15, subjekty: juchelka): Samotné ministerstvo práce k 29. červenci 2026 podle Blesku žádné trestní oznámení nepodalo; premiér Andrej Babiš uvedl: 'Pokud vznikne škoda, tak určitě pan ministr podá trestní oznámení.' Žádný trestný čin nebyl v té době prokázán ani nikomu kladen za vinu.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-16** (CORROBORATED, zdroje: SRC-13, SRC-14, SRC-15, subjekty: juchelka): MPSV si podle Juchelkova vyjádření z 27. července 2026 vyžádalo externí právní posudek k možnému střetu zájmů; ministr řekl: 'Pokud se prokáže, že škoda vznikla, tak ji budeme samozřejmě vymáhat.' Zpracovat jej má nezávislá advokátní kancelář.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-17** (CITACE, zdroje: SRC-03, SRC-04, subjekty: juchelka): Juchelka se v březnu 2026 poradkyně veřejně zastal slovy: 'Alexandra Semancová je normální ženská, uznávaná projekťačka… Je člověk na svém místě' (výrok citovaný Seznam Zprávami).
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-18** (CITACE, zdroje: SRC-05, subjekty: juchelka): Juchelka v dubnu 2026 ve sněmovně podle ČT24 prohlásil: 'Není práce ministra hlídat střety zájmů.'
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-19** (CITACE, zdroje: SRC-06, subjekty: juchelka): Juchelka v dubnu 2026 podle Blesku označil mediální pokrytí za 'štvavou a nenávistnou kampaň, kterou proti ní některá média a opozice rozjela' a která se podle něj 'na ní i její rodině hodně podepsala'.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-20** (CITACE, zdroje: SRC-07, subjekty: juchelka): Na dotaz novináře Forum24 ve sněmovně 22. července 2026, jak ministerstvo naloží se ztrátou 64 milionů, Juchelka podle serveru odpověděl jediným slovem: 'Čekat.'
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-21** (CITACE, zdroje: SRC-13, subjekty: juchelka): Na tiskové konferenci po jednání vlády 27. července 2026 Juchelka podle Forum24 řekl novinářce Seznam Zpráv: 'Je to odporná novinářská práce, styďte se, že pracujete pro Seznam Zprávy,' a dodal: 'Je neuvěřitelné, že se dá z ničeho uplést něco, co hýbe mediálním prostorem.'
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-22** (CORROBORATED, zdroje: SRC-08, SRC-09, SRC-11, SRC-13, SRC-14, subjekty: juchelka): Jádrem Juchelkovy obhajoby je opakované tvrzení, že Semancová nastoupila na ministerstvo už za předchozího ministra Jurečky, že její případný střet zájmů neošetřilo minulé vedení resortu, že 'vylučuje, že by ovlivňovala jakýsi proces přerozdělování dotací' a že stát 'o žádné prostředky z Evropské unie nepřijde'.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-23** (CORROBORATED, zdroje: SRC-23, SRC-24, subjekty: juchelka): K 29. červenci 2026 MPSV zadání externího právního posudku teprve připravovalo — zpracovatelem má být nezávislá advokátní kancelář, ale konkrétní výběr zpracovatele ani harmonogram v té době ještě nebyly určeny.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-24** (1 ZDROJ, zdroje: SRC-25, subjekty: juchelka): Žádný výsledek ani závěr externího posudku nebyl k datu rešerše (30. 7. 2026) zveřejněn; Deník N výslovně uvádí, že konkrétní závěry nejsou dosud k dispozici.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-25** (CITACE, zdroje: SRC-19, SRC-16, SRC-25, subjekty: juchelka): Juchelka k posudku uvedl: „Pokud se prokáže, že škoda vznikla, tak ji budeme samozřejmě vymáhat. Zatím nemáme jednoznačný závěr, že by škoda vznikla, ale vyžádali jsme si na to i externí posudek.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-26** (CORROBORATED, zdroje: SRC-23, SRC-16, subjekty: juchelka): Podle Juchelky bude o tom, zda České republice skutečně vznikla finanční újma, možné rozhodnout až po dokončení administrace projektů.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-27** (1 ZDROJ, zdroje: SRC-28, subjekty: juchelka): Juchelka podle iROZHLAS.cz sám střet zájmů Semancové nezpochybňuje, zároveň však vylučuje, že by ovlivňovala přerozdělování dotací. (Plný text iROZHLAS byl nedostupný — doloženo z přetištěného úryvku.)
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-28** (CITACE, zdroje: SRC-19, subjekty: juchelka): V rozhovoru ČT24 dne 27. 7. 2026 s moderátorem Danielem Takáčem Juchelka řekl: „Vůbec nepřijdeme o žádné peníze z EU a vůbec nebude v dluhu státní rozpočet, protože ty peníze jsou alokovány tak, jak alokovány jsou.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-29** (CITACE, zdroje: SRC-19, subjekty: juchelka): Juchelka v témže rozhovoru uvedl: „A tady o žádné prostředky nepřijdeme, nebudeme podle mě vůbec kráceni v žádné sankci, která se týká NPO a dětských skupin, protože dle mých informací ten milník splníme, opravdu se tomu blížíme.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-30** (1 ZDROJ, zdroje: SRC-21, subjekty: juchelka): Jádrem Juchelkovy rozpočtové obhajoby je argument, že Evropská komise vyplácí peníze za splnění konkrétního milníku, a stát proto o prostředky nepřijde.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-31** (1 ZDROJ, zdroje: SRC-19, subjekty: juchelka): Juchelka v rozhovoru ČT24 hovořil o vyjmutí celkem šesti projektů z Národního plánu obnovy a Operačního programu Zaměstnanost plus — tedy o vyšším počtu, než jsou dosud uváděné čtyři projekty za 63,8 mil. Kč.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-32** (1 ZDROJ, zdroje: SRC-19, subjekty: juchelka): Juchelka zasadil spornou částku do kontextu financování dětských skupin, u nichž uvedl objem 6 miliard korun ze státního rozpočtu a 700 milionů korun od Evropské unie.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-33** (CITACE, zdroje: SRC-26, subjekty: juchelka): MPSV k částce uvedlo: „Teprve po dokončení administrativních procesů bude možné vyhodnotit, zda došlo k porušení podmínek financování, zda vznikla škoda, a případně stanovit její výši.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-34** (1 ZDROJ, zdroje: SRC-22, subjekty: juchelka): MPSV podle zjištění FORUM 24 z 22. 7. 2026 neplánovalo vymáhat případnou škodu po Semancové s argumentem, že „samotné vyjmutí prostředků z evropského financování nelze automaticky klasifikovat jako přímou škodu“ — tedy pozice předcházející Juchelkovu pozdějšímu příslibu vymáhání z 27. 7.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-35** (1 ZDROJ, zdroje: SRC-22, subjekty: juchelka): Objem 63,8 mil. Kč ministerstvo přiznalo až po tříměsíčním naléhání novinářů na základě zákona o svobodném přístupu k informacím.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-36** (CITACE, zdroje: SRC-17, SRC-18, subjekty: juchelka): MPSV k projektům uvedlo: „Dotčené projekty jsou předmětem probíhajících administrativních a kontrolních postupů. V současné době probíhá jejich administrace v rámci Národního plánu obnovy a ministerstvo počítá s tím, že nebudou vykazovány vůči Evropské komisi.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-37** (CORROBORATED, zdroje: SRC-26, SRC-18, subjekty: juchelka): Ministerstvo počítá s úhradou vyřazených projektů ze státního rozpočtu, konkrétní suma ani rozpočtová kapitola však upřesněny nebyly.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-38** (CORROBORATED, zdroje: SRC-18, SRC-17, subjekty: juchelka): Poslanec Jiří Havránek (ODS) postavil Juchelku před alternativu: „Může a měl by podat trestní oznámení směrem k dané úřednici, nebo pokud o celé věci věděl… musí ve své pozici skončit.“
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-39** (CITACE, zdroje: SRC-23, subjekty: juchelka): Premiér Andrej Babiš k věci uvedl: „Pokud vznikne škoda, tak určitě pan ministr podá trestní oznámení.“ — tedy podmínil případné oznámení MPSV prokázáním škody.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-40** (1 ZDROJ, zdroje: SRC-18, subjekty: juchelka): Pavla Pivoňka Vaňková (STAN) po podání trestního oznámení uvedla, že očekává, že „orgány činné v trestním řízení prošetří a najde se ten, kdo za to bude zodpovídat“. Jde o ohlášené podání oznámení — nikoli o zahájení úkonů trestního řízení, obvinění ani odsouzení kohokoli.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-41** (CITACE, zdroje: SRC-21, subjekty: juchelka): Předseda STAN Vít Rakušan svůj krok odůvodnil slovy: „Na tenhle střet zájmů doplácí celá naše země.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-42** (CORROBORATED, zdroje: SRC-21, SRC-18, subjekty: juchelka): NKÚ v rámci své (správní, nikoli trestní) kontroly položil ministerstvu přímý dotaz: „Uveďte a zdůvodněte, zda MPSV zvažuje podat trestní oznámení na dotyčnou osobu“, a zajímal se také, zda se ministerští úředníci obrátili na policii.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-43** (1 ZDROJ, zdroje: SRC-21, subjekty: juchelka): NKÚ se ministerstva dále dotázal, zda bude vymáhat peníze po příjemcích dotací a z jakých zdrojů zaplatí projekty vyřazené z evropského financování.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-44** (1 ZDROJ, zdroje: SRC-21, subjekty: juchelka): Výsledky kontroly NKÚ (zahájené v červenci 2026, s dokončením kolem poloviny roku 2027) mají být podle FORUM 24 zveřejněny přibližně po letních prázdninách roku 2027. Jde o kontrolu správní povahy, nikoli o trestní řízení.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-45** (1 ZDROJ, zdroje: SRC-20, subjekty: juchelka): Odchod Semancové z MPSV byl podle Juchelky vzájemnou dohodou po jejím návratu z nemocenské; ministr uvedl, že „nechtěla riskovat ohrožení peněz z evropských fondů“ a že „bylo jí jasné, že by byla pořád terčem různých udání“. Semancová je zde uvedena pouze jako záznam pracovního vztahu k subjektu dossieru.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-46** (1 ZDROJ, zdroje: SRC-27, subjekty: juchelka): Komentátor Jiří Sezemský (Reflex) sečetl potenciální dopad na zhruba 82 milionů korun (64 mil. z Národního plánu obnovy plus dalších 18 mil. z OPZ+). Jde o autorský výpočet v komentáři, nikoli o oficiálně vyčíslenou škodu.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním

## Andrej Babiš — `andrej-babis` (54 tvrzení)

Per-dossier prismatic nástroje a výjimky: viz [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md#per-dossier-kroky).

- [ ] **CLM-01** (CORROBORATED, zdroje: SRC-01, SRC-27, subjekty: —): Vrchní soud v Praze dne 23. června 2025 zrušil zprošťující rozsudek Městského soudu v Praze z února 2024 nad Andrejem Babišem a Janou Nagyovou v kauze Čapí hnízdo; podle citovaného zdroje šlo již o druhé zrušení zprošťujícího verdiktu v této kauze
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-02** (1 ZDROJ, zdroje: SRC-01, subjekty: —): Odvolací soud dospěl k závěru, že zjištěné jednání naplňuje znaky dvou trestných činů, ale podle citovaného zdroje výslovně uvedl, že sám vinu vyslovit nemůže a věc pouze vrací soudu prvního stupně se závazným právním názorem. Zrušené zproštění není odsouzení
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-03** (1 ZDROJ, zdroje: SRC-01, subjekty: —): Oba obžalovaní vinu v kauze Čapí hnízdo odmítají
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-04** (1 ZDROJ, zdroje: SRC-02, subjekty: —): Babiš v únoru 2026 vložil veškeré akcie holdingu Agrofert do soukromého svěřenského fondu RSVP Trust poté, co získal souhlasy regulatorních orgánů tří členských států EU
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-05** (CITACE, zdroje: SRC-02, subjekty: —): Babiš uvedl: „Na společnost Agrofert, a. s., nemám žádný vliv ani z ní nemám a nebudu mít žádný prospěch. Plně jsem tak dostál nárokům českého a evropského práva v oblasti prevence střetu zájmů.“ — doloženo je, že to řekl, ne že to platí
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-06** (CITACE, zdroje: SRC-02, subjekty: —): Jmenovaní opoziční politici střet zájmů za vyřešený nepovažují: Zdeněk Hřib podle citovaného zpravodajství uvedl, že Babiš „nic nevyřešil“, Vít Rakušan mimo jiné to, že Babiš „veřejnosti lhal“ ohledně vlivu rodiny na Agrofert a odmítá zveřejnit dokumenty fondu, Matěj Ondřej Havel odkázal na zprávu Transparency International a Martin Kupka kritizoval nezveřejněné dokumenty; oslovený expert dodal, že Babiš může správce fondu odvolat
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-07** (CORROBORATED, zdroje: SRC-03, SRC-08, SRC-09, subjekty: —): Poslanecká sněmovna počátkem března 2026 nevydala Andreje Babiše k trestnímu stíhání v kauze Čapí hnízdo, jeho stíhání je proto přerušeno; nevydání je parlamentní procesní krok, ne zproštění obžaloby ani rozhodnutí o vině
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-08** (1 ZDROJ, zdroje: SRC-03, subjekty: —): Dne 4. května 2026 projednával Městský soud v Praze kauzu Čapí hnízdo potřetí, tentokrát ve věci Jany Nagyové; státní zástupce Jaroslav Šaroch pro ni navrhl tříletý podmíněný trest s pětiletou zkušební dobou a peněžitý trest 500 000 Kč — jde o návrh státního zástupce, ne o uložený trest
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-09** (1 ZDROJ, zdroje: SRC-03, subjekty: —): Podle téhož zdroje Jana Nagyová vinu odmítá a její obhajoba označila závazný pokyn odvolacího soudu za protiústavní a odporující trestnímu řádu; jde o stanovisko obhajoby, ne o posouzení soudu
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-10** (1 ZDROJ, zdroje: SRC-04, subjekty: —): Státní zemědělský intervenční fond rozhodl, že skupina Agrofert může opět čerpat dotace a účastnit se veřejných zakázek, a obnovil administraci jejích žádostí s účinností od 20. února 2026; rozhodnutí se opírá o externí právní analýzu, podle níž je vložení akcií do fondu RSVP Trust v souladu s národní i evropskou úpravou střetu zájmů
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-11** (1 ZDROJ, zdroje: SRC-04, subjekty: —): Podle téhož zdroje SZIF nebude zpětně vymáhat evropské nárokové dotace poskytnuté Agrofertu v letech 2017–2021, ukončil ale osm nenárokových podpor v objemu zhruba 68 milionů korun
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-12** (CITACE, zdroje: SRC-04, subjekty: —): Mluvčí Agrofertu Pavel Heřmanský k rozhodnutí uvedl, že právní analýzy „potvrzují, že vlastnické uspořádání Agrofertu umožňuje společnostem z koncernu ucházet se o dotace“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-13** (1 ZDROJ, zdroje: SRC-05, subjekty: —): Francouzská Národní finanční prokuratura (PNF) vede od 24. února 2022 předběžné vyšetřování kolem nákupu nemovitostí na jihu Francie pro podezření z daňového podvodu a praní peněz přes offshorové struktury; jde o předběžné vyšetřování, nikdo nebyl obviněn ani obžalován
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-14** (1 ZDROJ, zdroje: SRC-05, subjekty: —): Podle téhož zdroje prokuratura o zahájení stíhání dosud nerozhodla, protože čeká na předání vyšetřovacího spisu; podstatnou roli v dalším postupu hrají promlčecí lhůty, u daňového podvodu a praní peněz podle francouzského práva zpravidla šestileté
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-15** (CITACE, zdroje: SRC-05, subjekty: —): Andrej Babiš podle téhož zdroje odmítá jakékoli pochybení a tvrdí, že nákupy na jihu Francie proběhly v souladu se zákony
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-16** (1 ZDROJ, zdroje: SRC-06, subjekty: —): Andrej Babiš vložil v únoru 2017 akcie Agrofertu do svěřenských fondů AB private trust I a II v reakci na zpřísnění evropské úpravy střetu zájmů; v prosinci 2024 převedl zhruba 90 % podílu z prvního fondu zpět na sebe a 15. října 2025 byl ukončen druhý fond, čímž se stal opět jediným vlastníkem
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-17** (CITACE, zdroje: SRC-06, subjekty: —): Mluvčí Agrofertu Pavel Heřmanský k tomu podle citovaného zdroje uvedl, že „akcionář čestně prohlašuje, že je jediným akcionářem akciové společnosti Agrofert“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-18** (1 ZDROJ, zdroje: SRC-07, subjekty: —): Nejvyšší správní soud dne 28. listopadu 2025 zamítl kasační stížnost Kosteleckých uzenin ze skupiny Agrofert a potvrdil, že firma neměla nárok na dotaci z Programu rozvoje venkova, o kterou žádala v roce 2018, kvůli střetu zájmů tehdejšího premiéra Andreje Babiše
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-19** (1 ZDROJ, zdroje: SRC-07, subjekty: —): Podle téhož rozhodnutí lze nepřímý vliv vykonávat i prostřednictvím svěřenských fondů, takže vložení podílu do fondu samo o sobě střet zájmů neodstranilo; jde o výklad podmínek pro dotaci ve správním soudnictví, ne o rozhodnutí o trestní odpovědnosti
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-20** (CORROBORATED, zdroje: SRC-08, SRC-09, subjekty: —): Městský soud v Praze dne 4. května 2026 uznal spoluobžalovanou Janu Nagyovou nepravomocně vinnou z dotačního podvodu a poškození finančních zájmů EU a uložil jí tříletý podmíněný trest s pětiletou zkušební dobou a peněžitý trest 500 000 Kč; rozsudek není pravomocný, lze se proti němu odvolat a o vině Andreje Babiše soud v tomto řízení nerozhodoval
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-21** (CITACE, zdroje: SRC-08, subjekty: —): Předseda senátu Jan Šott při vyhlášení rozsudku podle citovaného zpravodajství uvedl: „Nadále jsme přesvědčeni, že paní obžalovaná Nagyová by neměla být odsouzena.“ — doloženo je, že to řekl
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-22** (CITACE, zdroje: SRC-09, subjekty: —): Andrej Babiš k rozsudku uvedl: „Je to skandální rozhodnutí a důkaz toho, že politického soupeře můžete stíhat na objednávku.“ a „Považuji to za ostudu české justice.“ — doloženo je, že tyto věty pronesl, ne že jejich obsah platí
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-23** (CITACE, zdroje: SRC-09, subjekty: —): Podle téhož zdroje Babiš dále uvedl: „Čapí hnízdo je politický proces, který měl vždy jediný cíl, a to znemožnit moji politickou kariéru.“ a „Soud si myslí, že je paní Nagyová nevinná, a odsoudí ji.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-24** (1 ZDROJ, zdroje: SRC-08, subjekty: —): Jana Nagyová se podle citovaného zpravodajství vyhlášení rozsudku neúčastnila a v závěrečné řeči vinu nadále odmítala
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-25** (1 ZDROJ, zdroje: SRC-10, subjekty: —): Evropská komise podle citovaného zpravodajství z 5. června 2026 potvrdila, že české úřady mohly obnovit administraci zemědělských dotací firmám ze skupiny Agrofert, ale sama dosud nic neproplatila; mluvčí Komise Louise Bogeyová uvedla: „K dnešnímu dni nebyly českým úřadům vyplaceny žádné náhrady týkající se Agrofertu.“
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-26** (1 ZDROJ, zdroje: SRC-11, subjekty: —): Podle popisu dopisu Evropské komise z 20. května 2026 v citovaném zpravodajství si Komise vyžádala potvrzení, že u operací vybraných od 9. prosince 2025 nebudou nárokovány k proplacení platby týkající se skupiny Agrofert ani dalších organizací spojených s Andrejem Babišem (jmenovitě SynBiol a Hartenberg Holding), dále právní posouzení struktury fondu RSVP Trust a informace o subjektech mimo ni, s lhůtou k odpovědi kolem 20. června 2026; jde o dotaz a pozastavené proplácení, ne o zjištění o něčí odpovědnosti
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-27** (1 ZDROJ, zdroje: SRC-12, subjekty: —): Evropská pověřená žalobkyně Daniela Bártíková vydala 24. května 2026 rozhodnutí o zahájení trestního řízení ve věci vyplácení evropských dotací skupině Agrofert a prověřováním pověřila Národní centrálu proti organizovanému zločinu; podezření se týkají poškození finančních zájmů EU, zneužití pravomoci úřední osoby a porušení povinnosti při správě cizího majetku
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-28** (1 ZDROJ, zdroje: SRC-12, subjekty: —): Řízení je podle téhož zdroje vedeno na neznámého pachatele, nikdo v něm k datu vydání zprávy není obviněn a Andrej Babiš v něm není uveden jako podezřelý; zahájení trestního řízení není obvinění ani rozhodnutí o vině
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-29** (1 ZDROJ, zdroje: SRC-12, subjekty: —): Podnětem k řízení bylo podle téhož zdroje trestní oznámení Pirátů z února 2026 k tvrzenému střetu zájmů premiéra; řízení pokrývá pouze evropské dotace, národní dotace do působnosti evropské prokuratury nespadají
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-30** (CITACE, zdroje: SRC-12, subjekty: —): Mluvčí Státního zemědělského intervenčního fondu Eva Češpiva k tomu podle téhož zdroje uvedla: „SZIF od Úřadu evropského veřejného žalobce ani od jiných orgánů činných v trestním řízení neobdržel žádnou oficiální výzvu ke spolupráci.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-31** (1 ZDROJ, zdroje: SRC-13, subjekty: —): Podle investigativního textu z projektu Pandora Papers byly nemovitosti na jihu Francie pořízeny přes řetězec společností BLAKEY FINANCE LIMITED (Britské Panenské ostrovy, založena 7. 8. 2009), BOYNE HOLDING LLC (Washington, D.C., 10. 8. 2009) a monacká SCP Bigaud (10. 8. 2009); Babiš podle textu vložil 17. 9. 2009 do BLAKEY FINANCE 15 milionů eur, které posloužily jako úvěr pro nákupy
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-32** (CITACE, zdroje: SRC-13, subjekty: —): Andrej Babiš k investicím ve Francii napsal 28. 7. 2013 na sociální síti: „Investujeme po Evropě. Po restauraci Paloma postavíme u Mougins hotel spa 5*“ — doloženo je, že to napsal
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-33** (1 ZDROJ, zdroje: SRC-13, subjekty: —): Podle téhož textu Babiš 13. 6. 2018 převedl svůj podíl 0,1 % v SCP Bigaud na Moniku Babišovou a od srpna 2019 je SCP Bigaud ze 100 % vlastněna společností I.M.O.D.I.M.; jde o záznam vlastnické změny, ne o tvrzení o pochybení kohokoli
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-34** (1 ZDROJ, zdroje: SRC-13, subjekty: —): Podle téhož textu poskytovatel offshore služeb ALCOGAL označil Babiše za vysoce rizikového klienta a v roce 2016 podal hlášení o podezřelé transakci s odkazem na dotační kauzu Čapí hnízdo; jde o interní hodnocení a hlášení soukromé firmy, ne o zjištění státního orgánu, obvinění ani rozhodnutí o vině
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-35** (1 ZDROJ, zdroje: SRC-14, subjekty: —): Podle oficiálního životopisu na webu Úřadu vlády se Andrej Babiš narodil 2. září 1954 v Bratislavě, v letech 1993–2014 byl zakladatelem a předsedou představenstva Agrofertu, od roku 2013 je poslancem, v letech 2014–2017 byl prvním místopředsedou vlády a ministrem financí a v letech 2017–2021 předsedou vlády; je členem hnutí ANO
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-36** (CORROBORATED, zdroje: SRC-08, SRC-09, SRC-12, subjekty: —): Andrej Babiš zastává k datu citovaného zpravodajství (květen až červenec 2026) úřad předsedy vlády České republiky
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-37** (1 ZDROJ, zdroje: SRC-15, subjekty: —): Podle údajů z majetkového přiznání podávaného do 30. června 2026 dostal Andrej Babiš v roce 2025 od Agrofertu dividendu 5 miliard korun v hrubém, po zdanění 4,25 miliardy, a to před vložením akcií holdingu do svěřenského fondu RSVP Trust v únoru 2026; výplata dividendy akcionáři je legální krok a citovaný zdroj netvrdí nic jiného
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-38** (CITACE, zdroje: SRC-15, subjekty: —): Babiš k tomu uvedl: „Předtím než jsem vložil firmu do fondu, mi byla vyplacena dividenda ve výši pěti miliard korun. Agrofert z toho zaplatil daň ve výši 750 milionů korun. Kdybych měl sídlo na Kypru, tak z toho stát neuvidí ani korunu.“ — doloženo je, že to řekl
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-39** (1 ZDROJ, zdroje: SRC-17, subjekty: —): Podle zpravodajství z 31. prosince 2025 Babiš oznámil, že do svěřenského fondu vloží pouze Agrofert; investiční společnost SynBiol s jeho podílem 87,75 %, fond Hartenberg a nemovitosti měly zůstat mimo fond. Prezident Petr Pavel jmenování podmínil vyřešením otázky střetu zájmů, zákonná lhůta byla 30 dnů od jmenování, tedy do 8. ledna 2026
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-40** (CITACE, zdroje: SRC-17, subjekty: —): K rozsahu vkladu do fondu Babiš podle téhož zdroje uvedl: „Týká se to jen Agrofertu“, a zdravotnické aktivity vysvětlil slovy: „Zdravotnické věci spadající pod SynBiol v rámci Hartenbergu fungují tak, že když si klient, občan České republiky, vybere reprodukční kliniku z této skupiny, tak ta automaticky dostává odpovídající částku ze zdravotního pojištění“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-41** (1 ZDROJ, zdroje: SRC-16, subjekty: —): Evropská komise podle své písemné reakce z 23. června 2026 sleduje otázku možného střetu zájmů i ve vztahu ke společnostem SynBiol a Hartenberg Holding, které byly od 9. prosince 2025 vybrány jako příjemci evropských prostředků, a požádala řídicí orgány, aby žádná žádost o platbu předložená Komisi neobsahovala výdaje spojené s těmito subjekty; jde o monitoring a pokyn, ne o zjištění o porušení pravidel
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-42** (1 ZDROJ, zdroje: SRC-16, subjekty: —): Podle veřejně dostupných informací, na které podle téhož zdroje upozornil europoslanec Tomáš Zdechovský, byl v únoru 2026 ověřen notářský zápis, na jehož základě se Babiš stal opět přímým vlastníkem SynBiolu; jde o výklad veřejných registrů, na který upozornil politik, ne o zjištění Evropské komise ani jiného orgánu
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-43** (1 ZDROJ, zdroje: SRC-19, subjekty: —): Podle závěrečné zprávy auditu Evropské komise z dubna 2021 jmenoval Babiš všechny činitele svěřenských fondů a může je odvolat, a proto oba fondy — a jejich prostřednictvím Agrofert — ovládá; dotace ze strukturálních fondů a Evropského sociálního fondu firmám skupiny jsou proto po 9. únoru 2017, kdy nabyla účinnosti novela zákona o střetu zájmů, podle auditorů neoprávněné a zpráva doporučila stoprocentní finanční opravu. Audit je kontrolní nástroj Komise, ne soud, a netýká se trestní odpovědnosti
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-44** (1 ZDROJ, zdroje: SRC-19, subjekty: —): Podle téhož zdroje Ministerstvo pro místní rozvoj se závěry auditu nesouhlasilo, přesto na žádost Evropské komise pozastavilo předkládání žádostí o platbu u projektů označených za problémové; Babiš závěry auditu odmítl
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-45** (1 ZDROJ, zdroje: SRC-18, subjekty: —): V tiskové zprávě Evropského parlamentu k plenární rozpravě z 19. května 2021 uvedl komisař Johannes Hahn, že na žádnou z operací dotčených auditem dosud nebyly vykázány žádné výdaje a že rozpočet EU „byl a zůstává plně chráněn“; poslanci požadovali přísnější kontrolní mechanismy. Rozprava a usnesení Parlamentu jsou politickým aktem, ne soudním zjištěním
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-46** (1 ZDROJ, zdroje: SRC-20, subjekty: —): Podle stanoviska organizace, která audit v roce 2018 podnětem iniciovala, obdržely české úřady 20. července 2022 dopis, podle kterého útvary Evropské komise považují audit číslo REGC414CZ0133 za uzavřený, protože všechna doporučení byla „plně a náležitě provedena“; uzavření auditu znamená provedení doporučení, nikoli zproštění ani zjištění, že ke střetu zájmů nedošlo
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-47** (1 ZDROJ, zdroje: SRC-21, subjekty: —): Ústavní soud dne 1. dubna 2026 odmítl ústavní stížnost Kosteleckých uzenin jako zjevně neopodstatněnou; podle odůvodnění Babiš v době výkonu funkce premiéra v letech 2017–2021 naplňoval znaky ovládající osoby Agrofertu majetkovým podílem i faktickým vlivem přes svěřenské fondy, a námitku podjatosti soud odmítl. Jde o rozhodnutí o nároku na dotaci ve správním soudnictví, ne o trestní odpovědnosti
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-48** (1 ZDROJ, zdroje: SRC-22, subjekty: —): Spornou podporou byla dotace z Programu rozvoje venkova z roku 2018 na inovaci technologie výroby masných výrobků, kterou nejprve schválil Státní zemědělský intervenční fond a následně ji zrušilo Ministerstvo zemědělství s odkazem na střet zájmů tehdejšího premiéra; podle citovaného zdroje se tento případ liší od jiných sporů skupiny, kde se firmy domáhaly zadržených dotací
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-49** (1 ZDROJ, zdroje: SRC-23, subjekty: —): Předmětem kauzy Čapí hnízdo je dotace 50 milionů korun na výstavbu areálu z let 2007–2008, kterou čerpala Farma Čapí hnízdo poté, co byla vyvedena ze skupiny Agrofert; sporné bylo, zda šlo o účelové vyvedení kvůli podmínce podpory pro malé a střední podniky
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-50** (1 ZDROJ, zdroje: SRC-23, subjekty: —): Městský soud v Praze dne 9. ledna 2023 zprostil Andreje Babiše i Janu Nagyovou obžaloby s odůvodněním, že skutek popsaný v obžalobě není trestným činem; rozsudek nebyl pravomocný a státní zástupce si ponechal lhůtu k odvolání
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-51** (1 ZDROJ, zdroje: SRC-24, subjekty: —): Týž soud dne 14. února 2024 oba obžalované zprostil znovu; podle odůvodnění netvořily nepřímé důkazy ucelený řetězec vyvracející obhajobu. Ani tento rozsudek nebyl pravomocný a státní zastupitelství avizovalo odvolání
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-52** (1 ZDROJ, zdroje: SRC-24, subjekty: —): Spornou dotaci 50 milionů korun firma podle citovaného zpravodajství vrátila již v roce 2018; jde o skutečnost o osudu peněz, nikoli o přiznání viny ani o vyvrácení obžaloby
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-53** (1 ZDROJ, zdroje: SRC-25, subjekty: —): Andrej Babiš podle analýzy z roku 2011 o ústeckou Setuzu dlouhodobě usiloval, firmu ale nezískal a vybudoval místo toho vlastní závod Preol na výrobu surovin pro biopaliva; citovaný zdroj neuvádí v souvislosti se Setuzou žádné jeho pochybení
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-54** (1 ZDROJ, zdroje: SRC-26, subjekty: —): Francouzská policie v květnu 2026 uzavřela vyšetřování nákupu nemovitostí na jihu Francie a případ převzala Národní finanční prokuratura (PNF), která má o dalším postupu rozhodnout do konce roku 2026; poté, co se Babiš koncem roku 2025 znovu stal předsedou vlády, získal podle francouzských pravidel imunitu, jež ho po dobu výkonu funkce chrání před případným stíháním ve Francii
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním

## Boris Šťastný — `boris-stastny` (39 tvrzení)

Per-dossier prismatic nástroje a výjimky: viz [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md#per-dossier-kroky).

- [ ] **CLM-01** (1 ZDROJ, zdroje: SRC-01, subjekty: stastny): Boris Šťastný zastává podle oficiálního profilu na webu Úřadu vlády funkci ministra pro sport, prevenci a zdraví
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-02** (CORROBORATED, zdroje: SRC-02, SRC-03, subjekty: —): Dne 22. ledna 2026 bylo při běžném úklidu v zasedací místnosti Úřadu vlády nalezeno nahrávací zařízení (AI rekordér), které několik týdnů zůstalo nevyzvednuté
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-03** (CITACE, zdroje: SRC-02, subjekty: —): Šťastný se k zařízení přihlásil jako ke svému osobnímu AI zapisovači: „Je to můj obyčejný AI rekordér, který používám k přepisu svých poznámek a vystoupení\", a uvedl, že o místě jeho uložení se dozvěděl až z článku
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-04** (1 ZDROJ, zdroje: SRC-02, subjekty: —): IT pracovníci vlády a bezpečnostní odbor zařízení posoudili a žádné bezpečnostní riziko nenašli; formální vyšetřování zpravodajskými službami ani ochrannou službou policie neproběhlo, protože o nálezu nebyly oficiálně informovány
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-05** (CITACE, zdroje: SRC-02, subjekty: —): Poslankyně Renáta Zajíčková (ODS) označila jeho reakci za „vysvětlování a krizovou komunikaci na pubertální úrovni\" a označila ho za bezpečnostní riziko; jde o politické hodnocení oponentky, ne o zjištění bezpečnostního orgánu
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-06** (CORROBORATED, zdroje: SRC-03, SRC-04, SRC-06, subjekty: stastny): Zaměstnanci Úřadu vlády našli 22. ledna 2026 při běžném úklidu v jednacím sále vlády ve Strakově akademii chytré nahrávací zařízení.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-07** (CORROBORATED, zdroje: SRC-03, SRC-04, SRC-05, subjekty: stastny): Šlo o přístroj značky Plaud ve formátu kreditní karty, který umožňuje nahrávat konverzace, odesílat je na internetové servery a pomocí umělé inteligence je převádět na text.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-08** (CORROBORATED, zdroje: SRC-05, SRC-06, subjekty: stastny): Podle Úřadu vlády bylo zařízení v době nálezu vypnuté a nebylo nijak ukryté, což úřad vyhodnotil jako zjevnou ztrátu, nikoli jako záměrné umístění.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-09** (CORROBORATED, zdroje: SRC-03, SRC-04, SRC-05, subjekty: stastny): Úřad vlády přístroj několik týdnů uschoval pro případ, že se o něj někdo přihlásí; teprve poté jej prověřili pracovníci IT spolu s bezpečnostním oddělením úřadu.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-10** (CORROBORATED, zdroje: SRC-03, SRC-04, SRC-05, SRC-06, subjekty: stastny): Ochranná služba policie ani zpravodajské služby (BIS, NÚKIB) nález oficiálně neprověřovaly, protože jim nebyl nahlášen — žádné formální bezpečnostní šetření tedy podle zveřejněných informací zahájeno nebylo.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-11** (CORROBORATED, zdroje: SRC-05, SRC-08, SRC-10, subjekty: stastny): Kauzu zveřejnil 10. července 2026 server Seznam Zprávy; Boris Šťastný se k zařízení veřejně přihlásil až po vydání tohoto článku.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-12** (CITACE, zdroje: SRC-03, SRC-04, SRC-05, subjekty: stastny): Boris Šťastný na síti X uvedl: „Je to totiž můj obyčejný AI záznamník, kterým si přepisuji své poznámky a projevy, který jsem si koupil v Alze a před pár měsíci jsem ho někde ztratil.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-13** (CITACE, zdroje: SRC-07, SRC-09, SRC-10, subjekty: stastny): Šťastný kauzu zlehčil ironickou poznámkou, že se „hluboce omlouvá“ redakci Seznam Zpráv, že jí „zkazil novou aféru Watergate“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-14** (CITACE, zdroje: SRC-07, subjekty: stastny): Na svou obhajobu Šťastný podle Blesku argumentoval otázkou, proč by si člen vlády nahrával jednání vlády, na němž sám sedí a z něhož existuje záznam, ke kterému má kdykoli přístup.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-15** (1 ZDROJ, zdroje: SRC-05, subjekty: stastny): Vedoucí Úřadu vlády Tünde Bartha uvedla, že v den nálezu přístroje vláda nezasedala a v dané místnosti neprobíhalo žádné jednání ve vyhrazeném režimu.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-16** (1 ZDROJ, zdroje: SRC-03, subjekty: stastny): Mluvčí Úřadu vlády Karla Mráčková uvedla, že v souvislosti s nálezem nevzniklo žádné bezpečnostní riziko.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-17** (1 ZDROJ, zdroje: SRC-08, subjekty: stastny): Podle zjištění Seznam Zpráv citovaných Bleskem se firma Plaud prezentuje jako americký startup se sídlem v Delaware, ale výrobcem zařízení je čínská společnost Shenzhen Smart Connect Technology.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-18** (CITACE, zdroje: SRC-07, SRC-08, subjekty: stastny): Bezpečnostní expert Andor Šándor k nálezu uvedl: „Takovéhle zařízení tam nemá co dělat. Nepřijde mi to úplně rozumné.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-19** (CITACE, zdroje: SRC-07, SRC-08, subjekty: stastny): Bezpečnostní expert Stanislav Kazbunda označil situaci za potenciálně závažný bezpečnostní incident a uvedl, že „mělo by se to hlásit bezpečnostním složkám, které se tím budou zabývat“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-20** (CITACE, zdroje: SRC-08, subjekty: stastny): K čínskému původu přístroje Šťastný uvedl: „Většina elektronických přístrojů nebo jejich součástek, se kterými všichni pracujeme, je vyrobená v Číně.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-21** (CITACE, zdroje: SRC-09, subjekty: stastny): Poslankyně ODS Renáta Zajíčková v reakci na kauzu ministrovi vzkázala: „Jste bezpečnostní riziko pro celou zemi“, a jeho krizovou komunikaci označila za komunikaci „na úrovni puberťáka“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-22** (CORROBORATED, zdroje: SRC-11, SRC-12, SRC-13, subjekty: stastny): Vláda na návrh ministra pro sport, prevenci a zdraví Borise Šťastného odvolala 16. prosince 2025 předsedu Národní sportovní agentury Ondřeje Šebka a člena Rady NSA Františka Horáka; jde o personální rozhodnutí vlády, nikoli o výsledek kontrolního či trestního řízení.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-23** (1 ZDROJ, zdroje: SRC-12, subjekty: stastny): Odvolání proběhlo den poté, co byla vláda jmenována prezidentem republiky (15. prosince 2025).
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-24** (CORROBORATED, zdroje: SRC-11, SRC-12, SRC-13, subjekty: stastny): Vedením Národní sportovní agentury byl po odvolání Šebka pověřen dosavadní místopředseda Rady NSA Ivo Jebousek.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-25** (CITACE, zdroje: SRC-11, SRC-12, SRC-13, subjekty: stastny): Premiér Andrej Babiš odvolání odůvodnil slovy: „Pan předseda si z toho udělal cestovní kancelář a my si myslíme, že peníze mají dostávat hlavně naše děti, které určitě rády sportují.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-26** (CITACE, zdroje: SRC-14, subjekty: stastny): Ministr Šťastný uvedl jako důvody odvolání „určité důvody, které se týkají především využívání svěřených prostředků“, „střet zájmů řady členů poradního orgánu“ a „nejrůznější zahraniční cesty, které byly obtížně obhajitelné ze strany vedení, například do Japonska a dalších exotických destinací“; podle něj bylo potřeba „změnit trenéra“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-27** (CORROBORATED, zdroje: SRC-14, SRC-15, subjekty: stastny): Šťastný v souvislosti s odvoláním ohlásil interní audit Národní sportovní agentury a řešení střetu zájmů jejího poradního orgánu.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-28** (CITACE, zdroje: SRC-11, SRC-12, subjekty: stastny): Odvolaný Ondřej Šebek uvedl, že jej odvolání překvapilo („Určitě jsem to nečekal, protože jsme byli v nějaké pracovní komunikaci s panem ministrem.“), kritiku označil za osobní a účelovou, své zahraniční cesty hájil jako součást sportovní diplomacie a ke střetu zájmů uvedl: „Já tam ale žádný střet zájmů nevidím.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-29** (1 ZDROJ, zdroje: SRC-11, subjekty: stastny): Bývalý premiér Petr Fiala (ODS) po odvolání označil práci Ondřeje Šebka v čele NSA za skvělou a profesionální.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-30** (1 ZDROJ, zdroje: SRC-15, subjekty: stastny): Novým předsedou Národní sportovní agentury byl 26. ledna 2026 jmenován Karel Kovář, dosavadní náměstek ústředního školního inspektora; ministr Šťastný jako jeho hlavní úkol označil kontrolu dotací a stanovení jasných pravidel jejich rozdělování.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-31** (CITACE, zdroje: SRC-15, subjekty: stastny): Předseda České unie sportu Jan Boháč jmenování Kováře uvítal s tím, že „agentura je ode dneška opět akceschopná“ a že nový předseda má sportovní i školské prostředí dobře načtené.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-32** (1 ZDROJ, zdroje: SRC-17, subjekty: stastny): Příspěvek, který Šťastný zveřejnil 22. června 2026 v 17:47 na síti X, měl podle Tiscali 177 lajků, 30 repostů, 184 odpovědí a 9 290 zobrazení.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-33** (CORROBORATED, zdroje: SRC-16, SRC-17, subjekty: stastny): Grafická karta téhož příspěvku, kterou ministrův tým následně sdílel na Facebooku a Instagramu, uváděla 1 743 lajků, 18 sdílení, 242 odpovědí a 65 500 zobrazení.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-34** (CORROBORATED, zdroje: SRC-16, SRC-18, subjekty: stastny): Na rozpor mezi oběma sadami čísel upozornil jako první server NašeTéma.cz na základě podnětu čtenáře; kauzu následně veřejně šířil europoslanec Tomáš Zdechovský (KDU-ČSL).
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-35** (CITACE, zdroje: SRC-16, subjekty: stastny): Odborník na sociální sítě Daniel Dočekal konstatoval, že příspěvek „vykazuje znaky manipulace“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-36** (CITACE, zdroje: SRC-16, SRC-18, subjekty: stastny): Šťastný postup vysvětlil takto: „Tým, který se mi stará o sítě, mne informoval, že takový postup zvolil proto, že příspěvky na všech třech sociálních sítích jsou vydávány prakticky ve stejný čas“; uvedená čísla podle něj sloužila jen jako vizuální prvek ke zvýšení čitelnosti příspěvku.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-37** (CORROBORATED, zdroje: SRC-17, SRC-18, subjekty: stastny): Šťastný později připustil, že vizuál „mohl být zavádějící“, omluvil se a vydal podle svého vyjádření důrazný pokyn, aby se v příštích příspěvcích nepoužívaly grafické prvky zachycující jakékoli metriky.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-38** (CITACE, zdroje: SRC-18, subjekty: stastny): Předseda STAN Vít Rakušan na ministrovo vysvětlení reagoval slovy: „Lžím a podvodům se teď bude říkat ‚stylizace‘.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-39** (CITACE, zdroje: SRC-18, subjekty: stastny): TOP 09 kauzu komentovala slovy: „Ministr Šťastný fejkuje lajky, tak doufáme, že aspoň nefejkuje těch 10 tisíc kroků“; Tomáš Zdechovský (KDU-ČSL) ji označil za „neuvěřitelnou ostudu ministra Šťastného“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný

## Igor Červený — `igor-cerveny` (57 tvrzení)

Per-dossier prismatic nástroje a výjimky: viz [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md#per-dossier-kroky).

- [ ] **CLM-01** (1 ZDROJ, zdroje: SRC-01, subjekty: cerveny): Igor Červený zastává podle oficiálního profilu na webu Úřadu vlády funkci ministra životního prostředí
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-02** (CORROBORATED, zdroje: SRC-02, SRC-03, subjekty: cerveny): Igor Červený neuvedl ve vstupním majetkovém přiznání (oznámení podle zákona o střetu zájmů) spoluvlastnictví rodinného domu se zahradou ve středočeských Bobnicích v hodnotě 11,4 milionu korun.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-03** (CORROBORATED, zdroje: SRC-02, SRC-03, subjekty: cerveny): Zhruba měsíc po zvolení poslancem (do Sněmovny zvolen 4. října 2025) převedl Červený dům dohodou o vypořádání společného jmění na manželku; spoluvlastníkem byl i v den zvolení.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-04** (CORROBORATED, zdroje: SRC-02, SRC-03, subjekty: cerveny): Podle Blesku si Červený při převodu domu na manželku ponechal bezúplatné doživotní užívací právo; podle Seznam Zpráv na ni převedl také dva bankovní účty a osobní auto.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-05** (CORROBORATED, zdroje: SRC-02, SRC-03, subjekty: cerveny): Ministerstvo spravedlnosti po obsahové kontrole postoupilo Červeného oznámení přestupkovému orgánu — Městskému úřadu v Nymburce; pokud by se přestupek prokázal, hrozí pokuta do 50 000 Kč. Nešlo o uloženou sankci, ale o zahájené prověřování.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-06** (CITACE, zdroje: SRC-02, subjekty: cerveny): Červený nejprve trval na správnosti přiznání, později chybu připustil slovy: 'Spletl jsem se v termínech, domníval jsem se, že se vypisuje majetek ke dni podání, nikoliv zahájení funkce.'
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-07** (1 ZDROJ, zdroje: SRC-04, subjekty: cerveny): Podle Ekolistu (22. 6. 2026) Červený následně podal opravné oznámení a zaplatil pokutu 7 500 Kč za neúplnost původního přiznání; z článku neplyne, že by řízení bylo formálně pravomocně uzavřeno.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-08** (CORROBORATED, zdroje: SRC-05, SRC-06, subjekty: cerveny): Červený byl při nástupu do vlády jednatelem a spolumajitelem podcastové společnosti Extreme BFG Cast; zákon o střetu zájmů veřejným funkcionářům působení ve vedení firem zakazuje a ukládá ukončit je nejpozději do 30 dnů od nástupu do funkce.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-09** (1 ZDROJ, zdroje: SRC-06, subjekty: cerveny): Podle Hospodářských novin (citovaných ČTK/Ekolistem) Červený svůj podíl v Extreme BFG Cast prodal spoluvlastníkovi Luboru Novákovi — předsedovi jihomoravských Motoristů a podnikateli, který je zároveň Červeného poslaneckým asistentem.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-10** (CITACE, zdroje: SRC-06, subjekty: cerveny): Červený 23. února 2026 novinářům prohlásil, že střet zájmů 'má vyřešený' a že se změna 'nejspíše tento týden' propíše do rejstříku.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-11** (1 ZDROJ, zdroje: SRC-07, subjekty: cerveny): Ministerstvo životního prostředí plánuje stavební úpravy sekretariátu a nové ministrovy pracovny za až 3 miliony korun (bourání příček, demontáže, nátěry, tapetování, nové koberce).
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-12** (1 ZDROJ, zdroje: SRC-07, subjekty: cerveny): Červený nesídlí v původní ministerské kanceláři — tu užívá poslanec Filip Turek (Motoristé); Červený si jako pracovnu zvolil místnost po vrchním řediteli v nezabezpečené části budovy.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-13** (CITACE, zdroje: SRC-08, SRC-09, subjekty: cerveny): Červený tvrdí, že přesun z ministerské kanceláře byl jeho vlastní volbou (jižní strana, 'celý den sluníčko', výhled na stadion Slavie), a popírá, že by úpravy dělal kvůli Turkovi: 'Kancelář ministra je ta, ve které sedí ministr.'
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-14** (1 ZDROJ, zdroje: SRC-08, subjekty: cerveny): Červený rekonstrukci hájí havarijním stavem budovy převzaté po předchůdci (plíseň, zatékání ze střechy); úprava jeho vlastní kanceláře má podle něj stát 250–300 tisíc Kč, smlouva zahrnuje mj. stoly za 40 tisíc a koženou pohovku za 65 tisíc Kč.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-15** (1 ZDROJ, zdroje: SRC-07, subjekty: cerveny): Exministr životního prostředí Petr Hladík (KDU-ČSL) rekonstrukci kritizoval jako vyhazování veřejných peněz s poukazem na nedávné renovace budovy.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-16** (CORROBORATED, zdroje: SRC-10, SRC-16, subjekty: cerveny): Červený strávil v červenci 2026 deset dní na cestě po USA, během níž navštívil národní parky Yosemite a Sequoia; oficiálním cílem byla příprava podzimní obchodní mise a seznámení se systémem prevence a zvládání lesních požárů; delegace jednala i se společností Meta o využití AI pro ochranu životního prostředí.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-17** (CITACE, zdroje: SRC-10, SRC-16, subjekty: cerveny): Červený odmítl sdělit podrobnosti o jednáních a složení delegace na cestě do USA a novinářské dotazy (Deníku N) označil za 'útok na zájmy České republiky'.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-18** (1 ZDROJ, zdroje: SRC-10, subjekty: cerveny): Podle Blesku (s odkazem na zjištění Deníku N) byl členem delegace v USA šéf komunikace Motoristů Lukáš Koutník; ministr nevysvětlil, proč byl v delegaci, ani zda jeho cestu hradil úřad.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-19** (1 ZDROJ, zdroje: SRC-10, subjekty: cerveny): Během cesty po USA Červený v rozhovoru pro Fox News ostře kritizoval klimatickou politiku EU a Green Deal, varoval před ohrožením průmyslu a pochválil prezidenta Trumpa.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-20** (1 ZDROJ, zdroje: SRC-14, subjekty: cerveny): Ministerstvo spravedlnosti provedlo obsahovou kontrolu ministrova oznámení „na základě žádosti o součinnost ze strany Městského úřadu Nymburk“ — podnět tedy nevznikl na ministerstvu, ale úřad si k již vedené věci vyžádal odbornou součinnost.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-21** (1 ZDROJ, zdroje: SRC-13, subjekty: cerveny): Ministerstvo spravedlnosti postoupilo věc přestupkovému orgánu 22. dubna 2026; veřejně se o tom informovalo až 6. května 2026.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-22** (CORROBORATED, zdroje: SRC-11, SRC-12, subjekty: cerveny): Ministr své pochybení vysvětlil tak, že „došlo z mé strany k nesprávnému výkladu jedné procesní skutečnosti“ a že „chybně jsem vycházel z předpokladu, že rozhodným obdobím je datum nabytí funkce, nikoliv datum podání oznámení“.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-23** (CORROBORATED, zdroje: SRC-12, SRC-14, subjekty: cerveny): Ministerstvo spravedlnosti trvá na výkladu, že „veškerý oznamovaný majetek, činnosti a závazky musejí se vztahovat ke dni předcházejícímu tomu, než veřejný funkcionář vstoupil do funkce“ — tedy opačně, než jak postupoval ministr.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-24** (1 ZDROJ, zdroje: SRC-14, subjekty: cerveny): Dohoda o vypořádání společného jmění s manželkou nezahrnovala jen dům v Bobnicích, ale také bankovní účty a automobil.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-25** (CORROBORATED, zdroje: SRC-14, SRC-15, subjekty: cerveny): Poslanecký mandát získal Červený 4. října 2025; vypořádání společného jmění s manželkou uzavřel měsíc poté.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-26** (1 ZDROJ, zdroje: SRC-11, subjekty: cerveny): O podání opravného oznámení a úhradě pokuty 7 500 Kč informoval ministr 22. června 2026 prostřednictvím zástupkyně mluvčí resortu Kateřiny Pacíkové; žádný z dohledaných článků neuvádí, že by rozhodnutí přestupkového orgánu nabylo právní moci ani že by řízení bylo formálně skončeno.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-27** (1 ZDROJ, zdroje: SRC-24, subjekty: cerveny): Na tiskové konferenci 16. února 2026 Červený k jednatelství v podcastové firmě řekl: „Vyřeším to tak, jak to zákon nařizuje“ a „Je to jediná firma, ve které mám malý podíl.“
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-28** (CORROBORATED, zdroje: SRC-24, SRC-26, subjekty: cerveny): Druhým jednatelem Extreme BFG Cast byl Lubor Novák, funkcionář jihomoravských Motoristů a dlouhodobý sponzor strany, kterého si Červený vzal jako poslaneckého asistenta do Sněmovny.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-29** (1 ZDROJ, zdroje: SRC-28, subjekty: cerveny): Lubor Novák a jeho firma poskytli Motoristům dar ve výši 400 tisíc korun; jako asistent Červeného pracuje od října 2025 a má díky tomu přístup do Sněmovny.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-30** (1 ZDROJ, zdroje: SRC-24, subjekty: cerveny): Lubor Novák je podle Novinek také členem představenstva společnosti Hemmont, kterou vlastní čínská Hammerton Capital Co. Limited se sídlem v Hongkongu.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-31** (CORROBORATED, zdroje: SRC-25, SRC-27, subjekty: cerveny): Dne 23. února 2026 Červený před jednáním vlády prohlásil: „Já žádný nemám, už je to vyřešené. Nejspíše tento týden se to propíše v rejstříku, už je to pryč.“
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-32** (CORROBORATED, zdroje: SRC-26, SRC-28, subjekty: cerveny): Podcastová společnost Extreme BFG Cast podle dostupného zpravodajství dosud nebyla podnikatelsky aktivní a její výsledky nejsou známé.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-33** (1 ZDROJ, zdroje: SRC-26, subjekty: cerveny): Situaci kolem ministrova střetu zájmů s ním podle Ekonomického deníku řešil prezident Petr Pavel; v dohledaných textech není uveden žádný konkrétní podatel formálního podnětu.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-34** (1 ZDROJ, zdroje: SRC-21, subjekty: cerveny): Už 26. února 2026 Deník N popsal, že Červený neusedl do ministerské kanceláře a pracuje z menšího prostoru po vedoucí sekretariátu; ministerskou pracovnu si ponechal vládní zmocněnec Filip Turek.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-35** (1 ZDROJ, zdroje: SRC-20, subjekty: cerveny): Ještě 18. května 2026, tedy téměř tři měsíce po nástupu ministra, uváděl Deník N, že ve skutečné ministerské pracovně dál sedí Filip Turek.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-36** (1 ZDROJ, zdroje: SRC-20, subjekty: cerveny): Ministerstvo objednalo do ministrovy nové pracovny nábytek od pražské společnosti Space Plan: dva výškově nastavitelné pracovní stoly s paravánem, dva kontejnery, dvoumístnou pohovku, dvě křesla a akustický panel.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-37** (CORROBORATED, zdroje: SRC-22, SRC-23, subjekty: cerveny): Veřejná zakázka na úpravy byla zveřejněna v pátek 31. května 2026 a zahrnuje bourání příček, demontáž skříní, vybourání otvoru v ocelové zdi, odstranění keramické dlažby a starých tapet, malování, nátěry topení, tapetování a nové koberce.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-38** (CORROBORATED, zdroje: SRC-22, SRC-23, subjekty: cerveny): Filip Turek k úpravám uvedl: „V mé kanceláři se řeší pouze nutné technické úpravy, případně opravy. Nic zásadního není v plánu,“ a připustil jedinou bezpečnostní úpravu — dvojité dveře do své kanceláře.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-39** (CORROBORATED, zdroje: SRC-22, SRC-23, subjekty: cerveny): Nová kancelář ministra po vrchním řediteli se nachází v nezabezpečené části budovy; Červený volbu zdůvodňoval mimo jiné lepším světlem a výhledem na stadion Eden.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-40** (1 ZDROJ, zdroje: SRC-23, subjekty: cerveny): Resort se hájil tím, že limit tří milionů korun se vztahuje k úpravám celého objektu včetně záchodů, sprch a oprav kanalizace, nikoli jen ministrovy pracovny.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-41** (1 ZDROJ, zdroje: SRC-20, subjekty: cerveny): Kancelář, kterou si ministr nechává upravovat, prošla rekonstrukcí teprve dva roky předtím.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-42** (1 ZDROJ, zdroje: SRC-22, subjekty: cerveny): Podle Fora 24 plánuje Turek na ministerstvu také novou kantýnu.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-43** (1 ZDROJ, zdroje: SRC-29, subjekty: cerveny): K 1. dubnu 2026 vzniklo na MŽP samostatné oddělení klimatické politiky a Green Dealu se čtyřmi novými pozicemi včetně vedoucího a asistentky; Červený odmítl, že by šlo o sekretariát vládního zmocněnce: „Nejedná se o sekretariát, ale o odborné oddělení… rozhodně se nepočítá s tím, že by v jeho čele stál vládní zmocněnec.“
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-44** (CORROBORATED, zdroje: SRC-30, SRC-31, subjekty: cerveny): Vedoucím tohoto oddělení se stal Lukáš Vaverka, bývalý poradce Filipa Turka v Evropském parlamentu a člen jeho Jaguar klubu; oddělení má být zmocněnci nápomocné.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-45** (CORROBORATED, zdroje: SRC-30, SRC-31, subjekty: cerveny): Vaverka má pouze bakalářský titul, ačkoli pozice vyžaduje minimálně magisterské vzdělání; ministerstvo mu udělilo výjimku.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-46** (1 ZDROJ, zdroje: SRC-31, subjekty: cerveny): Podle Ekonews Vaverka od roku 2007 pracoval v autodílně Art of Performance vlastněné Filipem Turkem.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-47** (1 ZDROJ, zdroje: SRC-29, subjekty: cerveny): Při systemizaci k dubnu 2026 resort zrušil 38 míst (Deník N uváděl 53 pozic — 42 služebních a 11 pracovních) a zanikla oddělení financování Nové zelené úsporám, Národního plánu obnovy, Modernizačního fondu, Sociálně klimatického fondu a oddělení zaměřená na dekarbonizaci.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-48** (1 ZDROJ, zdroje: SRC-32, subjekty: cerveny): Při sněmovních interpelacích 25. června 2026 čelil Červený výtkám kvůli personálním změnám; poté, co uvedl, že z resortu odešli „mladí lidovci, kteří tam pracovali na sociálních sítích“, se za výrok omluvil s tím, že nebyl šťastný a nezakládal se na pravdě.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-49** (CORROBORATED, zdroje: SRC-18, SRC-16, subjekty: cerveny): Cesta byla oficiálně avizována tiskovou zprávou MŽP z 10. července 2026 pouze jako vystoupení na High-Level Political Forum OSN v New Yorku 13. července; podle Deníku N ministr posléze strávil v USA deset dní a kompletní program nezveřejnil.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-50** (1 ZDROJ, zdroje: SRC-19, subjekty: cerveny): Fórum OSN, kvůli němuž ministr do USA odletěl, probíhalo 7.–16. července 2026 v New Yorku.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-51** (CORROBORATED, zdroje: SRC-18, SRC-19, subjekty: cerveny): Podle avíza resortu tvořili delegaci kromě ministra také zástupci Ministerstva pro místní rozvoj (a podle tiskové zprávy MŽP i mladí lidé z programu Youth2030); mluvčí Motoristů Lukáš Koutník v oficiálním avízu uveden nebyl.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-52** (1 ZDROJ, zdroje: SRC-18, subjekty: cerveny): MŽP avizovalo ministrovu účast v panelu iniciativy „Trade Over Aid“, kterou pořádají Spojené státy, a na akci „Powering Participation: Youth2030 and the Pact in Action“.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-53** (1 ZDROJ, zdroje: SRC-18, subjekty: cerveny): Resort v tiskové zprávě zdůraznil, že ČR je v plnění Cílů udržitelného rozvoje na 10. místě ze 169 hodnocených zemí.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-54** (CORROBORATED, zdroje: SRC-18, SRC-19, subjekty: cerveny): Návštěva národních parků Yosemite a Sequoia byla podle oficiálního avíza naplánována až po skončení politického fóra; deklarovaným cílem bylo seznámit se s americkým systémem prevence a zvládání lesních požárů.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-55** (1 ZDROJ, zdroje: SRC-19, subjekty: cerveny): Ministr k cestě uvedl: „Mým cílem je se nyní v amerických národních parcích seznámit s komplexním systémem prevence a zvládání lesních požárů, který je dlouhodobě u těchto národních parků považován za jeden z nejvyspělejších na světě.“
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-56** (1 ZDROJ, zdroje: SRC-17, subjekty: cerveny): Podle Blesku se ministr v USA sešel se zástupci společnosti Meta a jednal o využití umělé inteligence pro ochranu životního prostředí; cesta měla rovněž připravit půdu pro podzimní obchodní misi ČR.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-57** (CORROBORATED, zdroje: SRC-16, SRC-17, subjekty: cerveny): Ani ministr, ani resort do doby publikace dohledaných článků nezveřejnili, kdo cestu hradil, ani zda ministerstvo platilo cestu mluvčímu Motoristů Lukáši Koutníkovi.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet

## Ivan Bednárik — `ivan-bednarik` (47 tvrzení)

Per-dossier prismatic nástroje a výjimky: viz [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md#per-dossier-kroky).

- [ ] **CLM-01** (1 ZDROJ, zdroje: SRC-01, subjekty: bednarik): Ivan Bednárik zastává podle oficiálního profilu na webu Úřadu vlády funkci ministra dopravy
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-02** (CORROBORATED, zdroje: SRC-02, SRC-29, subjekty: —): Ivan Bednárik dne 15. února 2022 rezignoval na funkci generálního ředitele Českých drah slovy „Dnes jsem se rozhodl využít práva na rezignaci.\"; z představenstva tehdy odešli také Václav Nebeský a Petr Pavelec
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-03** (CITACE, zdroje: SRC-02, subjekty: —): Konkrétní důvody rezignace Bednárik veřejně neuvedl; podle citovaného zdroje je „podrobně vysvětlil dozorčí radě\" a dodal, že „další spekulace o mém odchodu Českým drahám škodí\"
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-04** (CITACE, zdroje: SRC-02, subjekty: —): Tehdejší ministr dopravy Martin Kupka odcházejícímu řediteli poděkoval za pokračující obnovu vozového parku a uvedl, že nový šéf „musí být silný manažer, který stabilizuje provoz Českých drah\"
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-05** (1 ZDROJ, zdroje: SRC-03, subjekty: bednarik): V prosinci 2025 Bednárik jako ministr dopravy označil finance a rozpočet SFDI na rok 2026 a léta 2027–2029 za „absolutní prioritu“; podle kritiků citovaných Ekonomickým deníkem chybělo v návrhu rozpočtu na krytí plánovaných výdajů 37,2 miliardy korun.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-06** (CITACE, zdroje: SRC-03, subjekty: bednarik): K cenám na vysokorychlostních tratích Bednárik v prosinci 2025 řekl: „Neumím si představit, že by někdo v Čechách platil 1500 korun za lístek mezi Brnem a Prahou.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-07** (CITACE, zdroje: SRC-04, subjekty: bednarik): V únoru 2026 Bednárik uvedl, že výstavba vysokorychlostních tratí v plném plánovaném rozsahu by stála 100 miliard korun ročně z národních zdrojů, a odmítl takové navýšení státního dluhu: „Sto miliard navíc ročně nevím, odkud bychom vzali. Přestaneme platit učitele, nebo zavřeme nemocnice?“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-08** (1 ZDROJ, zdroje: SRC-04, subjekty: bednarik): Podle Echo24 Bednárik deklaroval, že vláda bude z programu vysokorychlostních tratí stavět jen to, na co budou prostředky, s prioritou páteřního spojení Praha–Brno–Ostrava a mezinárodních návazností, v závislosti na podmínkách kofinancování EU očekávaných v létě 2026.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-09** (1 ZDROJ, zdroje: SRC-05, subjekty: bednarik): V dubnu 2026 Bednárik uvedl, že rozpočet SFDI na rok 2026 činí 169,3 miliardy korun (meziročně o 9 miliard více) a že prioritou je stabilní financování bez „slibů bez krytí“, dokončování rozestavěných staveb a kombinace národních zdrojů s prostředky EU („musíme stavět rychle, kvalitně a levně“).
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-10** (CITACE, zdroje: SRC-06, subjekty: bednarik): V květnu 2026 Bednárik v podcastu Hospodářských novin prohlásil: „Problém české železnice byl, že s penězi nebyl problém. A to se dostalo do její DNA,“ a avizoval záměr železniční trh „chladit“, tedy brzdit další masivní investice; nákupy vlaků za desítky miliard při jednotkových nákladech v řádu stovek korun za kilometr jízdy podle něj nejsou dlouhodobě udržitelné.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-11** (CORROBORATED, zdroje: SRC-07, SRC-08, subjekty: bednarik): Rozpočet SFDI na rok 2026, který Bednárik obhajoval, přidělil Ředitelství silnic a dálnic 81,1 miliardy korun a Správě železnic 72,2 miliardy korun; Ředitelství vodních cest získalo 1,3 miliardy.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-12** (CORROBORATED, zdroje: SRC-22, SRC-07, subjekty: bednarik): Podle rozpočtu SFDI na rok 2026 vzrostl objem prostředků pro Správu železnic o 9,5 miliardy korun oproti roku 2025.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-13** (1 ZDROJ, zdroje: SRC-07, subjekty: bednarik): Rozpočet SFDI 2026 se skládal ze 119,5 miliardy investičních a 49,8 miliardy neinvestičních výdajů, přičemž 144 miliard tvořily národní zdroje a 25,3 miliardy fondy EU.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-14** (1 ZDROJ, zdroje: SRC-23, subjekty: bednarik): Bednárik shrnul rozpočet dopravních staveb na rok 2026 do tří principů, které označil jako realismus, prioritizaci a efektivitu.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-15** (1 ZDROJ, zdroje: SRC-07, subjekty: bednarik): Po schválení rozpočtu Sněmovnou Bednárik avizoval zahájení staveb začátkem dubna 2026 a jmenovitě uvedl modernizaci železničního uzlu Hradec Králové vedle dálničního úseku D11 Jaroměř–Trutnov.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-16** (1 ZDROJ, zdroje: SRC-16, subjekty: bednarik): Bednárik označil zděděný návrh rozpočtu za problematický s tím, že naplánovat na straně výdajů o 37 miliard větší rozpočet je podle něj opravdu divné, a přirovnal situaci k dárku, který by od předchůdce nepřivítal.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-17** (1 ZDROJ, zdroje: SRC-16, subjekty: bednarik): Bednárik varoval, že každé narušení stability podniku jako Správa železnic může ohrozit čerpání evropských prostředků, a rozpočtové provizorium označil za menší zlo oproti nucenému propouštění u stavebních firem.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-18** (1 ZDROJ, zdroje: SRC-14, subjekty: bednarik): Ministerstvo dopravy pod Bednárikovým vedením oznámilo v únoru 2026 reformu Správy železnic s vyčíslenými ročními úsporami 335,6 milionu korun, zahrnující centralizaci 21 oblastních provozních jednotek pod dispečerská pracoviště v Praze a Přerově a zrušení 121 řídicích pozic bez dopadu na provozní zaměstnance.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-19** (1 ZDROJ, zdroje: SRC-14, subjekty: bednarik): Součástí ohlášených změn v zadávání zakázek Správy železnic bylo odstranění kvalifikačních bariér pro dodavatele, dělení zakázek na profesní části, větší transparentnost cen a širší využití principu Design & Build.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-20** (1 ZDROJ, zdroje: SRC-08, subjekty: bednarik): Po sto dnech ve funkci Bednárik uvedl, že opatření ke zefektivnění u Správy železnic přinesla úspory v řádu stovek milionů korun na jednotlivých projektech, což podle něj umožňuje opravit více kilometrů tratí.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-21** (1 ZDROJ, zdroje: SRC-09, subjekty: bednarik): Podle aktualizace přípravy VRT předložené vládou v dubnu 2026 měla Správa železnic v témže roce investovat do vysokorychlostních tratí 1,49 miliardy korun, z toho 0,96 miliardy z národních zdrojů a 0,53 miliardy z dotací EU.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-22** (1 ZDROJ, zdroje: SRC-09, subjekty: bednarik): Podle dubnové aktualizace přechází trať RS 42 Kralupy nad Vltavou–Most do útlumové fáze a osa RS 5 směrem na Hradec Králové se pozastavuje ve prospěch kapacitních úprav konvenční sítě, například zttrojkolejnění a modernizací.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-23** (1 ZDROJ, zdroje: SRC-09, subjekty: bednarik): U úseku VRT Moravská brána mezi Brodkem u Přerova, Ostravou a Katovicemi ministerstvo zvažuje zapojení soukromého kapitálu formou PPP.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-24** (1 ZDROJ, zdroje: SRC-09, subjekty: bednarik): Dokončení základní páteřní sítě VRT je cíleno na rok 2040 a závisí na rozhodnutí o spolufinancování z EU očekávaném na podzim 2026.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-25** (CORROBORATED, zdroje: SRC-09, SRC-10, subjekty: bednarik): Bednárik potvrdil jako prioritu páteřní osu Drážďany–Praha–Brno–Ostrava–Katovice a odklad hraničních úseků, přičemž v první fázi se má stavět úsek z Prahy do Světlé nad Sázavou.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-26** (1 ZDROJ, zdroje: SRC-15, subjekty: bednarik): Bednárik prohlásil, že vysokorychlostní tratě Česko postaví jen s výraznou podporou z unijních fondů, a jednal o tom v Bruselu s šéfkou generálního ředitelství DG MOVE Magdou Kopczyńskou.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-27** (1 ZDROJ, zdroje: SRC-11, subjekty: bednarik): Bednárik jednal v březnu 2026 s německým spolkovým ministrem dopravy Patrickem Schneiderem o Krušnohorském tunelu o délce zhruba 30 kilometrů, z toho 12 kilometrů na českém území, se zahájením stavby plánovaným na rok 2030 a provozem od roku 2042.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-28** (1 ZDROJ, zdroje: SRC-11, subjekty: bednarik): Bednárik zdůraznil, že význam Krušnohorského tunelu nespočívá jen v provozu rychlých osobních vlaků rychlostí až 200 km/h, ale také v navýšení kapacity pro nákladní dopravu.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-29** (1 ZDROJ, zdroje: SRC-22, subjekty: bednarik): Rozpočet SFDI na rok 2026 podle odborného tisku předpokládal zpomalení nebo odklad přípravy u řady železničních staveb, mimo jiné Kolín–Děčín, Přerov–Ostrava, hraničního úseku Plzeň–Domažlice, Praha–Mladá Boleslav–Liberec, Ústí nad Labem–Cheb a České Budějovice–Plzeň.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-30** (CORROBORATED, zdroje: SRC-25, SRC-22, subjekty: bednarik): Generální ředitel Správy železnic Tomáš Tóth uvedl, že některé velké železniční projekty nelze v roce 2026 financovat, a jako příklad odkládané stavby označil úsek Nemanice–Ševětín.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-31** (1 ZDROJ, zdroje: SRC-25, subjekty: bednarik): Navržený střednědobý výhled SFDI na roky 2027–2028 počítal dohromady s necelými 77 miliardami korun pro železnice i dálnice, zatímco pro rok 2026 bylo k dispozici 169 miliard; ŘSD samo by pro rok 2027 potřebovalo zhruba 90 miliard. Bednárik připustil nutnost prioritizace s tím, že vláda výhled upraví při přípravě rozpočtu v dubnu 2027.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-32** (1 ZDROJ, zdroje: SRC-24, subjekty: bednarik): Předseda Národní rozpočtové rady Mojmír Hampl kritizoval výdajovou trajektorii dopravní infrastruktury jako nepřiměřenou ekonomice a poukázal na růst navrhovaných výdajů ze 160 miliard na více než 311 miliard korun do roku 2028.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-33** (1 ZDROJ, zdroje: SRC-24, subjekty: bednarik): Bednárik označil situaci kolem chybějících prostředků za rozpočtové Waterloo na ministerstvu dopravy a navrhoval větší využití evropských zdrojů, konkrétně Modernizačního fondu a programu SAFE.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-34** (1 ZDROJ, zdroje: SRC-17, subjekty: bednarik): Bednárik odmítl investiční požadavky Prahy a Středočeského kraje s argumentem, že nemůže rozhodovat o investicích pouze ve prospěch nejbohatší oblasti a že metropole nemůže spotřebovat 90 procent rozpočtu resortu na úkor regionů.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-35** (CORROBORATED, zdroje: SRC-17, SRC-18, subjekty: bednarik): Bednárik prosazuje na evropské úrovni možnost zastropovat ceny elektřiny při výkyvech trhu jako podporu konkurenceschopnosti železniční nákladní dopravy a označil náklady na trakční elektřinu za nejkritičtější problém nákladních dopravců.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-36** (1 ZDROJ, zdroje: SRC-26, subjekty: bednarik): Bednárik v podcastu uvedl, že problémem české železnice bylo, že s penězi nebyl problém, a že se to dostalo do její DNA.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-37** (1 ZDROJ, zdroje: SRC-27, subjekty: bednarik): Na diskusním fóru ACRI v dubnu 2026 Bednárik upozornil, že rozhodování o železničních investicích je omezeno závazky vůči evropskému financování a že jde o dlouhodobé provozní závazky, nejen o investiční náklady.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-38** (1 ZDROJ, zdroje: SRC-27, subjekty: bednarik): Generální ředitel Českých drah Michal Krapinec na fóru ACRI upozornil, že pořizovací náklady vozidel pro rychlost 230 km/h dosahují stovek milionů korun na jednotku a že s rostoucí rychlostí výrazně rostou náklady na energie a údržbu.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-39** (1 ZDROJ, zdroje: SRC-28, subjekty: bednarik): Bednárik před nástupem do funkce uvedl, že je potřeba vyjasnit strategii, do čeho je smysluplné investovat, na základě analýz a exaktních čísel, a zdůraznil stabilní dlouhodobé financování s využitím evropských fondů a partnerství veřejného a soukromého sektoru.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-40** (1 ZDROJ, zdroje: SRC-13, subjekty: bednarik): Podle ČT24 nebyl v době rezignace převod pozemků z Českých drah na Správu železnic dosud schválen Evropskou komisí a Bednárik uvedl, že očekávané 3,5 miliardy za pozemky nakonec společnost vůbec nebude mít k dispozici.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-41** (1 ZDROJ, zdroje: SRC-20, subjekty: bednarik): Podle E15 Bednárik jako důvod odchodu uvedl vládní úsporná opatření, která se dotknou i Českých drah a nebude jednoduché se s nimi vypořádat, přičemž zmiňováno bylo snižování slev pro studenty a seniory a pozastavený spor o nájem pozemků.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-42** (1 ZDROJ, zdroje: SRC-21, subjekty: bednarik): Newstream uvedl, že Bednárik své pohnutky veřejně nesdělil, a jako pravděpodobné příčiny označil plánované vládní úspory a spor o platby za pozemky ČD užívané Správou železnic, s nimiž dopravce počítal v byznysplánu předloženém dozorčí radě.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-43** (CORROBORATED, zdroje: SRC-19, SRC-20, subjekty: bednarik): Souběžně s Bednárikovým odchodem opustili představenstvo Českých drah místopředseda Václav Nebeský a člen představenstva Petr Pavelec, novou členkou se stala Blanka Havelková.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-44** (CORROBORATED, zdroje: SRC-19, SRC-20, subjekty: bednarik): Předsedou dozorčí rady Českých drah byl na témže jednání zvolen ekonom Miroslav Zámečník, který nahradil Pavla Kysilku, jenž rezignoval v prosinci 2021.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-45** (CORROBORATED, zdroje: SRC-21, SRC-20, subjekty: bednarik): Bednárik vedl České dráhy zhruba 15 měsíců, od prosince 2020 do konce února 2022.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-46** (CORROBORATED, zdroje: SRC-20, SRC-21, subjekty: bednarik): V období Bednárikova vedení vykázaly České dráhy ztrátu 4,1 miliardy korun za rok 2020 a 217 milionů korun za první pololetí 2021.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-47** (1 ZDROJ, zdroje: SRC-12, subjekty: bednarik): Odborný web RAILTARGET zasadil Bednárikův odchod do kontextu nedokončeného majetkového vypořádání mezi Českými drahami a Správou železnic od rozdělení v letech 2002 až 2003, s uváděným převodem 12 miliard v roce 2008, 3,3 miliardy za zhruba 1500 nádražních budov v roce 2016 a zhruba 3 miliardami korun ročně v nájemném za sporné nemovitosti.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním

## Jaromír Zůna — `jaromir-zuna` (53 tvrzení)

Per-dossier prismatic nástroje a výjimky: viz [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md#per-dossier-kroky).

- [ ] **CLM-01** (1 ZDROJ, zdroje: SRC-01, subjekty: zuna): Jaromír Zůna zastává podle oficiálního profilu na webu Úřadu vlády funkci místopředsedy vlády a ministra obrany
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-02** (CORROBORATED, zdroje: SRC-03, SRC-04, subjekty: zuna): Babišova vláda v lednu 2026 snížila plánované obranné výdaje na rok 2026 o 21 miliard korun — z 206 miliard (2,35 % HDP podle návrhu předchozí vlády) na zhruba 185 miliard, tedy 2,07 % HDP podle tehdejší predikce.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-03** (CITACE, zdroje: SRC-03, SRC-04, subjekty: zuna): Ministr obrany Jaromír Zůna škrt hájil s tím, že se dotkne pouze nových, dosud nevyhlášených projektů, které se podle něj neruší, ale posouvají na rok 2027; všechny běžící projekty ministerstva mají pokračovat.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-04** (CITACE, zdroje: SRC-02, subjekty: zuna): V rozhovoru pro e15.cz (duben 2026) Zůna odmítl, že by armáda trpěla nedostatkem peněz; prohlásil, že armáda 'nikdy nebyla v tak luxusní situaci', že výdaje na obranu jsou nejvyšší v historii a všechny podepsané strategické projekty vyzbrojování běží.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-05** (CITACE, zdroje: SRC-02, subjekty: zuna): Zůna v rozhovoru pro e15.cz označil za slabiny resortu personální podstav armády, zanedbanou oblast dronů a roztříštěný bezpečnostní systém státu.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-06** (CITACE, zdroje: SRC-05, subjekty: zuna): Zůna v České televizi (duben 2026) uvedl, že NATO Česku neuzná jako obranné výdaje zhruba 20 miliard korun na dopravní stavby, které do výkazů zahrnula předchozí vláda; podle metodiky NATO tak ČR v roce 2026 dosáhne jen asi 1,78 % HDP místo dvouprocentního závazku.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-07** (CITACE, zdroje: SRC-12, subjekty: zuna): Premiér Babiš v květnu 2026 připustil, že Česko v letošním roce nejspíš nedosáhne závazku 2 % HDP na obranu.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-08** (CORROBORATED, zdroje: SRC-06, SRC-07, SRC-08, subjekty: zuna): Rozhovor prezidenta Petra Pavla pro armádní podcast Kamufláž měl vyjít 7. dubna 2026, ale zveřejněn nebyl; podle opozice a části médií do vydání zasáhlo ministerstvo obrany.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-09** (CITACE, zdroje: SRC-06, subjekty: zuna): Opoziční politici nezveřejnění rozhovoru charakterizovali jako cenzuru prezidenta: Josef Flek (STAN) mluvil o 'bezprecedentním pokusu o umlčení hlavy státu', Martin Kupka (ODS) o 'cenzuře v nejtvrdší podobě' a Matěj Ondřej Havel (TOP 09) žádal Zůnovu rezignaci.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-10** (CITACE, zdroje: SRC-06, SRC-07, subjekty: zuna): Ministerstvo obrany a ministr Zůna obvinění z cenzury odmítli; podle Zůny šlo o porušení předpisů, protože armáda založila paralelní komunikační kanál bez dodržení směrnic, a jeho úřad podle něj o existenci videa neměl informace.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-11** (1 ZDROJ, zdroje: SRC-07, subjekty: zuna): Rozhovor s prezidentem Pavlem armáda nakonec 20. dubna 2026 zveřejnila na svém YouTube kanálu; ještě předtím ho na Facebooku publikoval ministr zahraničí Petr Macinka (Motoristé).
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-12** (1 ZDROJ, zdroje: SRC-08, subjekty: zuna): Inspekce ministerstva obrany v červnu 2026 neprokázala, že by resort zveřejnění rozhovoru zakázal nebo že šlo o cílenou cenzuru; chyby konstatovala na obou stranách — u vedoucího komunikace generálního štábu (nový kanál bez oficiální žádosti) i u ministrova kabinetu (nedostatečná proaktivita).
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-13** (CORROBORATED, zdroje: SRC-10, SRC-09, subjekty: zuna): Vláda v květnu 2026 vybrala generála Miroslava Hlaváče jako nástupce Karla Řehky ve funkci náčelníka Generálního štábu; ministr obrany Zůna jako jediný člen vlády hlasoval proti, což veřejně potvrdil premiér Babiš.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-14** (CITACE, zdroje: SRC-10, subjekty: zuna): Prezident Pavel podle prohlášení Kanceláře prezidenta republiky považoval Hlaváče za dobrého kandidáta a byl připraven ho do funkce jmenovat.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-15** (CITACE, zdroje: SRC-09, subjekty: zuna): Bývalý ministr obrany a europoslanec Alexandr Vondra (ODS) prohlásil, že po hlasování proti novému náčelníkovi generálního štábu 'neexistuje jiné čestné řešení než okamžitě rezignovat', protože jmenování náčelníka je podle něj nejdůležitější rozhodnutí, které ministr obrany může ve funkci udělat.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-16** (CITACE, zdroje: SRC-11, subjekty: zuna): Předseda SPD Tomio Okamura spekulace o konci ministra Zůny odmítl; uvedl, že Hlaváč není z pohledu SPD z hlediska vojenského kariérního řádu ideální kandidát a že politickou odpovědnost za jeho výběr nese premiér Babiš.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-17** (CITACE, zdroje: SRC-12, subjekty: zuna): Babiš v květnu 2026 veřejně kritizoval Zůnovu koncepci armády slovy 'Plánovat do roku 2040 jen 32 tisíc vojáků, s tím určitě nejsem spokojen'; požadoval nábor minimálně 2 000 vojáků ročně a urychlení posilování protivzdušné obrany.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-18** (1 ZDROJ, zdroje: SRC-12, subjekty: zuna): Zůnova koncepce podle Echo24 počítala s růstem armády ze současných zhruba 25 750 na 32 000 vojáků do roku 2040, tedy o přibližně 4 000 osob.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-19** (CITACE, zdroje: SRC-13, subjekty: zuna): Babiš a Zůna jednali o armádní koncepci opakovaně (květen a začátek června 2026); premiér deklaroval záměr vrátit se ke koncepci budování armády schválené za předchozí vlády ANO se zaměřením na alianční závazky u těžké a střední brigády.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-20** (CORROBORATED, zdroje: SRC-14, SRC-21, SRC-28, SRC-27, subjekty: zuna): Prezident Petr Pavel jmenoval 30. června 2026 Miroslava Hlaváče náčelníkem Generálního štábu Armády ČR; do funkce nastoupil 1. července 2026 a nahradil Karla Řehku.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-21** (CORROBORATED, zdroje: SRC-14, SRC-21, SRC-28, subjekty: zuna): Karel Řehka vedl armádu od července 2022 a jeho služba v armádě končí k 31. srpnu 2026; oficiální předání funkce proběhlo při slavnostním nástupu na Vítkově u příležitosti Dne ozbrojených sil.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-22** (CITACE, zdroje: SRC-27, subjekty: zuna): Podle Blesku prezident Pavel při jmenování zkritizoval nízkou účast ústavních činitelů slovy: „Pevně doufám, že skromná účast ústavních činitelů není odrazem pozornosti věnované armádě.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-23** (CITACE, zdroje: SRC-14, subjekty: zuna): Prezident Pavel podle ČT24 uvedl, že nového náčelníka „čeká nelehké období“, kdy bude třeba přizpůsobit se nové realitě v NATO vzhledem k částečnému ústupu Spojených států z Evropy.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-24** (CITACE, zdroje: SRC-14, subjekty: zuna): Ministr obrany Jaromír Zůna při předání funkce řekl: „Úkolů, které nás společně čekají, je řada, ale věřím, že je zvládneme.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-25** (1 ZDROJ, zdroje: SRC-25, subjekty: zuna): Sněmovní výbor pro obranu 27. května 2026 jednomyslně podpořil jmenování generálporučíka Miroslava Hlaváče náčelníkem Generálního štábu s účinností od 1. července 2026.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-26** (CITACE, zdroje: SRC-25, subjekty: zuna): Přestože Zůna na jednání vlády 18. května 2026 pro Hlaváčovo jmenování nehlasoval, na sněmovním výboru pro obranu jej podpořil slovy, že „generálporučík Miroslav Hlaváč patří k nejzkušenějším důstojníkům Armády České republiky“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-27** (CORROBORATED, zdroje: SRC-28, SRC-27, SRC-25, subjekty: zuna): Hlaváč jako své priority uvedl dokončení výstavby těžké brigády, vybudování střední brigády a rozvoj vícevrstvého systému protivzdušné obrany.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-28** (CORROBORATED, zdroje: SRC-21, SRC-28, SRC-27, subjekty: zuna): Odcházející náčelník Karel Řehka podle médií zvažuje kandidaturu do Senátu jako nezávislý kandidát.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-29** (CORROBORATED, zdroje: SRC-21, SRC-27, subjekty: zuna): Prezident Pavel v souvislosti s jmenováním Hlaváče poukázal na problémy v komunikaci mezi ministerstvem obrany a armádou a uvedl, že podřízení mají nadřízeným dávat „informace, které jsou nezkreslené, objektivní, i když se jim občas nemusí líbit“.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-30** (CITACE, zdroje: SRC-08, subjekty: zuna): Inspekce ministerstva obrany podle ČT24 zjistila, že vedoucí oddělení komunikace generálního štábu porušil předpisy tím, že vytvořil nový informační kanál bez oficiální žádosti, a že na straně civilních úředníků ministerstva „neexistovaly jasné pokyny, jak zacházet s účty na sociálních sítích“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-31** (CITACE, zdroje: SRC-08, subjekty: zuna): Ministerstvo obrany se po závěrech inspekce zavázalo aktualizovat a metodicky upřesnit rozkazy ke komunikaci, aby „v budoucnu nemohlo docházet k rozdílné interpretaci jejich znění“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-32** (CORROBORATED, zdroje: SRC-25, SRC-32, subjekty: zuna): Zůna připravil tři varianty koncepce výstavby armády do roku 2040 odstupňované podle výše obranných výdajů; rozhodnutí o výběru varianty očekával v červnu 2026.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-33** (CORROBORATED, zdroje: SRC-31, SRC-32, subjekty: zuna): Po jednání s premiérem Babišem Zůna zvýšil plánovaný náborový cíl z původních 2600 na zhruba 3000 profesionálních vojáků ročně.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-34** (CITACE, zdroje: SRC-19, subjekty: zuna): Bezpečnostní rada státu projednávala novou koncepci armády 17. června 2026 za účasti prezidenta Pavla, debatu však nedokončila; podle Zůny „cílem nebylo schválit, ale projednat záměr“, přičemž se posuzovaly dvě varianty financování — 2 % a 3,5 % HDP.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-35** (CITACE, zdroje: SRC-19, subjekty: zuna): Prezident Pavel na Bezpečnostní radě státu uvedl, že koncepce musí mít dlouhodobý charakter a „není možné, aby se měnila z roku na rok“, a upozornil, že chybí finanční rámec ze strany vlády.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-36** (1 ZDROJ, zdroje: SRC-29, subjekty: zuna): Bezpečnostní rada státu se k armádní koncepci sešla znovu 2. července 2026 opět za účasti prezidenta Pavla, ani tehdy však diskuse nebyla uzavřena.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-37** (1 ZDROJ, zdroje: SRC-18, subjekty: zuna): Podle e15 připravovaná koncepce do roku 2040 staví na těžké a střední brigádě, rozšíření vícevrstvé protivzdušné obrany a náboru až deseti tisíc nových vojáků, s odhadovanými náklady v řádu vyšších stovek miliard korun; plánované akvizice zahrnují 8 systémů SPYDER za 37 miliard, střely Derby za 12 miliard, 246 vozidel CV90 za 59,7 miliardy a 77 tanků Leopard za 52 miliard.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-38** (1 ZDROJ, zdroje: SRC-30, subjekty: zuna): Zůna zdůvodňuje změnu koncepce demografickým propadem: počet obyvatel ve věku 18–25 let klesl z 1,4 milionu v roce 2002 na zhruba 800 tisíc, a nová koncepce se proto má zaměřit i na zálohy a mobilizační potenciál státu, nikoli jen na profesionální jádro.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-39** (CITACE, zdroje: SRC-32, subjekty: zuna): Zůna v rozhovoru pro Deník.cz uvedl, že bývalá ministryně Jana Černochová „neměla dostatečné povědomí o tom, co je to obranné plánování“, a že předchozí vláda odsouhlasila nárůst závazků vůči NATO o 200 procent bez vyjednání lepších podmínek, což označil za obrovskou zátěž.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-40** (1 ZDROJ, zdroje: SRC-32, subjekty: zuna): Zůna zatím neprosazuje obnovení povinné vojenské služby s odůvodněním, že ještě nebyla dobudována profesionální armáda a nebyl vytěžen její potenciál; současně plánuje první jednotku autonomních systémů a nákup 3000 dronů do roku 2028.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-41** (CORROBORATED, zdroje: SRC-16, SRC-20, subjekty: zuna): Vládní koalice se na začátku července 2026 shodla, že rozpočet ministerstva obrany na rok 2027 vzroste ze zhruba 1,7 % na 2 % HDP, tedy na téměř 191 miliard korun, o 36 miliard více než v roce 2026.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-42** (CORROBORATED, zdroje: SRC-20, SRC-33, subjekty: zuna): Premiér Babiš na summitu NATO v Ankaře 7.–8. července 2026, kam ho doprovázel i ministr obrany Zůna, oznámil navýšení obranného rozpočtu o 36 miliard korun a poprvé dosažení 2 % HDP, spolu se zvýšením počtu vojáků a aktivních záloh minimálně o čtvrtinu.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-43** (CITACE, zdroje: SRC-23, subjekty: zuna): Zůna 10. června 2026 požadoval navýšení rozpočtu obrany o 35 miliard na 190 miliard korun (2 % HDP) s odůvodněním, že „základní pozice jsou dvě procenta HDP na obranu, protože jinak to teď nejde“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-44** (CORROBORATED, zdroje: SRC-23, SRC-15, subjekty: zuna): Rozpočet kapitoly ministerstva obrany na rok 2026 činí zhruba 154,8 miliardy korun, což odpovídá přibližně 1,8 % HDP.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-45** (1 ZDROJ, zdroje: SRC-24, subjekty: zuna): Zůna v únoru 2026 uvedl, že rozpočet ministerstva obrany má vzrůst ze 154 miliard na 215 miliard korun v roce 2027 a 238 miliard v roce 2028, což by odpovídalo 2,5 % HDP.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-46** (CITACE, zdroje: SRC-17, subjekty: zuna): Zůna na jednání ministrů obrany NATO v Bruselu 18. června 2026 na otázku, zda Česko letos dosáhne dvouprocentního cíle, odpověděl: „My pro to děláme maximum,“ a k mandátu pro summit dodal, že „mandát bude také o tom, jakým způsobem naznačíme aliančním partnerům naši trajektorii výdajů na obranu“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-47** (CORROBORATED, zdroje: SRC-16, SRC-23, subjekty: zuna): Předseda sněmovního výboru pro obranu Josef Flek (STAN) označil plánované navýšení za nedostatečné — podle něj dvě procenta nebudou stačit kvůli rozjednaným akvizicím a protivzdušné obraně a reálné potřeby přesahují 60 miliard korun.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-48** (CITACE, zdroje: SRC-16, subjekty: zuna): Zůna uvedl, že v roce 2027 začnou dodávky tanků Leopard 2 A8, které jsou společným nákupem s Německem a mají do roku 2031 stát až 40 miliard korun.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-49** (1 ZDROJ, zdroje: SRC-15, subjekty: zuna): Zůna ve Sněmovně 4. února 2026 informoval, že probíhají vojskové zkoušky systému SPYDER pořízeného v roce 2021, v roce 2026 začnou vojskové zkoušky prvních bojových vozidel pěchoty CV90 a bylo rozhodnuto o pořízení dronů s kolmým startem pro pozemní síly.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-50** (1 ZDROJ, zdroje: SRC-15, subjekty: zuna): Zůna ve Sněmovně uvedl, že rok 2026 počítá s navýšením o 1100 vojáků z povolání a s bytovou výstavbou za více než 3 miliardy korun v osmi posádkách.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-51** (1 ZDROJ, zdroje: SRC-22, subjekty: zuna): V roce 2025 vstoupilo do armády 2396 lidí — nejvíce od roku 2004 — ale zároveň odešlo 1325 osob, takže čistý přírůstek činil 1071 vojáků; aktivní zálohy stagnují pod 5 tisíci osobami.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-52** (CORROBORATED, zdroje: SRC-22, SRC-31, SRC-20, subjekty: zuna): Náborový cíl 2250 nových profesionálních vojáků pro rok 2026 byl v dubnu splněn na 86 procent a na začátku června na 98 procent; podle premiéra Babiše nastoupilo za prvních šest měsíců roku 2010 nových vojáků.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-53** (1 ZDROJ, zdroje: SRC-22, subjekty: zuna): Oficiálním cílem je zvýšit počet profesionálních vojáků na 30 tisíc do roku 2030 a aktivních záloh na 10 tisíc, zatímco náčelník generálního štábu Karel Řehka uváděl, že pro naplnění cílů NATO je potřeba 37 500 příslušníků.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním

## Jaroslav Faltýnek — `jaroslav-faltynek` (8 tvrzení)

Per-dossier prismatic nástroje a výjimky: viz [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md#per-dossier-kroky).

- [ ] **CLM-01** (1 ZDROJ, zdroje: SRC-01, subjekty: faltynek): Podle oficiálního profilu Poslanecké sněmovny je Jaroslav Faltýnek poslancem od 4. října 2025 za Olomoucký kraj, místopředsedou poslaneckého klubu ANO 2011 od 8. října 2025 a členem zemědělského výboru od 11. listopadu 2025; profil uvádí předchozí funkční období 2013–2017, 2017–2021 a 2021–2025
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-02** (CORROBORATED, zdroje: SRC-02, SRC-04, subjekty: faltynek): Státní zástupce Jaroslav Šaroch z Městského státního zastupitelství v Praze podle citovaného zpravodajství zrušil v květnu 2018 trestní stíhání Jaroslava Faltýnka v kauze Čapí hnízdo poté, co vyhověl jeho stížnosti proti obvinění; současně zrušil stíhání tří dalších obviněných
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-03** (1 ZDROJ, zdroje: SRC-02, subjekty: faltynek): Týž státní zástupce podle citovaného zpravodajství zamítl stížnost Andreje Babiše jako nedůvodnou a jeho trestní stíhání pokračovalo
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-04** (CORROBORATED, zdroje: SRC-02, SRC-04, subjekty: faltynek): Zrušení stíhání bylo rozhodnutím státního zástupce, nikoli soudu; citovaný zdroj neuvádí žádné rozhodnutí o vině ani o nevině
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-05** (CORROBORATED, zdroje: SRC-03, SRC-05, subjekty: faltynek): Dne 14. září 2022 vypovídal Jaroslav Faltýnek u soudu v kauze Čapí hnízdo jako svědek, nikoli jako obžalovaný — jeho vlastní stíhání skončilo v roce 2018
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-06** (CITACE, zdroje: SRC-03, subjekty: faltynek): Na otázku, zda měl obžalovaný o projekt Čapí hnízdo zvláštní zájem, Faltýnek podle citovaného zpravodajství u soudu odpověděl: „Bylo to pod jeho rozlišovací schopnosti.\"
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-07** (CITACE, zdroje: SRC-03, subjekty: faltynek): Faltýnek podle citovaného zpravodajství u soudu uvedl, že projekt stál přibližně miliardu korun a dotace představovala pouze pět procent celkové investice, a označil kauzu za vykonstruovanou s cílem odstranit Andreje Babiše z politiky
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-08** (CITACE, zdroje: SRC-03, subjekty: faltynek): K převodu akcií Faltýnek podle citovaného zpravodajství uvedl, že u něj nebyl přítomen a že „byl kupec, který nabídl cenu, která byla vyšší než účetní hodnota\"; detaily podle něj řešili právníci a představenstvo návrh jen schválilo
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný

## Jeroným Tejc — `jeronym-tejc` (51 tvrzení)

Per-dossier prismatic nástroje a výjimky: viz [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md#per-dossier-kroky).

- [ ] **CLM-01** (1 ZDROJ, zdroje: SRC-01, subjekty: tejc): Jeroným Tejc zastává podle oficiálního profilu na webu Úřadu vlády funkci ministra spravedlnosti
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-02** (CORROBORATED, zdroje: SRC-02, SRC-03, subjekty: tejc): Ministr spravedlnosti Jeroným Tejc (nominovaný hnutím ANO) 17. dubna 2026 oznámil, že kvůli zjištěním interního auditu k přijetí a prodeji bitcoinů darovaných resortu podá trestní oznámení. Jde o ohlášení podezření orgánům činným v trestním řízení — nikoli o obvinění jakékoli konkrétní osoby.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-03** (CORROBORATED, zdroje: SRC-02, SRC-04, subjekty: tejc): Trestní oznámení bylo podle citovaného zpravodajství doručeno Vrchnímu státnímu zastupitelství v Olomouci večer 23. dubna 2026; doručení potvrdil mluvčí zastupitelství Radek Bartoš.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-04** (CORROBORATED, zdroje: SRC-02, SRC-03, SRC-04, subjekty: tejc): Trestní oznámení směřuje k podezření z porušení povinnosti při správě cizího majetku a zneužití pravomoci úřední osoby. K datu citovaného zpravodajství nebyl v souvislosti s oznámením nikdo obviněn ani odsouzen; věc byla ve fázi podaného oznámení.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-05** (CORROBORATED, zdroje: SRC-02, SRC-03, SRC-04, subjekty: tejc): Podle Tejcem prezentovaných závěrů interního auditu došlo k chybám jak před přijetím bitcoinového daru ministerstvem, tak při prodeji kryptoměny; snížením nejnižší možné ceny v aukcích stát podle ministra přišel přibližně o 13 milionů korun. Jde o tvrzení ministra opřené o interní audit, nikoli o zjištění orgánů činných v trestním řízení.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-06** (CORROBORATED, zdroje: SRC-03, SRC-04, subjekty: tejc): Audit podle citovaného zpravodajství rovněž uvádí, že chybí záznamy o schůzkách se zájemci o odkup bitcoinů, což znemožňuje posoudit, zda zvolený postup byl optimální.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-07** (CORROBORATED, zdroje: SRC-02, SRC-03, SRC-04, subjekty: tejc): Přijetí bitcoinového daru spadá podle citovaného zpravodajství do funkčního období exministra spravedlnosti Pavla Blažka (ODS) a dohody s kupci kryptoměny do období exministryně Evy Decroix (ODS); Decroix jakékoli pochybení odmítla a dohody obhajovala. Oba vystupují pouze jako záznam vztahu k auditované agendě — z trestního oznámení vůči nim neplyne žádné obvinění.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-08** (CORROBORATED, zdroje: SRC-05, SRC-06, SRC-07, subjekty: tejc): Tejc 1. července 2026 podal kárnou žalobu na soudkyni Okresního soudu v Benešově, jejíž rozhodnutí svěřilo tříletou Viktorku z pěstounské péče do péče biologických rodičů; dívku podle citovaného zpravodajství později usmrtil otec. Kárná žaloba je návrh v kárném řízení soudců — není to trestní stíhání a o případném pochybení rozhodne až kárný senát.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-09** (CORROBORATED, zdroje: SRC-05, SRC-06, SRC-07, subjekty: tejc): V kárné žalobě Tejc pro soudkyni navrhuje roční snížení platu o 30 procent.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-10** (CORROBORATED, zdroje: SRC-05, SRC-06, SRC-07, subjekty: tejc): Souběžně s kárnou žalobou Tejc zaslal podnět k prověření činnosti orgánu sociálně-právní ochrany dětí (OSPOD) v daném případu; podle ČT24 podnět směřoval ministru práce.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-11** (CORROBORATED, zdroje: SRC-05, SRC-07, subjekty: tejc): Tejc soudkyni v kárné žalobě vytýká, že se věci věnovala nedbale, rozhodla formálně a opomenula provést řadu dostupných důkazů. Jde o tvrzení ministra jako kárného žalobce; jeho oprávněnost posoudí kárný senát.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-12** (CITACE, zdroje: SRC-05, SRC-07, subjekty: tejc): Tejc na tiskové konferenci ke kauze prohlásil: „Soudci jsou ve svém rozhodování nezávislí, ale nemají být nezávislí na zákonech a neodpovědní.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-13** (CORROBORATED, zdroje: SRC-05, SRC-06, subjekty: tejc): Soudkyně podle citovaného zpravodajství svůj postup hájí: uvedla, že rozhodla podle tehdy dostupných důkazů a v nejlepším zájmu dítěte; podle České justice poukázala na to, že se všichni účastníci řízení vzdali práva na odvolání a znalecký posudek připouštěl, že při abstinenci by otec mohl o dítě pečovat. Soudkyně vystupuje výhradně jako protistrana kárného návrhu v rozsahu citovaného zpravodajství.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-14** (CITACE, zdroje: SRC-08, SRC-09, subjekty: tejc): Tejc 2. července 2026 veřejně zpochybnil předběžné opatření Ústavního soudu, které umožnilo prezidentu Petru Pavlovi účast na summitu NATO v Ankaře: „Mám velké pochybnosti o oprávněnosti Ústavního soudu vydat předběžné opatření ve věci kompetenčního sporu.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-15** (CORROBORATED, zdroje: SRC-08, SRC-09, subjekty: tejc): Tejc při kritice předběžného opatření rozlišoval mezi zákazem určitého jednání a nařizováním aktivních kroků vládě; současně uvedl, že vláda rozhodnutí Ústavního soudu respektuje a naplní.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-16** (1 ZDROJ, zdroje: SRC-10, subjekty: tejc): Vláda podle ČT24 z 20. července 2026 navrhne Ústavnímu soudu, aby kompetenční žalobu prezidenta Pavla zamítl nebo odmítl; postoj vlády prezentoval ministr Tejc s tím, že přijetí prezidentova výkladu by znamenalo zásadní změnu fungování českého ústavního systému.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-17** (CITACE, zdroje: SRC-10, subjekty: tejc): Vláda podle ČT24 žádá vyloučení soudce Pavla Šámala z dalšího rozhodování o kompetenční žalobě; Tejc uvedl, že Šámal „při vydání předběžného opatření bezprecedentně projevil soudní aktivismus a zasáhl do ústavního postavení vlády“. Jde o procesní návrh a připsaný výrok ministra, o vyloučení rozhoduje Ústavní soud.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-18** (1 ZDROJ, zdroje: SRC-10, subjekty: tejc): Tejc podle ČT24 rovněž kritizoval, že vláda před vydáním předběžného opatření nedostala možnost se k prezidentově žalobě vyjádřit.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-19** (CORROBORATED, zdroje: SRC-11, SRC-12, subjekty: tejc): Detektivové Národní centrály proti organizovanému zločinu zahájili 4. května 2026 trestní stíhání tří osob v bitcoinové kauze — exministra spravedlnosti Pavla Blažka, jeho bývalého náměstka Radomíra Daňhela a brněnského advokáta Kárima Titze. Jde o zahájení stíhání, tedy o obvinění, nikoli o obžalobu ani o odsouzení; platí presumpce neviny.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-20** (CORROBORATED, zdroje: SRC-11, SRC-12, subjekty: tejc): Obvinění je kvalifikováno jako legalizace výnosů z trestné činnosti a zneužití pravomoci úřední osoby; podle České justice jde o dva skutky legalizace a o zneužití pravomoci zčásti dokonané a zčásti ve stadiu pokusu.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-21** (CORROBORATED, zdroje: SRC-11, SRC-12, subjekty: tejc): Dozor nad trestním řízením vykonává Vrchní státní zastupitelství v Olomouci, dozorujícím státním zástupcem je Radim Dragoun. Jde o tentýž úřad, kterému bylo v dubnu 2026 doručeno trestní oznámení ministra Tejce.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-22** (1 ZDROJ, zdroje: SRC-11, subjekty: tejc): Obviněným podle České justice hrozí trest odnětí svobody v rozmezí pěti až dvanácti let; všichni tři jsou stíháni na svobodě.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-23** (1 ZDROJ, zdroje: SRC-11, subjekty: tejc): Česká justice v době zahájení stíhání uvedla, že Vrchní státní zastupitelství v Olomouci od konce dubna 2026 zkoumá trestní oznámení ministra Tejce podané na základě auditu, ale výslovně netvrdí, že by právě toto oznámení vedlo k obvinění konkrétních osob. Kauzativní vazba mezi Tejcovým oznámením a obviněním tak není z dostupných zdrojů doložena.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-24** (1 ZDROJ, zdroje: SRC-13, subjekty: tejc): Všichni tři obvinění podali proti zahájení trestního stíhání stížnosti, a to blanketně s avizovaným dodatečným odůvodněním. O stížnostech rozhodovalo Nejvyšší státní zastupitelství.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-25** (1 ZDROJ, zdroje: SRC-14, subjekty: tejc): Nejvyšší státní zastupitelství stížnosti zamítlo jako nedůvodné se závěrem, že trestní stíhání obviněných bylo zahájeno důvodně a v souladu se zákonem; oznámil to první náměstek nejvyššího státního zástupce Zdeněk Kasal. Zahájení stíhání se tím stalo pravomocným — nadále však jde o fázi přípravného řízení, nikoli o rozhodnutí o vině.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-26** (1 ZDROJ, zdroje: SRC-15, subjekty: tejc): Podle Reflexu šlo o dar 468 bitcoinů, které ministerstvo následně prodalo za 956,8 milionu korun.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-27** (1 ZDROJ, zdroje: SRC-15, subjekty: tejc): Tejcův interní audit podle Reflexu konkrétně vytkl, že smlouva byla podepsána ještě před ministerským schválením, že neproběhlo právní posouzení a že při prodeji ministerstvo připustilo účast zájemců, kteří nesložili kauci včas, a snížilo nejnižší cenu o deset procent.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-28** (CITACE, zdroje: SRC-15, subjekty: tejc): Tejc při prezentaci auditu uvedl: „Audit poukazuje nejen na možné porušení zákona a předpisů z hlediska těch nejvrcholnějších představitelů.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-29** (CORROBORATED, zdroje: SRC-15, SRC-13, subjekty: tejc): Pavel Blažek podle Reflexu argumentoval tím, že žádný státní orgán „autoritativně nezkonstatoval, že bitcoiny jsou právně vadné“, a že mu audit nebyl dán ani k nahlédnutí. Po zahájení stíhání pak uvedl, že se cítí naprosto nevinný.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-30** (CITACE, zdroje: SRC-15, subjekty: tejc): Exministryně Eva Decroix reagovala na Tejcovy kroky na síti X slovy: „To, co aktuálně pácháte, není spravedlnost. Možná jste chtěl poškodit mě.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-31** (CITACE, zdroje: SRC-16, subjekty: tejc): Decroix v den ohlášení trestního oznámení ve vysílání CNN Prima NEWS uvedla: „Na koho jiného je dnes možné dělat hon na čarodějnice, než na Decroix?“ a k roli resortu dodala, že „nesluší, když z justice dělá prodlouženou ruku své politiky“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-32** (CITACE, zdroje: SRC-16, subjekty: tejc): Decroix tamtéž vyjádřila přesvědčení, že ministr „k žádné trestní odpovědnosti nedospěje“, pokud si podklady přečte, a označila snahu o politizaci bitcoinové kauzy za nepřekvapivou.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-33** (1 ZDROJ, zdroje: SRC-06, subjekty: tejc): Kárná žaloba směřuje proti soudkyni Okresního soudu v Benešově Sandře Kimmelové; ministr navrhuje roční snížení platu o 30 procent. O kárné žalobě rozhoduje kárný senát, do jeho rozhodnutí platí presumpce neviny a nejde o zjištění pochybení.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-34** (1 ZDROJ, zdroje: SRC-17, subjekty: tejc): Podle tiskové zprávy ministerstva spravedlnosti ministr tvrdí, že se soudkyně „dopustila excesu“ a „zanedbala své povinnosti“ tím, že si dostatečně nezjistila skutkový stav. Šetření Odboru dohledu a kárné agendy ministerstva podle zprávy začalo v dubnu 2026.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-35** (1 ZDROJ, zdroje: SRC-06, subjekty: tejc): Tejc podle České justice soudkyni vytýká, že rozhodovala, přestože ze spisu vyplývaly informace o paranoidní schizofrenii a drogové závislosti otce.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-36** (1 ZDROJ, zdroje: SRC-06, subjekty: tejc): Soudkyně se podle České justice brání mimo jiné tím, že se všichni účastníci řízení včetně pěstounů vzdali práva na odvolání a že psychiatrické podklady i záznamy z terapie připouštěly řádnou péči otce v době abstinence.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-37** (1 ZDROJ, zdroje: SRC-19, subjekty: tejc): Tejc po případu ohlásil novelu občanského zákoníku, podle níž by opatrovnické soudy nově a povinně posuzovaly, zda není namístě zbavit rodičovské odpovědnosti rodiče, který se dopustil domácího násilí vůči dítěti nebo druhému rodiči; násilný rodič by dál platil výživné a mohl by být v kontaktu například formou asistovaných setkání či videohovorů. Předložení vládě předpokládal během léta 2026.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-38** (CITACE, zdroje: SRC-19, subjekty: tejc): Advokátka Hana Kordová Marvanová Tejcovu novelu kritizovala s tím, že „nezvyšuje ochranu a bezpečí dětí jako případ Viktorky vůbec“, protože míří především na rozhodování o péči po rozvodu, zatímco v tomto případu podle ní mezi rodiči žádný spor nebyl a oba byli vysoce rizikoví.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-39** (1 ZDROJ, zdroje: SRC-20, subjekty: tejc): Na ministerstvu práce a sociálních věcí poprvé zasedla Komise pro přezkum nepřirozených úmrtí dětí v čele s ministrem Alešem Juchelkou; jejím členem je i dětský ombudsman Martin Beneš. Výstupem prvního jednání byl podnět ke kontrole postupů orgánů sociálně-právní ochrany dětí ve Středočeském kraji a v Praze, který ministerstvo prezentovalo jako standardní kontrolní nástroj, nikoli jako předjímání pochybení.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-40** (CITACE, zdroje: SRC-20, subjekty: tejc): Dětský ombudsman Martin Beneš k práci komise uvedl: „Bylo by neodpovědné veřejně hodnotit situaci ve chvíli, kdy práce komise teprve probíhá a její závěry ještě nejsou hotové.“ Podle něj systém dlouhodobě postrádá jednotné metodické vedení a řešení je spíše v metodickém řízení než v legislativních změnách.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-41** (1 ZDROJ, zdroje: SRC-21, subjekty: tejc): Předběžné opatření Ústavního soudu bylo vydáno ve věci vedené pod sp. zn. Pl. ÚS 16/26. Soud jím nařídil vládě, ministrovi zahraničních věcí a ministerstvu, aby bezodkladně notifikovaly NATO a organizátorům summitu, že součástí oficiální delegace České republiky je také prezident republiky, zajistily mu akreditaci a nebránily jeho účasti ani ji neztěžovaly.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-42** (1 ZDROJ, zdroje: SRC-21, subjekty: tejc): Soudcem zpravodajem ve věci je Pavel Šámal; k rozhodnutí uplatnili odlišné stanovisko soudce Jan Wintr a soudkyně Řepková. Rozhodnutí bylo procesní povahy a nepředjímá výsledek sporu.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-43** (CORROBORATED, zdroje: SRC-21, SRC-23, subjekty: tejc): Ústavní soud avizoval, že kompetenční spor projedná v režimu přednostního projednání a konečné rozhodnutí lze očekávat v řádu měsíců.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-44** (CITACE, zdroje: SRC-08, subjekty: tejc): Tejc při vyjádření ve sněmovně 2. července 2026, kdy zpochybnil oprávnění soudu vydat předběžné opatření, současně uvedl: „Přes tento nesouhlas já i vláda rozhodnutí Ústavního soudu respektujeme a naplníme ho.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-45** (CITACE, zdroje: SRC-08, subjekty: tejc): Tejc svou kritiku soudu tamtéž zarámoval slovy: „Máme zaručenu svobodu slova a nikdo není nekritizovatelný, tedy ani soudy nebo jejich rozhodnutí.“ Reagoval na interpelaci poslance Karla Dvořáka (STAN), který varoval před znevažováním justice.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-46** (1 ZDROJ, zdroje: SRC-08, subjekty: tejc): V téže debatě zaujal ostřejší pozici ministr zahraničí Petr Macinka (Motoristé), který rozhodnutí Ústavního soudu označil za „ústavní puč“ a za důkaz úpadku právní kultury — formulace výrazně ostřejší než Tejcova.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-47** (CORROBORATED, zdroje: SRC-23, SRC-10, subjekty: tejc): Ve vládním vyjádření z 20. července 2026 Tejc argumentuje, že zákon o Ústavním soudu s možností předběžného opatření u kompetenčních žalob nepočítá a že podpůrné využití občanského soudního řádu bylo chybou.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-48** (CORROBORATED, zdroje: SRC-23, SRC-10, subjekty: tejc): Vláda podle Tejce namítá i porušení práva být slyšen, protože se před vydáním předběžného opatření nemohla k žalobě vyjádřit; ministr uvedl: „Porušení práva na to být slyšen nám připadá velmi zásadní.“
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-49** (CITACE, zdroje: SRC-23, subjekty: tejc): Tejc k důsledkům prezidentova výkladu uvedl: „Přijetí výkladu pana prezidenta by znamenalo zásadní změnu fungování českého ústavního systému. Vzniklo by druhé mocenské centrum, které by na rozdíl od vlády bylo zcela neodpovědné a neodpovídalo by se Poslanecké sněmovně.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-50** (CITACE, zdroje: SRC-10, subjekty: tejc): Tejc svou pozici opřel i o tezi, že „Česká republika má pouze jednu zahraniční politiku, a ta nemůže být vedena souběžně vládou a prezidentem“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-51** (CITACE, zdroje: SRC-25, subjekty: tejc): Soudcovská unie se 23. července 2026 vůči výrokům politiků o Ústavním soudu ohradila prohlášením: „Faktem je, že principy a lidé, na kterých česká justice stojí, dávají záruku její nezávislosti a nestrannosti.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný

## Karel Havlíček — `karel-havlicek` (46 tvrzení)

Per-dossier prismatic nástroje a výjimky: viz [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md#per-dossier-kroky).

- [ ] **CLM-01** (1 ZDROJ, zdroje: SRC-01, subjekty: havlicek): Karel Havlíček zastává podle oficiálního profilu na webu Úřadu vlády funkci 1. místopředsedy vlády a ministra průmyslu a obchodu
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-02** (CITACE, zdroje: SRC-03, SRC-06, subjekty: havlicek): Havlíček v prosinci 2019, tehdy jako ministr průmyslu a obchodu, uvedl, že audit Evropské komise ke střetu zájmů Andreje Babiše nečetl v plném rozsahu — podle vlastních slov si jej jen „prolétl“, viděl „jen titulní část“ a jako „třetí osoba“ jej podle sebe ani číst neměl.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-03** (CITACE, zdroje: SRC-03, subjekty: havlicek): Havlíček v prosinci 2019 odmítl závěr auditu Evropské komise, že je premiér Babiš ve střetu zájmů („V tom s vámi úplně nesouhlasím“), a odkazoval na rozdíl mezi českým a evropským právem.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-04** (CITACE, zdroje: SRC-03, SRC-06, subjekty: havlicek): Havlíček v prosinci 2019 tvrdil, že podobně problémových dotačních sporů s Evropskou komisí má Česko „stovky a tisíce“; podle FORUM 24 však na dotaz nedokázal uvést žádný konkrétní srovnatelný případ.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-05** (1 ZDROJ, zdroje: SRC-02, subjekty: havlicek): Podle FORUM 24 Evropská komise odmítla proplatit stomilionovou dotaci na linku na toustový chléb pekárny Penam (holding Agrofert) s odůvodněním, že projekt nebyl inovativní; auditoři EK uvedli, že velmi podobné tousty vyráběla německá společnost Lieken AG už v roce 2013.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-06** (CITACE, zdroje: SRC-02, subjekty: havlicek): Havlíček koncem listopadu 2020 připustil, že pokud Evropská komise definitivně rozhodne o neakceptovatelnosti dotace, „jde to standardně přes finanční úřad a Agrofert to musí vrátit. Tam není jiná cesta, odpustit se to nedá.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-07** (1 ZDROJ, zdroje: SRC-04, subjekty: havlicek): FORUM 24 v lednu 2021 kritizovalo, že ministerstvo průmyslu pod Havlíčkovým vedením 100 milionů korun za toustovou linku iniciativně nevymáhá a Havlíček podle listu „nikam spěchat nebude“; jde o tvrzení citovaného média, nikoli o zjištění soudu či úřadu.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-08** (1 ZDROJ, zdroje: SRC-05, subjekty: havlicek): Komentář Marka Wollnera ve FORUM 24 (červen 2026) tvrdí, že Havlíček o auditu EU označujícím dotaci za neoprávněnou věděl nejpozději od roku 2019, aktivní vymáhání jako ministr neinicioval a ministerstvo k němu přistoupilo až v roce 2022 pod vedením jeho nástupce; jde o tvrzení komentátora, nikoli o zjištění soudu či úřadu.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-09** (CITACE, zdroje: SRC-05, subjekty: havlicek): Europoslanec Tomáš Zdechovský (KDU-ČSL) podle komentáře FORUM 24 z června 2026 o kauze uvedl: „Karel Havlíček celou dobu zadával posudky a nechtěl po Agrofertu peníze vrátit“ — šlo přibližně o 100 milionů korun.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-10** (CITACE, zdroje: SRC-07, subjekty: havlicek): Havlíček v březnu 2026 sliboval, že novela stavebního zákona bude hotová do července, s odůvodněním „Jsme naprosto v kritické situaci“; vládní zmocněnkyně Hana Landová zároveň připustila, že faktické zrychlení povolování se projeví až po 1. lednu 2028.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-11** (1 ZDROJ, zdroje: SRC-08, subjekty: havlicek): Podle České justice vláda předložila komplexní pozměňovací návrh stavebního zákona o 1083 stranách formou poslaneckého návrhu, čímž obešla standardní připomínkové řízení; poslanci dostali na prostudování zhruba týden. Vládní poslance při předložení vedl vicepremiér Havlíček.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-12** (CITACE, zdroje: SRC-07, SRC-08, subjekty: havlicek): Poslanec Martin Kupka (ODS) Havlíčkovu novelu kritizoval slovy „Je tam několik nášlapných min, a to velmi vážných“ a „Vytvoříte centrální úřad, ale nebude v něm mít kdo pracovat“; v dubnu 2026 označil týdenní lhůtu pro poslance u úpravy měnící téměř 50 zákonů za „naprosto nereálnou“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-13** (CITACE, zdroje: SRC-07, SRC-08, subjekty: havlicek): Poslanec Lukáš Vlček (STAN) označil vládní návrh stavebního zákona za „legislativní paskvil a neskutečný zmetek“ a kritizoval, že „bylo obejito mezirezortní připomínkové řízení“, což podle něj přináší „obrovské zmatky a chyby“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-14** (CITACE, zdroje: SRC-07, SRC-08, subjekty: havlicek): Právníci citovaní Českou justicí novelu kritizovali: Vojtěch Faltus varoval, že rychlejší povolení může přesunout spory k soudům, a o postupu řekl „Připadá mi, že si z nás zákonodárce dělá legraci“; Lenka Němcová upozornila, že rozsah návrhu významně ztěžuje jeho řádné posouzení.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-15** (CITACE, zdroje: SRC-09, subjekty: havlicek): Havlíček v červenci 2026 vyzval automobilky, aby se postavily proti cíli Evropské komise ukončit do roku 2035 prodej aut se spalovacími motory: „Jsou to naprosto nereálné cíle a manažeři velmi dobře už vědí, že jsou nenaplnitelné.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-16** (CITACE, zdroje: SRC-10, subjekty: havlicek): Havlíček v březnu 2026 kritizoval návrh Evropské komise na zmírnění emisních cílů jako nedostatečný: sankce podle něj zůstávají nastavené, „jako by dál platil stoprocentní zákaz“, a „problém není rok 2035, ale i cíle 2030“; zpochybnil též reálnou dostupnost syntetických paliv.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-17** (1 ZDROJ, zdroje: SRC-10, subjekty: havlicek): Podle Ekonomického deníku Babišův kabinet, v němž je Havlíček ministrem průmyslu, požaduje úplné zastavení dalšího snižování emisních cílů EU pro automobily.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-18** (CITACE, zdroje: SRC-09, subjekty: havlicek): Komentátor FORUM 24 Jan Jandourek v červenci 2026 hodnotí Havlíčkovu pozici k elektromobilitě jako dezinterpretaci problému: evropské automobilky podle něj ztrácejí konkurenceschopnost kvůli zaostávání za čínskou konkurencí, nikoli kvůli regulacím EU; jde o hodnocení komentátora.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-19** (1 ZDROJ, zdroje: SRC-11, subjekty: havlicek): Ministerstvo průmyslu a obchodu oficiálně oznámilo 21. března 2022, že přistoupí k odnětí stomilionové dotace Pekárně Zelená louka ze skupiny Agrofert, protože auditoři Evropské komise zjistili, že projekt nesplňoval kritéria inovativnosti programu INOVACE — zaměřoval se na produkt, jehož výroba již ve skupině probíhala.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-20** (CITACE, zdroje: SRC-11, subjekty: havlicek): Náměstek MPO Marian Piecha při oznámení odnětí dotace v březnu 2022 upozornil, že „proces odnětí dotace bude dlouhý a komplikovaný a nelze vyloučit ani soudní jednání“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-21** (1 ZDROJ, zdroje: SRC-12, subjekty: havlicek): Proces odnětí dotace byl více než rok blokován námitkou podjatosti podanou vedením firmy; ve druhé polovině dubna 2023 ministr opravný prostředek zamítl a napadené rozhodnutí potvrdil, čímž mohlo MPO ve vymáhání pokračovat. Náměstek Piecha to shrnul slovy „Penam vymáháme“.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-22** (1 ZDROJ, zdroje: SRC-13, subjekty: havlicek): V říjnu 2024 obvinila Národní centrála proti organizovanému zločinu dvě fyzické osoby a společnost Pekárna Zelená louka v souvislosti s dotací z roku 2018; zjištěná škoda činí 100 milionů korun a stíhání probíhá pro dotační podvod a poškození finančních zájmů EU.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-23** (CORROBORATED, zdroje: SRC-13, SRC-14, subjekty: havlicek): Dotace byla vyplacena v plné výši z rozpočtu České republiky, protože Evropská komise ji ČR po auditu neproplatila — ztráta tak jde k tíži českého státního rozpočtu.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-24** (CORROBORATED, zdroje: SRC-14, SRC-16, subjekty: havlicek): Vyšetřovatelé zajistili (zaplombovali) majetek pekárny v Herinku — výrobní halu a přilehlé budovy — v hodnotě přibližně 98 milionů korun jako zajištění případné náhrady škody.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-25** (1 ZDROJ, zdroje: SRC-14, subjekty: havlicek): Dne 8. června 2026 podala NCOZ státnímu zástupci návrh na obžalobu Pekárny Zelená louka a dvou fyzických osob; státní zástupce Adam Bašný potvrdil: „Spisový materiál s návrhem policejního orgánu NCOZ na podání obžaloby mi byl řádně předložen.“
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-26** (CORROBORATED, zdroje: SRC-15, SRC-16, subjekty: havlicek): Dne 22. června 2026 podal evropský pověřený žalobce Adam Bašný z Úřadu evropského veřejného žalobce (EPPO) obžalobu ke Krajskému soudu v Praze na společnost Pekárna Zelená louka a dvě fyzické osoby.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-27** (1 ZDROJ, zdroje: SRC-15, subjekty: havlicek): Obžaloba navrhuje pro obžalovanou společnost náhradu škody ve výši přibližně 100 milionů korun, pokutu až 50 milionů korun a patnáctiletý zákaz čerpání dotací; dvěma fyzickým osobám hrozí pět až deset let odnětí svobody a pětiletý zákaz čerpání dotací.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-28** (CITACE, zdroje: SRC-15, SRC-16, subjekty: havlicek): Holding Agrofert k obžalobě opakovaně uvedl, že „firma postupovala v souladu se zákonem a na dotaci měla nárok“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-29** (1 ZDROJ, zdroje: SRC-17, subjekty: havlicek): Novelu stavebního zákona (sněmovní tisk 67) předložila 12. prosince 2025 skupina deseti poslanců vedená Andrejem Babišem, mezi nimiž byl i Karel Havlíček; vláda k ní 16. prosince 2025 zaslala souhlasné stanovisko.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-30** (CORROBORATED, zdroje: SRC-17, SRC-22, subjekty: havlicek): Sněmovna schválila novelu ve třetím čtení 10. července 2026 (hlasování č. 117) a Senátu ji postoupila 23. července 2026 jako senátní tisk č. 272 se lhůtou k projednání do 22. srpna 2026; k návrhu bylo podáno přes 100 písemných pozměňovacích návrhů.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-31** (CITACE, zdroje: SRC-18, subjekty: havlicek): Při závěrečném projednávání 8. července 2026 Sněmovna schvalování nedokončila po ostrém vystoupení Karla Havlíčka, který opozici vytkl: „Co jste tady napáchali za poslední roky, to vejde do dějin,“ a její postup k digitalizaci stavebního řízení komentoval slovy „Svazácký boj Pirátů, ale i celé pětikoalice za lepší zítřky dopadl jako vždy, když kolektivisté budují lepší budoucnost.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-32** (CITACE, zdroje: SRC-18, subjekty: havlicek): Na Havlíčkovo vystoupení reagovala Olga Richterová (Piráti) tvrzením, že ministr „evidentně ztrácí nervy“, Michal Kučera (TOP 09), že „předvedl předvolební projev“, a Marek Výborný (KDU-ČSL) slovy „Vaše arogance a drzost fakt nezná mezí“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-33** (1 ZDROJ, zdroje: SRC-19, subjekty: havlicek): Havlíček po schválení novely zdůraznil, že zákon prošel Sněmovnou jen o dva hlasy a že předkladatelé vycházeli opozičním návrhům vstříc.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-34** (CITACE, zdroje: SRC-19, subjekty: havlicek): Poslankyně Veronika Kovářová (Piráti) novele vytkla, že jí chybělo klasické připomínkové řízení a že „legalizuje vznik černých staveb“, a upozornila na nerovnováhu, kdy velké projekty bude schvalovat lépe vybavený centrální úřad, zatímco menší stavby úřady bez dostatku personálu.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-35** (CITACE, zdroje: SRC-20, subjekty: havlicek): Havlíček 4. června 2026 odmítl tvrzení, že novela zvýhodňuje velké developery: „Vyrojila se informace, že novela stavebního zákona urychlí pouze výstavbu bytových projektů nad 10 tisíc metrů čtverečních. Že je šitá pro velké developery. Je to lež.“ Podle něj jde jen o přechodné období do roku 2028, kdy dostanou stejné podmínky všichni.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-36** (CITACE, zdroje: SRC-21, subjekty: havlicek): Havlíček 14. července 2026 připustil, že Senát dostane novelu až v srpnu: „Já jsem hodně tlačil na to, aby to šlo ještě do konce července, ale to se časově zvládnout nedá. Takže věřím, že se nám to podaří do té srpnové senátní schůze.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-37** (CORROBORATED, zdroje: SRC-22, SRC-23, subjekty: havlicek): Senát zařadil novelu stavebního zákona na schůzi 19. a 20. srpna 2026; předseda Senátu Miloš Vystrčil uvedl, že „minimálně stavební zákon bude předmětem velmi podrobné debaty“, a nevyloučil jeho zamítnutí kvůli množství kritických připomínek.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-38** (CORROBORATED, zdroje: SRC-24, SRC-25, subjekty: havlicek): Česká komora autorizovaných inženýrů a techniků (ČKAIT), sdružující 32 000 autorizovaných osob, uvedla, že nebyla přizvána k projednávání novely, že novela nereaguje na zásadní chyby stavebního zákona z roku 2021 a že je přijímána ve zrychleném režimu bez odpovídajících přechodných ustanovení.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-39** (1 ZDROJ, zdroje: SRC-25, subjekty: havlicek): Předseda ČKAIT Robert Špalek varoval, že reforma nepovede k rychlejšímu povolování staveb a že by mohla dopadnout ještě hůře než špatně připravená digitalizace stavebního řízení; kritizuje také chybějící analýzu personálního zajištění jednotné stavební správy.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-40** (1 ZDROJ, zdroje: SRC-26, subjekty: havlicek): Havlíček vedl 26. února 2026 českou delegaci na zasedání Rady EU pro konkurenceschopnost (COMPET) v Bruselu, kde se mimo jiné jednalo o nouzových plánech průmyslové odolnosti navazujících na akční plány pro ocelářský, automobilový a chemický průmysl v rámci Dohody o čistém průmyslu.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-41** (1 ZDROJ, zdroje: SRC-10, subjekty: havlicek): Havlíček označil revizi emisních cílů navrženou Evropskou komisí za nedostatečnou a před senátory uvedl: „Z našeho pohledu je stále nedostatečná, problém není rok 2035, ale i cíle 2030.“ Upozornil, že ačkoliv byl cíl pro rok 2035 zmírněn na 90procentní snížení emisí, sankce zůstávají nastaveny, jako by dál platil absolutní zákaz spalovacích motorů.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-42** (CITACE, zdroje: SRC-10, subjekty: havlicek): K syntetickým palivům, jimiž má být kompenzováno zbývajících 10 procent emisí, Havlíček řekl: „Podívejte se někdy, co je to syntetické palivo, kolik je ho na světě, jaké jsou šance ho vyrobit, kolik to stojí.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-43** (CITACE, zdroje: SRC-27, subjekty: havlicek): Na tiskové konferenci po jednání vlády 13. července 2026 Havlíček odůvodnil svou pozici tím, že Česko je automobilově orientovaná země — „deset procent HDP, 25 procent exportu, několik set tisíc pracovních míst“ — a uvedl, že „manažeři významných společností nejenom automobilových velmi dobře už dnes vědí, že jsou nenaplnitelné“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-44** (1 ZDROJ, zdroje: SRC-30, subjekty: havlicek): Podle reportáže patřilo Česko do koalice sedmi zemí (spolu s Německem, Itálií, Polskem, Maďarskem, Slovenskem a Bulharskem), která tlačila na zmírnění cíle pro rok 2035 z plného zákazu na 90procentní snížení emisí; česká vláda podporuje technologickou neutralitu a hybridní vozidla jako přechodový most.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-45** (1 ZDROJ, zdroje: SRC-29, subjekty: havlicek): Sdružení automobilového průmyslu (AutoSAP) ve svém pozičním dokumentu z 30. dubna 2026 označilo návrh Evropské komise za odtržený od reality a vyčíslilo, že prognózovaný deficit 1,4 milionu vozidel by generoval sankce až 18 miliard eur ročně; výkonný ředitel Zdeněk Petzl uvedl, že „regulace tlačí na producenty přísnými cíli a hrozbou sankcí, zatímco ignoruje ekonomické fakty a zákazníky nechává stranou“.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-46** (1 ZDROJ, zdroje: SRC-31, subjekty: havlicek): Havlíček zahájil 11. června 2026 v Praze konferenci Forum Elektromobilita 2026, na níž vystoupili zástupci Škoda Auto, Orlen, Fastned, BYD Automotive a Hyundai; registrace elektromobilů v EU přitom v období leden–duben 2026 vzrostly o 33 procent, v Česku o 18 procent.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním

## Lubomír Metnar — `lubomir-metnar` (25 tvrzení)

Per-dossier prismatic nástroje a výjimky: viz [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md#per-dossier-kroky).

- [ ] **CLM-01** (1 ZDROJ, zdroje: SRC-01, subjekty: —): Ministerstvo vnitra navrhlo od příštího roku ukončit policejní ochrannou službu u Nejvyššího kontrolního úřadu; úřad by si podle citovaného zpravodajství musel platit soukromou ostrahu, odhadem přibližně 20 milionů korun ročně. K datu vydání zdroje jde o návrh, o němž nebylo rozhodnuto
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-02** (CITACE, zdroje: SRC-01, subjekty: —): Metnar návrh odůvodnil bezpečnostní analýzou Policie ČR, nikoli politickým rozhodnutím; sídlo NKÚ podle něj dlouhodobě vykazuje nejnižší riziko a má vlastní moderní zabezpečení, policejní kapacita má být přesměrována k ochraně České národní banky
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-03** (CITACE, zdroje: SRC-01, subjekty: —): Prezident NKÚ Miloslav Kala označil návrh za „útok na nezávislou instituci\" a „další pokus o vyhladovění\" a uvedl, že úřad nebyl předem informován a dozvěděl se o návrhu z vládních dokumentů
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-04** (1 ZDROJ, zdroje: SRC-02, subjekty: metnar): Podle návrhu ministerstva vnitra by zrušení policejní ochranné služby NKÚ mělo platit od 1. ledna následujícího roku.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-05** (CORROBORATED, zdroje: SRC-02, SRC-03, SRC-04, SRC-05, subjekty: metnar): NKÚ by si podle předběžných propočtů musel platit náhradní soukromou ostrahu za zhruba 20 milionů korun ročně. Doloženo více tituly, které ale přebírají tutéž původní reportáž Seznam Zpráv — nejde o nezávislé potvrzení.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-06** (1 ZDROJ, zdroje: SRC-02, subjekty: metnar): Policejní ochranná služba dosud střeží vstup do sídla NKÚ v pražských Holešovicích, sleduje kamerový systém a prověřuje návštěvníky.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-07** (1 ZDROJ, zdroje: SRC-02, subjekty: metnar): Stejnou policejní ochrannou službu, jakou má dosud NKÚ, využívají také Úřad vlády, ministerstva, Poslanecká sněmovna a Senát.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-08** (CORROBORATED, zdroje: SRC-02, SRC-03, SRC-04, SRC-05, subjekty: metnar): Podle návrhu by policie nově zajišťovala ochranu sídla České národní banky. Doloženo více tituly, které ale přebírají tutéž původní reportáž Seznam Zpráv — nejde o nezávislé potvrzení.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-09** (1 ZDROJ, zdroje: SRC-02, subjekty: metnar): Návrh se připravuje k projednání ve vládě a na poslední jednání vlády se nedostal.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-10** (1 ZDROJ, zdroje: SRC-02, subjekty: metnar): Podle elektronického systému vládních dokumentů dostal Metnarův návrh výjimku, díky níž se k němu nemusí vyjadřovat ostatní instituce, tedy neprochází obvyklým připomínkovým řízením.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-11** (CITACE, zdroje: SRC-02, subjekty: metnar): Původně předložený materiál neobsahoval podrobné zdůvodnění a uváděl pouze, že „Materiál je předkládán z důvodu aktuálních potřeb zajištění bezpečnosti určitých objektů“, bez dalšího upřesnění.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-12** (CORROBORATED, zdroje: SRC-02, SRC-05, subjekty: metnar): O návrhu jako první informoval server Seznam Zprávy ve středu 29. července 2026; ostatní česká média zprávu následně přebírala. Doloženo více tituly, které ale přebírají tutéž původní reportáž Seznam Zpráv — nejde o nezávislé potvrzení.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-13** (CITACE, zdroje: SRC-03, subjekty: metnar): Ministr vnitra Lubomír Metnar své zdůvodnění shrnul slovy: „Návrh nevychází z politického rozhodnutí, ale z bezpečnostní analýzy Policie ČR a z aktuálního vyhodnocení ochrany státních objektů.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-14** (CITACE, zdroje: SRC-03, SRC-04, subjekty: metnar): Metnar svůj postoj dále odůvodnil výrokem: „Bezpečnostní kapacity musí být nasazovány tam, kde jsou podle odborného posouzení nejvíce potřeba.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-15** (CITACE, zdroje: SRC-02, subjekty: metnar): Ministerstvo vnitra v dodatečně vydaném rozšířeném vysvětlení uvedlo, že policie vyhodnotila, že „sídlo NKÚ vykazuje dlouhodobě nejnižší riziko a zároveň disponuje vlastním moderním zabezpečením“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-16** (CITACE, zdroje: SRC-02, subjekty: metnar): Ministerstvo vnitra jako cíl opatření uvedlo „efektivnější rozdělení policejních kapacit tak, aby mohly být využity tam, kde je potřeba nejvyšší“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-17** (1 ZDROJ, zdroje: SRC-02, subjekty: metnar): Ministr Metnar se k dotazům Seznam Zpráv v úterý nevyjádřil; podrobnější zdůvodnění poskytlo ministerstvo vnitra až následně.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-18** (CORROBORATED, zdroje: SRC-02, SRC-03, SRC-05, subjekty: metnar): Prezident NKÚ Miloslav Kala uvedl, že o plánu na zrušení policejní ochrany jeho úřad nikdo neinformoval a dozvěděl se o něm až z elektronického systému vládních dokumentů. Doloženo více tituly, které ale přebírají tutéž původní reportáž Seznam Zpráv — nejde o nezávislé potvrzení.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-19** (CITACE, zdroje: SRC-02, SRC-03, subjekty: metnar): Kala návrh charakterizoval slovy: „Já to považuju za útok na nezávislou instituci. A za další pokus o její vyhladovění, aby se méně věnovala kontrolám.“ Jde o hodnocení jedné strany sporu, nikoli o zjištěné pochybení.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-20** (CITACE, zdroje: SRC-02, SRC-03, subjekty: metnar): Kala k návrhu dále uvedl: „Je to pořád stejný tlak na nesmyslné úspory.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-21** (CITACE, zdroje: SRC-02, SRC-03, subjekty: metnar): Kala postavil úsporné opatření do kontrastu s rozšiřováním agendy úřadu slovy: „A na druhou stranu se po nás chce, abychom nově kontrolovali například Českou televizi nebo Český rozhlas.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-22** (1 ZDROJ, zdroje: SRC-02, subjekty: metnar): NKÚ podle prezidenta úřadu již v minulosti musel podle požadavků vlády šetřit a snížit počet zaměstnanců.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-23** (1 ZDROJ, zdroje: SRC-02, subjekty: metnar): Spor mezi Andrejem Babišem a Miloslavem Kalou sahá do roku 2016, kdy Babiš jako ministr financí bez konkrétních argumentů prohlásil, že cena stavby sídla NKÚ je podle něj příliš vysoká, a z pozice ministra financí brzdil uvolnění peněz.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-24** (1 ZDROJ, zdroje: SRC-02, subjekty: metnar): NKÚ si na stavbu své budovy v Holešovicích našetřil třetinu z celkových 690 milionů korun.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-25** (1 ZDROJ, zdroje: SRC-06, subjekty: metnar): Prezident Petr Pavel 22. července 2026 vetoval novelu rozpočtových zákonů mimo jiné s odůvodněním obav o nezávislost institucí; norma by podle něj umožnila ministerstvu financí zasahovat do hospodaření Ústavního soudu, ombudsmana, NKÚ a Národní rozpočtové rady.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním

## Petr Macinka / Filip Turek (kanonický, aggregate macinka-turek) — `macinka-turek` (49 tvrzení)

Per-dossier prismatic nástroje a výjimky: viz [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md#per-dossier-kroky).

- [ ] **CLM-01** (CORROBORATED, zdroje: SRC-11, SRC-12, SRC-13, subjekty: turek): Turek zvolen europoslancem v červnu 2024 za společnou kandidátku Motoristů a Přísahy
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-02** (CORROBORATED, zdroje: SRC-11, SRC-13, subjekty: turek): Turek v říjnu 2025 zvolen poslancem, nejvyšší počet preferenčních hlasů Motoristů ve Středočeském kraji
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-03** (CORROBORATED, zdroje: SRC-11, SRC-13, subjekty: macinka): Macinka předsedou Motoristů sobě od 2022; zvolen poslancem 2025 za Jihomoravský kraj; Motoristé sobě 13 mandátů, vstup do vlády s ANO a SPD
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-04** (CORROBORATED, zdroje: SRC-12, SRC-14, subjekty: turek): V roce 2024 čelil Turek kritice kvůli fotografii se zdviženou pravicí (2013) a sbírce svícnů s hákovými kříži
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-05** (CITACE, zdroje: SRC-12, SRC-14, subjekty: turek): Turek fotografii/sbírku označil za „špatný humor\" / sběratelský zájem
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-06** (CITACE, zdroje: SRC-12, SRC-14, subjekty: macinka, turek): Macinka kauzu 2024 veřejně hájil, označil ji za „pseudoproblém\"
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-07** (1 ZDROJ, zdroje: SRC-15, subjekty: turek): Deník N v říjnu 2025 zveřejnil údajné smazané příspěvky připisované Turkovi s rasistickým/homofobním obsahem
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-08** (CITACE, zdroje: SRC-16, subjekty: turek): Turek odmítl autorství nejzávažnějších z těchto příspěvků
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-09** (SPORNÉ, zdroje: SRC-15, SRC-16, SRC-22, subjekty: turek): Pravost/autorství screenshotů z CLM-07 nebyla nezávisle prokázána ani vyvrácena
      → otevřené/sporné — sledovat vývoj, dohledat rozhodnutí/výsledek
- [ ] **CLM-10** (1 ZDROJ, zdroje: SRC-02, subjekty: turek): Auto Turka se v červenci 2026 v Praze střetlo se zdravotnickým vozem; dle záběrů předjížděl frontu v odbočovacím pruhu
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-11** (CORROBORATED, zdroje: SRC-06, SRC-07, subjekty: turek): Turek dočasně opustil funkci zmocněnce pro Green Deal, přislíbil rezignaci při prokázání viny
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-12** (CORROBORATED, zdroje: SRC-06, SRC-08, subjekty: turek): Babiš dle zdrojů řekl Macinkovi, že pokud se záběry potvrdí, měl by Turek rezignovat
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-13** (CITACE, zdroje: SRC-01, SRC-04, subjekty: macinka, turek): Macinka veřejně opakovaně prohlásil, že se Turka nevzdá
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-14** (CORROBORATED, zdroje: SRC-17, SRC-18, subjekty: macinka): Macinka (od prosince 2025 ministr zahraničí) nepřiznal v majetkovém přiznání 20% podíl v ukrajinské firmě GMR GAS UA LLC (od 2017); po upozornění Investigace.cz podíl dodatečně přiznal, hrozí mu pokuta až 50 000 Kč
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-15** (CITACE, zdroje: SRC-17, SRC-18, subjekty: macinka): Macinkovo vysvětlení: firma „de facto neexistuje\" kvůli válce na Ukrajině, plánovaná likvidace se zpozdila
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-16** (1 ZDROJ, zdroje: SRC-19, subjekty: turek): Policie potvrdila, že dopravní značení na místě nehody odpovídalo projektové dokumentaci — v rozporu s Turkovým tvrzením, že o odbočovací pruh nešlo
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-17** (CITACE, zdroje: SRC-20, subjekty: turek): Turkova verze nehody: jel na zelenou křižovatkou Ječná/Sokolská, sanitka vjela na červenou s majáky
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-18** (1 ZDROJ, zdroje: SRC-20, subjekty: turek): Turek se vzdal poslanecké imunity pro případ trestního stíhání; dechová zkouška negativní; řidič sanitky utrpěl středně těžké poranění hlavy a zranění lokte
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-19** (1 ZDROJ, zdroje: SRC-21, subjekty: turek): Motoristé sobě v říjnu 2025 podali trestní oznámení na Deník N a autory článku o Turkových příspěvcích pro pomluvu a křivé obvinění
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-20** (1 ZDROJ, zdroje: SRC-23, subjekty: turek): Turek je/byl 2016–2023 statutárním orgánem nebo společníkem v pěti firmách/spolcích (Art of Performance, Aston Martin klub ČR, Transgas, Jaguar klub ČR, Zapper-Club)
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-21** (1 ZDROJ, zdroje: SRC-25, subjekty: turek): Turek osobně daroval Motoristům sobě celkem 210 000 Kč (10 000 Kč v 2019, 200 000 Kč v 2025)
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-22** (1 ZDROJ, zdroje: SRC-24, subjekty: macinka): Macinka je/byl statutárním orgánem nebo společníkem v sedmi firmách/spolcích (DRILL COMPANY, Kauppias, Centrum pro výzkum terorismu, Motoristé Praha, PG Contract, Klub motoristů, MEAS Consulting); u DRILL COMPANY a Motoristé Praha skončil počátkem ledna 2026
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-23** (1 ZDROJ, zdroje: SRC-26, subjekty: macinka): Macinka osobně daroval 510 000 Kč (ODS 2017, Motoristé sobě 2× 2022) a přes Klub motoristů z.s., kde je statutárním orgánem, přišlo Motoristům sobě v roce 2024 dalších 800 000 Kč — celkem 1 310 000 Kč
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-24** (1 ZDROJ, zdroje: SRC-27, subjekty: macinka): Macinka byl od 2025 zároveň ministrem zahraničí, místopředsedou vlády a 2025–2026 dočasně pověřen i řízením Ministerstva životního prostředí
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-25** (CORROBORATED, zdroje: SRC-28, SRC-29, SRC-30, subjekty: turek): Bývalá partnerka v červnu 2025 podala trestní oznámení, ve kterém Turka viní z několikaletého domácího násilí, vyhrožování střelnou zbraní a jednoho případu znásilnění, k nimž mělo dojít podle jejího popisu před 15–20 lety
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-26** (CITACE, zdroje: SRC-29, SRC-30, subjekty: turek): Turek trestní jednání a násilí kategoricky odmítl, označil oznámení za „mediální lynč\" s politickým motivem; nevěru v tomto kontextu připustil
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-27** (CORROBORATED, zdroje: SRC-31, SRC-54, subjekty: turek): V květnu 2026 policie trestní oznámení odložila z důvodu promlčení (oznámilo Obvodní státní zastupitelství pro Prahu 4); rozhodnutí není pravomocné, žena proti němu podala stížnost. Jde o procesní důsledek uplynutí promlčecí doby, ne o rozhodnutí o vině nebo nevině
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-28** (1 ZDROJ, zdroje: SRC-32, subjekty: turek): V roce 2017 Turek nechal na autě zaměstnance saúdskoarabské ambasády kresbu oprátky a loveckou nábojnici; policie věc uzavřela jako pravděpodobnou záměnu osob a vyřešila jako přestupek
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-29** (CITACE, zdroje: SRC-32, subjekty: turek): Turkovo vysvětlení: bránil tehdejší přítelkyni, odmítl rasový motiv i vědomí, že jde o zaměstnance ambasády
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-30** (1 ZDROJ, zdroje: SRC-33, subjekty: turek): V roce 2026 dostal Turek pokuty v součtu 200 000 Kč za dvě nepovolené stavby na pozemku v Praze-Dubči (80 000 Kč nedbalost, 120 000 Kč úmysl); obě dodatečně zlegalizoval
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-31** (CORROBORATED, zdroje: SRC-34, SRC-35, subjekty: turek): Turkova firma Zapper-Club s.r.o. nabízela za pandemie „Imunitní balíček ANTI-COVID-19\"; přístroj zapper byl předmětem varování Ministerstva zdravotnictví a SZPI mu odebrala certifikát
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-32** (1 ZDROJ, zdroje: SRC-36, subjekty: turek): Z 27 dokumentovaných startů Turkovy závodní kariéry (2015–2017, Formula 4 Trophy) měl 12 výher; čtyřikrát jel sám, šestkrát proti jedinému soupeři
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-33** (CORROBORATED, zdroje: SRC-36, SRC-37, subjekty: turek): Turek se (spolu s Kateřinou Konečnou a Václavem Klausem) setkal s íránským velvyslancem; všichni tři schůzku potvrdili a označili ji za zdvořilostní návštěvu
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-34** (1 ZDROJ, zdroje: SRC-38, subjekty: turek): Turek si v dubnu 2026 koupil byt na Strahově za 18 mil. Kč na hypotéku — jediná další nemovitost vedle pozemku v Praze-Dubči
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-35** (CORROBORATED, zdroje: SRC-39, SRC-40, subjekty: macinka, turek): Motoristé sobě zveřejnili povinné přehledy dárců kampaně PS 2025 (UDHPSH); mezi velké dárce patřili Boris Šťastný (~5 mil. Kč přes Medical Investments) a František Fabičovic (1 mil. Kč)
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-36** (CORROBORATED, zdroje: SRC-41, SRC-42, subjekty: macinka, turek): Podnikatel Richard Chlad (dřívější osobní vazba na Radovana Krejčíře) oficiálně daroval Motoristům sobě v roce 2025 evidovaných 638 864 Kč, zatímco sám veřejně uváděl podporu v hodnotě „necelých dvou milionů\" Kč — do té podle CNN Prima News počítal i nepeněžní plnění (zápůjčky vozů), obě čísla tedy neměří totéž
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-37** (1 ZDROJ, zdroje: SRC-43, subjekty: macinka, turek): Turek i Macinka veřejně odmítali, že by Chlad hrál v okolí strany významnější roli; Macinka uváděl vlastní nižší částky (2× 50 000 Kč před eurovolbami) než sám Chlad
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-38** (CORROBORATED, zdroje: SRC-44, SRC-45, subjekty: turek): V lednu 2026 prezident Petr Pavel odmítl jmenovat Turka ministrem životního prostředí; jako důvod uvedl opakovaný nedostatek respektu k právnímu řádu, zlehčování nacistického Německa a zpochybňování důstojnosti a rovnosti žen a příslušníků menšin
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-39** (CITACE, zdroje: SRC-44, subjekty: turek): Turek 9. 1. 2026 oznámil, že na prezidenta podá žalobu na ochranu osobnosti a bude žádat omluvu za toto zdůvodnění
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-40** (CORROBORATED, zdroje: SRC-45, SRC-46, subjekty: macinka): Turek namísto ministerského postu působil jako vládní zmocněnec pro klimatickou změnu a Green Deal (funkci po nehodě v červenci 2026 dočasně opustil, viz CLM-11); premiér Babiš označil jeho jmenování ministrem za „uzavřenou kapitolu\"; řízením ministerstva byl dočasně pověřen Petr Macinka
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-41** (CORROBORATED, zdroje: SRC-47, SRC-48, subjekty: turek): Dne 28. 7. 2026 policie odložila prověřování Turkových výroků z CLM-07 pro promlčení; rozhodnutí není pravomocné. Jde o procesní důsledek uplynutí promlčecí doby, ne o posouzení pravosti nebo obsahu výroků. Policie zároveň nepotvrdila verzi Motoristů, že zveřejněné materiály byly zfalšované
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-42** (CORROBORATED, zdroje: SRC-47, SRC-48, subjekty: turek): Policie zároveň odložila trestní oznámení, které v říjnu 2025 podali Motoristé sobě na Deník N a autory článku (CLM-19), s odůvodněním, že zveřejnění informací nebylo trestným činem
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-43** (CORROBORATED, zdroje: SRC-49, SRC-50, subjekty: macinka): Dne 23. 2. 2026 prezident Petr Pavel jmenoval ministrem životního prostředí Igora Červeného (Motoristé sobě); tím skončilo dočasné pověření Petra Macinky vedením tohoto úřadu zmiňované v CLM-24 a CLM-40
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-44** (CORROBORATED, zdroje: SRC-51, SRC-52, subjekty: turek): Dne 27. 7. 2026 Turek oznámil, že žalobu na ochranu osobnosti proti prezidentu Pavlovi (avizovanou v CLM-39) nakonec nepodá; jako důvod uvedl, že „z mnoha důvodů\" svůj postoj přehodnotil, bez bližšího upřesnění
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-45** (1 ZDROJ, zdroje: SRC-53, subjekty: turek): V listopadu 2024 policie odložila případ Turkova údajného hajlování (fotografie z roku 2013, CLM-04) z důvodu promlčení trestní odpovědnosti; sbírky svícnů se rozhodnutí netýkalo. Jde o procesní důsledek uplynutí promlčecí doby, ne o rozhodnutí o vině
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-46** (1 ZDROJ, zdroje: SRC-55, subjekty: macinka): Českou společností za GMR GAS UA LLC je podle obchodního rejstříku GMR GAS s.r.o., IČO 28274318, se sídlem v Brně, zapsaná 2008 pod jménem KADAR s.r.o. a přejmenovaná 2015; mezi jejími zapsanými činnostmi je montáž, opravy a revize plynových zařízení
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-47** (1 ZDROJ, zdroje: SRC-17, subjekty: macinka): Podle Investigace.cz je GMR GAS UA LLC ukrajinskou pobočkou české společnosti vyrábějící regulátory tlaku plynu a vedle Macinky v ní drží podíl i tato česká společnost a podnikatel Tomáš Cabal
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-48** (CORROBORATED, zdroje: SRC-17, SRC-55, subjekty: macinka): Jediným společníkem (podíl 100 %, vklad 200 000 Kč) a jednatelem GMR GAS s.r.o. je Petr Vencálek, jednatelem od prosince 2014
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-49** (1 ZDROJ, zdroje: SRC-56, subjekty: turek): K odložení věci pro promlčení dozorující státní zástupce Jan Vychyta uvedl, že k danému skutku došlo a že by byl trestným činem, ale trestní odpovědnost zanikla promlčením; policie podle citovaného zdroje zjištění Deníku N nezpochybnila. Turek autorství konkrétního komentáře odmítal, za některé jiné výroky se omluvil
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním

## Martin Šebestyán — `martin-sebestyan` (44 tvrzení)

Per-dossier prismatic nástroje a výjimky: viz [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md#per-dossier-kroky).

- [ ] **CLM-01** (1 ZDROJ, zdroje: SRC-01, subjekty: sebestyan): Martin Šebestyán zastává podle oficiálního profilu na webu Úřadu vlády funkci ministra zemědělství
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-02** (1 ZDROJ, zdroje: SRC-07, subjekty: sebestyan): Podle ČT24 (15. 1. 2026) SZIF k polovině ledna 2026 nezahájil vymáhání dotací po firmách Agrofertu a ministerstvo zemědělství vedené Šebestyánem uvádělo, že mu k zahájení řízení „chybí klíčový dokument“.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-03** (1 ZDROJ, zdroje: SRC-07, subjekty: sebestyan): Exministr Marek Výborný (KDU-ČSL) podle ČT24 tvrdil, že SZIF disponuje třemi právními analýzami potvrzujícími nezákonnost vyplacení dotací Agrofertu; podle těchto analýz jde o více než 7 miliard Kč. Deník N v lednu 2026 napsal, že SZIF analýzu externí advokátní kanceláře skutečně má, ač mluvčí ministerstva tvrdil opak.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-04** (CITACE, zdroje: SRC-06, subjekty: sebestyan): Šebestyán se hájí (rozhovor pro iROZHLAS, přepis na webu MZe, 5. 3. 2026): vymáhání dotací po Agrofertu podle něj „nikdo nezastavil“, protože je minulá vláda vůbec nezačala — Nekula je sliboval už v roce 2022, ale do Šebestyánova nástupu v prosinci 2025 se podle něj nic nestalo; nyní čeká na kompletní právní analýzu SZIF s konkrétními částkami.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-05** (CITACE, zdroje: SRC-07, subjekty: sebestyan): Bývalý předseda Pirátů Ivan Bartoš podle ČT24 označil postup resortu za „zlodějinu“ a Piráti pohrozili trestním oznámením, pokud ministerstvo vymáhání dotací nezahájí; premiér Babiš naopak v parlamentu prohlásil, že Agrofert „nic nedluží“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-06** (1 ZDROJ, zdroje: SRC-02, subjekty: sebestyan): Ministerstvo pro místní rozvoj podle Deníku N uvedlo, že dopis Evropské komise „je vztažen ke všem fondům EU (včetně zemědělských)“ — tedy v rozporu s výkladem ministra Šebestyána; shodně argumentuje i komentář Aleše Rozehnala, podle nějž EK výslovně požadovala nevykazovat výdaje spojené s Agrofertem do vyřešení střetu zájmů.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-07** (CITACE, zdroje: SRC-02, subjekty: sebestyan): Advokát Aleš Rozehnal v komentáři na HlídacíPes.org (29. 5. 2026) hodnotí — jde o jeho názor, nikoli soudní zjištění — že ministrův výrok „Evropská komise dotace pro Agrofert nezastavila“ je manipulativní a „nepůsobí jako snaha veřejnost informovat, ale jako snaha veřejnost oklamat“; riziko podle něj je, že EK sporné výdaje neproplatí a ponese je český rozpočet.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-08** (CORROBORATED, zdroje: SRC-04, SRC-26, subjekty: sebestyan): Šebestyán vedl Státní zemědělský intervenční fond (SZIF) od roku 2013; v srpnu 2022 po dohodě s ministrem Nekulou ve funkci ředitele skončil a k 15. 10. 2022 mu nebyl prodloužen ani mandát v dozorčí radě Podpůrného a garančního rolnického a lesnického fondu.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-09** (1 ZDROJ, zdroje: SRC-04, subjekty: sebestyan): SZIF pod Šebestyánovým vedením po auditu Evropské komise z roku 2019 zastával názor, že střet zájmů premiéra Babiše se nepotvrdil a že se na fond nevztahují omezení tuzemského zákona o střetu zájmů — ačkoli auditoři Komise došli k opačnému závěru.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-10** (CITACE, zdroje: SRC-04, subjekty: sebestyan): Vyplácení eurodotací firmám Agrofertu fond za Šebestyána zastavil podle jeho vlastních slov „preventivně z úcty ke komisi“; národní dotace a nárokové přímé platby jim ale vyplácel dál, za což byl kritizován (u nárokových plateb podle iROZHLAS ke střetu nemohlo docházet i podle názoru Bruselu).
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-11** (1 ZDROJ, zdroje: SRC-04, subjekty: sebestyan): Vedení SZIF v čele se Šebestyánem v srpnu 2022 veřejně vyzvalo vládu Petra Fialy, aby Evropskou komisi kvůli výsledkům auditu ke střetu zájmů zažalovala.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-12** (CORROBORATED, zdroje: SRC-03, SRC-05, subjekty: sebestyan): Transparency International ČR 26. 11. 2025 veřejně varovala, že nominace Šebestyána na ministra zemědělství je podle ní „vážným rizikem pro veřejné rozpočty“, a to kvůli „nízké osobní integritě“ a rozpočtu resortu cca 50 mld. Kč ročně — jde o hodnocení TI, nikoli o zjištění soudu či jiného orgánu.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-13** (CITACE, zdroje: SRC-03, SRC-05, subjekty: sebestyan): Ředitel TI ČR David Kotora uvedl: „Šebestyán v tehdejší roli šéfa SZIF selhal, protože byl jedním z klíčových lidí s vlivem na vyplácení dotací firmám z koncernu Agrofert.“ Nominaci podle něj získal především pro „vysokou míru loajality“ vůči Babišovi.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-14** (CITACE, zdroje: SRC-03, SRC-05, subjekty: sebestyan): Podle TI měl Šebestyán v čele SZIF k dispozici veřejně známé informace potvrzující střet zájmů tehdejšího premiéra Babiše (podněty TI, rozhodnutí EK), podle TI je však ignoroval a „tlačil SZIF do pozice, která argumentačně nahrávala Babišovi a jeho soukromým společnostem“ — jde o tvrzení TI, které Šebestyánova strana odmítá.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-15** (CITACE, zdroje: SRC-05, subjekty: sebestyan): Obhajoba: předseda SPD Tomio Okamura na kritiku reagoval slovy, že Šebestyán „nikdy nebyl z ničeho obviněn, nikdy nebyl za nic souzen, nikdy nebylo podezření z žádné korupce“ a jako vysoce postavený úředník „plně postupoval v souladu se zákonem“; žádný soud pochybení Šebestyána nekonstatoval.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-16** (CITACE, zdroje: SRC-05, subjekty: sebestyan): Exministr Výborný po nominaci uvedl, že bude „velmi bedlivě sledovat“, zda Šebestyán nezasahuje do nezávislosti SZIF a zda bude pokračovat vymáhání dotací po Agrofertu; Šebestyána označil za faktického „lobbistu za zájmy výhradně těch největších zemědělských a potravinářských holdingů“ — jde o hodnocení politického oponenta.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-17** (1 ZDROJ, zdroje: SRC-08, subjekty: sebestyan): Dozorčí rada SZIF na jednání 24. února 2026 vyzvala generálního ředitele fondu Petra Dlouhého k bezodkladnému zahájení kroků potřebných k vymáhání neoprávněně vyplacených dotací; předsedou rady je Tomáš Dubský (STAN).
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-18** (CORROBORATED, zdroje: SRC-08, SRC-15, subjekty: sebestyan): Ministr Šebestyán se jednání dozorčí rady SZIF 24. února 2026 nezúčastnil a uvedl, že do činnosti fondu nebude nijak zasahovat; totéž stanovisko zopakoval v dubnu 2026 k otázce zveřejnění právních analýz.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-19** (1 ZDROJ, zdroje: SRC-08, subjekty: sebestyan): Opoziční Piráti podali s podporou Asociace soukromého zemědělství trestní oznámení u Vrchního státního zastupitelství v Praze s tvrzením, že stát v „deagrofertizaci“ nikdy nezačal konat. Trestní oznámení samo o sobě neznamená zahájení stíhání ani zjištění pochybení.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-20** (CORROBORATED, zdroje: SRC-08, SRC-09, subjekty: sebestyan): Andrej Babiš vložil 20. února 2026 Agrofert do soukromého svěřenského fondu RSVP Trust.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-21** (CORROBORATED, zdroje: SRC-09, SRC-10, SRC-11, subjekty: sebestyan): SZIF na konci dubna 2026 rozhodl, že Agrofert může znovu čerpat dotace, protože podle generálního ředitele Petra Dlouhého svěřenský fond RSVP Trust splňuje podmínky vypořádání majetkových poměrů.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-22** (1 ZDROJ, zdroje: SRC-09, subjekty: sebestyan): SZIF se na základě objednaných externích právních analýz rozhodl nevymáhat zpětně nárokové evropské dotace vyplacené Agrofertu v letech 2017–2021; podle výkladu se zákaz vztahuje výlučně na nenárokové dotace.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-23** (1 ZDROJ, zdroje: SRC-09, subjekty: sebestyan): Ivan Bartoš zpochybnil objednané právní analýzy SZIF s poukazem na to, že je zpracovala advokátní kancelář Portos (dříve Češka a Smutný); Vít Rakušan (STAN) uvedl, že nevymáhané miliardy poškodí rozpočet na obranu a vědu. Jde o politická hodnocení opozice.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-24** (CITACE, zdroje: SRC-15, subjekty: sebestyan): Ministr Šebestyán v dubnu 2026 uvedl, že se s právními analýzami, o něž SZIF opřel rozhodnutí, sám dosud neseznámil, protože jsou vedeny jako neveřejné, a že k jejich zveřejnění podle něj „jednou“ dojde, ale nezná smluvní ujednání mezi fondem a advokátními kancelářemi.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-25** (1 ZDROJ, zdroje: SRC-12, subjekty: sebestyan): Podle nejmenovaného vysokého představitele EU citovaného 28. května 2026 se dopis Evropské komise z 20. května 2026 vztahuje také na zemědělské fondy; podle zdrojů ČTK nebyly informace od českých úřadů pro Komisi dostatečné k uzavření posouzení.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-26** (CORROBORATED, zdroje: SRC-12, SRC-13, subjekty: sebestyan): Ministr Šebestyán trvá na tom, že pozastavit platby je oprávněna pouze Evropská komise oficiálním právním aktem, tedy prováděcím rozhodnutím, a že dopis z Bruselu je pouze pracovní, právně nezávaznou komunikací; proto resort dotace Agrofertu vyplácí dál.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-27** (CITACE, zdroje: SRC-13, subjekty: sebestyan): Ministr Šebestyán ve Sněmovně 11. června 2026 uvedl, že předmětem historického auditního šetření Evropské komise nikdy nebyly nárokové dotace, tedy přímé platby, a že ty Evropská komise po celou dobu proplácela.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-28** (CORROBORATED, zdroje: SRC-10, SRC-11, subjekty: sebestyan): Generální ředitelství Evropské komise pro zemědělství (DG Agri) podle SZIF na začátku června 2026 potvrdilo, že postup dohodnutý se SZIF zůstává v platnosti, včetně režimu vykazování plateb firmám z Agrofertu.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-29** (CORROBORATED, zdroje: SRC-10, SRC-11, subjekty: sebestyan): Podle údajů Seznam Zpráv převzatých dalšími médii vyplatil SZIF holdingu Agrofert od nástupu Andreje Babiše do funkce premiéra téměř 200 milionů korun na dotacích.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-30** (1 ZDROJ, zdroje: SRC-14, subjekty: sebestyan): Mimořádnou schůzi Sněmovny k dotacím Agrofertu svolanou pěticí opozičních stran Sněmovna 11. června 2026 fakticky zablokovala: program schůze podpořilo 66 poslanců ODS, STAN, Pirátů, KDU-ČSL a TOP 09 ze 151 přítomných, proti bylo 85 poslanců koaličních ANO, SPD a Motoristů. Ministr Šebestyán na schůzi uvedl, že resort postupuje správně a transparentně.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-31** (1 ZDROJ, zdroje: SRC-17, subjekty: sebestyan): Transparency International ČR odeslala 25. května 2026 podnět institucím EU — DG AGRI, DG JUST, DG BUDGET, úřadu OLAF a Evropskému účetnímu dvoru — s varováním, že svěřenský fond RSVP TRUST nesplňuje parametry pro zamezení střetu zájmů podle čl. 61 nařízení č. 2024/2509. Jde o hodnocení nevládní organizace, nikoli o zjištění orgánu veřejné moci.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-32** (CITACE, zdroje: SRC-17, subjekty: sebestyan): Právník Transparency International ČR Kryštof Doležal označil statut Babišova svěřenského fondu za „spíše o zástěrku umožňující obnovení vyplácení dotačních prostředků“; TI v témže materiálu uvádí, že SZIF je podřízen ministerstvu vedenému Martinem Šebestyánem, který byl dříve ředitelem fondu. Jde o stanovisko NGO.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-33** (1 ZDROJ, zdroje: SRC-16, subjekty: sebestyan): Server Demagog.cz ověřil výrok Martina Šebestyána z 13. května 2026, že investiční dotace pro Agrofert zastavil on v rámci SZIF po dohodě s Evropskou komisí, a vyhodnotil jej jako pravdivý: SZIF pod jeho vedením pozastavil firmám z Agrofertu 28 investičních projektů za více než půl miliardy korun a ve všech 28 soudních sporech uspěl fond.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-34** (1 ZDROJ, zdroje: SRC-16, subjekty: sebestyan): Podle ověření Demagog.cz byla jedinou dotací z auditované skupiny, která byla Agrofertu skutečně vyplacena, částka 1,6 milionu korun pro Schrom Farms, poskytnutá ještě před auditním procesem; firma ji následně vracela.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-35** (1 ZDROJ, zdroje: SRC-24, subjekty: sebestyan): Kontrolní akce NKÚ č. 23/06 zaměřená na Program rozvoje venkova 2014–2020 — tedy období, kdy SZIF vedl Martin Šebestyán — podle vyjádření Ministerstva zemědělství z března 2024 nenašla pochybení při administraci, kontrolách ani zadávání veřejných zakázek; zjištěné nedostatky se týkaly vyplňování monitorovacích zpráv žadateli.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-36** (1 ZDROJ, zdroje: SRC-23, subjekty: sebestyan): Ministerstvo zemědělství ve stanovisku z 16. prosince 2025 argumentuje, že § 4c zákona o střetu zájmů je napsán nepřesně, že dosud nebylo vydáno žádné soudní rozhodnutí ke způsobilosti Agrofertu na nárokové dotace a že by Česká republika byla jediným členským státem EU vymáhajícím nárokové dotace kvůli střetu zájmů.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-37** (1 ZDROJ, zdroje: SRC-23, subjekty: sebestyan): Podle stanoviska Ministerstva zemědělství odložily NCOZ a evropský pověřený žalobce trestní věci týkající se této problematiky v letech 2022–2023.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-38** (CORROBORATED, zdroje: SRC-18, SRC-19, subjekty: sebestyan): Ministr Šebestyán prosadil obnovení dotačního programu pro velké podniky v objemu 250 milionů korun, z nějž bude moci čerpat i Agrofert; program byl dříve ukončen na základě zjištění NKÚ, který kritizoval jeho netransparentnost a neefektivní vynakládání financí. Ministr částku označil za „pouze symbolickou“.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-39** (1 ZDROJ, zdroje: SRC-18, subjekty: sebestyan): Podle FORUM 24 byl současně program „Zlepšení životních podmínek hospodářských zvířat“ navýšen z necelé miliardy na 1,3 miliardy korun, a to na úkor podpory rozvoje venkova a zemědělského výzkumu.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-40** (1 ZDROJ, zdroje: SRC-19, subjekty: sebestyan): Ministr Šebestyán v únoru 2026 varoval, že potravinová soběstačnost České republiky se začíná blížit 50 procentům, a avizoval, že vláda chystá zavedení předkupního práva na zemědělskou půdu pro aktivní zemědělce; resort podle něj v roce 2026 hospodaří s rozpočtem 63,4 miliardy korun, z toho 46,2 miliardy pro agrární sektor a 4 miliardy na národní dotace.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-41** (1 ZDROJ, zdroje: SRC-20, subjekty: sebestyan): Ministr Šebestyán jmenoval 26. února 2026 potravinovým ombudsmanem Jindřicha Fialku, dosavadního ředitele sekce potravinářství ministerstva, který si funkci ředitele sekce ponechal. Krok ocenila Agrární komora, kritizovala jej Asociace soukromého zemědělství i poslanci ODS Petr Bendl a europoslankyně Veronika Vrecionová.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-42** (1 ZDROJ, zdroje: SRC-21, subjekty: sebestyan): Předseda Asociace soukromého zemědělství Jaroslav Šebek označil v lednu 2026 Šebestyána za „přiznaného lobbistu“ za zájmy zhruba dvacítky zemědělských a potravinářských gigantů a jeho nominaci za popření oprávněných zájmů zemědělců; Agrární komora a Zemědělský svaz nominaci naopak podpořily. Šebestyán reagoval, že postoj ASZ není založen na rozumných argumentech. Jde o hodnocení zájmových svazů.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-43** (1 ZDROJ, zdroje: SRC-22, subjekty: sebestyan): Prezident Agrární komory Jan Doležal vyzval 21. května 2026 na sněmu komory v Olomouci ke svolání mimořádného jednání vlády kvůli krizi v zemědělství a požadoval nezdaňování dotací, úlevy na sociálním pojištění a zmírnění regulatorní a daňové zátěže; ministr Šebestyán reagoval ujištěním, že resort situaci vyhodnocuje i na evropské úrovni.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-44** (1 ZDROJ, zdroje: SRC-25, subjekty: sebestyan): Bývalý ministr Marek Výborný (KDU-ČSL) v lednu 2026 uvedl, že u dvou společností z Agrofertu byly kontroly zahájeny ještě za jeho působení, a mluvčí SZIF Eva Češpiva potvrdila, že fond právní analýzu má, ale odmítla sdělit, zda je v ní kategoricky doporučeno vymáhání.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním

## Oto Klempíř — `oto-klempir` (43 tvrzení)

Per-dossier prismatic nástroje a výjimky: viz [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md#per-dossier-kroky).

- [ ] **CLM-01** (1 ZDROJ, zdroje: SRC-01, subjekty: —): Oto Klempíř zastává podle oficiálního profilu na webu Úřadu vlády funkci ministra kultury
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-02** (1 ZDROJ, zdroje: SRC-01, subjekty: —): Podle téhož oficiálního profilu je Klempíř poslancem od roku 2025 a v letech 1990–2011 pracoval jako kreativní ředitel v mezinárodních reklamních agenturách
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-03** (1 ZDROJ, zdroje: SRC-02, subjekty: —): RESPEKT dne 19. července 2026 uvedl, že Klempíř jako ministr prosazuje zákony v rozporu s předvolebními hesly svého hnutí; jde o hodnocení redakce, ne o zjištění kontrolního orgánu
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-04** (1 ZDROJ, zdroje: SRC-02, subjekty: —): Podle téhož textu RESPEKTU Klempíř prosazuje přesun financování České televize a Českého rozhlasu do státního rozpočtu
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-05** (1 ZDROJ, zdroje: SRC-02, subjekty: —): Podle téhož textu RESPEKTU Klempíř zrušil výběrové řízení na ředitele Národní galerie Praha
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-06** (1 ZDROJ, zdroje: SRC-02, subjekty: —): Podle téhož textu RESPEKTU se Klempíř k dotazům redakce nevyjádřil; nevyjádření není přiznáním ani potvrzením žádného tvrzení
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-07** (CORROBORATED, zdroje: SRC-20, SRC-26, subjekty: klempir): Vláda 15. června 2026 schválila zrušení financování České televize a Českého rozhlasu z koncesionářských poplatků a jeho nahrazení přímým financováním ze státního rozpočtu od roku 2027.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-08** (CORROBORATED, zdroje: SRC-03, SRC-06, SRC-20, subjekty: klempir): Podle vládního návrhu má Česká televize dostávat ze státního rozpočtu 5,74 miliardy korun ročně a Český rozhlas 2,065 miliardy korun, dohromady zhruba 7,8 miliardy korun.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-09** (1 ZDROJ, zdroje: SRC-03, subjekty: klempir): Navrhované částky jsou nižší než dosavadní výnos poplatků — Česká televize letos plánovala vybrat 6,73 miliardy korun a Český rozhlas 2,48 miliardy korun.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-10** (CITACE, zdroje: SRC-20, subjekty: klempir): Klempíř popsal legislativní řešení slovy: „Rušíme zákon číslo 248 z roku 2005 o rozhlasových a televizních poplatcích a nahrazujeme jej zákonem o financování médií veřejné služby.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-11** (CITACE, zdroje: SRC-03, subjekty: klempir): Klempíř označil stávající systém koncesionářských poplatků za „nemoderní“ a uvedl, že zákon má být platný od 1. ledna 2027.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-12** (CITACE, zdroje: SRC-07, subjekty: klempir): Na námitku, že peníze ze státního rozpočtu pocházejí z daní, Klempíř odpověděl: „Ono to z daní úplně nepůjde, protože my daně zvyšovat nebudeme,“ a doplnil, že vláda nezavede žádnou speciální daň nahrazující poplatky.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-13** (CITACE, zdroje: SRC-07, subjekty: klempir): Klempíř uvedl, že ministerstvo dostalo v připomínkovém řízení k návrhu zhruba čtyři sta připomínek, které rozdělilo do sedmi nebo osmi opakujících se okruhů.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-14** (CITACE, zdroje: SRC-07, subjekty: klempir): Klempíř potvrdil zúžení původního záměru: podle něj koalice dospěla k závěru, že pro splnění programového prohlášení není nutné měnit celý systém, a hlavním cílem zůstává zrušení poplatků.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-15** (CITACE, zdroje: SRC-21, subjekty: klempir): V dubnu 2026 Klempíř připustil, že navržená částka pro veřejnoprávní média není konečná: „Neříkám zase, že ta částka, která je v prvním znění zákona, že je pevná, že se nemůže měnit.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-16** (CITACE, zdroje: SRC-20, subjekty: klempir): Generální ředitel Českého rozhlasu René Zavoral označil vládní rozhodnutí za „nepřátelský krok vlády s cílem média destabilizovat“ a rozhlas odhadl nutnost snížit počet zaměstnanců o 150 až 200 osob.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-17** (CITACE, zdroje: SRC-03, subjekty: klempir): Opoziční politici Klempířův návrh odmítli — Vít Rakušan (STAN) jej označil za „cestu k postupnému zestátnění médií“ a František Talíř (KDU-ČSL) za „frontální útok“ a „zákon o likvidaci“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-18** (CORROBORATED, zdroje: SRC-13, SRC-14, subjekty: klempir): Dne 24. května 2026 se v centru Prahy konala demonstrace spolku Milion chvilek pro demokracii proti Klempířovu návrhu; pořadatelé odhadli účast na více než deset tisíc lidí a předali Úřadu vlády petici se 180 až 184 tisíci podpisy požadující stažení zákona.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-19** (CITACE, zdroje: SRC-13, SRC-14, subjekty: klempir): Předseda Milionu chvilek Mikuláš Minář o ministrovi na demonstraci řekl: „Místo, aby českou kulturu chránil, ji opakovaně poškozuje.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-20** (1 ZDROJ, zdroje: SRC-19, subjekty: klempir): Klempíř jednal 30. června 2026 s prezidentem Petrem Pavlem o novele financování ČT a ČRo; podle Hradu se prezident ptal, jak vláda po změně financování garantuje nezávislost obou médií, a vyzval k odborné debatě.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-21** (CITACE, zdroje: SRC-06, subjekty: klempir): Klempíř v červnu 2026 uvedl, že bude usilovat o rozpočet ministerstva kultury až 21 miliard korun na rok 2027 proti letošním 17,6 miliardy, přičemž peníze pro veřejnoprávní média mají být mimo tuto částku: „Rozpočet na veřejnoprávní média nebude v těch 21 miliardách, o to bude navýšen rozpočet naší kapitoly.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-22** (CORROBORATED, zdroje: SRC-04, SRC-27, subjekty: klempir): Ministerstvo kultury zrušilo výběrové řízení na generálního ředitele Národní galerie Praha; informace byla zveřejněna 2. července 2026 s tím, že řízení bude vypsáno znovu.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-23** (CITACE, zdroje: SRC-04, subjekty: klempir): Zrušení výběrového řízení Klempíř zdůvodnil tím, že „důraz na mezinárodní rozměr, schopnost prosadit Národní galerii Praha v evropském a světovém kontextu a přinést skutečně ambiciózní zahraniční vizi nebyl při výběru akcentován v takové míře, jakou ministerstvo považuje za zásadní“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-24** (1 ZDROJ, zdroje: SRC-04, subjekty: klempir): Do zrušeného výběrového řízení se přihlásilo pět zájemců, do druhého kola postoupili tři: Marcel Fišer, Olga Kotková a Aleš Seifert.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-25** (CORROBORATED, zdroje: SRC-04, SRC-08, subjekty: klempir): Klempíř v březnu 2026 odvolal generální ředitelku Národní galerie Praha Alicju Knastovou; vedením instituce byla pověřena Olga Kotková.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-26** (CITACE, zdroje: SRC-04, subjekty: klempir): Zrušení výběrového řízení kritizoval bývalý ministr kultury Martin Baxa (ODS) jako krok „opět nesmyslný“ a rektor Akademie výtvarných umění Tomáš Pospiszyl uvedl, že nové řízení problémy galerie nevyřeší.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-27** (1 ZDROJ, zdroje: SRC-09, subjekty: klempir): Výbor Uměleckohistorické společnosti zaslal 30. března 2026 Klempířovi otevřený dopis, v němž označil způsob odvolání ředitelky NGP za „neprofesionální a nevhodný“, kritizoval rozpuštění garanční rady bez vysvětlení a vyzval k vypsání transparentního výběrového řízení s komisí z respektovaných odborníků.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-28** (1 ZDROJ, zdroje: SRC-08, subjekty: klempir): Základní odborová organizace Národní galerie Praha odeslala 10. července 2026 ministrovi otevřený dopis, který podepsalo 63 zaměstnanců; podle dopisu „ministerstvo kultury pod Vaším vedením dosud neučinilo žádné oficiální vyjádření, které by tento krok srozumitelně vysvětlilo“.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-29** (1 ZDROJ, zdroje: SRC-08, subjekty: klempir): Odboráři NGP se v dopise ptali, proč ministerstvo plánuje budovat novou výstavní plochu v době chronického podfinancování galerie a nákladných investic včetně depozitáře v Jinonicích, jehož první etapa je odhadována na 2,2 miliardy korun; Klempíř přislíbil setkání a označil galerii za jednu z klíčových priorit ministerstva.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-30** (CITACE, zdroje: SRC-11, subjekty: klempir): Klempíř v únoru 2026 prohlásil: „Pokud bylo zvykem tady na ministerstvu, že o rozdělování dotací rozhodovali umělci, tak to, prosím, končí,“ a dodal, že „dotace na tomto úřadu totiž nejsou a nebudou nárokové“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-31** (CITACE, zdroje: SRC-11, subjekty: klempir): Rozpočtové škrty zdůvodnil Klempíř tvrzením, že „vláda Petra Fialy rozpočet nafoukla, protože byly volby a protože končilo období, kdy jsme mohli čerpat peníze z Národního plánu obnovy“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-32** (1 ZDROJ, zdroje: SRC-24, subjekty: klempir): Rozpočet ministerstva kultury na rok 2026 činí 17,6 miliardy korun, tedy zhruba o 1,17 miliardy méně než návrh předchozí vlády; symfonickým orchestrům a pěveckým sborům bylo škrtnuto 100 milionů korun (asi 25 procent), u kulturních aktivit více než 300 milionů, přičemž ministerstvo dopad na orchestry hájí jako „méně než dvě procenta jejich rozpočtů“.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-33** (1 ZDROJ, zdroje: SRC-10, subjekty: klempir): Podle komentáře Deníku Alarm Klempíř v dubnu 2026 na Facebooku slíbil, že navrhne zákon, který by ministrovi do budoucna dovolil vetovat rozhodnutí grantových komisí; konkrétní legislativní návrh v té době zveřejněn nebyl.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-34** (1 ZDROJ, zdroje: SRC-25, subjekty: klempir): Ministerstvo kultury oznámilo v roce 2026 dvě mimořádná navýšení podpory živé kultury mimo standardní dotační cyklus — 19. května pro 19 projektů a 2. července pro 15 projektů; kritika poukazuje na netransparentnost a obcházení odborných dotačních komisí.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-35** (CITACE, zdroje: SRC-05, subjekty: klempir): Klempíř v březnu 2026 podepsal stanovisko k zástavbě v pražské památkové zóně Smíchov (Hřebenky, Tichá ulice), v němž konstatoval: „Za tohoto stavu kdy zmíněné lhůty uplynuly marně, nemohu nijak zasáhnout. Takový postup mně ani mnou řízenému ministerstvu právní předpisy neumožňují.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-36** (1 ZDROJ, zdroje: SRC-15, subjekty: klempir): Novela stavebního zákona projednávaná v roce 2026 měla zrušit zhruba 450 památkových ochranných pásem, odejmout památkářům v památkových zónách pravomoc vydávat závazná stanoviska a umožnit stavebníkům konzultovat projekt s jiným znalcem místo Národního památkového ústavu.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-37** (1 ZDROJ, zdroje: SRC-18, subjekty: klempir): Dne 2. června 2026 vyzvalo 13 odborníků z českých univerzit a vědeckých institucí otevřeným dopisem poslance k zamítnutí novely stavebního zákona kvůli oslabení NPÚ, ohrožení ochranných pásem, zkrácení lhůt pro záchranné archeologické výzkumy a přenesení jejich nákladů na veřejné instituce.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-38** (1 ZDROJ, zdroje: SRC-17, subjekty: klempir): Poslanecká sněmovna schválila novelu stavebního zákona 10. července 2026 hlasy 89 poslanců vládní koalice; opozice hlasovala proti s tím, že novela nahrává developerům.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-39** (1 ZDROJ, zdroje: SRC-16, subjekty: klempir): Klempíř v červnu 2026 zrušil rozhodnutí svého předchůdce Martina Baxy o vyjmutí pastvin hřebčína Napajedla z památkové ochrany a nařídil ministerstvu nové posouzení s odůvodněním, že předchozí rozhodnutí nedostatečně vyhodnotilo historickou, funkční a vizuální integritu areálu.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-40** (CORROBORATED, zdroje: SRC-22, SRC-23, subjekty: klempir): Ještě před jmenování ministrem, v říjnu 2025, podepsalo zhruba 500 umělců a lidí z kultury otevřený dopis prezidentu Petru Pavlovi a Andreji Babišovi s žádostí, aby ministerstvo kultury nepřipadlo hnutí Motoristé sobě, s odůvodněním obav ze „snahy o politickou kontrolu umělecké produkce“.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-41** (CITACE, zdroje: SRC-22, subjekty: klempir): Klempíř na výzvu umělců v říjnu 2025 reagoval jako poslanec za Motoristy a pravděpodobný kandidát na ministra kultury výzvou, aby lidé počkali na program koalice, s tím, že „je to o mých schopnostech vést úřad a o mé energii či odhodlání zajistit jeho hladký chod a rozvoj“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-42** (1 ZDROJ, zdroje: SRC-23, subjekty: klempir): Klempíř byl v době otevřeného dopisu umělců v médiích představován jako bývalý frontman kapely J.A.R. a nově zvolený poslanec za Motoristé sobě.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-43** (CORROBORATED, zdroje: SRC-12, SRC-28, subjekty: klempir): Na folklorním festivalu ve Strážnici byl Klempíř v červnu 2026 vypískán publikem; spolek Milion chvilek následně spustil petici „Oto, zabal to!“ za jeho odvolání, kterou k 28. červnu 2026 podepsalo 45 000 lidí.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet

## Richard Chlad — `richard-chlad` (8 tvrzení)

Per-dossier prismatic nástroje a výjimky: viz [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md#per-dossier-kroky).

- [ ] **CLM-01** (1 ZDROJ, zdroje: SRC-01, subjekty: chlad): Veřejný rejstřík Hlídač státu eviduje u Richarda Chlada za rok 2025 dary straně Motoristé sobě v celkové výši 638 864 Kč, položkově: 140 000 Kč půjčení sportovních automobilů, 200 000 Kč propůjčení vozů Bugatti, 59 313 Kč výroba a instalace billboardu, 54 550 Kč demontáž billboardu a 185 001 Kč uspořádání akce; částka již zahrnuje nepeněžní plnění
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-02** (CITACE, zdroje: SRC-02, subjekty: chlad): Richard Chlad podle citovaného zpravodajství uvedl, že straně poskytl „necelé dva miliony korun\" na propagaci a vozy pro mítinky
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-03** (CITACE, zdroje: SRC-03, subjekty: chlad): Podle citovaného zpravodajství Chlad jinde uváděl podporu v řádu zhruba 1,5 milionu Kč, do níž počítal pronájmy aut, dopravu a pojištění
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-04** (CITACE, zdroje: SRC-03, subjekty: chlad): Předseda strany Petr Macinka podle citovaného zpravodajství uvedl: „Dal nám před eurovolbami dvakrát 50 tisíc korun.\"
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-05** (CITACE, zdroje: SRC-03, subjekty: chlad): Filip Turek podle citovaného zpravodajství uvedl: „Je to můj kamarád a s politikou nemá nic společného, i záměrně přeceňujete jeho roli v podpoře Motoristů.\"
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-06** (CITACE, zdroje: SRC-03, subjekty: chlad): Petr Macinka podle citovaného zpravodajství uvedl: „Richard Chlad je kamarád Filipa Turka, ale rozhodně není ideologem Motoristů. Tím jsem já.\"
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-07** (1 ZDROJ, zdroje: SRC-02, subjekty: chlad): Podle citovaného profilu Chlad začínal v 80. letech dovozem videokazet a hodinek, po roce 1989 podnikal v hazardu (síť heren Krijcos) a dnes investuje do solárních elektráren a vodíku (Krijcos Energy, Moravia Green Hydrogen)
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-08** (1 ZDROJ, zdroje: SRC-02, subjekty: chlad): Citovaný profil uvádí starší osobní známost Richarda Chlada s Radovanem Krejčířem — podle článku se seznámili na večírku Mercedes-Benz a navštěvovali sportovní areál ve Všenorech
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním

## Robert Plaga — `robert-plaga` (54 tvrzení)

Per-dossier prismatic nástroje a výjimky: viz [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md#per-dossier-kroky).

- [ ] **CLM-01** (1 ZDROJ, zdroje: SRC-01, subjekty: plaga): Robert Plaga zastává podle oficiálního profilu na webu Úřadu vlády funkci ministra školství, mládeže a tělovýchovy
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-02** (CORROBORATED, zdroje: SRC-02, SRC-03, SRC-04, subjekty: plaga): Ministr školství Robert Plaga (ANO) 25. května 2026 nařídil okamžité zastavení povinného testování žáků 5. a 9. tříd základních škol, které organizovala Česká školní inspekce.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-03** (CORROBORATED, zdroje: SRC-02, SRC-03, subjekty: plaga): Testování mělo probíhat od 11. května do 5. června 2026 a kombinovalo vědomostní testy z českého jazyka a matematiky s dotazníkem zjišťujícím socioekonomický status a duševní pohodu žáků.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-04** (CORROBORATED, zdroje: SRC-02, SRC-03, subjekty: plaga): Část škol při online testování hlásila technické výpadky aplikace České školní inspekce; ministerstvo školám doporučilo přejít z webového rozhraní na instalovanou aplikaci.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-05** (CORROBORATED, zdroje: SRC-02, SRC-03, SRC-04, subjekty: plaga): Dotazníková část testu obsahovala otázky na pocity a duševní zdraví žáků včetně sebevražedných myšlenek, na vybavení domácnosti a na vzdělání a profesi rodičů; podle Heroine.cz šlo mimo jiné o dotaz, zda dítě mělo myšlenky, že by mu 'bylo lépe, kdyby nežilo nebo kdyby si ublížilo'.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-06** (CORROBORATED, zdroje: SRC-02, SRC-03, subjekty: plaga): Podle zpravodajství žáci nemohli test regulérně dokončit bez zodpovězení osobních otázek — dotazník nenabízel možnost 'nechci odpovídat'.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-07** (CITACE, zdroje: SRC-02, subjekty: plaga): Plaga k testování řekl: 'To, co se ale zásadně nepovedlo a považuji to za zásadní selhání, je komunikace směrem k rodičům, ke školám a směrem k samotným dětem.'
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-08** (CORROBORATED, zdroje: SRC-02, SRC-04, subjekty: plaga): Plaga si 25. května 2026 předvolal ústředního školního inspektora Tomáše Zatloukala; ten se následně omluvil školám, rodičům i žákům a uvedl, že takové typy otázek je nutné daleko více komunikovat.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-09** (1 ZDROJ, zdroje: SRC-04, subjekty: plaga): Zatloukal zdůvodnil, proč dotazník nebyl školám a rodičům oznámen předem, tím, že by předchozí informace mohla ovlivnit odpovědi žáků; účelem šetření podle něj bylo zjistit, jak se dětem daří, aby stát mohl připravit podpůrný systém pro školy.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-10** (1 ZDROJ, zdroje: SRC-05, subjekty: plaga): Organizace EDUin se zastavením testování souhlasila kvůli nevhodně komunikovaným citlivým otázkám, zároveň však uvedla, že data byla anonymizována unikátními kódy a jsou zásadní pro nastavení systémových opatření, jako je indexové financování škol.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-11** (CITACE, zdroje: SRC-06, subjekty: plaga): Na tiskové konferenci 9. března 2026 Plaga o opozičním návrhu na zákaz mobilů ve školách prohlásil: 'Je to tupý zákaz, který navíc obsahuje řadu legislativních chyb a možná i nepochopení té problematiky jako celku'; vláda tehdy k návrhu vydala nesouhlasné stanovisko.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-12** (1 ZDROJ, zdroje: SRC-07, subjekty: plaga): V červnu 2026 Babiš a Plaga podepsali a do sněmovního systému nahráli společný poslanecký návrh zakazující používání mobilních telefonů během výuky i přestávek v mateřských školách, přípravných třídách, základních školách, nižších ročnících víceletých gymnázií a odpovídajících ročnících konzervatoří.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-13** (CORROBORATED, zdroje: SRC-06, SRC-08, subjekty: plaga): Dne 20. července 2026 vláda podpořila poslanecký návrh Babiše a Plagy na plošný zákaz mobilů a dalších elektronických komunikačních zařízení ve školách s navrhovanou účinností od 1. září 2027.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-14** (1 ZDROJ, zdroje: SRC-08, subjekty: plaga): Návrh zákazu mobilů počítá s výjimkami ze zdravotních důvodů a pro speciální vzdělávací potřeby, pro výuku s povolením školy a pro akce mimo školní prostory; zákaz se má vztahovat i na jídelny, družiny a kluby a návrh musí ještě projít parlamentem.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-15** (CITACE, zdroje: SRC-06, subjekty: plaga): Svůj obrat od březnové kritiky k vlastnímu návrhu zákazu Plaga zdůvodnil dokončeným monitoringem školních řádů — podle něj 93 % škol pravidla pro telefony upravilo — a slovy: 'Pouze polovina prvních stupňů základních škol má zakázané mobilní telefony o přestávkách a je dokázáno, že to dobře funguje.'
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-16** (CORROBORATED, zdroje: SRC-09, SRC-10, SRC-11, subjekty: plaga): Plaga rozhodl, že školní rok 2025/2026 skončí na základních a středních školách a konzervatořích už v pátek 26. června 2026 místo úterý 30. června; MŠMT to oznámilo 31. března 2026, tedy tři měsíce před koncem školního roku.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-17** (CORROBORATED, zdroje: SRC-09, SRC-11, subjekty: plaga): MŠMT zkrácení zdůvodnilo organizačními a provozními potřebami škol a zohledněním chování značné části rodin a ujistilo, že opatření nemá dopad na kvalitu ani rozsah výuky a splnění vzdělávacích cílů.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-18** (1 ZDROJ, zdroje: SRC-10, subjekty: plaga): Pozdní oznámení zkrácení školního roku kritizovala část rodičů kvůli neplánovanému zajišťování hlídání mladších dětí a rušení již naplánovaných třídních akcí s finančními dopady; citovaný rodič uvedl: 'Pokud je schválený a všude komunikovaný harmonogram, očekával bych, že se nebude měnit tři měsíce před koncem školního roku.'
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-19** (1 ZDROJ, zdroje: SRC-09, subjekty: plaga): Ředitelské asociace reagovaly na zkrácení spíše smířlivě — prezident Asociace ředitelů ZŠ Luboš Zajíc je označil za 'celkem přijatelné, byť s tím, že takovéhle věci je třeba opravdu plánovat dopředu'; školy s vážnými důvody mohou požádat ministerstvo o úpravu organizace školního roku.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-20** (1 ZDROJ, zdroje: SRC-12, subjekty: plaga): Podle mluvčího MŠMT Ondřeje Macury budou nashromážděná data z českého jazyka a matematiky dále zpracována, zatímco osobní informace z dotazů na socioekonomický status a duševní zdraví mají být kompletně vymazány.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-21** (1 ZDROJ, zdroje: SRC-12, subjekty: plaga): Přestože bylo testování zastaveno, ročník 2025/2026 se podle Deníku.cz započítá jako platný, protože ČŠI stihla nashromáždit dostatek dat pro vyhodnocení.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-22** (CORROBORATED, zdroje: SRC-14, SRC-23, SRC-28, subjekty: plaga): Robert Plaga uvedl, že individualizovaná data z testování budou smazána poté, co budou agregována na úroveň jednotlivých škol.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-23** (CORROBORATED, zdroje: SRC-14, SRC-23, subjekty: plaga): Ústřední školní inspektor Tomáš Zatloukal vyloučil, „že by měl kdokoliv přístup k tomu, aby znal identitu žáka a jeho odpovědi“.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-24** (CORROBORATED, zdroje: SRC-14, SRC-23, subjekty: plaga): Česká školní inspekce podle zpráv z 25. a 26. května 2026 oznámila, že provede komplexní analýzu celého procesu testování včetně souladu s ochranou osobních údajů (GDPR).
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-25** (CITACE, zdroje: SRC-28, SRC-23, subjekty: plaga): Plaga k dalšímu osudu šetření uvedl: „Poté, co to vyhodnotím, rozhodneme se o dalším postupu.“ Podle ČTK nebylo v době zastavení jasné, zda testy budou pokračovat.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-26** (1 ZDROJ, zdroje: SRC-12, subjekty: plaga): Ministerstvo a inspekce podle Deníku.cz plánují v testování pokračovat, avšak v upravené podobě s lepší komunikací ke školám a rodičům; konkrétní změny se mají rozhodnout „až po důkladné analýze letošního roku“.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-27** (CITACE, zdroje: SRC-28, subjekty: plaga): Učitelská platforma k testování uvedla: „Pokud stát využije školní prostředí k získávání velmi citlivých údajů bez otevřené komunikace, důsledky ponese především škola a učitelé.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-28** (1 ZDROJ, zdroje: SRC-23, subjekty: plaga): Podle ČTK kritizovaly Učitelská platforma a Unie rodičů sběr citlivých dat bez předchozího upozornění, zatímco asociace ředitelů požadovaly kvalitní přípravu a transparentní komunikaci.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-29** (1 ZDROJ, zdroje: SRC-13, subjekty: plaga): MŠMT ještě před zastavením testování vydalo doporučení, aby školy kvůli výpadkům infrastruktury využívaly instalovanou aplikaci namísto webového rozhraní, a připomnělo, že školy mohou typ testovací aplikace samy změnit ve spolupráci s technickou podporou.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-30** (1 ZDROJ, zdroje: SRC-24, subjekty: plaga): Novelu školského zákona o mobilních telefonech předložila skupina poslanců (Andrej Babiš, Robert Plaga) dne 18. června 2026; poslancům byla rozeslána jako sněmovní tisk 232/0 dne 22. června 2026.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-31** (1 ZDROJ, zdroje: SRC-24, subjekty: plaga): Souhlasné stanovisko vlády k tisku 232 bylo rozesláno 22. července 2026 jako sněmovní tisk 232/1.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-32** (1 ZDROJ, zdroje: SRC-24, subjekty: plaga): Dne 30. července 2026 předseda Poslanecké sněmovny doporučil tisk 232 k projednání, zpravodajem byl určen Bc. Petr Kowanda a tisk byl přikázán Výboru pro vědu, vzdělávání, mládež a sport.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-33** (1 ZDROJ, zdroje: SRC-24, subjekty: plaga): Podle oficiální karty projednávání Poslanecké sněmovny k 30. červenci 2026 první čtení tisku 232 dosud neproběhlo a další projednávání bylo možné až od 1. srpna 2026.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-34** (CORROBORATED, zdroje: SRC-26, SRC-16, subjekty: plaga): Navrhovaný zákaz se má vztahovat i na mateřské školy a přípravné třídy základních škol, nikoli na střední, vyšší odborné a vysoké školy.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-35** (1 ZDROJ, zdroje: SRC-26, subjekty: plaga): Zákaz se podle Seznam Zpráv nemá týkat jen mobilních telefonů, ale všech přenosných zařízení včetně tabletů a chytrých hodinek; porušení se má řešit podle školního řádu — napomenutím, důtkou třídního učitele, důtkou ředitele nebo sníženým stupněm z chování.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-36** (CORROBORATED, zdroje: SRC-16, SRC-19, SRC-27, subjekty: plaga): Návrh umožňuje školám upravit ve školním řádu odkládání telefonů na dobu vyučování a jejich odebrání jako sankci za porušení zákazu, s vrácením při odchodu ze školy.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-37** (CORROBORATED, zdroje: SRC-16, SRC-19, subjekty: plaga): Předkladatelé návrhu se odvolávají na doporučení Národního ústavu duševního zdraví a na zkušenosti z Francie a Nizozemska ohledně zlepšení koncentrace a snížení šikany.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-38** (CORROBORATED, zdroje: SRC-16, SRC-19, subjekty: plaga): Dětský ombudsman Martin Beneš k návrhu uvedl: „Nadále pochybuji o tom, že je vhodné upravovat zákaz mobilních telefonů ve školách celostátně,“ a obává se, že děti budou školu vnímat negativně.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-39** (CITACE, zdroje: SRC-15, subjekty: plaga): Beneš v České televizi doplnil: „Já se nemohu zbavit dojmu, že vlastně řešíme něco, co už je vyřešené,“ a argumentoval pro řešení na úrovni jednotlivých škol.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-40** (CITACE, zdroje: SRC-18, subjekty: plaga): Plaga na dětského ombudsmana reagoval na sociálních sítích slovy: „Zaráží mě, že dětský ombudsman při svých připomínkách k mobilům čerpá jen z novinových titulků, aniž by se seznámil s fakty.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-41** (CORROBORATED, zdroje: SRC-15, SRC-18, subjekty: plaga): Plaga Benešovi doporučil seznámit se s materiálem a navštívit školy, které telefony o přestávkách omezily, s tím, že poté „změní názor a bude tento návrh podporovat“.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-42** (CORROBORATED, zdroje: SRC-16, SRC-19, SRC-30, subjekty: plaga): Předseda ODS Martin Kupka označil opatření za populistické a uvedl, že „plošné zákazy nevedou k tomu, aby děti byly odolnější“; ODS varovala před proměnou učitelů v kontrolory a navrhovala místo toho tablety s aplikacemi jen pro výuku.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-43** (CORROBORATED, zdroje: SRC-27, SRC-30, subjekty: plaga): Ředitel Národního ústavu duševního zdraví Jiří Horáček zákaz podporuje s odůvodněním, že sociální sítě přispívají k duševním obtížím dětí; psychiatr Michal Goetz uvedl, že opatření „mělo být přijato už dávno“.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-44** (CORROBORATED, zdroje: SRC-27, SRC-15, subjekty: plaga): Odborník Kamil Kopecký považuje zákaz za zbytečný, protože ředitelé mohou telefony omezit již nyní, a výzkumníci Masarykovy univerzity uvádějí, že plošné zákazy nefungují univerzálně.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-45** (1 ZDROJ, zdroje: SRC-29, subjekty: plaga): Již v březnu 2026 předložili poslanci KDU-ČSL vlastní novelu školského zákona (úplný zákaz pro děti do 10 let, pro děti do 15 let použití jen na pokyn učitele, účinnost od 1. července 2026); MŠMT tehdy prostřednictvím mluvčího Ondřeje Macury uvádělo, že „o případném zákazu mobilních telefonů nebylo dosud rozhodnuto“ a ministr věc řeší s odborníky.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-46** (CITACE, zdroje: SRC-17, subjekty: plaga): V rozhovoru pro CNN Prima NEWS z 21. listopadu 2025 Plaga uvedl: „Na prvním stupni základních škol by děti mobily neměly mít,“ a popsal reakci vlastních dcer: „Když jsem řekl, že chci omezit mobily ve školách, tak říkaly, jestli jsem se nezbláznil.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-47** (CITACE, zdroje: SRC-30, subjekty: plaga): Plaga zákaz obhajuje slovy, že „děti se spolu baví a do školy se těší, protože mají reálné vazby mezi sebou“, a že nebudou scrollovat během přestávek.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-48** (1 ZDROJ, zdroje: SRC-20, subjekty: plaga): Zkrácení školního roku se týká základních škol, středních škol a konzervatoří, nikoli mateřských škol.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-49** (CORROBORATED, zdroje: SRC-22, SRC-21, subjekty: plaga): MŠMT umožnilo školám podat žádost o výjimku ze zkrácení školního roku a uvedlo, že školní družina má fungovat i v období po 26. červnu.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-50** (CORROBORATED, zdroje: SRC-21, SRC-22, subjekty: plaga): Mluvčí MŠMT Ondřej Macura hájil rozhodnutí s tím, že opatření neovlivní „kvalitu ani rozsah výuky“ a že bylo oznámeno „s dostatečným předstihem“.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-51** (CITACE, zdroje: SRC-21, subjekty: plaga): Předsedkyně Učitelské platformy a ředitelka Petra Mazancová k načasování uvedla: „Komplikuje to život školám i rodičům. První prázdninový týden se tak nebudou moci konat žádné tábory, protože na ně asi nikdo nebude chtít jezdit od středy.“
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-52** (CITACE, zdroje: SRC-21, subjekty: plaga): Pedagog Robert Müller z Gymnázia Jana Keplera považuje samotné rozhodnutí za správné, kritizuje však jeho pozdní oznámení: „Potíž je v tom, že svůj krok pan ministr oznámil až teď, protože hodně lidí už si naplánovalo začátek prázdnin,“ a upozornil, že jeho vícedenní výlet do Gdaňska nový termín konce roku přesahuje o tři dny.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-53** (1 ZDROJ, zdroje: SRC-21, subjekty: plaga): Angelika Gergelová z Unie rodičů upozornila, že pro rodiče bez flexibilní práce a možnosti home office může být problém zajistit péči o malé děti v posunutém termínu prázdnin.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-54** (1 ZDROJ, zdroje: SRC-21, subjekty: plaga): Poslankyně ODS Renáta Zajíčková kritizovala náročnost procesu žádosti o výjimku ze zkrácení školního roku a upozornila, že rozděluje třídní kolektivy.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním

## Tomio Okamura — `tomio-okamura` (35 tvrzení)

Per-dossier prismatic nástroje a výjimky: viz [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md#per-dossier-kroky).

- [ ] **CLM-01** (CORROBORATED, zdroje: SRC-01, SRC-02, subjekty: —): Obvodní soud pro Prahu 1 dne 3. června 2026 uznal hnutí SPD vinným z podněcování k nenávisti kvůli dvěma předvolebním plakátům a uložil peněžitý trest 3 miliony korun; soudkyně podle citovaného zpravodajství výslovně uvedla, že rozsudek není pravomocný
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-02** (CORROBORATED, zdroje: SRC-01, SRC-02, subjekty: —): Rozsudek byl vynesen nad hnutím SPD jako právnickou osobou; Okamura čelí obžalobě individuálně, jeho stíhání je však přerušené, protože ho Poslanecká sněmovna odmítla vydat, a jeho jednání má soud projednávat zvlášť. Nevydání je parlamentní procesní krok, ne rozhodnutí o vině či nevině
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-03** (CITACE, zdroje: SRC-01, subjekty: —): SPD i Okamura vinu odmítli s tím, že plakáty podle nich pouze pojmenovávaly reálné společenské problémy; hnutí oznámilo odvolání a připravenost obrátit se na Ústavní soud
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-04** (CITACE, zdroje: SRC-01, subjekty: —): Okamura podle citovaného zpravodajství kritizoval soudkyni s tím, že rozsudek měla připravený předem a že diktuje, jak se mají vést politické kampaně
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-05** (CITACE, zdroje: SRC-02, subjekty: —): Obhajoba SPD u soudu argumentovala, že plakáty pravdivě pojmenovávaly společenské problémy, kampaň označila za „satiru a alegorii\" a znalecké posudky obžaloby zpochybnila jako účelově zkreslené s návodným policejním zadáním
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-06** (1 ZDROJ, zdroje: SRC-02, subjekty: —): SPD podle citovaného zdroje dříve vyhrálo samostatný spor s Ministerstvem vnitra, v němž soud shledal, že její výroky nešířily strach
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-07** (CORROBORATED, zdroje: SRC-03, SRC-04, SRC-06, SRC-09, subjekty: okamura): Nepravomocný rozsudek ze 3. června 2026 vydala samosoudkyně Ivana Tichá z Obvodního soudu pro Prahu 1.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-08** (CORROBORATED, zdroje: SRC-04, SRC-07, subjekty: okamura): Soudkyně Ivana Tichá podle zpravodajství odůvodnila nepravomocný rozsudek slovy: „Mít názor a způsob, jakým ten názor projevím, jsou dvě odlišné věci.“
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-09** (CORROBORATED, zdroje: SRC-09, SRC-10, subjekty: okamura): Soudkyně Ivana Tichá podle zpravodajství v odůvodnění uvedla: „Problémem volební kampaně obžalované je to, že stavěla ty skupiny vůči zbytku obyvatelstva České republiky do pozice oni a my. Tato polarizace může vést — a podle mého názoru vede — k tomu, že v lidech vzroste strach, případně závist, a to vede následně k nenávisti vůči skupinám osob.“
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-10** (CORROBORATED, zdroje: SRC-05, SRC-06, SRC-21, subjekty: okamura): Obžalovanou v řízení, které skončilo nepravomocným rozsudkem ze 3. června 2026, bylo hnutí SPD jako právnická osoba; nešlo o rozsudek nad Tomiem Okamurou osobně, jehož trestní věc byla vyloučena k samostatnému projednání a jeho stíhání je přerušené.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-11** (CORROBORATED, zdroje: SRC-04, SRC-12, subjekty: okamura): Podle zpravodajství soud uložil peněžitý trest při dolní hranici zákonné sazby, označil jej za výchovný a při jeho stanovení vycházel z ročního státního příspěvku hnutí SPD ve výši přibližně 40 milionů korun; rozsudek není pravomocný.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-12** (CORROBORATED, zdroje: SRC-10, SRC-11, SRC-12, subjekty: okamura): Státní zástupce David Jachnický navrhoval podle zpravodajství peněžitý trest o půl milionu korun vyšší, než jaký soud nepravomocně uložil, tedy zhruba 3,5 milionu korun.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-13** (CORROBORATED, zdroje: SRC-11, SRC-12, subjekty: okamura): Státní zástupce David Jachnický podle zpravodajství v závěrečné řeči uvedl, že obžalovaná k jednání přistoupila „proto, aby získala moc, vliv a tím i materiální prospěch“, a poukázal na nulovou sebereflexi hnutí.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-14** (CORROBORATED, zdroje: SRC-10, SRC-11, subjekty: okamura): Státní zástupce David Jachnický podle zpravodajství argumentoval paralelou s nacistickým Německem, kde podle něj nenávistné projevy nezačaly násilím, ale slovy, a demokratický stát proto nemůže čekat, až se nenávist promění v útok.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-15** (CORROBORATED, zdroje: SRC-03, SRC-06, SRC-07, subjekty: okamura): Obhájce hnutí SPD Adam Batuna u soudu odmítl vinu s tím, že se hnutí cítí nevinné a že žalované skutky nejsou trestným činem; plakáty podle něj pouze pravdivě pojmenovávaly společenské otázky.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-16** (CORROBORATED, zdroje: SRC-06, SRC-26, subjekty: okamura): Obhájce Adam Batuna podle justičního zpravodajství zpochybnil odborné posudky provedené jako důkaz a označil je za účelově zkreslené.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-17** (CORROBORATED, zdroje: SRC-07, SRC-08, subjekty: okamura): Tomio Okamura po vyhlášení nepravomocného rozsudku uvedl: „Cílem našich plakátů nebylo vyvolat nenávist, ale pojmenovat problémy, které reálně jsou“, a dodal: „V žádném případě jsme necílili na rasové pohnutky.“
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-18** (CORROBORATED, zdroje: SRC-07, SRC-08, SRC-15, subjekty: okamura): Tomio Okamura zpochybnil postup soudu výrokem: „Samosoudkyně měla podle našeho názoru zjevně rozsudek připravený předem bez ohledu na hlavní líčení a dokazování.“ Jde o jeho tvrzení, nikoli o zjištění nadřízeného soudu.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-19** (CORROBORATED, zdroje: SRC-07, SRC-15, subjekty: okamura): Tomio Okamura podle zpravodajství kritizoval soudkyni Ivanu Tichou s tím, že podle něj kázala, jak má vypadat volební kampaň, a chtěla tím stanovit způsob jejího vedení.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-20** (CORROBORATED, zdroje: SRC-14, SRC-15, SRC-03, subjekty: okamura): Hnutí SPD prostřednictvím Tomia Okamury a obhájce Adama Batuny bezprostředně po vyhlášení ohlásilo odvolání a uvedlo, že je připraveno vést spor až k Ústavnímu soudu; rozsudek proto není pravomocný.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-21** (CORROBORATED, zdroje: SRC-16, SRC-17, subjekty: okamura): Obžalobu na Tomia Okamuru i na hnutí SPD podal 7. srpna 2025 šéf Obvodního státního zastupitelství pro Prahu 1 Jan Lelek, a to k Obvodnímu soudu pro Prahu 1.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-22** (CORROBORATED, zdroje: SRC-16, SRC-17, SRC-22, subjekty: okamura): Obžaloba navrhovala pro Tomia Okamuru podmíněný a peněžitý trest a pro hnutí SPD peněžitý trest; jde o návrh obžaloby, nikoli o rozhodnutí soudu.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-23** (CORROBORATED, zdroje: SRC-16, SRC-17, subjekty: okamura): Podle obžaloby měl obsah dvou předvolebních plakátů z kampaně před krajskými a senátními volbami roku 2024 „vzbuzovat či posilovat negativní emoce nenávistného charakteru vůči migrantům negroidní rasy a romskému etniku“; jde o formulaci obžaloby.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-24** (CORROBORATED, zdroje: SRC-16, SRC-17, subjekty: okamura): V základní skutkové podstatě hrozil za žalovaný trestný čin trest do dvou let odnětí svobody, přičemž sazba se zvyšuje na šest měsíců až tři roky, je-li čin spáchán tiskem, filmem, rozhlasem, televizí nebo veřejně přístupnou počítačovou sítí.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-25** (CORROBORATED, zdroje: SRC-18, SRC-27, subjekty: okamura): Sněmovna 12. února 2025 Tomia Okamuru k trestnímu stíhání v této věci vydala; pro vydání hlasovalo 81 ze 143 přítomných poslanců, proti bylo 62.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-26** (CORROBORATED, zdroje: SRC-18, SRC-27, subjekty: okamura): Vydání Tomia Okamury v únoru 2025 podpořili podle zpravodajství poslanci tehdejších vládních ODS, STAN, KDU-ČSL a TOP 09, opoziční Piráti a nezařazený Ivo Vondrák; proti hlasovali poslanci SPD a ANO.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-27** (1 ZDROJ, zdroje: SRC-20, subjekty: okamura): Po sněmovních volbách v říjnu 2025 se Tomiu Okamurovi obnovila poslanecká imunita v plném rozsahu, takže bylo nutné o vydání k trestnímu stíhání rozhodovat znovu.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-28** (CORROBORATED, zdroje: SRC-19, SRC-20, subjekty: okamura): Sněmovna 5. března 2026 Tomia Okamuru k trestnímu stíhání nevydala; pro nevydání hlasovalo 104 ze 186 přítomných poslanců, pro vydání 82. Jde o parlamentní procesní rozhodnutí, nikoli o posouzení pravdivosti obvinění.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-29** (CORROBORATED, zdroje: SRC-19, SRC-20, subjekty: okamura): Nevydání Tomia Okamury ke stíhání podpořili 5. března 2026 podle zpravodajství všichni přítomní poslanci vládních klubů ANO, SPD a Motoristů; sněmovní mandátový a imunitní výbor předtím vydání nedoporučil.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-30** (CORROBORATED, zdroje: SRC-21, SRC-22, subjekty: okamura): Obvodní soud pro Prahu 1 rozhodl 12. března 2026 o přerušení trestního stíhání Tomia Okamury s odůvodněním, že stíhání je „pro nedostatek souhlasu oprávněného orgánu dočasně nepřípustné“, a jeho věc vyloučil k samostatnému projednání a rozhodnutí. O kroku informovala místopředsedkyně soudu Eva Švíglerová.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-31** (CORROBORATED, zdroje: SRC-21, SRC-22, subjekty: okamura): Hlavní líčení s hnutím SPD nařídil Obvodní soud pro Prahu 1 na 25. května 2026, tedy bez projednání věci Tomia Okamury.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-32** (1 ZDROJ, zdroje: SRC-23, subjekty: okamura): Unie státních zástupců 6. března 2026 po sněmovním hlasování uvedla, že „některá čtvrteční prohlášení představitelů státu jsou způsobilá podrýt důvěru v nezávislost justice“; proti zpochybňování důvěry v justici se vymezila i Transparency International.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-33** (1 ZDROJ, zdroje: SRC-24, subjekty: okamura): Společnost pro obranu svobody projevu v přehledu z 11. července 2026 rozsudek kritizovala jako „faktické posvěcení cenzury“ a vytváření tlaku na autocenzuru; jde o hodnotící stanovisko advokační organizace, nikoli o zpravodajské zjištění.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-34** (1 ZDROJ, zdroje: SRC-25, subjekty: okamura): Komentátor Aleš Michal v Reflexu 7. června 2026 rozsudek naopak označil za „další dobrou zprávu o kvalitě právního státu v České republice“ a uvedl, že se Okamura po vyhlášení nevybíravě pustil i do samotné soudkyně; jde o názorový text.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-35** (1 ZDROJ, zdroje: SRC-13, subjekty: okamura): Podle agenturní zprávy soudkyně v odůvodnění odkázala na dřívější případ Jaromíra Baldy jako na příklad následků nenávistné rétoriky; tento odkaz uvádí pouze jeden zdroj a nebyl potvrzen dalším nezávislým vydavatelem.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním

## Tünde Bartha — `tunde-bartha` (8 tvrzení)

Per-dossier prismatic nástroje a výjimky: viz [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md#per-dossier-kroky).

- [ ] **CLM-01** (CORROBORATED, zdroje: SRC-01, SRC-02, subjekty: bartha): Rada městské části Praha 3 dne 24. června 2026 rozhodla o výpovědi z nájmu obecního bytu na Žižkově s tříměsíční výpovědní dobou; jako důvod uvedla přenechání předmětu nájmu třetím osobám bez předchozího souhlasu pronajímatele
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-02** (1 ZDROJ, zdroje: SRC-02, subjekty: bartha): Vedoucí odboru městské části Michal Dobiáš podle citovaného zpravodajství ve svém stanovisku uvedl, že pro výpověď pro hrubé porušení povinností neexistuje žádný právně relevantní podklad a že hrozí vysoké riziko, že soud výpověď shledá neplatnou
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-03** (CORROBORATED, zdroje: SRC-02, SRC-05, subjekty: bartha): Advokátní kancelář Šenkýř Pánik podle citovaného zpravodajství dospěla k závěru, že výpověď vyžaduje prokázat, že nájemci v bytě fakticky a trvale nebydlí, a že dosavadní důkazy k úspěchu u soudu nestačí
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-04** (1 ZDROJ, zdroje: SRC-01, subjekty: bartha): Byt o rozloze přibližně 70 m² s nájemným přibližně 11 000 Kč měsíčně nájemci podle citovaného zpravodajství získali v roce 2004 směnou za jiný obecní byt v Praze 8
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-05** (CITACE, zdroje: SRC-01, SRC-02, subjekty: bartha): Tünde Bartha podle citovaného zpravodajství uvedla, že bydlí v Průhonicích v objektu společnosti Imoba, která patří premiéru Andreji Babišovi
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-06** (1 ZDROJ, zdroje: SRC-03, subjekty: bartha): Tünde Bartha podle citovaného zpravodajství pracovala v holdingu Agrofert jako business development manager pro východní Evropu, Balkán a Blízký východ; její působení potvrdil mluvčí Agrofertu Pavel Heřmanský
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-07** (CORROBORATED, zdroje: SRC-01, SRC-02, subjekty: bartha): V červnu 2026 označují Tünde Barthu jako šéfku Úřadu vlády ČR dvě na sobě nezávislá celostátní média
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-08** (1 ZDROJ, zdroje: SRC-04, subjekty: bartha): Oficiální přehled Úřadu vlády ČR uvádí u Tünde Barthy za období 28. 6. 2018 až 17. 12. 2021 formulaci pověřena řízením, nikoli funkční období jako u ostatních osob v přehledu
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním

## Zuzana Mrázová — `zuzana-mrazova` (56 tvrzení)

Per-dossier prismatic nástroje a výjimky: viz [`PRISMATIC_SOURCING_TODO.md`](./PRISMATIC_SOURCING_TODO.md#per-dossier-kroky).

- [ ] **CLM-01** (1 ZDROJ, zdroje: SRC-01, subjekty: mrazova): Zuzana Mrázová zastává podle oficiálního profilu na webu Úřadu vlády funkci ministryně pro místní rozvoj
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-02** (CORROBORATED, zdroje: SRC-02, SRC-03, SRC-04, SRC-05, subjekty: mrazova): Magistrát města Most uložil ministryni pro místní rozvoj Zuzaně Mrázové (ANO) pokutu za porušení zákona o střetu zájmů; rozhodnutí je zatím NEPRAVOMOCNÉ. Jako první o tom 25. 7. 2026 informovaly Seznam Zprávy.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-03** (CORROBORATED, zdroje: SRC-02, SRC-04, SRC-05, SRC-08, subjekty: mrazova): Důvodem nepravomocné pokuty je, že Mrázová v majetkovém přiznání za rok 2024 neuvedla půjčku 500 000 Kč od rodiny na koupi parcely v Bílině, přestože existenci této půjčky sama potvrdila na tiskové konferenci v květnu 2026.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-04** (CORROBORATED, zdroje: SRC-04, SRC-05, subjekty: mrazova): Mostecký magistrát vyhodnotil jednání Mrázové jako přestupek z nedbalosti, nikoli úmyslný; rozhodnutí o pokutě je nepravomocné.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-05** (CORROBORATED, zdroje: SRC-04, SRC-05, SRC-08, subjekty: mrazova): Výše nepravomocné pokuty nebyla zveřejněna; magistrát odmítl sdělit bližší informace do nabytí právní moci. Zákon o střetu zájmů umožňuje uložit pokutu až 50 000 Kč.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-06** (CITACE, zdroje: SRC-02, SRC-04, SRC-05, subjekty: mrazova): Podle mluvčí ministerstva pro místní rozvoj Veroniky Lukášové si Mrázová chybu uvědomuje, nepravomocnou pokutu zaplatí a nebude se odvolávat (vyjádření strany ministryně, citováno s atribucí).
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-07** (CORROBORATED, zdroje: SRC-08, SRC-12, subjekty: mrazova): U dalších 500 000 Kč na účtu Mrázové se podle publikovaných rekonstrukcí měnilo vysvětlení původu: nejprve byly označeny za dar od současného manžela, později ministryně uvedla, že u ní byly pouze „deponovány“.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-08** (CITACE, zdroje: SRC-02, SRC-08, subjekty: mrazova): Na dotazy novinářů Seznam Zpráv k okolnostem nepravomocné pokuty Mrázová podle záznamu rozhovoru během přibližně šesti minut desetkrát zopakovala větu „S vámi já se bavit nebudu“.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-09** (CORROBORATED, zdroje: SRC-05, SRC-06, SRC-11, SRC-12, subjekty: mrazova): Mrázová od roku 2009 užívala obecní byt o rozloze 130 m² na náměstí v Bílině za nájemné okolo 4 500 Kč měsíčně; z bytu se odstěhovala na jaře 2026.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-10** (CITACE, zdroje: SRC-06, SRC-11, subjekty: mrazova): Mrázová se na tiskové konferenci 7. 5. 2026 hájila tím, že v době přidělení bytu splňovala podmínky nastavené městem, že s energiemi platila podle svých slov 14–18 tisíc Kč měsíčně a že devět let žila jako samoživitelka (obhajoba citována s atribucí).
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-11** (CITACE, zdroje: SRC-09, subjekty: mrazova): Předseda Pirátů Zdeněk Hřib 3. 6. 2026 ve sněmovně při projednávání novely o podpoře bydlení předal Mrázové klíčenku se slovy, že dostupné bydlení „vyřešila… pro jednoho člověka“, a vyzval ji k doplacení přibližně dvou milionů Kč, které podle výpočtu Pirátů ušetřila na nájmu obecního bytu.
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-12** (CORROBORATED, zdroje: SRC-06, SRC-10, SRC-11, subjekty: mrazova): Na pozemku Mrázové na okraji Bíliny, který je v územním plánu veden jako lesní plocha, stojí podle publikovaných zjištění stavby v rozporu s územním plánem (mj. domek s komínem, pergola a přístřešek); úřady v minulosti odmítly změnu územního plánu s odkazem na ochranu krajiny.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-13** (CITACE, zdroje: SRC-10, SRC-11, subjekty: mrazova): Mrázová ke stavbám uvedla, že parcelu nabyla již s existujícími objekty a „vycházela z předpokladu, že jsou v souladu s právními předpisy“; na tiskové konferenci se omluvila za „nedůslednost“ a uvedla, že žádá o změnu funkčního využití pozemku (obhajoba citována s atribucí).
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-14** (1 ZDROJ, zdroje: SRC-10, subjekty: mrazova): Polovinu dotčeného pozemku získala Mrázová podle FORUM 24 v roce 2021 darem od manžela Romana Schwarze.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-15** (1 ZDROJ, zdroje: SRC-10, subjekty: mrazova): Kauza černých staveb probíhá podle FORUM 24 v době, kdy se projednává novela stavebního zákona zjednodušující dodatečné povolování staveb, což kritici dávají do souvislosti s resortem Mrázové.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-16** (CORROBORATED, zdroje: SRC-06, SRC-11, subjekty: mrazova): Opoziční politici (mj. Zdeněk Hřib za Piráty, Martin Kupka a Radim Ivan za ODS, Lukáš Vlček za STAN, Jan Grolich za KDU-ČSL, Matěj Ondřej Havel za TOP 09) v květnu 2026 vyzvali Mrázovou k rezignaci kvůli kauzám obecního bytu, černých staveb a nesrovnalostí v majetkovém přiznání.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-17** (CORROBORATED, zdroje: SRC-06, SRC-11, subjekty: mrazova): Premiér Andrej Babiš (ANO) Mrázovou veřejně podpořil, její odvolání vyloučil a kritiku označil za cílený útok médií; Mrázová uvedla, že jeho podporu cítí.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-18** (CORROBORATED, zdroje: SRC-07, SRC-12, subjekty: mrazova): Resort spravedlnosti podal 21. 5. 2026 přestupkovému úřadu podnět k prověření nesrovnalostí v majetkovém přiznání Mrázové (chybějící půjčka a dar použité na nákup pozemku u Bíliny). Jde o PROCESNÍ KROK — podnět k prověření, nikoli o zjištění viny.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-19** (CITACE, zdroje: SRC-07, subjekty: mrazova): Mrázová označila nesrovnalosti v majetkovém přiznání za „administrativní pochybení“ a deklarovala, že chce s úřady spolupracovat (obhajoba citována s atribucí).
      → přímá citace — ověřit věrnost proti primárnímu záznamu (přepis/tisková zpráva/video), pokud dohledatelný
- [ ] **CLM-20** (CORROBORATED, zdroje: SRC-13, SRC-14, subjekty: mrazova): Rozhodnutí mosteckého magistrátu o pokutě je nepravomocné; podle magistrátu může nabýt právní moci do tří týdnů od doručení, pokud Mrázová nepodá odvolání.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-21** (CORROBORATED, zdroje: SRC-13, SRC-14, subjekty: mrazova): Magistrát konstatoval, že se Mrázová dopustila přestupku tím, že v oznámení podle zákona o střetu zájmů uvedla nepravdivé údaje — konkrétně že za rok 2024 neměla peněžité příjmy ani jiný majetkový prospěch nesouvisející s výkonem funkce převyšující 100 tisíc korun.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-22** (1 ZDROJ, zdroje: SRC-13, subjekty: mrazova): Mluvčí ministerstva pro místní rozvoj Veronika Lukášová v den zveřejnění uvedla, že resort nemůže sdělit více informací, protože si ministryně dosud nestihla vyzvednout na poště dopis s rozhodnutím.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-23** (CORROBORATED, zdroje: SRC-13, SRC-14, subjekty: mrazova): Existenci rodinné půjčky 500 tisíc korun Mrázová podle médií přiznala až na květnové tiskové konferenci na dotaz novinářů, tedy poté, co ji neuvedla v majetkovém oznámení za rok 2024.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-24** (CORROBORATED, zdroje: SRC-20, SRC-27, subjekty: mrazova): Podnět ministerstva spravedlnosti z 21. května 2026 směřoval přestupkovému úřadu a týkal se nesrovnalostí v majetkovém oznámení — chybějící půjčky i chybějícího daru v souvislosti s nákupem pozemku v Bílině. Jde o procesní krok zahajující prověření, nikoli o zjištění viny.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-25** (1 ZDROJ, zdroje: SRC-20, subjekty: mrazova): Ministerstvo pro místní rozvoj na podnět reagovalo prohlášením mluvčí, že „veškeré podstatné informace k těmto tématům již byly ze strany paní ministryně dostatečně a otevřeně odkomunikovány“.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-26** (1 ZDROJ, zdroje: SRC-20, subjekty: mrazova): Předseda ODS Martin Kupka označil vyjádření Mrázové k jejím kauzám za projev „ryzího pokrytectví“.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-27** (CORROBORATED, zdroje: SRC-22, SRC-23, subjekty: mrazova): Nájemní smlouva Mrázové na obecní byt v Bílině skončila 31. března 2026.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-28** (1 ZDROJ, zdroje: SRC-26, subjekty: mrazova): Podle Romea.cz se Mrázová po vyklizení bytu přestěhovala přibližně 130 metrů dál — do jiného městského bytu na tomtéž náměstí, blíže k radnici, spolu s manželem Pavlem Mrázem.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-29** (1 ZDROJ, zdroje: SRC-26, subjekty: mrazova): Nájemné za byt, které do roku 2024 činilo přibližně 4 500 korun měsíčně, bylo od roku 2024 navýšeno na sazbu 42 korun za metr čtvereční.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-30** (1 ZDROJ, zdroje: SRC-26, subjekty: mrazova): V Bílině s přibližně 14 tisíci obyvateli je podle Romea.cz zhruba pětina obyvatel v exekuci s průměrným dluhem kolem 500 tisíc korun, tržní nájem srovnatelně velkého bytu dosahuje asi 15 tisíc korun měsíčně a na obecní byt se běžně čeká nejméně dva roky.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-31** (1 ZDROJ, zdroje: SRC-26, subjekty: mrazova): Mrázová argumentuje, že město rozlišuje čtyři kategorie bytů a takzvané standardní byty jsou dostupné komukoli, kdo splní podmínky, bez zkoumání příjmů; má jít o nástroj podpory pracujících obyvatel.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-32** (1 ZDROJ, zdroje: SRC-26, subjekty: mrazova): Petr Kulhánek (STAN), předchůdce Mrázové v čele ministerstva pro místní rozvoj, označil situaci za paradoxní — ministryně podle něj čerpá výhody obecního bydlení, zatímco zastavuje programy podpory dostupného nájemního bydlení.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-33** (1 ZDROJ, zdroje: SRC-21, subjekty: mrazova): Mrázová 17. června 2026 rezignovala na mandát zastupitelky Bíliny; jako důvod uvedla velké časové zaneprázdnění. Nahradil ji Štěpán Kohlschütter.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-34** (1 ZDROJ, zdroje: SRC-21, subjekty: mrazova): Před nástupem do vlády byla Mrázová čtyři roky místostarostkou a sedm let starostkou Bíliny.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-35** (1 ZDROJ, zdroje: SRC-15, subjekty: mrazova): Sporná parcela má podle Seznam Zpráv rozlohu zhruba 500 metrů čtverečních; kromě objektu s komínem a dřevěné pergoly se sezením se na ní nachází šedý přístřešek o výměře přes 40 metrů čtverečních, pod nímž stojí bílý karavan.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-36** (CORROBORATED, zdroje: SRC-15, SRC-16, subjekty: mrazova): Stavební úřad v Bílině o nepovolených stavbách na pozemku Mrázové věděl nejméně čtyři roky a řízení nezahájil; věc se rozhýbala až po dotazech novinářů na jaře 2026.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-37** (1 ZDROJ, zdroje: SRC-16, subjekty: mrazova): Vedoucí bílinského stavebního úřadu Oldřich Jedlička se z případu vyloučil pro možný střet zájmů a předal jej nadřízenému Krajskému úřadu Ústeckého kraje; projednávání následně převzal stavební úřad v Mostě.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-38** (1 ZDROJ, zdroje: SRC-16, subjekty: mrazova): Krajský úřad Ústeckého kraje následně upozornil vedení Bíliny na možné podezření z nečinnosti.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-39** (CORROBORATED, zdroje: SRC-15, SRC-16, subjekty: mrazova): Jedlička odmítl, že by o podezřeních ohledně staveb dříve věděl; na dotaz novinářů reagoval slovy „Myslíte, že vím všechno? Jsme velká obec.“
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-40** (1 ZDROJ, zdroje: SRC-16, subjekty: mrazova): Tajemník bílinského městského úřadu dlouhodobou nečinnost odmítl s odůvodněním, že „není možné průběžně kontrolovat všechny stavby na území města bez konkrétního podnětu“.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-41** (1 ZDROJ, zdroje: SRC-17, subjekty: mrazova): Starosta Bíliny Karel Matuška (ANO) 2. května 2026 uvedl, že stavby bude řešit stavební úřad podle zákonného postupu a že město do toho nemůže a nebude zasahovat.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-42** (CORROBORATED, zdroje: SRC-15, SRC-25, subjekty: mrazova): Město v podkladech k územnímu plánu z let 2018–2022 zamítlo žádost tehdejšího manžela Romana Schwarze o překlasifikaci parcely na stavební pozemek s odůvodněním, že by šlo o rozšiřování sídla do volné krajiny; dokumentace zároveň uváděla, že na parcele již stojí nepovolené drobné stavby.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-43** (1 ZDROJ, zdroje: SRC-25, subjekty: mrazova): V době, kdy se Mrázová stala výlučnou vlastnicí celé parcely (2022), zastávala funkci starostky Bíliny a měla ve své gesci územní plánování.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-44** (CORROBORATED, zdroje: SRC-22, SRC-23, subjekty: mrazova): Mrázová k pozemku uvádí: „Zahradu jsem kupovala, když tam už stály mobilní objekty,“ tvrdí, že jde o plochu bývalé skládky, a o změnu územního plánu podle svých slov žádá stejně jako jiní vlastníci v republice.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
- [ ] **CLM-45** (1 ZDROJ, zdroje: SRC-23, subjekty: mrazova): Mrázová odmítá souvislost mezi svým pozemkem a novelou: podle svého vyjádření se na přípravě ustanovení o dodatečném povolování nepodílela a nemá to podle ní žádnou souvislost s objekty na jejím pozemku.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-46** (1 ZDROJ, zdroje: SRC-15, subjekty: mrazova): Novela stavebního zákona, kterou Mrázová spolupředkládala s Andrejem Babišem, podle Seznam Zpráv ruší ustanovení bránící dodatečnému povolení stavby při zmeškání lhůt a umožňuje legalizaci tam, kde stavební úřad uzná důvody zmeškání za omluvitelné.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-47** (1 ZDROJ, zdroje: SRC-18, subjekty: mrazova): Sněmovna novelu stavebního zákona schválila 10. července 2026 hlasy 89 koaličních poslanců (potřebné minimum bylo 86); vzniká Úřad pro rozvoj území a počet stavebních úřadů se má do roku 2028 snížit z 638 na 205 územních pracovišť.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-48** (1 ZDROJ, zdroje: SRC-18, subjekty: mrazova): Schválená novela umožňuje dodatečné povolení nepovolené stavby v případech, kdy by její odstranění bylo „zjevně nepřiměřené“ ve vztahu k dotčeným osobám a veřejným zájmům, i při nesplnění standardních požadavků.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-49** (1 ZDROJ, zdroje: SRC-18, subjekty: mrazova): Předsedkyně poslaneckého klubu STAN Michaela Šebelová novelu kritizovala jako zákon, který vyhovuje developerům a nepřináší zlepšení pro občany; Piráti označili schválení za „nezodpovědné a prokorupční“.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-50** (1 ZDROJ, zdroje: SRC-15, subjekty: mrazova): Pirátská poslankyně Veronika Kovářová varovala, že navrhovaná úprava dodatečného povolování „otevírá dveře“ nepovolené výstavbě vil v chráněných územích.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-51** (1 ZDROJ, zdroje: SRC-19, subjekty: mrazova): Při sněmovních interpelacích 2. července 2026 Mrázovou kritizovali pirátští poslanci Olga Richterová, Ivan Bartoš a Kateřina Stojanová; ministryně na jejich vystoupení nereagovala a premiér Babiš se z dopolední části jednání omluvil.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-52** (1 ZDROJ, zdroje: SRC-19, subjekty: mrazova): Andrej Babiš v písemné odpovědi na interpelaci Olgy Richterové uvedl, že Mrázová neporušila žádné zákony, právní normy ani pravidla Bíliny, a nevidí důvod, proč by měla na základě opoziční výzvy rezignovat.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-53** (1 ZDROJ, zdroje: SRC-19, subjekty: mrazova): Richterová při interpelacích upozornila, že vedoucí stavebního úřadu příslušného k pozemku ministryně je jejím kamarádem.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-54** (1 ZDROJ, zdroje: SRC-24, subjekty: mrazova): Olga Richterová v rámci interpelace 28. května 2026 navrhla takzvaný „lex Mrázová“ — úpravu, která by politikům ukládala povinnost uvádět užívání obecního bytu v majetkovém přiznání.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-55** (1 ZDROJ, zdroje: SRC-24, subjekty: mrazova): Premiér Babiš ve sněmovně 28. května 2026 Mrázovou hájil argumentem, že si byt o výměře 130 metrů čtverečních platí sama, a srovnával její situaci s politiky pobírajícími vyšší náhrady na bydlení.
      → najít druhý, nezávislý zdroj (jiná vydavatelská rodina) → posun na CORROBORATED, nikdy jen relabelováním
- [ ] **CLM-56** (CORROBORATED, zdroje: SRC-19, SRC-26, subjekty: mrazova): Bývalý ministr pro místní rozvoj Ivan Bartoš (Piráti) prohlásil, že „ministryně Mrázová by mohla být jednotkou pokrytectví“ a že by se měla stydět; podle jeho vyjádření z července 2026 Mrázová zklamala a nevyvodila žádné důsledky.
      → již potvrzeno ≥2 nezávislými zdroji — ověřit/doplnit primárním registrovým záznamem (prismatic), nepřidávat další novinový zdroj jen pro počet
