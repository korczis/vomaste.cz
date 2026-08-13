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

{% <callout kind="varovani" title="2. Chybí klíč, nebo chybí celá proměnná? To jsou dvě různé věci"> %}
Chybějící **klíč** v existující mapě je nepravdivý, ne chyba:
`{% raw %}{% if page.extra.neco %}{% endraw %}` projde i bez toho klíče.

Chybějící **proměnná** je něco jiného. `/404.html` se vykresluje bez `page`
i bez `section`, takže `{% raw %}{{ page.extra.neco }}{% endraw %}` tam skončí chybou
„Variable `page` is not defined". Řešení je náhrada:
`{% raw %}{% set pg = page | default(value={"extra": {}}) %}{% endraw %}`.

A pozor na to, co `default` vlastně dělá: reaguje jen na **chybějící** klíč,
ne na prázdnou hodnotu. Když do náhrady napíšete `"title": ""`, řetěz
`page → section → config` se už nikdy nespustí, protože `title` existuje —
je jen prázdný. Přesně tak zmizel název ze všech `<title>` na webu.
{% </callout> %}

{% <callout kind="varovani" title="3. Komponenta nevidí nic, co jí nepředáte"> %}
Komponenty jsou globální — neimportují se a klidně volají jedna druhou.
Zato **nevidí okolní kontext**: uvnitř komponenty neexistuje `config`,
`page` ani `section`, jen deklarované parametry. `config.extra.neco`
uvnitř komponenty spadne na „Variable `config` is not defined"; hodnotu
musíte předat parametrem.

Druhá půlka téhle pasti: když výstup komponenty **zachytíte do proměnné**
(`{% raw %}{% set x = <komp /> %}{% endraw %}`), dostanete HTML-escapovaný text a Tera
nemá filtr, který by to vrátil zpět. V atributu se entita při parsování
dekóduje, v JSON-LD ale zůstane doslovné `&quot;` — jedna stránka pak
tvrdí dvě různé věci.
{% </callout> %}

{% <callout kind="varovani" title="4. Typ parametru se odvodí z výchozí hodnoty"> %}
Filtr uvnitř argumentu je v pořádku:
`{% raw %}{{ <komp label={seznam | length ~ " položek"} /> }}{% endraw %}` funguje.

Past je jinde. Typ parametru si Tera odvodí z jeho **výchozí hodnoty**,
takže `sloupce=""` je parametr typu `string` — a předání pole skončí na
„does not match expected type: `string`". Sentinel `""` pro „nic nepředáno"
proto nefunguje: pole potřebuje `sloupce=[]`, číslo `pocet: integer = -1`.
{% </callout> %}

## Komponenty

Shortcodes od Zoly 0.23 neexistují. Nahradily je **komponenty**, které jdou
volat v šablonách i uvnitř markdownu:

```jinja2
{% raw %}{% component callout(kind="poznamka", title="") -%}
  …markup…
{%- endcomponent %}{% endraw %}
```

Volání bez těla je `{% raw %}{{ <callout kind="priklad" /> }}{% endraw %}`, s tělem
`{% raw %}{% <callout kind="priklad"> %}…{% </callout> %}{% endraw %}` — tělo je uvnitř
dostupné jako `body` a markdown v něm vykreslí filtr `markdown`.

Nestringový argument patří do složených závorek: `{% raw %}poradi={3}{% endraw %}`,
`{% raw %}polozky={seznam}{% endraw %}`. Řetězcový literál je bez nich.

Soubor komponentu nikam neregistruje — jméno je globální, takže dvě
komponenty stejného jména kolidují. Proto mají v tomhle repozitáři prefix
podle role (`ui_`, `table_`, `views_`).

Obsah stránek se navíc od 0.23 pouští přes Teru **před** parsováním
markdownu. Doslovný příklad šablonového jazyka v textu proto musí být
obalený blokem `raw` / `endraw` — starý escape `{% raw %}{%/* … */%}{% endraw %}` už
neexistuje. (Tenhle odstavec ho proto pojmenovává, místo aby ho ukazoval:
`raw` uvnitř `raw` se ukončí tím prvním `endraw`, na který narazí.)

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
