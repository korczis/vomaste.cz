+++
title = "Slovníček"
description = "Termíny, které web používá, vysvětlené jednou větou běžnou češtinou — s odkazem tam, kde je závazná definice."
template = "learning-lesson.html"
weight = 2601

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "prirucka"
category = "slovnicek"
estimated_minutes = 6
audience = ["ctenar", "zdroje", "research"]
+++

Jedna věta na termín. Kde je odkaz, je za ním podrobná stránka —
a ta je závazná, tohle je jen rychlá pomůcka.

## Základ

**Dossier** — všechno, co web o jednom subjektu doložil, rozdělené do
provázaných registrů. [Podrobně](@/koncepty/co-je-dossier.md)

**Tvrzení (CLM)** — jedna konkrétní věta o tom, co se stalo nebo co kdo
řekl. [Podrobně](@/koncepty/registr-tvrzeni.md)

**Zdroj (SRC)** — konkrétní publikovaný text nebo dokument, ze kterého to
víme. [Podrobně](@/koncepty/registr-zdroju.md)

**Mezera (GAP)** — otázka, na kterou dostupné zdroje neodpovídají.
[Podrobně](@/koncepty/registr-mezer.md)

**Kauza (CASE)** — sledovaný děj, do kterého tvrzení patří.
[Podrobně](@/koncepty/registr-kauz.md)

**Entita** — osoba, firma nebo instituce vedená jako záznam. Když nenese
žádné tvrzení, je to jen záznam vazby.

## Doklady

**Doložení** — že tvrzení opírá o konkrétní, jmenovaný a dohledatelný
zdroj. [Podrobně](@/koncepty/zdrojovano.md)

**Nezávislé potvrzení** — druhý zdroj, který nevychází z toho prvního.
Dvacet přetisků jedné zprávy je pořád jedno potvrzení.
[Podrobně](@/koncepty/nezavisle-dolozeni.md)

**Rodina zdrojů** — skupina textů se společným původem. Pojmenovává se
podle původu, ne podle vydavatele.

**Primární dokument** — smlouva, rozhodnutí, výpis z registru. Vznikl při
té věci, ne jako text o ní. [Podrobně](@/koncepty/primarni-dokumenty.md)

**Provenance** — odkud údaj přišel, kdy, čím prošel a co podpírá.

**Datum vydání** — kdy zdroj vyšel. **Datum pořízení** — kdy ho někdo
naposledy otevřel a viděl v něm to, co se tvrdí.

## Stavy

**Ověřeno více zdroji** — potvrzují to aspoň dvě nezávislé linie.
Neznamená „je to pravda“.
[Podrobně](@/koncepty/stav-overeno-vice-zdroji.md)

**1 zdroj** — doloženo, ale zatím jednou linií. Neznamená „pochybné“.
[Podrobně](@/koncepty/stav-jeden-zdroj.md)

**Citace** — tenhle výrok podle zdroje opravdu padl. Neznamená, že jeho
obsah platí. [Podrobně](@/koncepty/stav-citace.md)

**Sporné** — zdroje si odporují nebo věc není uzavřená. Neznamená „spíš
nepravda“. [Podrobně](@/koncepty/stav-sporne.md)

**Názor** — autorský komentář, vedený jako komentář.
[Podrobně](@/koncepty/stav-nazor.md)

## Rozsah a hranice

**Veřejný zájem** — důvod, proč o někom smí web psát: veřejná funkce,
veřejné peníze, veřejná moc, regulovaná činnost.

**Kontextová entita** — někdo, u koho je zaznamenáno, že vazba existuje,
ale web o něm netvrdí nic. [Podrobně](@/koncepty/tretiosoby.md)

**Autorizace** — zapsané rozhodnutí, koho a v jakém rozsahu web pokrývá.
[Podrobně](@/koncepty/autorizace.md)

**Procesní výsledek** — co se stalo s řízením (odloženo, promlčeno,
nepravomocné). Není to zjištění o skutku.
[Podrobně](@/koncepty/procesni-vysledek.md)

**Věcné zjištění** — závěr o tom, co se stalo. Dělá ho soud nebo jiný
orgán, ne tenhle web.

## Technické

**Kanonická data** — JSON záznamy, ze kterých se web generuje. Jediný
zdroj pravdy.

**Generovaný adaptér** — stránka vyrobená z dat. Ruční úprava se při
dalším sestavení přepíše.

**Brána** — `npm run build`. Sada kontrol, kterou musí projít každá změna.

**JSON-LD** — formát, díky kterému jsou data čitelná i strojově.
[Podrobně](@/koncepty/strojove-citelna-data.md)
