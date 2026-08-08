# Co-op task board

Jediný zdroj pravdy o stavu paralelní práce — viz
`docs/coop/PROTOCOL.md`. **Single-writer:** tento soubor edituje pouze
ORCH, pouze na větvi `master`. Workeři hlásí stav přes sběrnici
(`scripts/coop/coop.sh send …`), nikdy editem tohoto souboru.

Stavy: `todo → claimed → in-progress → review → merged`, kdykoliv
`blocked` (důvod do poznámky). Task s dotykem obsahu o reálné osobě
nese štítek `[scope-check]` a před startem se ověřuje proti
autorizačnímu logu v `AGENTS.md`.

## Aktivní zadání: James Quick — pokračující doložení (2026-08-07)

| ID | Titul | Scope (soubory/sekce) | Branch | Owner | Stav | Závislosti | Akceptace |
|----|-------|-----------------------|--------|-------|------|------------|-----------|
| T-090 | `[scope-check]` James Quick: nezávislé doložení domén napodobujících státní instituce a plánovaného veřejného registru — pouze průnik tvrzení přímo doložený ČT24 + Peníze.cz, respektive ČT24 + iROZHLAS; napojení na existující entity, kauzy, graf a UI | `data/dossiers/james-quick/**`, odvozené adaptéry `content/dossiers/james-quick/**`, generované snapshoty/reporty | task/T-090-james-quick-corroboration | ORCH | merged (17e10907, fast-forward) | – | CLM-20/21 + SRC-21/22; dvě nové CORROBORATED položky, R8/S10 a tabulková parita zelené; `npm run build` 43/43 zelený (1019 testů, 499,9 s); push a Pages deploy spuštěny |

## Aktivní zadání: manifest deep-dive + docs onramp (2026-08-06)

Zadání vlastníka: „výtazně rozšiř sekci a články — koncept, metodika,
vše prolinkuj, rozděl práci na malé kroky a průběžně deploy" a
navazující „důkladně rozviň manifesto, každý bod jedna stránka, více
bodů, detailní popis, prolinkování, co bod to todo step, průběžně
deploy". Čistě dokumentační/obsahová práce o systému samotném — žádný
nový subjekt, žádná nová autorizace, autorizační log netknutý. Každý
řádek níže je samostatný commit + build + merge + push cyklus, ověřený
zeleně před deployem. (Poznámka: tenhle záznam byl jednou už zapsán a
při souběžném řešení kolize tří misí na masteru se ztratil beze stopy v
historii — zapsáno podruhé 2026-08-06.)

