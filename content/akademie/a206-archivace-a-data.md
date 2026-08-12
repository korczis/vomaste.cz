+++
title = "A206 — Archivace a data pořízení"
description = "Odkazy umírají. Co dělat, aby doklad přežil zdroj, jak zaznamenat datum pořízení a kdy je archivace povinná."
template = "learning-lesson.html"
weight = 1206

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A206"
level = "research"
estimated_minutes = 10
audience = ["research", "editor", "vyvojar"]
objectives = [
  "Zaznamenáte u zdroje obě data a budete vědět, na co která odpovídají.",
  "Poznáte, kdy je nutné pořídit archivní kopii.",
  "Vysvětlíte, proč se úřední dokumenty nezveřejňují hromadně.",
]
prerequisites = ["A205"]
related_kb = ["koncepty/prubezne-overovani.md", "koncepty/primarni-dokumenty.md", "koncepty/bezpecnostni-hranice.md"]
next = "A207"
+++

Odkaz na zdroj je slib, že si to čtenář může ověřit. Slib, který weby
běžně poruší — reorganizací, placenou zdí nebo prostě zánikem.

## Dvě data u každého zdroje

- **Datum vydání** — k jakému okamžiku se výpověď vztahuje.
- **Datum pořízení** — kdy jste zdroj naposledy otevřeli a viděli v něm to,
  co tvrdíte.

Datum pořízení je to, co dělá z odkazu doklad. Bez něj nejde říct, jestli
tam ten obsah někdy vůbec byl, když dnes chybí.

{% <callout kind="varovani" title="Datum pořízení není datum zápisu"> %}
Když převezmete odkaz z cizí rešerše, datem pořízení je den, kdy jste ten
zdroj **otevřeli vy**. Opsat cizí datum znamená tvrdit o vlastní práci
něco, co jste neudělali.
{% </callout> %}

## Kdy pořídit archivní kopii

Vždycky u dokladů, které nese jen jedna adresa a jejichž zánik by tvrzení
odzdrojoval:

- **úřední dokumenty** (rozhodnutí, protokoly, smlouvy),
- **záznamy z registrů**, které se přepisují na místě,
- **stránky, které už jednou zmizely** nebo mají krátkou životnost,
- **cokoli, na čem stojí tvrzení s vážným dopadem** na konkrétního člověka.

U běžného zpravodajského článku je archivace vhodná, ne povinná.

## Co se nezveřejňuje

Tohle je místo, kde se archivace potkává s ochranou osobních údajů, a
projekt tu má tvrdé pravidlo: **pořídit ≠ publikovat.**

Archiv má dvě zóny. Veřejná nese jen základní identifikační údaje,
sanitizované indexy a jednotlivě prověřené dokumenty — u každého původní
adresa, datum pořízení a kontrolní součet. Neveřejná zóna, kam patří
originální listiny a surová metadata, **nikdy nevstupuje do repozitáře**
ani do jeho historie.

Hromadné publikování PDF „protože registr je veřejný“ je zakázané. Každý
zveřejněný dokument prochází individuální obsahovou a osobněprávní
kontrolou — už proto, že listiny běžně obsahují data narození a adresy
bydliště.

{% <kontrola otazka="Odkaz na zdroj, o který se opírá tvrzení, přestal fungovat. Co s tím tvrzením?"> %}
Nesmaže se a nezůstane beze změny. Postup:

1. **Ověřit, že je mrtvý doopravdy** — ne jen dočasný výpadek nebo
   blokace automatizovaného přístupu.
2. **Hledat archivní kopii** — vlastní, nebo veřejnou archivní službu.
3. **Když kopie je**, doplní se k záznamu s poznámkou, že originál je
   nedostupný, a s datem, kdy se to zjistilo.
4. **Když kopie není**, tvrzení přichází o doklad. Když je to jeho jediná
   opora, musí stav dolů; při ztrátě všech dokladů se tvrzení stahuje a
   otázka zůstává jako mezera.

Co se nesmí: nechat mrtvý odkaz u tvrzení, které se tváří jako doložené.
Čtenář pak nemá jak zjistit, že doklad neexistuje — a přesně to je ta
kontrolovatelnost, kterou celý projekt slibuje.
{% </kontrola> %}
