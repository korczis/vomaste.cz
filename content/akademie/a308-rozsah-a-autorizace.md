+++
title = "A308 — Rozsah a autorizace"
description = "Test veřejného zájmu se dělá na uzlu, ne na kauze kolem něj. Devět publikačních bran a co znamená, že objevování je volné a publikování ne."
template = "learning-lesson.html"
weight = 1308

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A308"
level = "editorial"
estimated_minutes = 14
audience = ["editor", "research", "maintainer"]
objectives = [
  "Aplikujete test veřejného zájmu na konkrétní osobu, ne na téma.",
  "Vyjmenujete publikační brány, kterými musí projít každý záznam.",
  "Rozliší se vám objevení vazby od publikace tvrzení.",
]
prerequisites = ["A307"]
related_kb = ["koncepty/autorizace.md", "koncepty/tretiosoby.md", "koncepty/bezpecnostni-hranice.md"]
next = "A309"
+++

## Dvě různé věci

**Objevování** — zaznamenat, že vazba existuje v registru nebo v už
citovaném zdroji — je volné. Vzniká z toho kontextová entita bez jediného
tvrzení.

**Publikování tvrzení o někom** a **otevření dossieru** je publikační akt.
Ten se řídí testem veřejného zájmu.

Když si nejste jisti, ve které z těch dvou činností jste, jste ve druhé.

## Test veřejného zájmu

Dělá se **na tom uzlu**, ne na kauze kolem něj. Ptá se:

- Jde o **veřejnou funkci, veřejné peníze, veřejnou moc** nebo regulovanou
  činnost?
- Je zásah **přiměřený** tomu, co se tím zjistí?
- Existuje **méně invazivní alternativa** — třeba nechat osobu jako
  kontext?

„Už to někde na internetu je“ není odůvodnění. „Je to zajímavé“ taky ne.

{% <callout kind="pravidlo" title="Rekurze má zastavovací podmínku"> %}
Z pokrytého subjektu se dá jít po doložených vazbách dál a povýšit
objevený uzel na samostatný subjekt. Zastavuje to test veřejného zájmu:
**subjektem se stává jen uzel, který jím projde sám o sobě.**

Soukromé osoby, jmenovci a třetí strany zůstávají kontextem. Rekurze mění,
koho lze zpracovat — nikoli co lze publikovat.
{% </callout> %}

## Publikační brány

Záznam smí do veřejných dat, jen když projde všemi:

1. **Jmenovaný doklad** — konkrétní, otevřený a přečtený. Ne výtah
   z vyhledávače, ne výstup nástroje.
2. **Provenance** — odkud, kdy, jakou transformací, co to podpírá.
3. **Věrný stav** — citace zůstane citací, obvinění obviněním, procesní
   výsledek procesním výsledkem.
4. **Žádná vina z grafu** — vazba sama nezakládá vliv ani odpovědnost.
5. **Nezávislost zdrojů** — přetisky nejsou potvrzení.
6. **Minimalizace údajů** — data narození, adresy a soukromé detaily ne.
7. **Přiměřenost vůči třetím osobám** — kontext ano, subjekt ne
   automaticky.
8. **Přezkoumatelná změna** — každé povýšení je viditelný rozdíl. Dávkový
   review je v pořádku, tiché publikování z automatického běhu ne.
9. **Deterministický build** — web se musí postavit z dat v repozitáři,
   bez externí platformy, přihlašovacích údajů a bez sítě.

{% <kontrola otazka="Automatický běh najde deset firem navázaných na pokrytý subjekt a připraví návrhy záznamů. Co se s nimi smí stát?"> %}
Smí vzniknout **kandidátní záznamy** a smí se normalizovat, deduplikovat
a připravit k revizi. Objevování je volné.

Nesmí se **tiše sloučit do kanonických veřejných dat, commitnout,
pushnout ani nasadit**. Mezi kandidátem a publikací stojí člověk, který
vidí rozdíl a schvaluje ho — to je brána číslo 8 a jediné, co odděluje
automatizovaný objev od publikovaného tvrzení.

Konkrétně u těch deseti firem: jako **kontextové entity** (vazba
z rejstříku, žádné tvrzení) projdou po revizi bez problému. Kdyby některá
měla dostat vlastní dossier nebo tvrzení, musí projít testem veřejného
zájmu sama za sebe.

A ještě jedna věc: že vazbu našel nástroj, se nikdy nepublikuje jako
doklad. Cituje se **ten rejstřík**, na který nástroj ukázal.
{% </kontrola> %}
