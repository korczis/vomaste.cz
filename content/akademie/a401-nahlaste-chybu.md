+++
title = "A401 — Nahlaste chybu"
description = "Nejcennější typ příspěvku a nejrychleji vyřízený. Které formuláře na co jsou a jak napsat hlášení, které se dá ověřit za dvě minuty."
template = "learning-lesson.html"
weight = 1401

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A401"
level = "contribution"
estimated_minutes = 8
audience = ["ctenar", "zdroje"]
objectives = [
  "Vyberete správný formulář podle typu chyby.",
  "Napíšete hlášení obsahující adresu, současný stav, správný stav a doklad.",
  "Budete vědět, co se s hlášením stane dál.",
]
related_kb = ["koncepty/pravo-opravit.md", "koncepty/prubezne-overovani.md"]
next = "A402"
+++

Oprava je nejužitečnější příspěvek, jaký může přijít zvenčí — a jediný,
který nikdo uvnitř projektu neumí udělat sám, protože chybu nevidí.

## Které formuláře existují

Projekt používá GitHub Issue formuláře; prázdné issues jsou **záměrně
vypnuté**, aby žádný podnět neobešel povinná pole a upozornění na
veřejnost kanálu.

| Situace | Formulář |
|---|---|
| Chybný údaj, formulace nebo stav tvrzení | **Oprava faktu nebo stavu tvrzení** |
| Odkaz na zdroj nefunguje nebo se změnil | **Mrtvý či změněný zdroj** |
| Máte nový zdroj k existujícímu tvrzení | **Nový zdroj k existujícímu tvrzení** |
| Jste subjektem dossieru a chcete reagovat | **Reakce subjektu / právo na odpověď** |
| Navrhujete nový subjekt nebo entitu | **Navrhnout dossier nebo entitu** |

## Anatomie dobrého hlášení

Čtyři věci, a je hotovo:

1. **Adresa a identifikátor** — `SRC-12` a odkaz na stránku.
2. **Co je tam teď** — doslova.
3. **Co tam má být** — doslova.
4. **Doklad** — odkaz, kde je správná hodnota vidět.

{% <callout kind="protipriklad" title="Hlášení, které leží týden"> %}
*„Máte tam špatně datum u jednoho zdroje.“*

Někdo to musí dohledat. U dvou set dossierů to znamená, že se to odloží.
{% </callout> %}

{% <callout kind="priklad" title="Hlášení vyřízené za dvě minuty"> %}
*„Na /dossiers/…/sources/src-12/ je datum vydání 3. 5. 2026. Na originále
je 5. 3. 2026 — viz [odkaz]. Nejspíš prohozený den a měsíc.“*
{% </callout> %}

## Co se stane dál

Hlášení někdo přečte a ověří proti zdroji. Pokud sedí, změní se kanonická
data, projde to validací a buildem a zveřejní se. V historii repozitáře
zůstane dohledatelné, co se změnilo, kdy a proč.

Když hlášení nesedí, dozvíte se proč — a to je taky výsledek.

{% <callout kind="varovani" title="Kanál je veřejný a trvalý"> %}
Projekt **nemá** důvěrný kanál pro citlivé podněty a netvrdí, že ho má.
GitHub issue je veřejná a smazání ji nevymaže z historie. Neposílejte tam
nepublikovaný citlivý materiál ani nic, co by mohlo identifikovat zdroj.
{% </callout> %}

{% <kontrola otazka="Všimli jste si, že tvrzení má stav „ověřeno více zdroji“, ale oba jeho zdroje jsou přetisky téže agenturní zprávy. Jak to nahlásit?"> %}
Formulářem **Oprava faktu nebo stavu tvrzení** — je to chyba stavu, ne
zdroje.

Do hlášení patří:

- adresa a identifikátor tvrzení,
- oba zdroje s odkazy,
- **doklad společného původu**: kredit „Zdroj: ČTK“ v obou textech, nebo
  doslovně shodné pasáže (klidně je ocitujte),
- navrhovaný stav: **1 zdroj**.

Tohle je jeden z nejcennějších nálezů vůbec, protože je to chyba, kterou
validátor nemusí chytit — pozná ji podle deklarované rodiny zdrojů, a
když ji někdo vyplnil špatně nebo vůbec, projde to.

Jinými slovy: našli jste přesně to, na co stroj nestačí.
{% </kontrola> %}