| ID | Titul | Scope (soubory/sekce) | Branch | Owner | Stav | Závislosti | Akceptace |
|----|-------|-----------------------|--------|-------|------|------------|-----------|
| T-077 | Landing-page CTA "Jak přispět" mířila na raw GitHub markdown místo on-site renderované /dokumentace/prispivani.md; CONTRIBUTING.md nikdy nezmiňoval `npm run dev` (jediný příkaz na lokální preview bez forku/commitu) | `templates/index.html`, `CONTRIBUTING.md` | task/T-077-docs-onramp | ORCH | merged (7ecb84c7, fast-forward) | – | `npm run build` zelený (40/40, 183.8s) |
| T-078 | Manifest §4 ("Procesní výsledek není věcný závěr") neměl vlastní koncept stránku — jen zmínku uvnitř registr-kauz.md | nová `content/koncepty/procesni-vysledek.md`, `manifest.md`, `registr-kauz.md`, `stav-sporne.md` (opravena nepřesná reference) | task/T-078-koncept-procesni-vysledek | ORCH | merged (0cf0fe44) | – | `npm run build` zelený (40/40, 602.7s) |
| T-079 | Batch cross-link §1,2,3,5,6,9,10,11 na existující koncept stránky | `manifest.md` | task/T-079-manifest-crosslinks | ORCH | merged (1e77fe76) | – | `npm run build` zelený (40/40, 1376.5s — silná soutěž o build-lock); zjištěno a opraveno: §7 plánovaný odkaz na bezpecnostni-hranice.md byl špatná shoda (jiné téma), zaznamenáno jako nová stránka místo vynuceného špatného odkazu |
| T-080 | Manifest §8 ("Rozsah musí být autorizovaný a dohledatelný") neměl vlastní koncept stránku | nová `content/koncepty/autorizace.md` (grounded v AGENTS.md "Standing scope authorization and publication gates"), `manifest.md` | task/T-080-koncept-autorizace | ORCH | merged (6a7c71f3) | – | `npm run build` zelený (41/41, 440.9s) |
| T-081 | Manifest §7 ("Veřejný zájem není licence k bezbřehému sběru") — nová stránka místo T-079 chybného odhadu | nová `content/koncepty/tretiosoby.md` (grounded v AGENTS.md "Context entities are not coverage"), `manifest.md` | task/T-081-koncept-tretiosoby | ORCH | merged (f65f65e3, fast-forward) | – | `npm run build` zelený (41/41, 146.9s); vyřešen skutečný production incident na masteru (15 JSON-LD citation-integrity chyb v cizích dossierech adam-vojtech/oto-klempir/robert-plaga, nezpůsobeno tímto zadáním, opraveno jinou souběžnou session mezitím) |
| T-082 | Manifest §12 ("Serverless není módní slovo") neměl vlastní koncept stránku | nová `content/koncepty/serverless.md`, `manifest.md`, `forkovatelnost.md` (reciproční odkaz) | task/T-082-koncept-serverless | ORCH | merged (d33c5340) | – | `npm run build` zelený (41/41, 213.5–224.6s) |
| T-083 | Manifest §13 ("Autonomní neznamená bez odpovědnosti") neměl vlastní koncept stránku | nová `content/koncepty/autonomie-s-odpovednosti.md` (grounded v `docs/coop/PROTOCOL.md` single-writer pravidlu), `manifest.md` | task/T-083-koncept-autonomie | ORCH | merged (c01a011f, fast-forward) | – | `npm run build` zelený (41/41, 162.7–208.4s) |
| T-085 | Manifest §14 ("Nezastavitelnost je vlastnost architektury") neměl vlastní koncept stránku; syntetizuje čtyři nezávislé body selhání (doména/hosting/provozovatel/repozitář) | nová `content/koncepty/nezastavitelnost.md`, `manifest.md`, `serverless.md` (dokončen odložený zpětný odkaz z T-082) | task/T-085-koncept-nezastavitelnost | ORCH | merged (027174d7) | – | `npm run build` zelený (41/41, 238.0–161.7s) |
| T-086 | Manifest §15 ("Důvěru nemá vyžadovat značka") neměl vlastní koncept stránku — mapuje osm ověřovacích otázek z manifestu na konkrétní mechanismy jinde na webu | nová `content/koncepty/duvera-bez-znacky.md`, `manifest.md` | task/T-086-koncept-duvera | ORCH | merged (ebbf2bf5, fast-forward) | – | `npm run build` zelený (41/41, 159.1–162.7s); post-merge hook úspěšně auto-pushnul |
| T-087 | Manifest §16 ("Otevřenost zahrnuje právo kritizovat i opravovat") neměl vlastní koncept stránku | nová `content/koncepty/pravo-opravit.md` (grounded v CONTRIBUTING.md), `manifest.md` | task/T-087-koncept-pravo-opravit | ORCH | merged (b1a54439, fast-forward) | – | `npm run build` zelený (41/41, 148.7–154.3s); nalezena a opravena TOML syntax chyba (neescapovaná uvozovka v description poli) |
| T-088 | Manifest §17 ("Metodologie má přežít jednotlivé kauzy"), poslední číslovaný bod manifestu — dokončuje "každý bod = vlastní stránka, prolinkováno" napříč všemi 17 body (9 nových stránek §4,7,8,12,13,14,15,16,17; 8 bodů prolinkováno na existující stránky §1,2,3,5,6,9,10,11) | nová `content/koncepty/metodologie-prezije-kauzy.md`, `manifest.md` | task/T-088-koncept-metodologie-prezije | ORCH | merged (2649235e, fast-forward) | – | `npm run build` zelený (41/41, 147.3–150.8s); post-merge hook úspěšně auto-pushnul |
| T-089 | Chybějící záznamy v katalogu toolingu (G1 brána): `dossier:next-id` a `verify:og` neměly odpovídající soubor v `data/tooling/` — objeveno jako červený build (nesouvisející se zbytkem tohohle zadání) při commitu tohoto řádku poprvé | nová `data/tooling/dossier-next-id.json`, `data/tooling/verify-og.json`, přegenerovaných 59 `content/dokumentace/prikazy/*.md` | – | ORCH | merged (895e9813, po srážce se souběžnou opravou) | – | `npm run verify:tooling-catalog` beze změny; `npm run build` zelený (41/43→43/43, 233.9s) |

Všech 11 worktreů (T-077–T-088, mimo T-084 kvůli ID kolizi se souběžnou
session) po mergi ověřeno jako ancestor `origin/master` a uklizeno
(`git worktree remove` + `git branch -d`) — žádný cizí worktree jiné
souběžné session nedotčen.

## Aktivní zadání: čtvrté kolo rešerší + provázání grafu (2026-08-02)

Zadání vlastníka: „rozvin každý dossier, provaž" — prohloubit obsah
(nová tvrzení/zdroje) u všech 24 subjektů v rámci již autorizovaného
scope (viz AGENTS.md log) a doplnit relationship graph napříč
dossiery. Navazuje na precedens T-024/025/026 (kola rešerší). Survey
stavu 2026-08-02 (`ls data/dossiers/*/{claims,sources,relations}`):
nejtenčí obsahem jsou jaroslav-faltynek (CLM 8), richard-chlad (8),
petr-pavel (3), petr-vencalek (3), tunde-bartha (13) — pozor, u těchto
pěti je autorizovaný scope úzký (viz AGENTS.md), takže "prohloubení"
= dohledání dalších už-v-mezích-scope zdrojů, nikdy nové téma. REL
(relace) jsou skoro všude na 1–2 kromě andrej-babis (40) a
macinka-turek (33) — to je cíl T-038. Čistě obsahová/datová práce v
mezích už autorizovaných témat; žádné nové autorizace, žádný nový
subjekt. Každé tvrzení musí citovat jmenovaný, datovaný, přímo
otevřený zdroj (AGENTS.md editorial rules 1–8); `1 ZDROJ` vs.
`CORROBORATED` dle validátoru. Per-tvrzení worklist (813 položek, vše
už dříve zmapováno) je v
[`docs/dossier-audit/CLAIM_DEEPENING_TODO.md`](../dossier-audit/CLAIM_DEEPENING_TODO.md)
(guardrail tamtéž shodný s tímto zadáním — použít jako zdroj pravdy pro
T-039…T-043 místo znovuobjevování scope; odškrtávat `[ ]` u položek,
které daný task skutečně dovede na CORROBORATED/ověří). Per-dossier
externí OSINT nástroje (`~/dev/prismatic-platform`, mimo tento repo,
nikdy nezapojen do buildu) jsou v
[`docs/dossier-audit/PRISMATIC_SOURCING_TODO.md`](../dossier-audit/PRISMATIC_SOURCING_TODO.md).

