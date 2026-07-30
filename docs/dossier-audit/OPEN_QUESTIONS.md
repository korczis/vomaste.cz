# Otevřené otázky & backlog

Interní kontrolní dokument — redakční a inženýrské položky s prioritou.
Veřejné otevřené otázky žijí v registru mezer (GAP-01…06); tento soubor
sleduje interní práci nad jejich rámec.

**Aktualizace 2026-07-30** (první verze 2026-07-29): položky vyřešené
mezitím přesunuty dolů do „Vyřešeno“, ať je vidět skutečná fronta.

## Redakční (obsah) — otevřené

1. **[P1] GAP-06 — výsledek stížnosti** proti odložení z 5/2026.
   Snippet vyhledávače 2× tvrdil zamítnutí, žádný inspekcí ověřitelný
   článek to nepotvrdil — správně mimo dossier. **První kontrola každého
   dalšího rešeršního kola.** *(Re-check 2026-07-30: snippet totéž tvrdí
   potřetí, dohledané články jsou stále jen květnové/červencové texty o
   odložení — o stížnosti nic. Beze změny.)*
2. **[P1] Rozdělení složených tvrzení** — CLM-03 (4 biografická fakta),
   CLM-18 (vzdání imunity + dechová zkouška + zranění řidiče). Provést
   při/po migraci T-001, nová ID, nikdy recyklace.
3. **[P2] Vychytova diferencovaná argumentace** k výrokům (Deník N
   2139584, 28. 7. 2026: část výroků amorální-ale-legální, část trestná-
   ale-promlčená; titulek „K tomu skutku došlo“). Jediný, částečně
   paywallovaný zdroj — doplnit až po plné inspekci nebo s druhým zdrojem.
   *(Ověřeno 2026-07-30: druhý zdroj neexistuje — Echo24 HBtn6 i
   ČeskéNoviny 2855833 (obojí 28. 7., přebírají iROZHLAS/ČTK) nesou jen
   Vychytovu citaci k pomluvě „skutek není trestným činem" +
   nepravomocnost, diferenciaci výroků ne. Blokováno na plnou inspekci
   Deníku N — vyžaduje předplatné, tj. akci vlastníka.)*
4. **[P2] CLM-20/22 „je/byl“** — rozlišit současné vs. bývalé angažmá po
   firmách proti ARES (základ v GAP-04 existuje).
5. **[P2] CLM-12 kaveát nezávislosti** — ČT24 + iROZHLAS relay „dle
   zdrojů“; dvě redakce, možná jeden zdrojový řetěz.
6. **[P2] Jednorodinné hrany grafu** (5× WARN ve validate-graph) — druhá
   rodina na hranu, nebo grafová obdoba stavu „1 ZDROJ“. Rozhodnout při
   de-specializaci.

## Inženýrské — otevřené

7. **[P2]** `published_state = "living-page"` pro src-23..27, 40, 41 +
   validátor (po T-001 — soubory se stěhují).
8. **[P2]** kontrolovaný slovník `src_type` + kontrola ve validátoru
   (Blesk i Deník N dnes typované dvojím způsobem). Po T-001.
9. **[P2]** `role = "context"` pro záměrně bez-tvrzeních zdroje
   (src-03, 05, 09, 10). Po T-001.
10. **[P3]** URL hygiena: kanonické URL pro src-14/19/52; `?lp=1` u
    src-48; asymetrie `?aktualnost=` mezi src-23/24. Po T-001.
11. **[P2] Po T-001**: zapnout `lint:historical-coupling` do build gate
    (allowlist prázdný/odůvodněný) a otevřít T-010 (JSON-LD exportní
    routy + manifest datasetu).

## Governance

12. ~~Pokrytí finanční/majetkové vrstvy v autorizačním logu~~ →
    **VYŘEŠENO 2026-07-30**: vlastník autorizoval on the record
    („autorizuji finanční vrstvu, doplň záznam do logu"); zapsáno jako
    „Rozšíření rozsahu, 2026-07-30" v AGENTS.md + AUTH-2026-07-30-A
    v data/authorizations.toml, referencováno všemi třemi dossiery.
    Záznam potvrzuje i výklad, že vlákno ministerské nominace spadá pod
    autorizaci politické kariéry z 2026-07-21. Žádná blokovaná položka
    nezbývá.

## Vyřešeno (od 2026-07-29)

- ~~Licence repozitáře~~ → **The Unlicense** (61bfe84), vč. patičky webu
  a vymezení práv třetích stran.
- ~~CONTRIBUTING/SECURITY/policy trať~~ → T-009 (f292474) + issue
  formuláře a PR šablona; private vulnerability reporting zapnut;
  governance dokumenty renderované přímo na webu (2a9408d).
- ~~Kanál oprav corrections@vomaste.cz~~ → doména nemá MX; sjednoceno na
  veřejné GitHub issues (47fcfd1 + follow-upy).
- ~~Chybějící sociální/SEO/ikonová sada~~ → og-image 1200×630 + čtverec,
  twitter:image, ikony, manifest, 404, security.txt, keywords/author/
  modified_time.
- ~~Doména~~ → vomaste.cz živé na HTTPS (Route 53 + Pages cert +
  enforce), github.io přesměrovává.
