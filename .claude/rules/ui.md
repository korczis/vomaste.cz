---
paths:
  - "templates/**"
  - "assets/**"
  - "static/css/**"
  - "data/seo.toml"
  - "data/navigation.toml"
---

# UI — komponenty, doktrína, metadata

## Šablona je prezentační vrstva, nic víc

Každá dossierová šablona čte data z **view modelu**
(`load_data("data/" ~ extra.view_model)`), nikdy z ručně udržovaného
frontmatteru. Generované adaptéry nesou jen směrovací obálku.

**Žádná šablona nehardcoduje slug dossieru.** Kořen se čte z front
matteru (`page.extra.dossier`, `section.extra.dossier`) a sourozenecké
cesty se skládají z něj.

## Znovupoužití komponent je vynucená brána

`npm run lint:component-reuse` (v `build`, pre-commit i CI) shodí build,
když obsahová šablona neimportuje a nepoužije `macros/ui.html`
(`page_header`, `breadcrumb`, `stat_tile`, `registry-card`,
`empty_state`, `back_link_footer`).

Od 2026-07-30 navíc: šablona obsahující `<table` mimo `macros/table.html`
musí importovat `macros/table.html` a použít `table::advanced_table`
(výjimky jen per-file s odůvodněním v `TABLE_EXEMPT`). Obal tabulky nese
`data-record-type`, který provazuje řádky s JSON-LD uzly stránky.

**Co ta brána NENÍ**: kontrola shody s flowbite.com/docs/getting-started/llm/.
Ta stránka i její `llms.txt` byly načteny a přečteny přímo a neobsahují
žádné konkrétní strojově kontrolovatelné pravidlo — je to navigační
rozcestník, ne konformanční specifikace. Vynucuje se **vlastní konvence
tohohle webu**. Popisovat bránu jako „Flowbite LLM compliance" by bylo
přesně to tvrzení o vynucení, které konstituce §8 zakazuje.

## Flowbite doktrína F1–F7 (závazná)

**F1** utility-first, žádné inline `style="…"` v šablonách (vynucuje
`verify-full-pages.mjs`, výjimka jen přes odůvodněný allowlist).
**F2** dark-first barevné tokeny z `base.html` + `input.css`, žádné
ad-hoc barvy mimo paletu. **F3** viditelný focus (globální
`:focus-visible`). **F4** responsivita přes Tailwind breakpointy, širý
obsah v `overflow-x-auto`. **F5** sémantika a ARIA (nav/aria-label,
sr-only, role). **F6** interaktivní vzory podle Flowbite komponent, žádný
ad-hoc JS shell. **F7** typografická hierarchie.

## Metadata jsou data, ne šablonová logika

| Vrstva | Soubor |
|---|---|
| Konfigurace | `data/seo.toml` |
| Vykreslení | `templates/macros/meta.html` |
| Vstupy | `templates/base.html` (rozloží front matter na `meta_*`) |
| Strojová vrstva | `templates/partials/jsonld.html` (čte **tytéž** `meta_*`) |
| Vynucení | `scripts/build/verify-og.mjs` |

- `<meta property="og:*">` ani `<meta name="twitter:*">` se **nepíše
  ručně** v žádné šabloně.
- Rozhodovací logika („jaký `og:type` má stránka tvrzení") patří do
  `data/seo.toml`, ne do `if` v šabloně. Nový `record_type` bez záznamu
  v `[page_types.*]` shodí build — a obousměrně i mrtvý záznam.
- `og:title`/`og:description` a `name`/`description` stránkového uzlu
  JSON-LD musí být **tatáž hodnota**.

## Navigace se generuje

`data/navigation.toml` je kostra **bez slugů dossierů**;
`scripts/dossier/build-navigation.mjs` ji kompiluje s datasetem do
`data/generated/navigation.json`. Slug napsaný ručně do kostry shodí
build. Žádná osoba není top-level položkou sidebaru.

## Média jsou publikace cizího díla

Obrázek entity se zobrazí **jedinou** cestou — `ui::media_figure` —
a ta vždy nese autora, licenci s odkazem a odkaz na zdroj. Holý `<img>`
na položku z `media` je porušení licence, ne odchylka od stylu. Detaily:
[`media.md`](media.md).