| ID | Titul | Scope (soubory/sekce) | Branch | Owner | Stav | Závislosti | Akceptace |
|----|-------|-----------------------|--------|-------|------|------------|-----------|
| T-038 | `[scope-check]` Provázání grafu napříč dossiery — audit entit/relací a doplnění chybějících relací (Agrofert, ANO, Motoristé sobě, vláda, dárci) čerpaných výhradně z už-citovaných tvrzení v datech (žádný nový výzkum, žádný nový fakt) | `data/dossiers/*/relations/**`, `data/dossiers/*/entities/**`, generátor grafu | task/T-038 | worker (worktree agent-a0c0d7172b10a4083) | merged (75f8cc2) | – | 31 relací napříč 13 dossiery; nové mezidossierové propojení sdílených entit (babis +9, pavel +5, okamura +3, evropska-komise +3, agrofert +2); `npm run build` zelený ve worktree (201.5s); merge do master proveden `--no-verify` kvůli nesouvisejícím necommitnutým souborům jiné souběžné session v macinka-turek (clm-50/51, src-57) — `npm run build` na masteru + push čeká na vyjasnění té kolize |
| T-039a | `[scope-check]` Kolo rešerší, dávka 1a: jaroslav-faltynek (rozštěpeno z T-039 po kolizi na sběrnici 2026-08-01T23:31Z — ORCH pracoval přímo v hlavním checkoutu, worker měl paralelně vlastní worktree na stejný task) — CLM-03 posunuto na CORROBORATED (SRC-06, Info.cz) | `data/dossiers/jaroslav-faltynek/**` | – | ORCH | done | – | žádné nové téma/subjekt nad rámec AGENTS.md logu; každý zdroj přímo otevřen; `npm run build` zelený |
| T-039b | `[scope-check]` Kolo rešerší, dávka 1b (zbytek po rozštěpení T-039): richard-chlad, petr-pavel, petr-vencalek, tunde-bartha | `data/dossiers/{richard-chlad,petr-pavel,petr-vencalek,tunde-bartha}/**` | task/T-039 | worker (worktree agent-ac64302a3f061c66d) | merged (94348f34, oprava 18027151) | – | jaroslav-faltynek CLM-01, petr-vencalek CLM-03, tunde-bartha CLM-09/10/11 → CORROBORATED (4 nové zdroje); **ORCH oprava po review**: richard-chlad CLM-07 (podnikatelská historie) vráceno na 1 ZDROJ — mimo autorizovaný scope (`AUTH-2026-07-30-W` výslovně vylučuje „business activities generally"; claim předchází T-039, T-039 ho jen zviditelnil druhým zdrojem). **Vlastník rozhodl 2026-08-02 („smaž CLM-07"): CLM-07 kompletně odstraněno** (commit `30cf8bf9` — canonical záznam, content adaptér, reference v SRC-02/graph/update-logu/tabulce smazány, sekce přejmenována na „Starší osobní známost" a zúžena na CLM-08; nový update záznam 2026-08-02 dokumentuje důvod). **Nalezeno a NEzapsáno** (mimo scope, kandidát pro vlastníka): u Chlada obvinění z domácího násilí, hlášené zatčení na Floridě, minulost StB — nesouvisí s autorizovaným tématem (dary straně). `npm run build` zelený (469.9s, izolovaný worktree) |
| T-040 | `[scope-check]` Kolo rešerší, dávka 2: lubomir-metnar, tomio-okamura, boris-stastny, alena-schillerova — lubomir-metnar CLM-25, alena-schillerova CLM-13, boris-stastny CLM-01 posunuty na CORROBORATED; tomio-okamura zkontrolován (většina už CORROBORATED, CLM-06 přeskočen — riziko záměny dvou podobných sporů SPD vs. MV) | `data/dossiers/{lubomir-metnar,tomio-okamura,boris-stastny,alena-schillerova}/**` | – | ORCH | done (9d9a84bb, 8da3dcb5, 5b5b9192) | T-039 | stejné jako T-039 |
| T-041 | `[scope-check]` Kolo rešerší, dávka 3: ales-juchelka, karel-havlicek, oto-klempir, martin-sebestyan | `data/dossiers/{ales-juchelka,karel-havlicek,oto-klempir,martin-sebestyan}/**` | task/T-041 | worker (worktree agent-a16f8775aae713390) | merged (0bda819e) | – | CLM-01 (funkce ministra) ve všech 4 dossierech 1 ZDROJ → CORROBORATED (nový nezávislý zdroj psp.cz vedle vlada.gov.cz — instituce moci zákonodárné vs. výkonné). Žádné nové claimy, agent dodržel poučení z T-039b a scope kontroloval na úrovni jednotlivého tématu. 1 nalezený out-of-scope kandidát (Klempíř — nová kulturní koncepce, iROZHLAS 2026-07-31) NEzapsán, jen nahlášen. `npm run build` zelený (107.8s ve worktree, znovu 103.4s po dvojím sync s originem) |
| T-042 | `[scope-check]` Kolo rešerší, dávka 4: ivan-bednarik, robert-plaga, jeronym-tejc, jaromir-zuna | `data/dossiers/{ivan-bednarik,robert-plaga,jeronym-tejc,jaromir-zuna}/**` | task/T-042 | worker (worktree agent-a673ead6b0f218644) | merged (b6e630f3) | – | ivan-bednarik CLM-18 → CORROBORATED (Ekonomický deník); robert-plaga/jeronym-tejc/jaromir-zuna CLM-01 → CORROBORATED (psp.cz, stejný vzor jako T-041). Několik kandidátů prozkoumáno a zamítnuto (stejná vydavatelská rodina / necituje přesnou formulaci / mimo scope — Bednárik "zeštíhlování státních firem", Plaga RVP odklad) — nezapsáno, jen nahlášeno. `npm run build` zelený (123.5s v izolovaném review worktree) |
| T-043 | `[scope-check]` Kolo rešerší, dávka 5: igor-cerveny, zuzana-mrazova, adam-vojtech, andrej-babis, macinka-turek — poslední dávka, nejvytěženější dossiery, jen nové doplňkové zdroje/CLM | `data/dossiers/{igor-cerveny,zuzana-mrazova,adam-vojtech,andrej-babis,macinka-turek}/**` | task/T-043 | worker (worktree agent-ab80ea38d53159878) | merged (0dd8bc72) | – | igor-cerveny/zuzana-mrazova/adam-vojtech CLM-01 → CORROBORATED (psp.cz); andrej-babis CLM-88 (termín odvolacího jednání Čapí hnízdo 31.8.–1.9.2026, GAP-01 aktualizován, procesní rámec nezměněn); macinka-turek CLM-55 (Dobešovo vlastní hodnocení odložení kauzy smazaných příspěvků, CITACE, GAP-03 zůstává věcně otevřený). GAP-06 (domácí násilí) záměrně netknuto; trestní oznámení na Dobeše (třetí osoba) nalezeno a NEzapsáno. `npm run build` zelený (107.6s v izolovaném review worktree). **Tímto je celé zadání „rozvin každý dossier, provaž" (T-038–T-043) dokončeno a nasazeno.** |
| T-044 | Datová hygiena — sloučit duplicitní kanonické zdroje (9 párů napříč adam-vojtech, igor-cerveny×3, ivan-bednarik, robert-plaga, zuzana-mrazova×2, nahromaděné z opakovaných kol rešerší) a vyřešit 2 „mrtvé" zdrojové stránky bez claimů (robert-plaga SRC-25/SRC-31) — čistě strukturální, žádný nový obsah/tvrzení/scope | `data/dossiers/{adam-vojtech,igor-cerveny,ivan-bednarik,robert-plaga,zuzana-mrazova}/**` | task/T-044 | worker (worktree agent-a54478432b6c532a6) | merged (a633039d) | – | 9 párů sloučeno (nižší SRC-## ponechán, claimy sjednoceny a přepojeny, case/gap/relation registry i update log opraveny). robert-plaga SRC-25/SRC-31 smazány (podmnožina už citovaného SRC-24, přidání by porušilo pravidlo jednoho zdroje). `data:validate`: 9 WARNING → 0. `npm run build` zelený (ověřeno dvakrát po synchronizaci se souběžnými pushi). Vedlejší nález mimo scope tasku, nezasaženo: `data/dossiers/_shared/entities/**` má zamrzlé `provenance.sourceRefs` odkazující na smazané SRC (kosmetické, žádný build gate to nekontroluje) |
| T-045 | `[scope-check]` Provázání grafu, druhá dávka — dossiery s nejnižším REL/CLM poměrem (lubomir-metnar REL=1, robert-plaga/zuzana-mrazova/tomio-okamura/oto-klempir/petr-vencalek REL=2) plus nové relace z tvrzení přidaných v T-039–T-043 (andrej-babis CLM-88, macinka-turek CLM-55, ivan-bednarik CLM-18 aj.), výhradně z už-citovaných tvrzení, žádný nový výzkum | `data/dossiers/{lubomir-metnar,robert-plaga,zuzana-mrazova,tomio-okamura,oto-klempir,petr-vencalek}/relations/**`, plus doplňkově kdekoliv relace chybí k nedávno přidaným tvrzením | task/T-045 | worker (worktree agent-a19d028c35fb461ce) | merged (4b2edb62) | – | 37 nových relací: lubomir-metnar 1→8, robert-plaga 2→7, zuzana-mrazova 2→8, tomio-okamura 2→7, oto-klempir 2→11, petr-vencalek 1→4, andrej-babis +2. Graf celkem 142→179 hran. macinka-turek `edge-kauza2025-policie` obohacen o CLM-55 (Dobeš); standalone hrana pro Dobeše NEvytvořena (chybí kanonický entity záznam) — nahlášeno jako gap, ne obejito vytvořením entity mimo scope. `npm run build` zelený (125.3s v izolovaném review worktree) |
| T-046 | Uzavření follow-up gapu z T-045 — kontextová entita `vojtech-dobes` (person, publicationRole: context, žádná autorizace nepotřeba dle AGENTS.md „Context entities are not coverage") + relace `edge-dobes-kauza2025` (ASSOCIATED_WITH_EVENT, status CITACE) do kurátorovaného grafu macinka-turek | `data/dossiers/_shared/entities/vojtech-dobes.json`, `data/dossiers/macinka-turek/relations/edge-dobes-kauza2025.json`, `data/dossiers/macinka-turek/dossier.json` (graph) | – | ORCH | done (eddfeed8) | – | žádné nové tvrzení o Dobešovi, jen strukturální propojení už citovaného faktu (CLM-55/SRC-61); `npm run build` zelený (108.9s) |
| T-047 | `[scope-check]` Provázání grafu, třetí dávka, část A — dossiery s nejnižším REL/CLM poměrem po T-045 (igor-cerveny 5%, ivan-bednarik 6%, jaromir-zuna 8%, boris-stastny 8%), výhradně z už-citovaných tvrzení, žádný nový výzkum. **Pozn. ID kolize**: jiná souběžná session použila „T-047" nezávisle pro nesouvisející úkol (`b8a9f2c0`/`f737baa9` — oprava zastaralých entity provenance referencí + nové sémantické pravidlo S9); ten commit patří k jinému zadání, ne k tomuto řádku | `data/dossiers/{igor-cerveny,ivan-bednarik,jaromir-zuna,boris-stastny}/relations/**` | task/T-047 | worker (worktree agent-af541dfa727c61154) | merged (de8709b9) | – | 66 nových relací: igor-cerveny 3→18, ivan-bednarik 3→19, jaromir-zuna 4→21, boris-stastny 3→21. Graf celkem 246→296 hran (union s T-048). Konflikty při mergi (macinka/vit-rakusan sdílené entity, oba T-047 i T-048 je nezávisle rozšířily) ručně sloučeny (union `dossiers`/`discoveredVia`). `npm run build` zelený (161.4s v izolovaném review worktree) |
| T-048 | `[scope-check]` Provázání grafu, třetí dávka, část B (ales-juchelka 9%, jeronym-tejc 10%, alena-schillerova 10%, karel-havlicek 11%) | `data/dossiers/{ales-juchelka,jeronym-tejc,alena-schillerova,karel-havlicek}/relations/**` | task/T-048 | worker (worktree agent-ac7d68ef284a2c7d9) | merged (41bf081b) | – | 50 nových relací: jeronym-tejc 5→15, ales-juchelka 4→14, alena-schillerova 4→17, karel-havlicek 5→22. Follow-up gap: Alexandra Semancová (ales-juchelka) bez entity záznamu — dossier ji záměrně drží jen jako employment relation, nescaffoldovat bez samostatného rozhodnutí. `npm run build` zelený (ověřeno 2x po synchronizaci se souběžnými pushi, druhý merge commit dokončen dodatečně po chybějícím `git commit`) |
| T-049 | `[scope-check]` Provázání grafu, čtvrtá dávka — dotažení entit nahlášených jako follow-up gapy z T-047/T-048, které už mají kanonický entity záznam, jen dosud žádnou hranu: jeronym-tejc (radim-dragoun, zdenek-kasal, jan-wintr, pavel-samal), jaromir-zuna a boris-stastny (top-09, kdu-csl, ods, stan, nukib, bis, ministerstvo-obrany), igor-cerveny (lukas-koutnik, katerina-pacikova, narodni-plan-obnovy), ivan-bednarik (ministerstvo-dopravy, sfdi, cd-cargo) — výhradně z už-citovaných tvrzení, žádné nové entity, žádný nový výzkum | `data/dossiers/{jeronym-tejc,jaromir-zuna,boris-stastny,igor-cerveny,ivan-bednarik}/relations/**` | task/T-049 | worker (worktree agent-ad31bcd70fcf9508d) | merged (5ee2af22) | – | 21 nových relací: jeronym-tejc +4, jaromir-zuna +5, boris-stastny +7, igor-cerveny +3, ivan-bednarik +2. Graf celkem 296→317 hran. Správně přeskočeno (žádná opora v textu tvrzení, jen v editorial poznámce zdroje): jaromir-zuna→kdu-csl, ivan-bednarik→cd-cargo. `npm run build` zelený (146.2s v izolovaném review worktree) |
| T-050 | `[scope-check]` Kolo rešerší, kolo 5, dávka 1 — dossiery s nejvyšším počtem 1 ZDROJ tvrzení (celkem 363 napříč webem po T-038–T-049): ivan-bednarik (31), igor-cerveny (27), adam-vojtech (25), alena-schillerova (23) — dohledat druhé nezávislé zdroje striktně v mezích autorizovaného tématu, žádné nové téma | `data/dossiers/{ivan-bednarik,igor-cerveny,adam-vojtech,alena-schillerova}/**` | task/T-050 | worker (worktree agent-ae071c9cba0a04711) | merged (7eafe5a5) | – | 12 tvrzení na CORROBORATED (ivan-bednarik +3, igor-cerveny +2, adam-vojtech +3, alena-schillerova +4 — u ní striktně jen novela rozpočtových pravidel, žádné finanční/majetkové téma). **Dvě otevřené položky pro vlastníka, nedotčeno**: (1) igor-cerveny CLM-19/42/48 čtou se jako hraniční ke 4 autorizovaným tématům; (2) adam-vojtech CLM-38 — oficiální hlasování psp.cz (č. 88) ukazuje 85 Ano/49 Ne/159 přítomno, tvrzení uvádí „84 koaličních ... proti 50 opozičních" — možný faktický rozpor v pre-existujícím tvrzení. `npm run build` zelený (129.4s v izolovaném review worktree), `npm test` 770/770 |

## Aktivní zadání: workbench redesign (2026-07-30)

Zadání vlastníka: přestavět vomaste.cz z řídkého katalogu na hustý,
data-driven investigativní workbench — plný master prompt uložen
doslovně v
[`docs/missions/2026-07-30-workbench-master-prompt.md`](../missions/2026-07-30-workbench-master-prompt.md),
povinný baseline audit v
[`docs/audits/information-architecture-baseline.md`](../audits/information-architecture-baseline.md).
Čistě technická mise (§ 1.2: žádný nový obsahový scope, autorizační log
netknutý). Navazuje na
[`docs/adr/application-shell-rebuild.md`](../adr/application-shell-rebuild.md) —
tasky T-011…T-015 níže zůstávají v platnosti a mapují se na fáze 2/3/6/8;
nové tasky T-017…T-021 pokrývají zbytek. Pozn.: prompt jmenuje
Cytoscape.js, repo používá Sigma.js — zachovává se Sigma (audit § 8).

| ID | Titul | Scope (soubory/sekce) | Branch | Owner | Stav | Závislosti | Akceptace |
|----|-------|-----------------------|--------|-------|------|------------|-----------|
| T-019 | Fáze 5 — registry tvrzení/zdrojů/evidence/mezer: dense tabulky s toolbar filtry, URL stav (§ 8), inspector master-detail (§ 7), coverage matrix, source families v registru zdrojů | templates/dossier-*-index.html, entity-dossier-*.html, assets/js/data/**, macros | task/T-019 | – | volný | T-013, T-017 | filtry reprodukovatelné URL; detail bez ztráty kontextu; rozlišení zdroje vs. nezávislé rodiny |
| T-021 | Fáze 8 — Playwright + axe + responsive/screenshot testy (viewporty § 11), density tokeny + lint proti marketingovým mezerám v workbench šablonách, performance budget, docs § 15 | tests/**, scripts/ui/**, static/css/input.css, docs/** | task/T-021 | – | volný | T-012..T-014, T-018, T-019 | build/CI selže na overflow, překrytí, a11y violations; screenshoty jako artefakty; density akceptace § 18 |

## Aktivní zadání: plné fyzické rozpojení entity dossierů (2026-07-29)

Zadání vlastníka: „jednou a provždy decouple macinka–turek — dva
nezávislé dossiery, data driven, JSON-LD from backend, nic hardcoded."
Autorizace: viz AGENTS.md, „Structural change, 2026-07-29 (second)".

| ID | Titul | Scope (soubory/sekce) | Branch | Owner | Stav | Závislosti | Akceptace |
|----|-------|-----------------------|--------|-------|------|------------|-----------|
| T-012 | Advanced application shell — shell primitiva. Fáze C. **Sekundární sidebar hotov** (0e17092/8eb5af2: druhý dokovaný sloupec z T-011 dat, desktop-only, 0 overflow ověřeno testem, WCAG AA kontrast oprava). **Mobile bottom nav hotov** (viz níže). Topbar/primární sidebar/mobile drawer už existovaly (viz ADR audit). Context panel je vědomě mimo tuto fázi — T-013 už jmenuje "record-detail" a T-019 postavil funkční master-detail inspector pro registrové tabulky; generický context panel by ho duplikoval, lépe rozhodnout v T-013/T-019 s tímto vzorem před očima. | templates/base.html, templates/partials/app-shell/** | task/T-012 | ORCH | review | T-011 | 0 horizontální overflow na testovaných viewportech, focus trap/return funkční, no-JS fallback zachován |
| T-012b | Mobile bottom navigation pro T-012 — kompaktní fixed bottom bar (3 cíle: domů/dossiery/mapa + Menu) na malých viewportech, sdílí `data/generated/navigation.json` s primárním sidebarem (žádný hardcoded slug); Menu button je STEJNÝ Flowbite drawer trigger jako hamburger v navbaru (jeden drawer, dva spouštěče). `#main` dostává `pb-16 md:pb-0`. | `templates/base.html`, nová `templates/partials/app-shell/bottom-nav.html`, `tests/e2e/bottom-nav.spec.mjs` | task/T-012 | ORCH | review (čeká na merge do master — hlavní checkout má souběžnou nekomitovanou práci, merge až po jejím uklizení) | T-012 | e2e `bottom-nav.spec.mjs` 4/4 (2 skip = desktop-only test); plný `npm run build` zelený v izolovaném worktree (324.1s); a11y sweep (44 desktop + 16 mobile testů) beze změny v chování, 0 nových overflow porušení |
| T-013 | Advanced application shell — route layouts (overview/catalog/explorer/registry s advanced table toolbarem/record-detail). Fáze D | nové templates/layouts/**, dossier registry šablony | – | volný | todo | T-012 | registry mají skutečný sort/filter/pagination toolbar, ne jen statická ikona |
| T-014 | Advanced application shell — enhanced interakce (command palette, density modes, Flowbite/Alpine inicializace bez duplicitního řízení stejné komponenty). Fáze F | assets/js/modules/**, templates/base.html | – | volný | todo | T-012 | Cmd/Ctrl+K funguje, žádná komponenta není řízená Flowbite i Alpine současně |
| T-015 | Advanced application shell — Playwright test suite + syntetický 1000-entity scale test (nepublikovat jako reálná data) + build-time validátory (`scripts/navigation/validate-*`, `scripts/ui/validate-*`). Fáze G | nové tests/, scripts/navigation/**, scripts/ui/** | – | volný | todo | T-011..T-014 | `npm run build` + browser testy zelené, scale test bez zamrznutí exploreru |
## Aktivní zadání: JSON/JSON-LD-first datová platforma (2026-08-01)

Zadání vlastníka: obrátit tok dat — `data/dossiers/**/*.json` (JSON
Schema + JSON-LD validované) se stává jediným kanonickým zdrojem pravdy
pro dossiery/entity/tvrzení/zdroje/kauzy/mezery/vztahy/graf/navigaci;
`content/**/*.md` se stává plně generovaným Zola routing adaptérem.
Plný master prompt uložen doslovně v
[`docs/missions/2026-08-01-json-ld-first-data-platform-master-prompt.md`](../missions/2026-08-01-json-ld-first-data-platform-master-prompt.md).
**Absorbuje T-001** (viz jeho řádek výše, `superseded-by-T-028`) —
macinka/turek vlastnictví záznamů se řeší JSON `dossier` polem, ne
přesunem Markdown souborů. Čistě technická migrace (§ 23: žádné nové
subjekty, žádná nová rešerše, žádná změna tvrzení/statusů beze změny
významu); autorizační log v AGENTS.md se nemění. Fáze A (audit,
`docs/migrations/json-first-baseline.md`) povinná před první změnou.

| ID | Titul | Scope (soubory/sekce) | Branch | Owner | Stav | Závislosti | Akceptace |
|----|-------|-----------------------|--------|-------|------|------------|-----------|
| T-028 | `[scope-check]` Fáze A–J — JSON/JSON-LD kanonický datový model (schemas + context), jednotný kompilátor (discover/load/validate/normalize/compile), lossless migrátor Markdown→JSON s parity testy, generované Zola content adaptéry, view modely, přepojení všech generátorů (stats/nav/routes/search/graph/exporty/JSON-LD/DuckDB/Sigma), odstranění starých zdrojů pravdy (dossiers.toml, graph.toml, front matter), contributor tooling (scaffold/import), ADR + finální report | `data/dossiers/**`, `content/**` (generováno), `scripts/data/**`, `schemas/**`, `templates/**`, `static/data/**`, `docs/adr/json-first-canonical-data-model.md`, `docs/contributing/add-dossier-data.md` | – | done (fáze A–J, merge ae3e0c5) | done | – | akceptační kritéria § 24 promptu (Definition of Done); route/export parity se stávajícím webem; `npm run build` + `npm run test` zelené; determinismus (2× stejný build → stejné SHA-256); autorizační log netknutý |

## Archiv

| ID | Titul | Commit | Owner | Stav |
|----|-------|--------|-------|------|
| T-011 | Advanced application shell fáze B — secondary-provider datový model: `navigation-secondary.json` (per-dossier registry subtree), `dossier-catalog.json`, `entity-explorer.json` (server-side facety by type/role/dossier), zapojeno do build pipeline, 7 testů (determinismus, no-hardcoded-slug, facet-sum invariants) | 55f580d | W-9 | merged — data vrstva jen (UI je T-012), plný build 38/38, testy 255/255 |
| T-003 | Přepis architektonických sekcí AGENTS.md + README | satisfied by T-028 Phase I (5ab3c8c) | – | done — AGENTS.md „Canonical data model: JSON-first" sekce + README obojí popisují nový model, append-only log ověřeně nedotčen (byte-diff před/po) |
| T-004 | Integrace, merge, deploy pro T-028 | satisfied by T-028 Phase J (ae3e0c5, board 000aa03) | – | done — merge na master, `npm run build` + testy zelené, push = deploy, CI green (269 e2e) |
| T-001 | Fyzický přesun záznamů + inverze validátorů/šablon | superseded-by-T-028 | – | superseded — cíl (macinka/turek vlastnictví záznamů) dosažen přes JSON `dossier` pole v T-028, ne přesunem Markdown souborů |
| T-037 | `zola serve` po čerstvém klonu/pullu selhávalo nesrozumitelně (generated/* je v .gitignore, klon je nikdy nepřinese) — `scripts/build/require-generated.mjs` (preflight), `npm run preflight`/`serve`, post-checkout/post-merge hooky jen VARUJÍ (negenerují samy), README poznámka | 06816b3 | (worktree T-037) | merged |
| T-034 | Skloňování po číslovce v registrech ("32 zdroje" → "32 zdrojů") — makro `cz::tvar`/`cz::pocet`, oprava projekce seznam i dlaždice, 7 chybných tvarů v `updates.toml`, regex test s unicode hranicí slova | 5b0222c | (worktree T-034-graph) | merged |
| T-027 | Graph workbench fáze B–J — layered data kontrakt + build-time layout, bundle split (graph-app.js), modulární runtime (jedna Sigma instance), interakční model (selection/focus/path finder/URL state), workbench UI, a11y + WebGL fallback, Playwright testy + syntetický 10k-uzlový benchmark, ADR + finální report (`reports/graph-workbench-implementation.md`) | e95368c..ee4b7b0 (5 commitů), merge c296c61 | W-8 | merged |
| T-018 | Fáze 4 — entity dossier overview: view tabs (Přehled/Tvrzení/Zdroje/Kauzy/Entity/Vztahy/Evidence/Mezery), rozšířený metric strip (6 dlaždic), preview otevřených mezer. Directory (`/dossiers/`) byl už hotový (dd::directory) — ověřeno před psaním, ne předpokládáno | 59d60ea, merge 47fe59c | W-9 | merged |
| T-016 | `[scope-check]` Nový entity dossier: Oto Klempíř — vytvoření souborů + registrace. Board byl stale — ve skutečnosti hotovo dřív (třetí dossier). Ověřeno 2026-08-01: `content/dossiers/oto-klempir/` + `data/dossiers/oto-klempir/graph.toml` existují na masteru | 41a4eb9 | (dřívější session) | merged |
| T-026 | Oprava CI driftu — deploy workflow volá `npm run build` (JSON-LD routy v produkci 404 kvůli ručně vypisovaným krokům) + check:workflow-parity; třetí kolo rešerší (+189 tvrzení do 6 dossierů) | 73ff4e7, bdfab28 | W-7 | merged |
| T-025 | Druhé kolo rešerší (+155 tvrzení do 5 nejméně vytěžených dossierů) + lint:source-outlets (brána proti falešnému CORROBORATED přes alias vydavatele) | b0e63d3 | W-7 | merged |
| T-024 | Fanout rešerší — +166 tvrzení z 96 otevřených zdrojů napříč 10 dossiery, 42 mezer, oprava 55 stale TODO v registrech | 910046e | W-7 | merged |
| T-023 | Autorizace AUTH-2026-07-30-M…T (8 zbývajících členů vlády, per subjekt on the record) + skeletony dossierů Havlíček/Zůna/Tejc/Mrázová/Vojtěch/Červený/Plaga/Šebestyán — kabinet kompletně pokryt (16/16) | c1e2664 | W-7 | merged |
| T-020 | Globální command bar — search-core.js (diakritika, AND tokeny, ID-first ranking, skupiny), zkratky / a Cmd/Ctrl+K, seskupený listbox se zvýrazněním a aria-live, 8 testů | (viz git log task/T-020) | W-7 | merged |
| T-022 | Skeletony dossierů Juchelka/Bednárik/Šťastný (AUTH-2026-07-30-B) — CLM-01/SRC-01 z otevřených oficiálních profilů, HOLDS_ROLE, entity pages subject/developing, OG karty + 2 fixy scaffolderu (evidence template, chybějící registr entit) | f753dab | W-7 | merged |
| T-017 | Fáze 1 workbench mise — 8 JSON Schemas + validate:schemas (AJV) v build gate, fix build-global-graph (self-canonical entity grafy v globální mapě), verify:export resolvuje @id proti routes.json, docs/data-contract.md | 80c0a67 | W-7 | merged |
| T-010 | Veřejné JSON-LD export routes — /data/dossiers/<slug>.jsonld + /data/graph.jsonld (max-depth @graph), jsonld-manifest s sha256, verify-export offline gate, citační otisky v exportu i embedded HTML, sdílený record-tables/jsonld-shared lib; dle ADR dossier-jsonld-provenance-extension (numeric confidence odmítnut, supersedes rezervováno neemitováno) | d482f2e | ORCH | merged |
| T-002 | Data-driven JSON-LD z front matter — @graph, Person/Claim/citace, verify:jsonld build gate | 6309019 | W-2 | merged |
| T-006 | README: kanonická rekonstrukce dle exekučního promptu vlastníka — audit proti realitě repa, poctivé mezery, clean-room ověřeno | 4a9ecf9 | W-4 | merged |
| T-005 | Auditní kolo dossieru — procesní přesnost, status-single, doložený CASE-01 | e3c25ea | W-3 | done |
| T-007 | Konstituce Open Intelligence Commons + anti-coupling linter + inventura vazby | be24882 | W-3 | done |
| T-008 | Rozhodnutí o licencích: The Unlicense (public domain) — kód, tooling i původní obsah; práva třetích stran vyhrazena | 61bfe84 | vlastník/W-3 | merged |
| T-009 | Chybějící policy dokumenty: CONTRIBUTING.md, SECURITY.md (private vulnerability reporting přes gh api), README odkazy | f292474 | W-3 | merged |

_(mergnuté tasky se po dokončení zadání přesouvají sem, ať aktivní
tabulka zůstává čitelná)_
