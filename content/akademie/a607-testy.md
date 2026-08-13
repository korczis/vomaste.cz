+++
title = "A607 — Testy"
description = "Tři úrovně testů, každá na něco jiného: čisté funkce v Node, shellový guard nad git hooky a chování v prohlížeči. Co který typ pokrývá a co nepokrývá ani jeden."
template = "learning-lesson.html"
weight = 1607

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A607"
level = "engineering"
estimated_minutes = 10
audience = ["vyvojar", "maintainer"]
objectives = [
  "Vyberete správnou úroveň testu podle toho, co ověřujete.",
  "Napíšete test, který selže z jednoho konkrétního důvodu.",
  "Poznáte, co testy principiálně nepokrývají.",
]
prerequisites = ["A606"]
related_kb = ["koncepty/prubezne-overovani.md"]
next = "A608"
+++

## Tři úrovně

**Node testy** (`npm test`) — čisté funkce: validátory, generátory,
parsery, výpočty. Běží uvnitř kanonické brány, takže se nedají obejít.

**Test hooků** (`npm run test:hooks`) — shellový test nad guardem, který
rozhoduje, jestli se commit na hlavní větvi sám nasadí. Do předchozí
úrovně se nevejde technicky: guard je shell, a spouštěč Node testů čte
jen soubory Node. Běží v bráně **i** v rychlém režimu, protože si staví
vlastní dočasné repozitáře a nesahá na síť.

**Prohlížečové testy** (`npm run test:e2e`) — chování nad hotovým
`public/`: interakce, přístupnost, chování na mobilním viewportu. Běží
**mimo** bránu, jako samostatný krok — potřebují sestavený web a
prodlužovaly by každý commit, který se HTML netýká.

## Co ověřuje která

| Otázka | Úroveň |
|---|---|
| Spočítá se hloubka grafu správně? | Node |
| Odmítne validátor stav bez nezávislé dvojice? | Node |
| Nasadí se merge na hlavní větvi sám? | hook |
| Zůstane commit lokální uprostřed rozdělané operace? | hook |
| Přeteče tabulka na mobilu do strany? | prohlížeč |
| Hlásí řadicí tlačítko stav čtečce obrazovky? | prohlížeč |
| Nemá stránka vážné porušení přístupnosti? | prohlížeč |

Přístupnostní kontrola se nepouští na ručně sepsaný seznam stránek — typy
stránek se **odvozují z dat**, aby se nový typ zařadil sám. Kdyby se
odvozování rozbilo, sada by prošla s nulou testů a vypadala zeleně; proto
je součástí i kontrola, že seznam není prázdný ani zkrácený.

Blokující hook potřebuje čtyři případy, ne jeden: **povolený**,
**zablokovaný**, **hraniční** a **selhání samotného hooku**. Poslední se
vynechává nejčastěji a je nejdražší — hook, který spadne na vlastní chybě,
umí zablokovat celý repozitář. U guardu nasazení mají obě chyby svou cenu:
přísný navíc znamená, že si někdo myslí, že nasadil, a nenasadil; volný
navíc zveřejní něco, co nikdo zveřejnit nechtěl.

{% <callout kind="pravidlo" title="Test, který nikdy nespadl, obvykle nic netestuje"> %}
Než test odevzdáte, rozbijte to, co má hlídat, a ověřte, že spadne — a že
z hlášky poznáte proč. Test, který projde za všech okolností, je horší než
žádný: dělá dojem pokrytí.
{% </callout> %}

{% <callout kind="varovani" title="Co nepokrývá ani jedna úroveň"> %}
Že tvrzení sahá dál než doklad. Že zkrácená citace posunula význam. Že je
osobní údaj nepřiměřený. Že dvě redakce měly téhož informátora.

Na to je člověk a redakční kontrola. Zelené testy neříkají, že je obsah
v pořádku.
{% </callout> %}

{% <kontrola otazka="Opravujete chybu ve validátoru. V jakém pořadí psát test a opravu?"> %}
Test první — a musí **spadnout** dřív, než sáhnete na opravu.

Když napíšete opravu první, nemáte jak zjistit, jestli test opravdu
pokrývá tu chybu, nebo jestli by prošel i bez ní. Padající test je jediný
důkaz, že měří to, co si myslíte.

Postup:

1. Napsat test reprodukující chybu.
2. Ověřit, že padá — a že hláška popisuje skutečný problém.
3. Opravit.
4. Ověřit, že prochází.
5. Pustit celou sadu, ne jen ten jeden test.

Pátý bod je nejčastěji vynechaný. Oprava validátoru běžně rozbije jiný
test, který se opíral o původní chování — a to je informace, ne obtíž.
{% </kontrola> %}
