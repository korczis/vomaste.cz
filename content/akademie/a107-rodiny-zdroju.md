+++
title = "A107 — Rodiny zdrojů"
description = "Rodina se pojmenovává podle původu materiálu, ne podle vydavatele. Jak se určuje, co z ní plyne pro nezávislost a proč může jen ubírat."
template = "learning-lesson.html"
weight = 1107

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A107"
level = "foundations"
estimated_minutes = 11
audience = ["zdroje", "research", "editor"]
objectives = [
  "Určíte rodinu zdroje podle původu materiálu, ne podle hlavičky.",
  "Vysvětlíte, proč rodina může nezávislost jen ubrat, nikdy přidat.",
  "Najdete v textu stopy převzetí.",
]
prerequisites = ["A106"]
related_kb = ["koncepty/nezavisle-dolozeni.md", "koncepty/stav-overeno-vice-zdroji.md"]
next = "A108"
+++

Rodina zdrojů je skupina textů se **společným původem**. Pojmenovává se
podle toho, odkud materiál pochází — ne podle toho, kdo ho vydal.

Agenturní zpráva přetištěná pěti deníky patří do rodiny té agentury, i
když má pět různých hlaviček a pět různých URL.

## Dvě nezávislé osy

Nezávislost se posuzuje dvěma způsoby zároveň a **oba musí sedět**:

1. **Rodina** — mají texty společný původ?
2. **Vydavatel** — vyšly pod stejnou registrovanou doménou?

Dva texty téže redakce jsou jeden hlas, i kdyby měly různé autory a různý
původ. Když se redakce splete, opraví se to uvnitř jednoho domu jen těžko
— a právě proti tomu má nezávislé potvrzení chránit.

{% <callout kind="pravidlo" title="Rodina umí jen ubírat"> %}
Deklarovaná rodina může nezávislost **odebrat** (spojí texty, které by
jinak vypadaly odděleně), ale nikdy ji nepřidá. Dva zdroje se stejným
vydavatelem zůstanou jedním hlasem, i kdyby měly rodiny různé.

Prakticky: neuvedená rodina není bezpečná mezera. Chybějící údaj znamená
jen, že nikdo původ nezjistil — ne že je zdroj nezávislý.
{% </callout> %}

## Jak původ zjistit

- **Kredit v patičce** — „Zdroj: ČTK“ a podobné.
- **Doslovně shodné pasáže** ve dvou článcích.
- **Formulace z tiskové zprávy**, včetně přívlastků a pořadí faktů.
- **Absence vlastních citací** — nikdo si nikoho nezavolal.
- **Publikováno v řádu minut** po jiném textu.
- **Strojová metadata** stránky, kde je občas původní autor uvedený.

## Typické rodiny

| Rodina | Co ji tvoří |
|---|---|
| agenturní | ČTK a přetisky |
| tisková zpráva | vyjádření instituce a texty z něj |
| vlastní zjištění redakce | jedna redakce, jedno vyšetřování |
| veřejný registr | primární záznam a výpisy z něj |
| úřední dokument | rozhodnutí, protokol, smlouva |

{% <kontrola otazka="Dvě redakce nezávisle na sobě dohledaly tutéž smlouvu v registru smluv a obě o ní napsaly. Jsou to dvě nezávislé linie, nebo jedna rodina „veřejný registr“?"> %}
Záleží na tom, co tvrdíte.

**O obsahu smlouvy** je to **jedna linie**: obě redakce se dívají do téhož
dokumentu. Kdyby byl chybně zapsaný, obě zopakují tutéž chybu. Doklad je
ta smlouva, a ta je jedna.

**O existenci a znění smlouvy** je situace lepší, ale nezajímavá — o tom
nejlépe vypovídá smlouva sama.

**O čemkoli, co redakce přidaly nad rámec dokumentu** — kontext, reakce,
srovnání — jsou to dvě nezávislé linie, protože každá dělala vlastní práci.

Odsud plyne obecné pravidlo: rodina se určuje **k tvrzení**, ne k článku.
Tentýž text může být jedním hlasem pro jedno tvrzení a nezávislým hlasem
pro jiné.
{% </kontrola> %}
