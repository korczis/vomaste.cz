+++
title = "A601 — Architektura repozitáře"
description = "Kde co bydlí a proč. Tok od kanonických dat přes generátory a šablony k vydanému webu, plus adresáře, které se často pletou."
template = "learning-lesson.html"
weight = 1601

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A601"
level = "engineering"
estimated_minutes = 11
audience = ["vyvojar", "maintainer"]
objectives = [
  "Popíšete tok dat od kanonického JSON po vydanou stránku.",
  "Najdete správný adresář pro konkrétní typ změny.",
  "Rozliší se vám verzované a odvozené výstupy.",
]
related_kb = ["koncepty/strojove-citelna-data.md", "koncepty/forkovatelnost.md", "koncepty/serverless.md"]
next = "A602"
+++

## Tok

```text
data/                 kanonická data (JSON) + konfigurace (TOML)
  │
  ├─ scripts/         validátory a generátory
  │      │
  │      ├─ data/generated/**   pohledové modely, navigace, metriky
  │      └─ content/**          adaptéry stránek (generované)
  │
  ├─ templates/       Tera šablony — čistě prezentace
  ├─ assets/, static/ zdroje frontendu
  │
  └─ public/          vydaný web (odvozený, nikdy se needituje)
```

Podstatné je, že šipky vedou **jedním směrem**. Šablona nikdy nezapisuje
do dat a generovaný obsah není zdroj.

## Kam patří jaká změna

| Chcete změnit | Sáhněte do |
|---|---|
| tvrzení, zdroj, entitu | `data/dossiers/**` |
| vzhled nebo strukturu stránky | `templates/` |
| pravidlo, které má hlídat build | `scripts/` |
| pojem, koncept, dokumentaci | `content/koncepty/`, `content/dokumentace/` |
| navigaci | `data/navigation.toml` (kostra, bez dossierů) |
| metadata pro sociální sítě | `data/seo.toml` |

## Dvě zásady, které vysvětlí většinu rozhodnutí

**Co se dá spočítat, se počítá.** Počty na dlaždicích, hloubka grafu,
seznamy v navigaci — nic z toho není v datech. Uložené je jen to, co je
rozhodnutím.

**Šablona nesmí vědět, které dossiery existují.** Žádná neobsahuje slug.
Navigace i routy se generují z dat, takže nový dossier nevyžaduje zásah do
kostry ani do šablony.

{% <callout kind="pravidlo" title="Web se musí postavit z repozitáře"> %}
Sestavení nesmí potřebovat externí platformu, databázi, přihlašovací údaje
ani síť. Kdo si repozitář naklonuje, musí dostat týž web — jinak není
forkovatelný a slib kontrolovatelnosti neplatí.
{% </callout> %}

{% <kontrola otazka="Kolega přidá do šablony podmínku, která se ptá, jestli je aktuální dossier konkrétní slug, kvůli jedné výjimce. Proč je to problém?"> %}
Tři důvody, každý sám o sobě dost silný:

1. **Šablona začne vědět, kdo je pokrytý.** Přestává být prezentační
   vrstvou a stává se místem, kde se rozhoduje o obsahu. Příště bude
   výjimka dvě a nikdo nepozná, kolik jich je.
2. **Rozbíjí to forkovatelnost.** Kdo si projekt vezme pro jiné subjekty,
   zdědí podmínku na cizí slug, která u něj nedává smysl.
3. **Neprojde to.** Repozitář má bránu proti napevno zapsaným záznamům
   a slugům ve strukturálním kódu.

Správné řešení: udělat z výjimky **data**. Když se dossier v něčem
odlišuje, je to jeho vlastnost — pole v jeho kanonickém záznamu, které
šablona přečte, aniž by věděla, koho se týká.
{% </kontrola> %}
