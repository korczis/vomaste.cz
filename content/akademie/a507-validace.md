+++
title = "A507 — Vrstvy validace"
description = "Pět vrstev kontrol, každá s jedním vlastníkem: tvar, referenční integrita, redakční sémantika, parita tabulky a expanze JSON-LD."
template = "learning-lesson.html"
weight = 1507

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A507"
level = "data"
estimated_minutes = 12
audience = ["vyvojar", "maintainer"]
objectives = [
  "Přiřadíte typ chyby ke správné vrstvě validace.",
  "Vysvětlíte, proč má každé pravidlo právě jednoho vlastníka.",
  "Poznáte, co validace principiálně nezachytí.",
]
prerequisites = ["A506"]
related_kb = ["koncepty/zdrojovano.md", "koncepty/nezavisle-dolozeni.md"]
next = "A508"
+++

Kontroly kanonických dat jsou rozdělené do vrstev a **každé pravidlo má
právě jednoho vlastníka**. Kdyby stejnou věc hlídaly dvě vrstvy, jedna by
se při změně opravila a druhá ne.

| Vrstva | Co hlídá |
|---|---|
| **Tvar** | typy, povinná pole, formáty `@id` a dat, uzavřené číselníky |
| **Referenční integrita** | unikátní `@id`, soulad cesty s `@id`, odkazy v rámci dossieru, obousměrná vazba tvrzení ↔ zdroj |
| **Redakční sémantika** | pravidla stavů, autorizace, subjektové uzly grafu, souvislost, jeden vydavatel = jeden hlas |
| **Parita tabulky** | řádek přehledu vs. kanonický záznam, byte na byte, 1:1 v obou směrech |
| **Expanze JSON-LD** | dokument se rozbalí proti lokálnímu kontextu, bez sítě |

Všechno spouští jeden příkaz:

```bash
npm run data:validate
```

Pro rychlou smyčku nad jedním záznamem během psaní:

```bash
npm run data:validate -- --file data/dossiers/<slug>/claims/clm-NN.json
```

## Dvě sémantická pravidla, která stojí za pozornost

**Stav vs. struktura zdrojů.** Stav „ověřeno více zdroji“ neprojde bez
dvojice lišící se rodinou **i** registrovanou doménou vydavatele. A
naopak: stav „1 zdroj“ neprojde, když taková dvojice existuje. Chybu tedy
nejde udělat ani jedním směrem.

**Jeden vydavatel = jeden hlas.** Porovnává se `outlet` i doména `url`.
Dva texty téže redakce nezaloží nezávislost, ať mají rodiny jakékoli.

Úplné znění všech pravidel — sémantiky, referenční integrity, parity
tabulky i expanze JSON-LD — je generované přímo z modulů, které je
vynucují: [/pravidla/](@/pravidla/_index.md). Tahle lekce vysvětluje, proč
jsou vrstvy rozdělené; ta stránka je závazný výčet.

{% <callout kind="varovani" title="Co validace principiálně nezachytí"> %}
Posun významu ve zkrácené citaci. Dvě redakce s týmž anonymním
informátorem. Nepřiměřený osobní údaj. Tvrzení, které sahá dál než doklad.
Špatně vyplněnou rodinu zdroje.

Všechno to jsou posouzení obsahu, ne struktury. **Zelená brána proto
neznamená, že je záznam v pořádku** — znamená, že v něm nejsou chyby,
které jde najít strojem.
{% </callout> %}

{% <kontrola otazka="Build spadne na tom, že text tvrzení neodpovídá řádku v tabulce. Která vrstva to hlásí a co je nejspíš příčina?"> %}
Hlásí to **parita tabulky** — a příčina je skoro vždycky stejná: změna se
udělala na jednom ze dvou míst.

Tvrzení je jediný záznam v celém modelu, který má **dvě ručně udržované
reprezentace**: kanonický JSON a řádek přehledové tabulky v `dossier.json`.
Obě se editují ručně a obě musí souhlasit v textu, stavu, popisku i
seznamu zdrojů — a množiny si musí odpovídat 1:1 v obou směrech.

Oprava je mechanická: srovnat obě místa a spustit `npm run data:build`.

Za pozornost stojí, proč to takhle je. Bylo by snadné tabulku generovat a
brány se zbavit. Zůstává ručně psaná schválně, protože je to to, co editor
opravdu edituje spolu se záznamy — a brána zaručuje, že se ty dvě věci
nemůžou rozejít potichu. Cena je tenhle občasný pád buildu; alternativou
by byl čtenář, který vidí v tabulce jiné znění než na stránce tvrzení.
{% </kontrola> %}
