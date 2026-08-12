+++
title = "A407 — Průběh revize"
description = "Co se s příspěvkem děje od podání po zveřejnění, kdo co posuzuje a proč se nikdy nepublikuje bez druhého páru očí."
template = "learning-lesson.html"
weight = 1407

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A407"
level = "contribution"
estimated_minutes = 9
audience = ["research", "editor", "vyvojar"]
objectives = [
  "Popíšete cestu příspěvku od podání po zveřejnění.",
  "Rozliší se vám, co posuzuje stroj a co člověk.",
  "Budete vědět, co znamená vrácení k doplnění a co odmítnutí.",
]
prerequisites = ["A406"]
related_kb = ["koncepty/pravo-opravit.md", "koncepty/autonomie-s-odpovednosti.md"]
next_route = "@/akademie/a501-model-entity.md"
next_label = "A501 — Model entity (úroveň Datový model)"
+++

## Cesta příspěvku

1. **Podání** — issue nebo pull request.
2. **Zařazení** — o jaký typ jde a co pro něj platí.
3. **Ověření dokladu** — někdo otevře zdroj a porovná ho s tvrzením.
   Tenhle krok se nedá přeskočit ani zautomatizovat.
4. **Kontrola rozsahu a osobních údajů.**
5. **Brána** — validace, testy, sestavení.
6. **Schválení** — někdo jiný než autor.
7. **Zveřejnění** a záznam v historii.

## Co posuzuje stroj a co člověk

| Stroj | Člověk |
|---|---|
| Chybějící pole, rozbité vazby | Sahá tvrzení dál než doklad? |
| Stav vs. struktura zdrojů | Neposunulo zkrácení citace význam? |
| Parita tabulky se záznamy | Nejsou dva zdroje týž informátor? |
| Odkazy, metadata, exporty | Je ten osobní údaj přiměřený? |
| Pokrytí archivace | Projde subjekt testem veřejného zájmu? |

Pravý sloupec je důvod, proč se nepublikuje automaticky. Zelená brána
znamená, že v příspěvku nejsou chyby, které jde najít strojem — nic víc.

{% <callout kind="pravidlo" title="Nikdo nepublikuje sám sobě"> %}
Každé povýšení do veřejných dat je přezkoumatelný rozdíl, který schvaluje
někdo další. Dávkové schválení souvislé skupiny záznamů je v pořádku;
tiché sloučení z automatického běhu ne.

Platí to i pro automatizaci: smí objevovat, normalizovat a připravovat
kandidáty — nesmí commitnout, pushnout ani nasadit.
{% </callout> %}

## Vrácení není odmítnutí

**Vrácení k doplnění** znamená, že příspěvek je použitelný, ale něco
chybí — typicky pole o původu zdroje nebo doslovný obsah dokladu.

**Odmítnutí** má čtyři důvody a všechny jsou věcné: zdroj nebyl otevřen,
tvrzení říká víc než doklad, je to mimo rozsah, nebo je tam nepřiměřený
osobní údaj. U žádného se nevyjednává o míře — buď se to opraví, nebo to
nejde ven.

{% <kontrola otazka="Váš příspěvek leží týden bez reakce. Co s tím?"> %}
Připomenout se je v pořádku. Užitečnější je ale zkontrolovat, jestli není
příčina na straně příspěvku.

Tři nejčastější důvody, proč něco leží:

1. **Chybí něco, bez čeho to nejde posoudit** — typicky doslovný obsah
   dokladu nebo původ zdroje. Recenzent by musel dělat vaši práci znovu,
   a to odkládá.
2. **Je v tom víc témat najednou.** Návrh se schvaluje jako celek; jedno
   sporné tvrzení blokuje pět nesporných.
3. **Je to rozhodnutí o rozsahu**, ne příspěvek k obsahu. Ta rozhodnutí
   jsou pomalejší záměrně.

Nejrychlejší způsob, jak návrh odblokovat, je doplnit pole „co přesně
zdroj dokládá“ a „odkud materiál pochází“. Ušetří to kolečko otázek a
odpovědí, které jinak trvá dýl než samotné posouzení.
{% </kontrola> %}
