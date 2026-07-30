# Authorization candidates report

**This is not an authorization.** Every entity below is a context entity —
discovered because it is named in an already-authorized dossier's sources
or claims. None of them has, or is proposed to automatically receive, its
own dossier. Promoting any of these to a subject with its own dossier
requires the site owner's explicit, dated, on-record decision in
`AGENTS.md` — this report exists only to make that decision informed,
never to make it for them.

Generated from 36 context entities across 19 dossier(s). Regenerate with `npm run generate:candidates`.

## Agrofert (`agrofert`)

- Type: company
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-04, CLM-05, CLM-16
- Sources: SRC-02, SRC-06 (2 independent source families)
- Relations: 
  - edge-agrofert-eppo (agrofert -> eppo, "trestní řízení k vyplácení evropských dotací, vedené na neznámého pachatele — nikdo není obviněn", dossier: andrej-babis)
  - edge-agrofert-komise (agrofert -> evropska-komise, "Komise k 5. 6. 2026 neproplatila žádnou náhradu a žádá vysvětlení struktury fondu — dotaz, ne zjištění", dossier: andrej-babis)
  - edge-agrofert-kostelecke (agrofert -> kostelecke-uzeniny, "firma ze skupiny Agrofert", dossier: andrej-babis)
  - edge-agrofert-szif (agrofert -> szif, "SZIF obnovil administraci žádostí o dotace (4/2026)", dossier: andrej-babis)
  - edge-babis-agrofert (babis -> agrofert, "vlastnické vazby; od 2/2026 akcie ve svěřenském fondu RSVP Trust, míra vlivu sporná", dossier: andrej-babis)
  - edge-rsvp-agrofert (rsvp-trust -> agrofert, "drží akcie Agrofertu (vloženy 2/2026)", dossier: andrej-babis)
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
- Appears in: andrej-babis
- Claims: CLM-01
- Sources: SRC-01 (1 independent source family)
- Relations: 
  - edge-babis-capihnizdo (babis -> capi-hnizdo, "obžalovaný; stíhání přerušeno po nevydání Sněmovnou — procesní krok, ne rozhodnutí o vině", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Richard Chlad (sponzor) (`chlad`)

- Type: person
- Status: not_authorized
- Appears in: macinka-turek, petr-macinka, filip-turek
- Claims: CLM-36
- Sources: SRC-41 (1 independent source family)
- Relations: 
  - edge-chlad-motoriste (chlad -> motoriste, "dar 638 864 Kč (2025, oficiálně) vs. tvrzené ~2 mil. Kč", dossier: macinka-turek)
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
- Missing: explicit owner authorization to promote this to its own dossier

## Evropská komise (`evropska-komise`)

- Type: public_institution
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-25, CLM-26
- Sources: SRC-10, SRC-11 (1 independent source family)
- Relations: 
  - edge-agrofert-komise (agrofert -> evropska-komise, "Komise k 5. 6. 2026 neproplatila žádnou náhradu a žádá vysvětlení struktury fondu — dotaz, ne zjištění", dossier: andrej-babis)
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
- Appears in: macinka-turek, petr-macinka
- Claims: CLM-46, CLM-47, CLM-48
- Sources: SRC-17, SRC-55 (2 independent source families)
- Relations: 
  - edge-gmrgascz-gmrgas (gmrgas-cz -> gmrgas, "podíl v ukrajinské pobočce", dossier: macinka-turek)
  - edge-vencalek-gmrgascz (vencalek -> gmrgas-cz, "jediný společník a jednatel", dossier: macinka-turek)
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
- Claims: CLM-18
- Sources: SRC-07 (1 independent source family)
- Relations: 
  - edge-agrofert-kostelecke (agrofert -> kostelecke-uzeniny, "firma ze skupiny Agrofert", dossier: andrej-babis)
  - edge-kostelecke-nss (kostelecke-uzeniny -> nss, "NSS potvrdil zrušení dotace (11/2025); rozhodnutí o dotaci, ne o vině osoby", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Motoristé sobě (`motoriste`)

- Type: political_party
- Status: not_authorized
- Appears in: macinka-turek, petr-macinka, filip-turek
- Claims: CLM-03
- Sources: SRC-11 (1 independent source family)
- Relations: 
  - edge-chlad-motoriste (chlad -> motoriste, "dar 638 864 Kč (2025, oficiálně) vs. tvrzené ~2 mil. Kč", dossier: macinka-turek)
  - edge-klubmotoristu-motoriste (klubmotoristu -> motoriste, "dar 800 000 Kč (2024)", dossier: macinka-turek)
  - edge-macinka-motoriste (macinka -> motoriste, "předseda", dossier: macinka-turek)
  - edge-motoriste-vlada (motoriste -> vlada, "člen koalice", dossier: macinka-turek)
  - edge-turek-motoriste (turek -> motoriste, "poslanec za", dossier: macinka-turek)
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

## Národní centrála proti organizovanému zločinu (`ncoz`)

- Type: public_institution
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-27
- Sources: SRC-12 (1 independent source family)
- Relations: 
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

## Nejvyšší správní soud (`nss`)

- Type: public_institution
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-18
- Sources: SRC-07 (1 independent source family)
- Relations: 
  - edge-kostelecke-nss (kostelecke-uzeniny -> nss, "NSS potvrdil zrušení dotace (11/2025); rozhodnutí o dotaci, ne o vině osoby", dossier: andrej-babis)
- Missing: explicit owner authorization to promote this to its own dossier

## Petr Pavel (prezident) (`pavel`)

- Type: person
- Status: not_authorized
- Appears in: macinka-turek, filip-turek
- Claims: CLM-38
- Sources: SRC-44 (1 independent source family)
- Relations: 
  - edge-pavel-mzp2026 (pavel -> mzp2026, "odmítl jmenovat", dossier: macinka-turek)
  - edge-turek-pavel (turek -> pavel, "hrozil žalobou (1/2026), nakonec nepodal (7/2026)", dossier: macinka-turek)
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

## RSVP Trust (`rsvp-trust`)

- Type: organization
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-04
- Sources: SRC-02 (1 independent source family)
- Relations: 
  - edge-rsvp-agrofert (rsvp-trust -> agrofert, "drží akcie Agrofertu (vloženy 2/2026)", dossier: andrej-babis)
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

## SPD (`spd`)

- Type: political_party
- Status: not_authorized
- Appears in: tomio-okamura
- Claims: CLM-01, CLM-02
- Sources: SRC-01 (1 independent source family)
- Relations: 
  - edge-okamura-spd (okamura -> spd, "předseda hnutí", dossier: tomio-okamura)
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

## Státní zemědělský intervenční fond (`szif`)

- Type: public_institution
- Status: not_authorized
- Appears in: andrej-babis
- Claims: CLM-10
- Sources: SRC-04 (1 independent source family)
- Relations: 
  - edge-agrofert-szif (agrofert -> szif, "SZIF obnovil administraci žádostí o dotace (4/2026)", dossier: andrej-babis)
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

## Petr Vencálek (vlastník GMR GAS s.r.o.) (`vencalek`)

- Type: person
- Status: not_authorized
- Appears in: macinka-turek, petr-macinka
- Claims: CLM-48
- Sources: SRC-17, SRC-55 (2 independent source families)
- Relations: 
  - edge-vencalek-gmrgascz (vencalek -> gmrgas-cz, "jediný společník a jednatel", dossier: macinka-turek)
- Missing: explicit owner authorization to promote this to its own dossier

## Vláda ČR (`vlada`)

- Type: public_institution
- Status: not_authorized
- Appears in: macinka-turek, petr-macinka, filip-turek, oto-klempir, alena-schillerova, ales-juchelka, ivan-bednarik, boris-stastny, andrej-babis, karel-havlicek, jaromir-zuna, jeronym-tejc, zuzana-mrazova, adam-vojtech, igor-cerveny, robert-plaga, martin-sebestyan
- Claims: CLM-03, CLM-01, CLM-36
- Sources: SRC-11, SRC-01, SRC-08, SRC-09, SRC-12 (6 independent source families)
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
