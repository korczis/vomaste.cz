# Authorization candidates report

**This is not an authorization.** Every entity below is a context entity —
discovered because it is named in an already-authorized dossier's sources
or claims. None of them has, or is proposed to automatically receive, its
own dossier. Promoting any of these to a subject with its own dossier
requires the site owner's explicit, dated, on-record decision in
`AGENTS.md` — this report exists only to make that decision informed,
never to make it for them.

Generated from 66 context entities across 24 dossier(s). Regenerate with `npm run generate:candidates`.

## AB private trust I a II (`ab-private-trusts`)

- Type: organization
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-16
- Sources: SRC-06, SRC-28 (2 independent source families)
- Relations: 
  - edge-ab-trusts-agrofert (ab-private-trusts -> agrofert, "držely akcie Agrofertu (2017–2025)", dossier: andrej-babis)
  - edge-babis-ab-trusts (babis -> ab-private-trusts, "akcie Agrofertu ve fondech 2/2017–2024/2025; poté návrat k přímému vlastnictví — majetková posloupnost, sama o sobě legální", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Agrofert (`agrofert`)

- Type: company
- Status: not_authorized
- Appears in: andrej-babis, tunde-bartha
- Claims: CLM-04, CLM-05, CLM-16, CLM-37, CLM-06
- Sources: SRC-02, SRC-06, SRC-15, SRC-03 (4 independent source families)
- Relations: 
  - edge-ab-trusts-agrofert (ab-private-trusts -> agrofert, "držely akcie Agrofertu (2017–2025)", dossier: andrej-babis)
  - edge-agrofert-capihnizdo-reklamy (agrofert -> capi-hnizdo, "platby firem skupiny za reklamu >270 mil. Kč (2010–2013); dvakrát odloženo, trestný čin nezjištěn — odložení není potvrzení přiměřenosti plateb", dossier: andrej-babis)
  - edge-agrofert-eppo (agrofert -> eppo, "trestní řízení k vyplácení evropských dotací, vedené na neznámého pachatele — nikdo není obviněn", dossier: andrej-babis)
  - edge-agrofert-komise (agrofert -> evropska-komise, "Komise k 5. 6. 2026 neproplatila žádnou náhradu a žádá vysvětlení struktury fondu — dotaz, ne zjištění", dossier: andrej-babis)
  - edge-agrofert-kostelecke (agrofert -> kostelecke-uzeniny, "firma ze skupiny Agrofert", dossier: andrej-babis)
  - edge-agrofert-navos (agrofert -> navos-farm-technic, "firma ze skupiny", dossier: andrej-babis)
  - edge-agrofert-pekarna (agrofert -> penam-zelena-louka, "firma ze skupiny (Penam)", dossier: andrej-babis)
  - edge-agrofert-pgrlf (agrofert -> pgrlf, "žaloby na 28 firem skupiny o 22 mil. Kč (7/2026) — podaná žaloba není rozhodnutí soudu", dossier: andrej-babis)
  - edge-agrofert-preol (agrofert -> preol, "největší tuzemský producent biopaliv ve skupině (kontext sporu o podporu biopaliv 2015)", dossier: andrej-babis)
  - edge-agrofert-sady (agrofert -> sady-cz, "firma ze skupiny", dossier: andrej-babis)
  - edge-agrofert-szif (agrofert -> szif, "SZIF ukončil administraci 21 předjednaných projektů (2023, spory u soudů) a obnovil administraci nových žádostí (4/2026)", dossier: andrej-babis)
  - edge-agrofert-vodnanska (agrofert -> vodnanska-drubez, "firma ze skupiny", dossier: andrej-babis)
  - edge-babis-agrofert (babis -> agrofert, "vlastnické vazby; od 2/2026 akcie ve svěřenském fondu RSVP Trust, míra vlivu sporná; dividenda 4,25 mld. Kč vyplacena před vkladem (legální krok)", dossier: andrej-babis)
  - edge-rsvp-agrofert (rsvp-trust -> agrofert, "drží akcie Agrofertu (vloženy 2/2026)", dossier: andrej-babis)
  - edge-agrofert-hungaria (agrofert -> agrofert-hungaria, "maďarská společnost koncernu", dossier: tunde-bartha)
  - edge-bartha-agrofert (bartha -> agrofert, "business development manager (dle zpravodajství, potvrzeno mluvčím); firemní web 9/2024: country managerka AGROFERT Hungária", dossier: tunde-bartha)
- Missing: explicit owner authorization to promote this to its own dossier

## AGROFERT Hungária (`agrofert-hungaria`)

- Type: company
- Status: not_authorized
- Appears in: tunde-bartha
- Claims: CLM-13
- Sources: SRC-09 (1 independent source family)
- Relations: 
  - edge-agrofert-hungaria (agrofert -> agrofert-hungaria, "maďarská společnost koncernu", dossier: tunde-bartha)
  - edge-bartha-agrofert-hungaria (bartha -> agrofert-hungaria, "country managerka (dle firemního webu, 9/2024) — popis pracovního zařazení, ne tvrzení o pochybení", dossier: tunde-bartha)
- Missing: explicit owner authorization to promote this to its own dossier

## JUDr. Alexej Bílek (`alexej-bilek`)

- Type: person
- Status: not_authorized
- Appears in: —
- Claims: none
- Sources: none (0 independent source families)
- Relations: none
- Missing: explicit owner authorization to promote this to its own dossier

## BLAKEY FINANCE LIMITED (BVI) (`blakey-finance`)

- Type: company
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-31
- Sources: SRC-13 (1 independent source family)
- Relations: 
  - edge-babis-blakey (babis -> blakey-finance, "vklad 15 mil. EUR (17. 9. 2009) — offshore struktura sama o sobě není protiprávní", dossier: andrej-babis)
  - edge-blakey-boyne (blakey-finance -> boyne-holding, "úvěr na nákupy nemovitostí ve Francii", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## BOYNE HOLDING LLC (Washington, D.C.) (`boyne-holding`)

- Type: company
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-31
- Sources: SRC-13 (1 independent source family)
- Relations: 
  - edge-blakey-boyne (blakey-finance -> boyne-holding, "úvěr na nákupy nemovitostí ve Francii", dossier: andrej-babis)
  - edge-boyne-bigaud (boyne-holding -> scp-bigaud, "financování pořízení pozemku; od 8/2019 SCP Bigaud ze 100 % vlastněna I.M.O.D.I.M.", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Čapí hnízdo (dotační kauza) (`capi-hnizdo`)

- Type: controversy
- Status: not_authorized
- Appears in: andrej-babis, jaroslav-faltynek
- Claims: CLM-01, CLM-02, CLM-05, CLM-49, CLM-50, CLM-51, CLM-52
- Sources: SRC-01, SRC-02, SRC-03, SRC-23, SRC-24 (4 independent source families)
- Relations: 
  - edge-agrofert-capihnizdo-reklamy (agrofert -> capi-hnizdo, "platby firem skupiny za reklamu >270 mil. Kč (2010–2013); dvakrát odloženo, trestný čin nezjištěn — odložení není potvrzení přiměřenosti plateb", dossier: andrej-babis)
  - edge-babis-capihnizdo (babis -> capi-hnizdo, "obžalovaný; dvakrát nepravomocně zproštěn (2023, 2024), obě zproštění zrušena; stíhání přerušeno po nevydání Sněmovnou — nic z toho není rozhodnutí o vině", dossier: andrej-babis)
  - edge-capihnizdo-olaf (capi-hnizdo -> olaf, "šetření OLAF; zveřejněné části zprávy hovoří o nesrovnalostech — zjištění kontrolního úřadu, ne rozsudek", dossier: andrej-babis)
  - edge-imoba-capihnizdo (imoba -> capi-hnizdo, "vlastník areálu; 6/2018 vrátila dotaci ~50 mil. Kč — vrácení není přiznání viny, do dohody firma prosadila opak", dossier: andrej-babis)
  - edge-faltynek-capihnizdo (faltynek -> capi-hnizdo, "stíhán 2015–2018; stíhání zrušeno státním zástupcem", dossier: jaroslav-faltynek)
- Missing: explicit owner authorization to promote this to its own dossier

## České dráhy (`ceske-drahy`)

- Type: organization
- Status: not_authorized
- Appears in: ivan-bednarik
- Claims: CLM-02
- Sources: SRC-02, SRC-29 (2 independent source families)
- Relations: 
  - edge-bednarik-ceske-drahy (bednarik -> ceske-drahy, "bývalý předseda představenstva a generální ředitel (rezignace 2022)", dossier: ivan-bednarik)
- Missing: explicit owner authorization to promote this to its own dossier

## Evropský parlament (`ep`)

- Type: public_institution
- Status: not_authorized
- Appears in: macinka-turek, filip-turek
- Claims: CLM-01
- Sources: SRC-11 (1 independent source family)
- Relations: 
  - edge-turek-ep (turek -> ep, "europoslanec 2024–2025", dossier: macinka-turek)
- Missing: explicit owner authorization to promote this to its own dossier

## Úřad evropského veřejného žalobce (EPPO) (`eppo`)

- Type: public_institution
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-27, CLM-28
- Sources: SRC-12 (1 independent source family)
- Relations: 
  - edge-agrofert-eppo (agrofert -> eppo, "trestní řízení k vyplácení evropských dotací, vedené na neznámého pachatele — nikdo není obviněn", dossier: andrej-babis)
  - edge-eppo-ncoz (eppo -> ncoz, "prověřováním pověřena NCOZ (24. 5. 2026)", dossier: andrej-babis)
  - edge-pekarna-eppo (penam-zelena-louka -> eppo, "obžaloba EPPO z 22. 6. 2026 (společnost + 2 osoby) — obžaloba není rozhodnutí o vině", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Evropská komise (`evropska-komise`)

- Type: public_institution
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-25, CLM-26, CLM-43, CLM-46
- Sources: SRC-10, SRC-11, SRC-19, SRC-20 (2 independent source families)
- Relations: 
  - edge-agrofert-komise (agrofert -> evropska-komise, "Komise k 5. 6. 2026 neproplatila žádnou náhradu a žádá vysvětlení struktury fondu — dotaz, ne zjištění", dossier: andrej-babis)
  - edge-babis-komise-audit (babis -> evropska-komise, "audit REGC414CZ0133: závěr o ovládání fondů (4/2021), uzavřen 20. 7. 2022 splněním doporučení — kontrolní nástroj, ne soud", dossier: andrej-babis)
  - edge-synbiol-komise (synbiol -> evropska-komise, "Komise sleduje střet zájmů i u SynBiolu a Hartenbergu — monitoring a pokyn, ne zjištění o porušení", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Fakultní nemocnice Olomouc (`fn-olomouc`)

- Type: public_institution
- Status: not_authorized
- Appears in: adam-vojtech
- Claims: CLM-07, CLM-08, CLM-09, CLM-11, CLM-12, CLM-31, CLM-32, CLM-33
- Sources: SRC-02, SRC-04, SRC-06, SRC-07, SRC-19, SRC-20 (6 independent source families)
- Relations: 
  - edge-vojtech-fn-olomouc (vojtech -> fn-olomouc, "kauza studie PROFID EHRA a trestní oznámení resortu (2025–2026)", dossier: adam-vojtech)
- Missing: explicit owner authorization to promote this to its own dossier

## GMR GAS UA LLC (Kyjev) (`gmrgas`)

- Type: company
- Status: not_authorized
- Appears in: macinka-turek, petr-macinka
- Claims: CLM-14, CLM-15, CLM-47
- Sources: SRC-17, SRC-18 (2 independent source families)
- Relations: 
  - edge-gmrgascz-gmrgas (gmrgas-cz -> gmrgas, "podíl v ukrajinské pobočce", dossier: macinka-turek)
  - edge-macinka-gmrgas (macinka -> gmrgas, "nepřiznaný 20% podíl", dossier: macinka-turek)
- Missing: explicit owner authorization to promote this to its own dossier

## GMR GAS s.r.o. (Brno) (`gmrgas-cz`)

- Type: company
- Status: not_authorized
- Appears in: macinka-turek, petr-macinka, petr-vencalek
- Claims: CLM-46, CLM-47, CLM-48, CLM-01
- Sources: SRC-17, SRC-55, SRC-01, SRC-02 (4 independent source families)
- Relations: 
  - edge-gmrgascz-gmrgas (gmrgas-cz -> gmrgas, "podíl v ukrajinské pobočce", dossier: macinka-turek)
  - edge-vencalek-gmrgascz (vencalek -> gmrgas-cz, "jediný společník a jednatel", dossier: macinka-turek)
  - edge-vencalek-gmrgascz (vencalek -> gmrgas-cz, "jediný společník a jednatel", dossier: petr-vencalek)
- Missing: explicit owner authorization to promote this to its own dossier

## Zmocněnec pro Green Deal (`greendeal`)

- Type: role
- Status: not_authorized
- Appears in: macinka-turek, filip-turek
- Claims: CLM-11
- Sources: SRC-06 (1 independent source family)
- Relations: 
  - edge-turek-greendeal (turek -> greendeal, "zmocněnec (do nehody)", dossier: macinka-turek)
- Missing: explicit owner authorization to promote this to its own dossier

## Hartenberg Holding (`hartenberg`)

- Type: company
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-39, CLM-41
- Sources: SRC-16, SRC-17 (1 independent source family)
- Relations: 
  - edge-synbiol-hartenberg (synbiol -> hartenberg, "zdravotnické aktivity ve skupině Hartenberg, mimo svěřenský fond", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Imoba (`imoba`)

- Type: company
- Status: not_authorized
- Appears in: tunde-bartha, andrej-babis
- Claims: CLM-05, CLM-73, CLM-74
- Sources: SRC-01, SRC-02, SRC-51 (3 independent source families)
- Relations: 
  - edge-bartha-imoba (bartha -> imoba, "dle vlastního vyjádření bydlí v objektu společnosti", dossier: tunde-bartha)
  - edge-imoba-babis (imoba -> babis, "dle citovaného zpravodajství společnost patří Andreji Babišovi", dossier: tunde-bartha)
  - edge-imoba-capihnizdo (imoba -> capi-hnizdo, "vlastník areálu; 6/2018 vrátila dotaci ~50 mil. Kč — vrácení není přiznání viny, do dohody firma prosadila opak", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Ing. Jaroslav Kurčík (`jaroslav-kurcik`)

- Type: person
- Status: not_authorized
- Appears in: —
- Claims: none
- Sources: none (0 independent source families)
- Relations: none
- Missing: explicit owner authorization to promote this to its own dossier

## Jiří Tvrdík (`jiri-tvrdik`)

- Type: person
- Status: not_authorized
- Appears in: —
- Claims: none
- Sources: none (0 independent source families)
- Relations: none
- Missing: explicit owner authorization to promote this to its own dossier

## Ing. Josef Mráz (`josef-mraz`)

- Type: person
- Status: not_authorized
- Appears in: —
- Claims: none
- Sources: none (0 independent source families)
- Relations: none
- Missing: explicit owner authorization to promote this to its own dossier

## Prezidentská kampaň Andreje Babiše (2022–2023) (`kampan-babis-2023`)

- Type: event
- Status: not_authorized
- Appears in: tunde-bartha
- Claims: CLM-10, CLM-11
- Sources: SRC-07 (1 independent source family)
- Relations: 
  - edge-bartha-kampan (bartha -> kampan-babis-2023, "šéfka prezidentské kampaně (12/2022); zmínka o kancléřce = zamýšlená budoucí role, ne funkce", dossier: tunde-bartha)
  - edge-kampan-babis (kampan-babis-2023 -> babis, "kampaň kandidáta Andreje Babiše", dossier: tunde-bartha)
- Missing: explicit owner authorization to promote this to its own dossier

## Kauza 2024: fotografie a svícny (`kauza2024`)

- Type: controversy
- Status: not_authorized
- Appears in: macinka-turek, petr-macinka, filip-turek
- Claims: CLM-04
- Sources: SRC-12 (1 independent source family)
- Relations: 
  - edge-macinka-kauza2024 (macinka -> kauza2024, "hájí ("pseudoproblém")", dossier: macinka-turek)
  - edge-turek-kauza2024 (turek -> kauza2024, "subjekt", dossier: macinka-turek)
- Missing: explicit owner authorization to promote this to its own dossier

## Kauza 2025: smazané příspěvky (`kauza2025`)

- Type: controversy
- Status: not_authorized
- Appears in: macinka-turek, filip-turek
- Claims: CLM-07
- Sources: SRC-15 (1 independent source family)
- Relations: 
  - edge-kauza2025-policie (kauza2025 -> policie, "prověřování výroků i oznámení na Deník N odloženo (28. 7. 2026)", dossier: macinka-turek)
  - edge-turek-kauza2025 (turek -> kauza2025, "subjekt", dossier: macinka-turek)
- Missing: explicit owner authorization to promote this to its own dossier

## Klub motoristů, z.s. (`klubmotoristu`)

- Type: organization
- Status: not_authorized
- Appears in: macinka-turek, petr-macinka
- Claims: CLM-22
- Sources: SRC-24 (1 independent source family)
- Relations: 
  - edge-klubmotoristu-motoriste (klubmotoristu -> motoriste, "dar 800 000 Kč (2024)", dossier: macinka-turek)
  - edge-macinka-klubmotoristu (macinka -> klubmotoristu, "statutární orgán", dossier: macinka-turek)
- Missing: explicit owner authorization to promote this to its own dossier

## Kostelecké uzeniny (`kostelecke-uzeniny`)

- Type: company
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-18, CLM-47, CLM-48
- Sources: SRC-07, SRC-21, SRC-22 (3 independent source families)
- Relations: 
  - edge-agrofert-kostelecke (agrofert -> kostelecke-uzeniny, "firma ze skupiny Agrofert", dossier: andrej-babis)
  - edge-kostelecke-nss (kostelecke-uzeniny -> nss, "NSS potvrdil zrušení dotace (11/2025); rozhodnutí o dotaci, ne o vině osoby", dossier: andrej-babis)
  - edge-kostelecke-szif (kostelecke-uzeniny -> szif, "dotaci z PRV 2018 schválil SZIF, zrušilo ji Ministerstvo zemědělství", dossier: andrej-babis)
  - edge-kostelecke-ustavnisoud (kostelecke-uzeniny -> ustavni-soud, "ústavní stížnost odmítnuta 1. 4. 2026 jako zjevně neopodstatněná — spor o nárok na dotaci, ne o vině", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Mgr. Libor Němeček (`libor-nemecek`)

- Type: person
- Status: not_authorized
- Appears in: —
- Claims: none
- Sources: none (0 independent source families)
- Relations: none
- Missing: explicit owner authorization to promote this to its own dossier

## Ing. Martin Kubů (`martin-kubu`)

- Type: person
- Status: not_authorized
- Appears in: —
- Claims: none
- Sources: none (0 independent source families)
- Relations: none
- Missing: explicit owner authorization to promote this to its own dossier

## Ing. Michal Jedlička (`michal-jedlicka`)

- Type: person
- Status: not_authorized
- Appears in: —
- Claims: none
- Sources: none (0 independent source families)
- Relations: none
- Missing: explicit owner authorization to promote this to its own dossier

## Motoristé sobě (`motoriste`)

- Type: political_party
- Status: not_authorized
- Appears in: macinka-turek, petr-macinka, filip-turek, richard-chlad
- Claims: CLM-03, CLM-01, CLM-02, CLM-04
- Sources: SRC-11, SRC-01, SRC-02, SRC-03 (4 independent source families)
- Relations: 
  - edge-chlad-motoriste (chlad -> motoriste, "dar 638 864 Kč (2025, oficiálně) vs. tvrzené ~2 mil. Kč", dossier: macinka-turek)
  - edge-klubmotoristu-motoriste (klubmotoristu -> motoriste, "dar 800 000 Kč (2024)", dossier: macinka-turek)
  - edge-macinka-motoriste (macinka -> motoriste, "předseda", dossier: macinka-turek)
  - edge-motoriste-vlada (motoriste -> vlada, "člen koalice", dossier: macinka-turek)
  - edge-turek-motoriste (turek -> motoriste, "poslanec za", dossier: macinka-turek)
  - edge-chlad-motoriste-dary (chlad -> motoriste, "evidováno 638 864 Kč za rok 2025 včetně nepeněžního plnění; veřejně uváděná čísla se liší", dossier: richard-chlad)
- Missing: explicit owner authorization to promote this to its own dossier

## Ministerstvo průmyslu a obchodu (`mpo`)

- Type: public_institution
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-55
- Sources: SRC-36, SRC-37 (2 independent source families)
- Relations: 
  - edge-pekarna-mpo (penam-zelena-louka -> mpo, "odnětí stomilionové dotace (2022); EK ji odmítla proplatit", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Ministerstvo zdravotnictví (`mzdrav`)

- Type: public_institution
- Status: not_authorized
- Appears in: macinka-turek, filip-turek
- Claims: CLM-31
- Sources: SRC-34 (1 independent source family)
- Relations: 
  - edge-zapperclub-mzdrav (zapper-club -> mzdrav, "varování před přístrojem zapper", dossier: macinka-turek)
- Missing: explicit owner authorization to promote this to its own dossier

## Jmenování ministrem ŽP (2026) (`mzp2026`)

- Type: controversy
- Status: not_authorized
- Appears in: macinka-turek, petr-macinka, filip-turek
- Claims: CLM-38
- Sources: SRC-44 (1 independent source family)
- Relations: 
  - edge-cerveny-mzp2026 (cerveny -> mzp2026, "jmenován ministrem (nahradil Macinku, 23. 2. 2026)", dossier: macinka-turek)
  - edge-macinka-mzp2026 (macinka -> mzp2026, "dočasně vede resort (do 2/2026)", dossier: macinka-turek)
  - edge-pavel-mzp2026 (pavel -> mzp2026, "odmítl jmenovat", dossier: macinka-turek)
  - edge-turek-mzp2026 (turek -> mzp2026, "navrhován, nejmenován (1/2026)", dossier: macinka-turek)
- Missing: explicit owner authorization to promote this to its own dossier

## Navos Farm Technic (`navos-farm-technic`)

- Type: company
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-68
- Sources: SRC-46, SRC-47 (2 independent source families)
- Relations: 
  - edge-agrofert-navos (agrofert -> navos-farm-technic, "firma ze skupiny", dossier: andrej-babis)
  - edge-navos-nss (navos-farm-technic -> nss, "NSS 12/2025: zákaz kvůli střetu zájmů platí i pro zakázky malého rozsahu — správní výklad, ne trestní odpovědnost", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Národní centrála proti organizovanému zločinu (`ncoz`)

- Type: public_institution
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-27, CLM-75
- Sources: SRC-12, SRC-52 (2 independent source families)
- Relations: 
  - edge-babis-ncoz-pandora (babis -> ncoz, "Pandora Papers, česká větev: jednání nelze posoudit jako TČ na území ČR, poznatky předány jiné zemi EU — závěr o příslušnosti, ne zproštění", dossier: andrej-babis)
  - edge-eppo-ncoz (eppo -> ncoz, "prověřováním pověřena NCOZ (24. 5. 2026)", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Nehoda 2026 (`nehoda2026`)

- Type: event
- Status: not_authorized
- Appears in: macinka-turek, petr-macinka, filip-turek
- Claims: CLM-10
- Sources: SRC-02 (1 independent source family)
- Relations: 
  - edge-babis-nehoda2026 (babis -> nehoda2026, "vyzval k odpovědnosti", dossier: macinka-turek)
  - edge-homolce-nehoda2026 (nemocnice-homolce -> nehoda2026, "provozovatel vozidla záchranné služby", dossier: macinka-turek)
  - edge-macinka-nehoda2026 (macinka -> nehoda2026, "hájí ("nikdy se ho nevzdám")", dossier: macinka-turek)
  - edge-nehoda2026-policie (nehoda2026 -> policie, "vyšetřování (výsledek k datu poslední kontroly neuzavřen)", dossier: macinka-turek)
  - edge-turek-nehoda2026 (turek -> nehoda2026, "subjekt", dossier: macinka-turek)
- Missing: explicit owner authorization to promote this to its own dossier

## Nemocnice Na Homolce (`nemocnice-homolce`)

- Type: public_institution
- Status: not_authorized
- Appears in: macinka-turek, filip-turek
- Claims: CLM-18
- Sources: SRC-20 (1 independent source family)
- Relations: 
  - edge-homolce-nehoda2026 (nemocnice-homolce -> nehoda2026, "provozovatel vozidla záchranné služby", dossier: macinka-turek)
- Missing: explicit owner authorization to promote this to its own dossier

## Nejvyšší kontrolní úřad (`nku`)

- Type: public_institution
- Status: not_authorized
- Appears in: lubomir-metnar
- Claims: CLM-01, CLM-03
- Sources: SRC-01 (1 independent source family)
- Relations: 
  - edge-metnar-nku (metnar -> nku, "návrh ukončit policejní ochranu úřadu (2026)", dossier: lubomir-metnar)
- Missing: explicit owner authorization to promote this to its own dossier

## Národní rozpočtová rada (`nrr`)

- Type: public_institution
- Status: not_authorized
- Appears in: alena-schillerova
- Claims: CLM-24, CLM-25, CLM-26, CLM-30, CLM-31, CLM-32, CLM-33
- Sources: SRC-18, SRC-16, SRC-17, SRC-11 (4 independent source families)
- Relations: 
  - edge-schillerova-nrr (schillerova -> nrr, "kritika souladu rozpočtu se zákonem o rozpočtové odpovědnosti", dossier: alena-schillerova)
- Missing: explicit owner authorization to promote this to its own dossier

## Nejvyšší správní soud (`nss`)

- Type: public_institution
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-18
- Sources: SRC-07 (1 independent source family)
- Relations: 
  - edge-kostelecke-nss (kostelecke-uzeniny -> nss, "NSS potvrdil zrušení dotace (11/2025); rozhodnutí o dotaci, ne o vině osoby", dossier: andrej-babis)
  - edge-navos-nss (navos-farm-technic -> nss, "NSS 12/2025: zákaz kvůli střetu zájmů platí i pro zakázky malého rozsahu — správní výklad, ne trestní odpovědnost", dossier: andrej-babis)
  - edge-sady-nss (sady-cz -> nss, "NSS 8/2025 zamítl kasační stížnost: rozhodný je stav v době podání žádosti", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Evropský úřad pro boj proti podvodům (OLAF) (`olaf`)

- Type: public_institution
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-72
- Sources: SRC-50 (1 independent source family)
- Relations: 
  - edge-capihnizdo-olaf (capi-hnizdo -> olaf, "šetření OLAF; zveřejněné části zprávy hovoří o nesrovnalostech — zjištění kontrolního úřadu, ne rozsudek", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Mgr. Pavel Hanus (`pavel-hanus`)

- Type: person
- Status: not_authorized
- Appears in: —
- Claims: none
- Sources: none (0 independent source families)
- Relations: none
- Missing: explicit owner authorization to promote this to its own dossier

## Pekárna Zelená louka (skupina Agrofert) (`penam-zelena-louka`)

- Type: organization
- Status: not_authorized
- Appears in: karel-havlicek, andrej-babis
- Claims: CLM-05, CLM-07, CLM-08, CLM-19, CLM-21, CLM-22, CLM-25, CLM-27, CLM-55, CLM-57, CLM-58
- Sources: SRC-02, SRC-04, SRC-05, SRC-11, SRC-12, SRC-13, SRC-14, SRC-15, SRC-34, SRC-35, SRC-36, SRC-37 (14 independent source families)
- Relations: 
  - edge-havlicek-penam-zelena-louka (havlicek -> penam-zelena-louka, "reportovaná nevymáhaná dotace (od 2019 znám audit EU)", dossier: karel-havlicek)
  - edge-agrofert-pekarna (agrofert -> penam-zelena-louka, "firma ze skupiny (Penam)", dossier: andrej-babis)
  - edge-pekarna-eppo (penam-zelena-louka -> eppo, "obžaloba EPPO z 22. 6. 2026 (společnost + 2 osoby) — obžaloba není rozhodnutí o vině", dossier: andrej-babis)
  - edge-pekarna-mpo (penam-zelena-louka -> mpo, "odnětí stomilionové dotace (2022); EK ji odmítla proplatit", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Ing. Petr Cingr (`petr-cingr`)

- Type: person
- Status: not_authorized
- Appears in: —
- Claims: none
- Sources: none (0 independent source families)
- Relations: none
- Missing: explicit owner authorization to promote this to its own dossier

## Ing. Petra Procházková (`petra-prochazkova`)

- Type: person
- Status: not_authorized
- Appears in: —
- Claims: none
- Sources: none (0 independent source families)
- Relations: none
- Missing: explicit owner authorization to promote this to its own dossier

## Podpůrný a garanční rolnický a lesnický fond (PGRLF) (`pgrlf`)

- Type: public_institution
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-60
- Sources: SRC-38, SRC-40 (2 independent source families)
- Relations: 
  - edge-agrofert-pgrlf (agrofert -> pgrlf, "žaloby na 28 firem skupiny o 22 mil. Kč (7/2026) — podaná žaloba není rozhodnutí soudu", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Národní finanční prokuratura (PNF, Francie) (`pnf`)

- Type: public_institution
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-13
- Sources: SRC-05 (1 independent source family)
- Relations: 
  - edge-babis-pnf (babis -> pnf, "předběžné vyšetřování ve Francii; k datu kontroly bez obvinění", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Policie ČR (`policie`)

- Type: public_institution
- Status: not_authorized
- Appears in: macinka-turek, filip-turek
- Claims: CLM-27, CLM-41
- Sources: SRC-31, SRC-47, SRC-48, SRC-54 (4 independent source families)
- Relations: 
  - edge-kauza2025-policie (kauza2025 -> policie, "prověřování výroků i oznámení na Deník N odloženo (28. 7. 2026)", dossier: macinka-turek)
  - edge-nehoda2026-policie (nehoda2026 -> policie, "vyšetřování (výsledek k datu poslední kontroly neuzavřen)", dossier: macinka-turek)
  - edge-trestniozn-policie (trestniozn -> policie, "odloženo policií pro promlčení — procesní krok, ne rozhodnutí o vině; nepravomocné", dossier: macinka-turek)
- Missing: explicit owner authorization to promote this to its own dossier

## Městská část Praha 3 (`praha3`)

- Type: public_institution
- Status: not_authorized
- Appears in: tunde-bartha
- Claims: CLM-01, CLM-02, CLM-03, CLM-04
- Sources: SRC-01, SRC-02 (2 independent source families)
- Relations: 
  - edge-bartha-praha3 (bartha -> praha3, "výpověď z nájmu obecního bytu (rozhodnutí rady, ne soudu)", dossier: tunde-bartha)
- Missing: explicit owner authorization to promote this to its own dossier

## Preol (`preol`)

- Type: company
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-84
- Sources: SRC-60 (1 independent source family)
- Relations: 
  - edge-agrofert-preol (agrofert -> preol, "největší tuzemský producent biopaliv ve skupině (kontext sporu o podporu biopaliv 2015)", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## RSVP Trust (`rsvp-trust`)

- Type: organization
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-04
- Sources: SRC-02 (1 independent source family)
- Relations: 
  - edge-rsvp-agrofert (rsvp-trust -> agrofert, "drží akcie Agrofertu (vloženy 2/2026)", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Sady CZ (`sady-cz`)

- Type: company
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-65
- Sources: SRC-45 (1 independent source family)
- Relations: 
  - edge-agrofert-sady (agrofert -> sady-cz, "firma ze skupiny", dossier: andrej-babis)
  - edge-sady-nss (sady-cz -> nss, "NSS 8/2025 zamítl kasační stížnost: rozhodný je stav v době podání žádosti", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## SCP Bigaud (Monako) (`scp-bigaud`)

- Type: company
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-31, CLM-33
- Sources: SRC-13 (1 independent source family)
- Relations: 
  - edge-boyne-bigaud (boyne-holding -> scp-bigaud, "financování pořízení pozemku; od 8/2019 SCP Bigaud ze 100 % vlastněna I.M.O.D.I.M.", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Seznam.cz (`seznam-cz`)

- Type: company
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-86, CLM-87
- Sources: SRC-62, SRC-63 (2 independent source families)
- Relations: 
  - edge-seznam-zaloba (seznam-cz -> zaloba-seznam-2026, "žalobce", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## SPD (`spd`)

- Type: political_party
- Status: not_authorized
- Appears in: tomio-okamura
- Claims: CLM-01, CLM-02
- Sources: SRC-01 (1 independent source family)
- Relations: 
  - edge-okamura-spd (okamura -> spd, "předseda hnutí", dossier: tomio-okamura)
- Missing: explicit owner authorization to promote this to its own dossier

## Správa železnic (`sprava-zeleznic`)

- Type: organization
- Status: not_authorized
- Appears in: ivan-bednarik
- Claims: CLM-18, CLM-19
- Sources: SRC-14 (1 independent source family)
- Relations: 
  - edge-bednarik-sprava-zeleznic (bednarik -> sprava-zeleznic, "spor o pozemky a reforma úspor (2026)", dossier: ivan-bednarik)
- Missing: explicit owner authorization to promote this to its own dossier

## Státní zastupitelství (`statni-zastupitelstvi`)

- Type: public_institution
- Status: not_authorized
- Appears in: macinka-turek, filip-turek
- Claims: CLM-27
- Sources: SRC-31, SRC-54 (2 independent source families)
- Relations: 
  - edge-trestniozn-statnizastupitelstvi (trestniozn -> statni-zastupitelstvi, "OSZ pro Prahu 4 odložení oznámilo; o stížnosti ženy rozhoduje státní zástupkyně", dossier: macinka-turek)
- Missing: explicit owner authorization to promote this to its own dossier

## SynBiol (`synbiol`)

- Type: company
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-39, CLM-41, CLM-42
- Sources: SRC-16, SRC-17 (1 independent source family)
- Relations: 
  - edge-babis-synbiol (babis -> synbiol, "podíl 87,75 %, ponechán mimo svěřenský fond; 2/2026 podle výkladu veřejných registrů opět přímé vlastnictví", dossier: andrej-babis)
  - edge-synbiol-hartenberg (synbiol -> hartenberg, "zdravotnické aktivity ve skupině Hartenberg, mimo svěřenský fond", dossier: andrej-babis)
  - edge-synbiol-komise (synbiol -> evropska-komise, "Komise sleduje střet zájmů i u SynBiolu a Hartenbergu — monitoring a pokyn, ne zjištění o porušení", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Státní zemědělský intervenční fond (`szif`)

- Type: public_institution
- Status: not_authorized
- Appears in: andrej-babis, martin-sebestyan
- Claims: CLM-10, CLM-48, CLM-08, CLM-09, CLM-11
- Sources: SRC-04, SRC-22, SRC-26 (4 independent source families)
- Relations: 
  - edge-agrofert-szif (agrofert -> szif, "SZIF ukončil administraci 21 předjednaných projektů (2023, spory u soudů) a obnovil administraci nových žádostí (4/2026)", dossier: andrej-babis)
  - edge-kostelecke-szif (kostelecke-uzeniny -> szif, "dotaci z PRV 2018 schválil SZIF, zrušilo ji Ministerstvo zemědělství", dossier: andrej-babis)
  - edge-vodnanska-szif (vodnanska-drubez -> szif, "SZIF ukončil administraci žádosti (2023); NSS 1/2025 vyhověl kasační stížnosti fondu", dossier: andrej-babis)
  - edge-sebestyan-szif (sebestyan -> szif, "bývalý ředitel (2013–2022)", dossier: martin-sebestyan)
- Missing: explicit owner authorization to promote this to its own dossier

## SZPI (`szpi`)

- Type: public_institution
- Status: not_authorized
- Appears in: macinka-turek, filip-turek
- Claims: CLM-31
- Sources: SRC-34, SRC-35 (2 independent source families)
- Relations: 
  - edge-zapperclub-szpi (zapper-club -> szpi, "odebrání certifikátu", dossier: macinka-turek)
- Missing: explicit owner authorization to promote this to its own dossier

## Trestní oznámení (2025) (`trestniozn`)

- Type: legal_or_administrative_process
- Status: not_authorized
- Appears in: macinka-turek, filip-turek
- Claims: CLM-25
- Sources: SRC-28 (1 independent source family)
- Relations: 
  - edge-trestniozn-policie (trestniozn -> policie, "odloženo policií pro promlčení — procesní krok, ne rozhodnutí o vině; nepravomocné", dossier: macinka-turek)
  - edge-trestniozn-statnizastupitelstvi (trestniozn -> statni-zastupitelstvi, "OSZ pro Prahu 4 odložení oznámilo; o stížnosti ženy rozhoduje státní zástupkyně", dossier: macinka-turek)
  - edge-turek-trestniozn (turek -> trestniozn, "subjekt (oznámení 6/2025, odloženo pro promlčení 5/2026)", dossier: macinka-turek)
- Missing: explicit owner authorization to promote this to its own dossier

## Ústavní soud (`ustavni-soud`)

- Type: public_institution
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-47, CLM-66
- Sources: SRC-21, SRC-44 (2 independent source families)
- Relations: 
  - edge-kostelecke-ustavnisoud (kostelecke-uzeniny -> ustavni-soud, "ústavní stížnost odmítnuta 1. 4. 2026 jako zjevně neopodstatněná — spor o nárok na dotaci, ne o vině", dossier: andrej-babis)
  - edge-vodnanska-ustavnisoud (vodnanska-drubez -> ustavni-soud, "ústavní stížnost odmítnuta 1/2026 (dotace 75 mil. Kč) — spor o nárok na dotaci, ne o vině", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Vláda ČR (`vlada`)

- Type: public_institution
- Status: not_authorized
- Appears in: macinka-turek, petr-macinka, filip-turek, oto-klempir, alena-schillerova, ales-juchelka, ivan-bednarik, boris-stastny, andrej-babis, karel-havlicek, jaromir-zuna, jeronym-tejc, zuzana-mrazova, adam-vojtech, igor-cerveny, robert-plaga, martin-sebestyan, tunde-bartha
- Claims: CLM-03, CLM-01, CLM-36, CLM-07, CLM-08
- Sources: SRC-11, SRC-01, SRC-08, SRC-09, SRC-12, SRC-04 (7 independent source families)
- Relations: 
  - edge-babis-vlada (babis -> vlada, "premiér", dossier: macinka-turek)
  - edge-motoriste-vlada (motoriste -> vlada, "člen koalice", dossier: macinka-turek)
  - edge-klempir-vlada (klempir -> vlada, "ministr kultury", dossier: oto-klempir)
  - edge-schillerova-vlada (schillerova -> vlada, "místopředsedkyně vlády a ministryně financí", dossier: alena-schillerova)
  - edge-juchelka-vlada (juchelka -> vlada, "ministr práce a sociálních věcí", dossier: ales-juchelka)
  - edge-bednarik-vlada (bednarik -> vlada, "ministr dopravy", dossier: ivan-bednarik)
  - edge-stastny-vlada (stastny -> vlada, "ministr pro sport, prevenci a zdraví", dossier: boris-stastny)
  - edge-babis-vlada (babis -> vlada, "předseda vlády (k datu citovaného zpravodajství 2026)", dossier: andrej-babis)
  - edge-havlicek-vlada (havlicek -> vlada, "1. místopředseda vlády a ministr průmyslu a obchodu", dossier: karel-havlicek)
  - edge-zuna-vlada (zuna -> vlada, "místopředseda vlády a ministr obrany", dossier: jaromir-zuna)
  - edge-tejc-vlada (tejc -> vlada, "ministr spravedlnosti", dossier: jeronym-tejc)
  - edge-mrazova-vlada (mrazova -> vlada, "ministryně pro místní rozvoj", dossier: zuzana-mrazova)
  - edge-vojtech-vlada (vojtech -> vlada, "ministr zdravotnictví", dossier: adam-vojtech)
  - edge-cerveny-vlada (cerveny -> vlada, "ministr životního prostředí", dossier: igor-cerveny)
  - edge-plaga-vlada (plaga -> vlada, "ministr školství, mládeže a tělovýchovy", dossier: robert-plaga)
  - edge-sebestyan-vlada (sebestyan -> vlada, "ministr zemědělství", dossier: martin-sebestyan)
  - edge-bartha-vlada (bartha -> vlada, "pověřena řízením 2018–2021; 15. 12. 2025 jmenována vedoucí Úřadu vlády (primární úřední zdroj)", dossier: tunde-bartha)
- Missing: explicit owner authorization to promote this to its own dossier

## Vodňanská drůbež (`vodnanska-drubez`)

- Type: company
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-64, CLM-66, CLM-67
- Sources: SRC-43, SRC-44 (2 independent source families)
- Relations: 
  - edge-agrofert-vodnanska (agrofert -> vodnanska-drubez, "firma ze skupiny", dossier: andrej-babis)
  - edge-vodnanska-szif (vodnanska-drubez -> szif, "SZIF ukončil administraci žádosti (2023); NSS 1/2025 vyhověl kasační stížnosti fondu", dossier: andrej-babis)
  - edge-vodnanska-ustavnisoud (vodnanska-drubez -> ustavni-soud, "ústavní stížnost odmítnuta 1/2026 (dotace 75 mil. Kč) — spor o nárok na dotaci, ne o vině", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Žaloba Seznam.cz na ochranu pověsti (2026) (`zaloba-seznam-2026`)

- Type: legal_or_administrative_process
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-86
- Sources: SRC-62, SRC-63 (2 independent source families)
- Relations: 
  - edge-babis-zaloba-seznam (babis -> zaloba-seznam-2026, "žalovaný v civilním sporu o ochranu pověsti — podaná žaloba není rozhodnutí soudu", dossier: andrej-babis)
  - edge-seznam-zaloba (seznam-cz -> zaloba-seznam-2026, "žalobce", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Zapper-Club s.r.o. (`zapper-club`)

- Type: company
- Status: not_authorized
- Appears in: macinka-turek, filip-turek
- Claims: CLM-20, CLM-31
- Sources: SRC-23, SRC-34 (2 independent source families)
- Relations: 
  - edge-turek-zapperclub (turek -> zapper-club, "společník 2016–2023", dossier: macinka-turek)
  - edge-zapperclub-mzdrav (zapper-club -> mzdrav, "varování před přístrojem zapper", dossier: macinka-turek)
  - edge-zapperclub-szpi (zapper-club -> szpi, "odebrání certifikátu", dossier: macinka-turek)
- Missing: explicit owner authorization to promote this to its own dossier

## Ing. Zbyněk Průša (`zbynek-prusa`)

- Type: person
- Status: not_authorized
- Appears in: —
- Claims: none
- Sources: none (0 independent source families)
- Relations: none
- Missing: explicit owner authorization to promote this to its own dossier
