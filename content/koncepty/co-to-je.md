+++
title = "Co vomaste.cz je"
description = "Open-source systém komunitní veřejné inteligence: strukturované, verzované registry kauz s auditovatelnou vazbou na zdroje — a forkovatelný toolkit, ne uzavřená redakce."
template = "concept.html"
weight = 410

[extra]
lang = "cs"
seo_type = "WebPage"
group = "identita"
tile_title = "Je to"
tile_accent = true
bullets = [
  "Open-source systém komunitní veřejné inteligence: strukturované registry kauz s auditovatelnou vazbou na zdroje, verzované v Gitu — veřejná data se nikdy nemění potichu.",
  "Web, který výslovně rozlišuje ověřený fakt, jednozdrojové tvrzení, citaci, sporné tvrzení a autorský názor.",
  "Přehled, který otevřeně přiznává, co zůstává nedořešené nebo nedohledané — a procesní výsledek nikdy nevydává za rozhodnutí o vině.",
  "Forkovatelný toolkit — kdokoli může převzít datový model, validátory i šablony a postavit vlastní, řádně autorizovaný dossier (kód i původní obsah jsou public domain).",
]
+++

## Systém, ne článek

Základní jednotkou tady není text, ale záznam:
[tvrzení](@/koncepty/registr-tvrzeni.md), [zdroj](@/koncepty/registr-zdroju.md),
[kauza](@/koncepty/registr-kauz.md), [mezera](@/koncepty/registr-mezer.md),
entita a vztah. Každý má vlastní ID, vlastní stránku a vlastní URL. Text kolem
je jen čitelný pohled na tahle data — když se rozejde s daty, build spadne.

## Rozlišené stavy místo jednoho „fakt"

Doložený fakt, jednozdrojová informace, citace, sporné tvrzení a autorský
komentář jsou pět různých věcí s pěti různými, viditelnými stavy. Slévat je do
jednoho je nejběžnější způsob, jak se z nepodloženého obvinění stane „veřejně
známá věc".

## Přiznané mezery

Registr otevřených otázek je součást obsahu, ne omluva na konci stránky.
Přehled, který ukazuje jen doložené, působí úplněji, než je.

## Fork jako pojistka

Kód, tooling i původní obsah jsou [public domain](@/koncepty/public-domain.md).
Kdo nesouhlasí s výběrem témat nebo s hodnocením, si má systém odnést a
postavit vlastní — ne přesvědčovat autora.

Co tenhle web naopak není, je popsané zvlášť:
[co vomaste.cz není](@/koncepty/co-to-neni.md).

## Jak si to ověřit za tři minuty

Nemusíte věřit ani téhle stránce. Zkuste tohle:

1. Otevřete libovolné tvrzení a klikněte na jeho zdroj — dostanete se
   na původní článek, ne na další stránku tohohle webu.
2. V patičce té stránky dejte „historie změn" — uvidíte, kdy vznikla a co
   se v ní kdy změnilo.
3. Na [/data/](@/data/_index.md) si spusťte `SELECT status_label,
   count(*) FROM claims GROUP BY 1` a porovnejte s čísly, která web sám
   ukazuje.

Když některý z těch tří kroků nevyjde, je to vada — a dá se nahlásit.

## Pro koho to je

Pro čtenáře, kterému nestačí „bylo to v médiích", a pro novináře nebo
výzkumníka, který potřebuje strukturovaný přehled s dohledatelnými zdroji
místo dvaceti otevřených záložek. A pro kohokoli, kdo chce ten aparát
použít na vlastní téma — proto je celý
[public domain](@/koncepty/public-domain.md).

## Co z toho plyne pro čtení

Že se tenhle web nedá číst jako článek se závěrem. Nemá pointu; má
registry, stavy a mezery. Kdo hledá verdikt, nenajde ho — kdo hledá, co je
čím doloženo, dostane to i s tím, co doloženo není.
