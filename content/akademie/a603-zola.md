+++
title = "A603 — Zola"
description = "Jak generátor rozhoduje o routách, co umí load_data a čtyři pasti šablonovacího jazyka, na které v tomhle repozitáři každý najede."
template = "learning-lesson.html"
weight = 1603

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A603"
level = "engineering"
estimated_minutes = 12
audience = ["vyvojar"]
objectives = [
  "Vysvětlíte, jak vzniká routa a proč potřebuje soubor v content/.",
  "Použijete load_data k načtení konfigurace do šablony.",
  "Vyhnete se čtyřem známým pastím šablonovacího jazyka.",
]
prerequisites = ["A602"]
related_kb = ["koncepty/strojove-citelna-data.md"]
next = "A604"
+++

Zola je statický generátor. Podstatné pro tenhle projekt: **routa vzniká
ze souboru v `content/`**. To je celý důvod, proč existují generované
adaptéry — kanonická data jsou JSON a Zola z JSON routu neudělá.

## Sekce a stránky

`_index.md` dělá **sekci** (má `pages`, `subsections`), ostatní soubory
jsou **stránky**. Šablona sekce k nim přistupuje přes `section.pages`,
stránka ke své sekci přes `get_section(path=…)`.

## `load_data`

Načte TOML/JSON přímo v šabloně:

{% raw %}
```jinja2
{% set learning = load_data(path="data/learning.toml") %}
```
{% endraw %}

Díky tomu můžou být popisky, pořadí a ikony v datech, ne v markupu.
Používá to navigace, metadata i tahle vzdělávací vrstva.

## Čtyři pasti

{% <callout kind="varovani" title="1. Cesty se liší podle funkce"> %}
`get_url(path="@/koncepty/x.md")` — **s** prefixem.
`get_page(path="koncepty/x.md")` — **bez** něj.

Záměna se projeví jako „stránka nenalezena“ při sestavení.
{% </callout> %}

{% <callout kind="varovani" title="2. Chybějící klíč je chyba, ne prázdno"> %}
Šablonovací jazyk je striktní: `{% raw %}{% if page.extra.neco %}{% endraw %}` spadne, pokud
klíč neexistuje. Volitelná pole potřebují
`| default(value=…)`.
{% </callout> %}

{% <callout kind="varovani" title="3. Makra nevolají sourozence"> %}
`self::` se vyhodnocuje proti **volající** šabloně, ne proti souboru, kde
makro bydlí. Import sebe sama to neřeší — skončí nekonečnou rekurzí a
generátor spadne přetečením zásobníku, ne chybovou hláškou.

Řešení je rozdělit makra na listová (nevolají nic) a složená, která si ta
listová importují. Přesně tak jsou postavená makra téhle sekce.
{% </callout> %}

{% <callout kind="varovani" title="4. Filtr uvnitř výrazu potřebuje mezikrok"> %}
`{% raw %}{{ makro(label=seznam | length ~ " položek") }}{% endraw %}` se nepřeloží. Nejdřív
`{% raw %}{% set n = seznam | length %}{% endraw %}`, pak `n ~ " položek"`.
{% </callout> %}

## Shortcodes

Komponenty použitelné **uvnitř markdownu**: soubory v
`templates/shortcodes/`, volané jako `{% raw %}{% nazev() %}{% endraw %}…{% raw %}{% end %}{% endraw %}`. Tělo se
předává jako `body`; markdown v něm se vykreslí filtrem `markdown`.

Tímhle způsobem jsou udělané prvky lekcí — a importují tatáž makra, jaká
používají šablony, takže markup existuje jednou.

{% <kontrola otazka="Přidáte novou stránku pod content/, ale na webu se neobjeví. Čím začít?"> %}
Třemi věcmi, v tomhle pořadí:

1. **Šablona v hlavičce.** Chybějící nebo překlepnutá `template` znamená,
   že se stránka vykreslí výchozí šablonou — nebo že sestavení spadne.
2. **Je nadřazená sekce sekcí?** Bez `_index.md` v adresáři Zola stránky
   uvnitř nesbírá a `section.pages` je nenajde.
3. **Neskončila v generovaném rozsahu?** Pokud jste ji položili pod
   `content/dossiers/**` nebo `content/entities/`, synchronizace ji při
   dalším sestavení smaže — tam patří jen generované adaptéry.

Když sestavení projde a stránka existuje v `public/`, ale není vidět
v navigaci, je to jiný problém: navigační strom se **generuje z dat** a
novou stránku musí zahrnout příslušný generátor.
{% </kontrola> %}
