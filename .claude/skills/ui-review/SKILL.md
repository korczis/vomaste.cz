---
name: ui-review
description: Zkontroluje změnu v šablonách nebo UI proti konvencím tohohle webu — znovupoužití komponent, jednotná tabulková komponenta, data-driven rendering bez hardcodovaných záznamů, prázdné stavy, responzivita a metadata. Použij ho po úpravě templates/, assets/ nebo CSS, nebo když někdo řekne „zkontroluj mi tu stránku", „vypadá to divně na mobilu".
argument-hint: "[cesta k šabloně | changed]"
---

Review UI vrstvy. **Read-only.**

## Kdy ho použít

- Po změně v `templates/`, `assets/` nebo `static/css/`.
- Před merge změny, která se dotýká vzhledu.
- Když se přidává nová šablona.

## Kdy ho NEPOUŽÍT

- **Na přístupnost.** To je `/a11y-review` — je to samostatná
  a náročnější kontrola.
- **Na metadata a sdílení.** To je `/seo-review`.
- **Na obsah.** Šablona zobrazuje; co zobrazuje, řeší redakční review.

## Co zkontrolovat

### 1. Znovupoužití komponent — vynucená brána

`npm run lint:component-reuse` shodí build, když obsahová šablona
neimportuje a nepoužije `macros/ui.html` (`page_header`, `breadcrumb`,
`stat_tile`, `registry-card`, `empty_state`, `back_link_footer`).

Šablona s `<table` mimo `macros/table.html` musí importovat
`macros/table.html` a použít `table::advanced_table`. Výjimka jen
per-file s odůvodněním.

**Buď přesný v tom, co ta brána je**: vynucuje vlastní konvenci tohohle
webu, ne shodu s flowbite.com/docs/getting-started/llm/. Ta stránka
žádné strojově kontrolovatelné pravidlo neobsahuje. Popisovat bránu
jako „Flowbite compliance" by bylo tvrzení o vynucení, které neexistuje.

### 2. Data-driven, ne hardcoded

- Čte šablona **view model** (`load_data("data/" ~ extra.view_model)`),
  nebo si vymýšlí data z front matteru?
- Nezná náhodou slug dossieru? Sourozenecké cesty se skládají z
  `page.extra.dossier` / `section.extra.dossier`.
- `npm run lint:hardcoded-records` hlídá zapsané identifikátory záznamů
  v šablonách.

### 3. Doktrína F1–F7

F1 žádné inline `style="…"` (vynucuje `verify-full-pages.mjs`) ·
F2 barvy jen z palety v `base.html` a `input.css` · F3 viditelný
`:focus-visible` · F4 breakpointy a `overflow-x-auto` u širokého obsahu ·
F5 sémantika a ARIA · F6 interaktivní vzory Flowbite, žádný ad-hoc JS
shell · F7 typografická hierarchie.

### 4. Prázdné a mezní stavy

- Co se zobrazí při **nule** položek? (`empty_state`, ne prázdná
  tabulka.)
- Co při velmi dlouhém názvu, chybějícím obrázku, jednom prvku?

### 5. Responzivita

Ověř na 360, 390, 768 a 1280 px. Široký obsah patří do vlastního
`overflow-x-auto` kontejneru; stránka sama nesmí scrollovat vodorovně.
`npm run verify:table-responsive` to hlídá pro tabulky.

### 6. Média

Obrázek entity jde **jedinou** cestou — `ui::media_figure` — a ta vždy
nese autora, licenci s odkazem a odkaz na zdroj. Holý `<img>` je
porušení licence, ne odchylka od stylu.

## Bez prohlížeče

Prohlížečová automatizace není povinná a build na ní nestojí. Když
není k dispozici, dělá se statická kontrola šablon a **řekne se to**:

```
OVĚŘENO STATICKY: <co>
NEOVĚŘENO:        <co by chtělo vizuální kontrolu>
```

Tvrdit, že něco vypadá dobře, bez toho, aby se to zobrazilo, je přesně
ten druh nepodloženého tvrzení, kterému celý repozitář brání jinde.

## Výstup

```
ZMĚNĚNO:     <šablony a assety>
KOMPONENTY:  <použité macros | porušení>
DATA:        view model | hardcoded (<co>)
DOKTRÍNA:    <F1–F7: OK nebo porušení>
PRÁZDNÉ STAVY: <ošetřeno | chybí>
RESPONZIVITA: <ověřeno jak, na kterých šířkách>
MÉDIA:       <n/a | ui::media_figure | porušení>
NÁLEZY:      [BLOCKER|HIGH|MEDIUM|LOW] <…>
NEOVĚŘENO:   <co vyžaduje vizuální kontrolu>
```

## Příklady

**Základní.** Změna jedné šablony, komponenty použité, view model,
žádné inline styly → bez nálezu, poznámka o tom, co nebylo ověřeno
vizuálně.

**Realistický.** Nová šablona s vlastní `<table>`. [BLOCKER]: brána
`lint:component-reuse` to shodí, a je to správně — tabulková komponenta
nese `data-record-type`, který provazuje řádky s JSON-LD uzly stránky.
Vlastní tabulka tu vazbu ztratí.

**Selhání.** Šablona vypisuje pět dossierů podle jmen. [BLOCKER]:
hardcodovaný slug. Který dossier existuje, rozhoduje adresář
s `dossier.json`, a šablona to má číst, ne vědět.

## Související

`/a11y-review`, `/seo-review`, `/build` (brány),
`.claude/rules/ui.md`, `.claude/rules/media.md`.
