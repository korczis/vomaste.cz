+++
title = "A705 — Nekompatibilní změny"
description = "Adresa záznamu je závazek vůči každému, kdo na ni odkázal. Jak měnit strukturu webu, aniž byste rozbili cizí odkazy."
template = "learning-lesson.html"
weight = 1705

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A705"
level = "governance"
estimated_minutes = 10
audience = ["maintainer", "vyvojar"]
objectives = [
  "Zachováte staré adresy při přesunu záznamu.",
  "Vyjmenujete, co je vůči vnějšku závazek a co ne.",
  "Rozliší se vám změna struktury od změny obsahu.",
]
prerequisites = ["A704"]
related_kb = ["koncepty/verzovano-v-gitu.md", "koncepty/forkovatelnost.md"]
next = "A706"
+++

## Co je závazek vůči vnějšku

**Adresy stránek.** Někdo na ně odkázal v článku, v poznámkách, ve
zprávě. Rozbitý odkaz na doklad je věcná škoda, ne kosmetická.

**Kotvy uvnitř stránek.** Odkaz na konkrétní tvrzení míří na `id`
v dokumentu.

**Strojové exporty.** Tvar dat pod `/data/` a lokální kontext.

**Identita záznamů.** Globální `@id` je identita; když se změní, je to
z pohledu strojů jiný záznam.

Naproti tomu vzhled, vnitřní struktura šablon, názvy skriptů ani formát
generovaných výstupů závazek nejsou.

## Jak přesunout záznam

Aliasy jsou **kanonická data**: dossier i entita nesou seznam starých
adres a ten se promítne do přesměrování ve vydaném webu.

Navíc: přesměrovací stránka přenáší i **kotvu** z původní adresy, takže
odkaz na konkrétní tvrzení skončí na tom tvrzení, ne na začátku stránky.

{% <callout kind="pravidlo" title="Historická adresa přebíjí čistotu struktury"> %}
Když je na výběr mezi hezčí strukturou a zachováním adres, vyhrávají
adresy.

Reálný příklad z historie projektu: při rozdělení sdíleného dossieru na
dva samostatné by bylo „čistší“ přesunout záznamy na neutrální místo. Byly
by tím ale rozbité všechny existující odkazy — takže záznamy zůstaly, kde
byly, a čistota se vyřešila jinak. Dodnes je to v pravidlech popsané jako
vědomý kompromis, ne jako nedodělek.
{% </callout> %}

{% <kontrola otazka="Přejmenováváte dossier ze `stary-slug` na `novy-slug`. Co všechno musíte udělat, aby se nic nerozbilo?"> %}
Čtyři věci, a třetí se zapomíná:

1. **Přejmenovat kanonický adresář** a upravit `@id` všech záznamů uvnitř
   — cesta a `@id` musí souhlasit, hlídá to referenční integrita.
2. **Přidat starý slug mezi aliasy**, aby staré adresy přesměrovávaly.
3. **Projít odkazy uvnitř obsahu.** Vnitřní odkazy na `@/dossiers/…`
   nejsou aliasy pokryté — ověří je až kontrola odkazů při sestavení.
4. **Přegenerovat** a pustit plnou bránu.

Co se z toho **nedá vzít zpět**: změna `@id` znamená, že strojoví
konzumenti vidí jiný záznam. Pro identitu záznamu neexistuje obdoba
přesměrování.

Proto se slug volí opatrně už při zakládání — a proto to není změna, která
by se dělala kvůli lepšímu znění.
{% </kontrola> %}
