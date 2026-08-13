+++
title = "Start"
description = "Nikdy jste o vomaste.cz neslyšeli? Tady začněte. Za pět minut budete umět přečíst dossier, poznat, čemu se dá věřit, a hlavně kde jsou hranice toho, co web tvrdí."
template = "learning-section.html"
sort_by = "weight"

[extra]
lang = "cs"
seo_type = "CollectionPage"
record_type = "learningIndex"
section = "start"
footer_link = "@/bootcamp/_index.md"
footer_label = "Bootcamp — procvičit si to na příkladech"
+++

Tahle stránka nepředpokládá vůbec nic. Nemusíte vědět, co je dossier, co je
Git ani co znamená JSON. Nemusíte znát jediné jméno z těch, o kterých web
píše.

## Nejjednodušší možný popis

Někdo něco veřejně tvrdí — politik, úřad, novinář, soud.

vomaste.cz se **neptá „věříme tomu?“**. Na to nemá právo a ani se o to
nepokouší. Ptá se na šest jiných věcí:

- Kdo to tvrdí?
- Kde to bylo zveřejněné?
- Kdy?
- Co přesně ten zdroj říká — a co už ne?
- Potvrzuje to nezávisle ještě někdo jiný?
- **Co pořád nevíme?**

Odpovědi na těchhle šest otázek se dají uložit, očíslovat, zveřejnit
a zkontrolovat. Odpověď na otázku „je to pravda?“ ne. Proto tenhle web
sbírá to první a to druhé nechává na vás.

## Tři pojmy a jste doma

Celá stavba stojí na třech věcech. Zbytek jsou detaily.

```text
TVRZENÍ        co se tvrdí
   │
   ├── ZDROJ   odkud to víme
   ├── ZDROJ   a jestli je to druhý
   │           nezávislý hlas
   │
   └── MEZERA  co pořád nevíme
```

Až budete na webu, uvidíte u nich zkratky **CLM**, **SRC** a **GAP**
s číslem — `CLM-01`, `SRC-12`. Je to jen adresa, aby se dalo na konkrétní
tvrzení odkázat. Nic víc za tím nehledejte.

## Co tenhle web nedělá

Tohle je stejně důležité jako to, co dělá — a je to lepší vědět hned:

- **Nerozhoduje o vině.** To umí soud, ne web.
- **Neříká vám, co si máte myslet.** Dá vám podklady a zdroj, ať si to
  přečtete sami.
- **Netvrdí, že je úplný.** Co se nepodařilo doložit, je vypsané jako
  otevřená mezera — ne zamlčené.
- **Není to blog ani anketa.** Nikdo sem nepřidá obvinění, protože ho
  „někde četl“.

## Kudy dál

Když máte pět minut, projděte si [průvodce čtením dossieru](@/start/pet-minut.md).
Když chcete rovnou vědět, co které barevné označení u tvrzení znamená,
začněte [Jak číst dossier](@/start/jak-cist-dossier.md).

### Chci jen rozumět

[Bootcamp](@/bootcamp/_index.md) je nejkratší cesta k tomu, umět dossier
přečíst a nenechat se zmást stavem, který znamená něco jiného, než
vypadá. [Akademie](@/akademie/_index.md) jde do hloubky, [příručka](@/prirucka/_index.md)
odpovídá na konkrétní otázky.

### Chci přispět

[Jak přispět](@/prispet/_index.md) rozlišuje šest cest podle toho, co
umíte a kolik času máte — od nahlášení chyby po programování.

### Chci pracovat s repozitářem přes Claude Code

Projekt má vlastní vrstvu schopností pro Claude Code: rozcestník, který
zjistí, co chcete udělat, diagnostiku prostředí, ověřování zdrojů,
redakční review a bránu kvality. Nemusíte znát jejich názvy ani strukturu
repozitáře.

Začátek je jeden příkaz v adresáři repozitáře:

{% <prikaz kind="terminal"> %}
claude
{% </prikaz> %}

a potom:

{% <prikaz kind="claude" note="Ověří prostředí. Nic nemění."> %}
/diagnose
{% </prikaz> %}

{% <prikaz kind="claude" note="Určí roli a skončí konkrétním prvním úkolem."> %}
/bootstrap
{% </prikaz> %}

Podrobně: [Jak začít s Claude Code](@/prirucka/jak-zacit-s-claude-code.md).
Praktické úkoly jsou v [Bootcampu](@/bootcamp/_index.md), teorie
v [Akademii](@/akademie/_index.md), úplný seznam schopností
v [katalogu příkazů](@/dokumentace/prikazy/_index.md).

**Jedna věc předem:** Claude Code v tomhle projektu není zdroj a nemůže
rozhodnout, o kom se smí psát. Je to navigátor a kontrolor uvnitř
pravidel, která si projekt určil sám.
