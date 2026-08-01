*Historický dokument — popisuje stav před JSON-first migrací (T-028).*

# Flowbite LLM compliance — plán a ověření pro každý Zola markdown

Vygenerováno 2026-07-30 · 219 článků · 28 šablon. Kritéria F1–F7 odvozená z Flowbite utility/LLM konvencí (flowbite.com/docs/getting-started/llm/ → llms.txt); závazně zakotveno v AGENTS.md („Flowbite doktrína“). Compliance je vlastnost renderující šablony → ověřeno per-template, platí pro každý článek, který šablona renderuje. F2 (dark-first tokeny) a F6 (Flowbite drawer/navbar vzory) plní site-wide base.html + input.css; F3 (focus-visible) je globální v input.css. F1 (žádné inline styly) nově vynucuje verify-full-pages.mjs v build gate. Tabulární data (F4/F5/F6): každá `<table>` v šablonách jde přes jednotnou komponentu `templates/macros/table.html` (`table::advanced_table`, vzor Flowbite „Advanced Tables" nad volným Tailwindem/Flowbite; `overflow-x-auto` obal, sr-only `<caption>`, `scope` na záhlavích, `data-record-type` vazba na JSON-LD) — vynucuje `npm run lint:component-reuse`.

## Audit šablon (F1 inline / F4 responsive / F5 ARIA / F7 typografie)

| Šablona | F1 | F4 | F5 | F7 |
|---|---|---|---|---|
| 404.html | ✓ | ✓ | – | ✓ |
| base.html | ✓ | ✓ | ✓ | ✓ |
| concept.html | ✓ | – | ✓ | ✓ |
| concepts-index.html | ✓ | ✓ | ✓ | ✓ |
| docs-index.html | ✓ | ✓ | ✓(ui:: makra) | ✓ |
| docs-viewer.html | ✓ | – | ✓(ui:: makra) | ✓ |
| dossier-case.html | ✓ | – | ✓(ui:: makra) | ✓ |
| dossier-cases-index.html | ✓ | ✓ | ✓(ui:: makra) | ✓ |
| dossier-claim.html | ✓ | – | ✓ | ✓ |
| dossier-claims-index.html | ✓ | ✓ | ✓(ui:: makra) | ✓ |
| dossier-evidence.html | ✓ | ✓ | ✓ | ✓ |
| dossier-gap.html | ✓ | – | ✓(ui:: makra) | ✓ |
| dossier-gaps-index.html | ✓ | ✓ | ✓(ui:: makra) | ✓ |
| dossier-relation.html | ✓ | – | ✓ | ✓ |
| dossier-relations-index.html | ✓ | ✓ | ✓ | ✓ |
| dossier-source.html | ✓ | – | ✓ | ✓ |
| dossier-sources-index.html | ✓ | ✓ | ✓ | ✓ |
| dossier.html | ✓ | ✓ | ✓ | ✓ |
| dossiers-index.html | ✓ | ✓ | ✓(ui:: makra) | ✓ |
| entities-index.html | ✓ | ✓ | ✓(ui:: makra) | ✓ |
| entity-dossier-entities.html | ✓ | ✓ | ✓(ui:: makra) | ✓ |
| entity-dossier-evidence.html | ✓ | ✓ | ✓ | ✓ |
| entity-dossier-registry.html | ✓ | ✓ | ✓(ui:: makra) | ✓ |
| entity-dossier-relations.html | ✓ | ✓ | ✓ | ✓ |
| entity-dossier.html | ✓ | ✓ | ✓ | ✓ |
| entity.html | ✓ | – | ✓ | ✓ |
| index.html | ✓ | ✓ | ✓ | ✓ |
| map.html | ✓ | ✓ | ✓ | ✓ |

## Plán per článek

| # | Soubor | Typ | Šablona | Plán |
|---|---|---|---|---|
| 1 | `_index.md` | page | index.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 2 | `dokumentace/_index.md` | page | docs-index.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 3 | `dokumentace/adr-graph-renderer.md` | page | docs-viewer.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 4 | `dokumentace/adr-jsonld-provenance.md` | page | docs-viewer.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 5 | `dokumentace/adr-markdown-mermaid.md` | page | docs-viewer.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 6 | `dokumentace/agents.md` | page | docs-viewer.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 7 | `dokumentace/bezpecnost.md` | page | docs-viewer.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 8 | `dokumentace/konstituce.md` | page | docs-viewer.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 9 | `dokumentace/koop-protokol.md` | page | docs-viewer.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 10 | `dokumentace/licence.md` | page | docs-viewer.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 11 | `dokumentace/prispivani.md` | page | docs-viewer.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 12 | `dossiers/_index.md` | page | dossiers-index.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 13 | `dossiers/filip-turek/_index.md` | page | entity-dossier.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 14 | `dossiers/filip-turek/cases/_index.md` | page | entity-dossier-registry.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 15 | `dossiers/filip-turek/claims/_index.md` | page | entity-dossier-registry.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 16 | `dossiers/filip-turek/entities/_index.md` | page | entity-dossier-entities.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 17 | `dossiers/filip-turek/evidence/_index.md` | page | entity-dossier-evidence.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 18 | `dossiers/filip-turek/gaps/_index.md` | page | entity-dossier-registry.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 19 | `dossiers/filip-turek/relations/_index.md` | page | entity-dossier-relations.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 20 | `dossiers/filip-turek/sources/_index.md` | page | entity-dossier-registry.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 21 | `dossiers/macinka-turek/_index.md` | dossier | dossier.html | Kanonická tabulka tvrzení (dvě reprezentace, vynuceno); po T-001 rozpad do entity dossierů. |
| 22 | `dossiers/macinka-turek/cases/_index.md` | page | dossier-cases-index.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 23 | `dossiers/macinka-turek/cases/case-01.md` | case | dossier-case.html | Detail z front matter v paritě s kartou (vynuceno); label vždy doložený tvrzením; období měsíční přesnost. |
| 24 | `dossiers/macinka-turek/cases/case-02.md` | case | dossier-case.html | Detail z front matter v paritě s kartou (vynuceno); label vždy doložený tvrzením; období měsíční přesnost. |
| 25 | `dossiers/macinka-turek/cases/case-03.md` | case | dossier-case.html | Detail z front matter v paritě s kartou (vynuceno); label vždy doložený tvrzením; období měsíční přesnost. |
| 26 | `dossiers/macinka-turek/cases/case-04.md` | case | dossier-case.html | Detail z front matter v paritě s kartou (vynuceno); label vždy doložený tvrzením; období měsíční přesnost. |
| 27 | `dossiers/macinka-turek/claims/_index.md` | page | dossier-claims-index.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 28 | `dossiers/macinka-turek/claims/clm-01.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 29 | `dossiers/macinka-turek/claims/clm-02.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 30 | `dossiers/macinka-turek/claims/clm-03.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 31 | `dossiers/macinka-turek/claims/clm-04.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 32 | `dossiers/macinka-turek/claims/clm-05.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 33 | `dossiers/macinka-turek/claims/clm-06.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 34 | `dossiers/macinka-turek/claims/clm-07.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 35 | `dossiers/macinka-turek/claims/clm-08.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 36 | `dossiers/macinka-turek/claims/clm-09.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 37 | `dossiers/macinka-turek/claims/clm-10.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 38 | `dossiers/macinka-turek/claims/clm-11.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 39 | `dossiers/macinka-turek/claims/clm-12.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 40 | `dossiers/macinka-turek/claims/clm-13.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 41 | `dossiers/macinka-turek/claims/clm-14.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 42 | `dossiers/macinka-turek/claims/clm-15.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 43 | `dossiers/macinka-turek/claims/clm-16.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 44 | `dossiers/macinka-turek/claims/clm-17.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 45 | `dossiers/macinka-turek/claims/clm-18.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 46 | `dossiers/macinka-turek/claims/clm-19.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 47 | `dossiers/macinka-turek/claims/clm-20.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 48 | `dossiers/macinka-turek/claims/clm-21.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 49 | `dossiers/macinka-turek/claims/clm-22.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 50 | `dossiers/macinka-turek/claims/clm-23.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 51 | `dossiers/macinka-turek/claims/clm-24.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 52 | `dossiers/macinka-turek/claims/clm-25.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 53 | `dossiers/macinka-turek/claims/clm-26.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 54 | `dossiers/macinka-turek/claims/clm-27.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 55 | `dossiers/macinka-turek/claims/clm-28.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 56 | `dossiers/macinka-turek/claims/clm-29.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 57 | `dossiers/macinka-turek/claims/clm-30.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 58 | `dossiers/macinka-turek/claims/clm-31.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 59 | `dossiers/macinka-turek/claims/clm-32.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 60 | `dossiers/macinka-turek/claims/clm-33.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 61 | `dossiers/macinka-turek/claims/clm-34.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 62 | `dossiers/macinka-turek/claims/clm-35.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 63 | `dossiers/macinka-turek/claims/clm-36.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 64 | `dossiers/macinka-turek/claims/clm-37.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 65 | `dossiers/macinka-turek/claims/clm-38.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 66 | `dossiers/macinka-turek/claims/clm-39.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 67 | `dossiers/macinka-turek/claims/clm-40.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 68 | `dossiers/macinka-turek/claims/clm-41.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 69 | `dossiers/macinka-turek/claims/clm-42.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 70 | `dossiers/macinka-turek/claims/clm-43.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 71 | `dossiers/macinka-turek/claims/clm-44.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 72 | `dossiers/macinka-turek/claims/clm-45.md` | claim | dossier-claim.html | Full page (dossier-claim.html): zdroje/kauza/vztahy/subjekty/Git provenance — hotovo, vynuceno verify:full-pages; po T-001 ověřit novou cestu. |
| 73 | `dossiers/macinka-turek/evidence/_index.md` | page | dossier-evidence.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 74 | `dossiers/macinka-turek/gaps/_index.md` | page | dossier-gaps-index.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 75 | `dossiers/macinka-turek/gaps/gap-01.md` | gap | dossier-gap.html | Neutrální otázka + checked; re-check každé rešeršní kolo (GAP-06 první). |
| 76 | `dossiers/macinka-turek/gaps/gap-02.md` | gap | dossier-gap.html | Neutrální otázka + checked; re-check každé rešeršní kolo (GAP-06 první). |
| 77 | `dossiers/macinka-turek/gaps/gap-03.md` | gap | dossier-gap.html | Neutrální otázka + checked; re-check každé rešeršní kolo (GAP-06 první). |
| 78 | `dossiers/macinka-turek/gaps/gap-04.md` | gap | dossier-gap.html | Neutrální otázka + checked; re-check každé rešeršní kolo (GAP-06 první). |
| 79 | `dossiers/macinka-turek/gaps/gap-05.md` | gap | dossier-gap.html | Neutrální otázka + checked; re-check každé rešeršní kolo (GAP-06 první). |
| 80 | `dossiers/macinka-turek/gaps/gap-06.md` | gap | dossier-gap.html | Neutrální otázka + checked; re-check každé rešeršní kolo (GAP-06 první). |
| 81 | `dossiers/macinka-turek/relations/_index.md` | page | dossier-relations-index.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 82 | `dossiers/macinka-turek/relations/edge-babis-nehoda2026.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 83 | `dossiers/macinka-turek/relations/edge-babis-vlada.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 84 | `dossiers/macinka-turek/relations/edge-cerveny-mzp2026.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 85 | `dossiers/macinka-turek/relations/edge-chlad-motoriste.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 86 | `dossiers/macinka-turek/relations/edge-homolce-nehoda2026.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 87 | `dossiers/macinka-turek/relations/edge-kauza2025-policie.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 88 | `dossiers/macinka-turek/relations/edge-klubmotoristu-motoriste.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 89 | `dossiers/macinka-turek/relations/edge-macinka-cerveny.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 90 | `dossiers/macinka-turek/relations/edge-macinka-gmrgas.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 91 | `dossiers/macinka-turek/relations/edge-macinka-kauza2024.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 92 | `dossiers/macinka-turek/relations/edge-macinka-klubmotoristu.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 93 | `dossiers/macinka-turek/relations/edge-macinka-motoriste.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 94 | `dossiers/macinka-turek/relations/edge-macinka-mzp2026.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 95 | `dossiers/macinka-turek/relations/edge-macinka-nehoda2026.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 96 | `dossiers/macinka-turek/relations/edge-motoriste-vlada.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 97 | `dossiers/macinka-turek/relations/edge-nehoda2026-policie.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 98 | `dossiers/macinka-turek/relations/edge-pavel-mzp2026.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 99 | `dossiers/macinka-turek/relations/edge-trestniozn-policie.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 100 | `dossiers/macinka-turek/relations/edge-trestniozn-statnizastupitelstvi.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 101 | `dossiers/macinka-turek/relations/edge-turek-ep.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 102 | `dossiers/macinka-turek/relations/edge-turek-greendeal.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 103 | `dossiers/macinka-turek/relations/edge-turek-kauza2024.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 104 | `dossiers/macinka-turek/relations/edge-turek-kauza2025.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 105 | `dossiers/macinka-turek/relations/edge-turek-motoriste.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 106 | `dossiers/macinka-turek/relations/edge-turek-mzp2026.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 107 | `dossiers/macinka-turek/relations/edge-turek-nehoda2026.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 108 | `dossiers/macinka-turek/relations/edge-turek-pavel.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 109 | `dossiers/macinka-turek/relations/edge-turek-trestniozn.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 110 | `dossiers/macinka-turek/relations/edge-turek-zapperclub.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 111 | `dossiers/macinka-turek/relations/edge-zapperclub-mzdrav.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 112 | `dossiers/macinka-turek/relations/edge-zapperclub-szpi.md` | relation | dossier-relation.html | Hrana s claims+sources (vynuceno); jednorodinné hrany → druhá rodina (backlog 6). |
| 113 | `dossiers/macinka-turek/sources/_index.md` | page | dossier-sources-index.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 114 | `dossiers/macinka-turek/sources/src-01.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 115 | `dossiers/macinka-turek/sources/src-02.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 116 | `dossiers/macinka-turek/sources/src-03.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 117 | `dossiers/macinka-turek/sources/src-04.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 118 | `dossiers/macinka-turek/sources/src-05.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 119 | `dossiers/macinka-turek/sources/src-06.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 120 | `dossiers/macinka-turek/sources/src-07.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 121 | `dossiers/macinka-turek/sources/src-08.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 122 | `dossiers/macinka-turek/sources/src-09.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 123 | `dossiers/macinka-turek/sources/src-10.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 124 | `dossiers/macinka-turek/sources/src-11.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 125 | `dossiers/macinka-turek/sources/src-12.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 126 | `dossiers/macinka-turek/sources/src-13.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 127 | `dossiers/macinka-turek/sources/src-14.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 128 | `dossiers/macinka-turek/sources/src-15.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 129 | `dossiers/macinka-turek/sources/src-16.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 130 | `dossiers/macinka-turek/sources/src-17.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 131 | `dossiers/macinka-turek/sources/src-18.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 132 | `dossiers/macinka-turek/sources/src-19.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 133 | `dossiers/macinka-turek/sources/src-20.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 134 | `dossiers/macinka-turek/sources/src-21.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 135 | `dossiers/macinka-turek/sources/src-22.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 136 | `dossiers/macinka-turek/sources/src-23.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 137 | `dossiers/macinka-turek/sources/src-24.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 138 | `dossiers/macinka-turek/sources/src-25.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 139 | `dossiers/macinka-turek/sources/src-26.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 140 | `dossiers/macinka-turek/sources/src-27.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 141 | `dossiers/macinka-turek/sources/src-28.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 142 | `dossiers/macinka-turek/sources/src-29.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 143 | `dossiers/macinka-turek/sources/src-30.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 144 | `dossiers/macinka-turek/sources/src-31.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 145 | `dossiers/macinka-turek/sources/src-32.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 146 | `dossiers/macinka-turek/sources/src-33.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 147 | `dossiers/macinka-turek/sources/src-34.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 148 | `dossiers/macinka-turek/sources/src-35.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 149 | `dossiers/macinka-turek/sources/src-36.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 150 | `dossiers/macinka-turek/sources/src-37.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 151 | `dossiers/macinka-turek/sources/src-38.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 152 | `dossiers/macinka-turek/sources/src-39.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 153 | `dossiers/macinka-turek/sources/src-40.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 154 | `dossiers/macinka-turek/sources/src-41.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 155 | `dossiers/macinka-turek/sources/src-42.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 156 | `dossiers/macinka-turek/sources/src-43.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 157 | `dossiers/macinka-turek/sources/src-44.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 158 | `dossiers/macinka-turek/sources/src-45.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 159 | `dossiers/macinka-turek/sources/src-46.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 160 | `dossiers/macinka-turek/sources/src-47.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 161 | `dossiers/macinka-turek/sources/src-48.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 162 | `dossiers/macinka-turek/sources/src-49.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 163 | `dossiers/macinka-turek/sources/src-50.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 164 | `dossiers/macinka-turek/sources/src-51.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 165 | `dossiers/macinka-turek/sources/src-52.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 166 | `dossiers/macinka-turek/sources/src-53.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 167 | `dossiers/macinka-turek/sources/src-54.md` | source | dossier-source.html | Full page (dossier-source.html) + povinná redakční poznámka ≥150 zn. (vynuceno) + JSON-LD citační uzel (vynuceno); doplnit family kde chybí; po T-001 ověřit cestu. |
| 168 | `dossiers/petr-macinka/_index.md` | page | entity-dossier.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 169 | `dossiers/petr-macinka/cases/_index.md` | page | entity-dossier-registry.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 170 | `dossiers/petr-macinka/claims/_index.md` | page | entity-dossier-registry.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 171 | `dossiers/petr-macinka/entities/_index.md` | page | entity-dossier-entities.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 172 | `dossiers/petr-macinka/evidence/_index.md` | page | entity-dossier-evidence.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 173 | `dossiers/petr-macinka/gaps/_index.md` | page | entity-dossier-registry.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 174 | `dossiers/petr-macinka/relations/_index.md` | page | entity-dossier-relations.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 175 | `dossiers/petr-macinka/sources/_index.md` | page | entity-dossier-registry.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 176 | `entities/_index.md` | page | entities-index.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 177 | `entities/babis.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 178 | `entities/cerveny.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 179 | `entities/chlad.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 180 | `entities/ep.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 181 | `entities/gmrgas.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 182 | `entities/greendeal.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 183 | `entities/kauza2024.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 184 | `entities/kauza2025.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 185 | `entities/klubmotoristu.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 186 | `entities/macinka.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 187 | `entities/motoriste.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 188 | `entities/mzdrav.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 189 | `entities/mzp2026.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 190 | `entities/nehoda2026.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 191 | `entities/nemocnice-homolce.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 192 | `entities/pavel.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 193 | `entities/policie.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 194 | `entities/statni-zastupitelstvi.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 195 | `entities/szpi.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 196 | `entities/trestniozn.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 197 | `entities/turek.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 198 | `entities/vlada.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 199 | `entities/zapper-club.md` | entity | entity.html | Parita s graph.toml (vynuceno validate-graph); summary aktualizovat s novými tvrzeními. |
| 200 | `koncepty/_index.md` | page | concepts-index.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 201 | `koncepty/bezpecnostni-hranice.md` | page | concept.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 202 | `koncepty/co-to-je.md` | page | concept.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 203 | `koncepty/co-to-neni.md` | page | concept.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 204 | `koncepty/fakt-oddelene-od-nazoru.md` | page | concept.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 205 | `koncepty/prubezne-overovani.md` | page | concept.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 206 | `koncepty/public-domain.md` | page | concept.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 207 | `koncepty/registr-kauz.md` | page | concept.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 208 | `koncepty/registr-mezer.md` | page | concept.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 209 | `koncepty/registr-tvrzeni.md` | page | concept.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 210 | `koncepty/registr-zdroju.md` | page | concept.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 211 | `koncepty/stav-citace.md` | page | concept.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 212 | `koncepty/stav-jeden-zdroj.md` | page | concept.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 213 | `koncepty/stav-nazor.md` | page | concept.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 214 | `koncepty/stav-overeno-vice-zdroji.md` | page | concept.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 215 | `koncepty/stav-sporne.md` | page | concept.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 216 | `koncepty/strojove-citelna-data.md` | page | concept.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 217 | `koncepty/verzovano-v-gitu.md` | page | concept.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 218 | `koncepty/zdrojovano.md` | page | concept.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
| 219 | `map/_index.md` | page | map.html | Sekční/indexová stránka: generická, bez hardcodu subjektů; po T-001 kryje lint:historical-coupling. |
