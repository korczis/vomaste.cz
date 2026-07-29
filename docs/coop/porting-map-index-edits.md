# Porting mapa: rozpracované edity `content/dossiers/macinka-turek/_index.md`

V hlavním checkoutu leží necommitnuté redakční úpravy (80+/56−), které
nejsou součástí decouplingu a **záměrně zůstaly nedotčené**. Plný diff je
zálohován v `.git/coop-bus/pending-index-edits.patch`. Po mergnutí T-001
se `_index.md` rozpadne do dvou entity souborů — tyto úpravy je potřeba
ručně přenést tam. Rozpad podle `subjects`:

| Úprava | Cíl po splitu | Stav / co chybí |
|---|---|---|
| Nový status `status-single` („1 zdroj") — legenda + filtr + přeznačení řady CLM z `status-corroborated` | oba dossiery + šablony + validátor | **Nedokončená „tři místa" změna**: chybí podpora v šabloně stavů, ve validátoru (`status-single` není povolený stav) a regenerace detail stránek (`migrate-claims-to-pages.mjs`) |
| Nové tvrzení **CLM-45** (odkazované z case „Fotografie a sbírka svícnů" a z nové timeline položky 11/2024 o odložení případu pro promlčení) | filip-turek | **Chybí samotný řádek CLM-45 v tabulce a jeho zdroj (SRC)** — bez doplnění autorem nelze dokončit; bez toho build červený |
| CASE-01 label „Uzavřeno bez trestu" → „Fotografie: odloženo pro promlčení" | filip-turek | Po přenosu přegenerovat case detail (`migrate-cases-to-pages.mjs`) |
| CASE-03 period „2025" → „2025–2026"; CASE-04 period „2026" → „červenec 2026", summary „vozidlem záchranné služby" → „zdravotnickým vozem" | filip-turek | dtto |
| Timeline: nová položka 11/2024 (odložení případu fotografie — procesní krok); přesun položky nehody na „červenec 2026"; zpřesnění procesních formulací u položek 5/2026 a 28. 7. 2026 („procesní krok, ne rozhodnutí o vině/posouzení pravosti") | filip-turek | Čistě přenositelné; formulace odpovídají editorskému pravidlu 3 |
| Klíčoví aktéři: u Turka doplněno *(CLM-02, CLM-11)* | filip-turek | Čistě přenositelné |

Postup po T-004: aplikovat patch po částech na nové soubory, doplnit
CLM-45 (text + zdroj — jen autor), dotáhnout `status-single` ve všech
třech místech, přegenerovat detail stránky, zelený build.
