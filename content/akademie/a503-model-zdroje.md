+++
title = "A503 — Model zdroje"
description = "Záznam zdroje včetně pole sourceFamily a povinné redakční poznámky — jediné ručně psané části, která rozhoduje o použitelnosti."
template = "learning-lesson.html"
weight = 1503

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A503"
level = "data"
estimated_minutes = 11
audience = ["vyvojar", "maintainer", "editor"]
objectives = [
  "Popíšete povinná pole záznamu zdroje včetně obou dat.",
  "Vysvětlíte, jak sourceFamily vstupuje do výpočtu nezávislosti.",
  "Napíšete redakční poznámku, která splní minimální délku i smysl.",
]
prerequisites = ["A502"]
related_kb = ["koncepty/registr-zdroju.md", "koncepty/nezavisle-dolozeni.md"]
next = "A504"
+++

```json
{
  "@id": "https://vomaste.cz/id/dossiers/adam-vojtech/sources/SRC-01",
  "@type": "vomaste:Source",
  "recordType": "source",
  "identifier": "SRC-01",
  "outlet": "Vláda České republiky (vlada.gov.cz)",
  "sourceType": "oficiální primární zdroj",
  "url": "https://vlada.gov.cz/cz/vlada/clenove-vlady/",
  "retrieved": "2026-07-30",
  "claims": [
    { "@id": "https://vomaste.cz/id/dossiers/adam-vojtech/claims/CLM-01" }
  ],
  "subjects": ["vojtech"],
  "content": [{ "type": "markdown", "value": "…redakční poznámka…" }]
}
```

## `sourceFamily`

Pojmenovává se podle **původu materiálu**, ne podle vydavatele. Agenturní
zpráva přetištěná pěti deníky má rodinu té agentury.

Vstupuje do výpočtu nezávislosti, ale jen jedním směrem: **může
nezávislost odebrat, nikdy ji nepřidá.** Dva zdroje se stejným vydavatelem
zůstanou jedním hlasem, i kdyby měly rodiny různé — nezávislost se
posuzuje podle rodiny **i** podle registrované domény.

Prakticky z toho plyne i to, jak se zapisuje „rodinu neznám": pole se
**vynechá**. Prázdný řetězec schéma odmítne — znamenal by přesně totéž co
chybějící klíč a jen svádí k tomu, aby se ty dva stavy rozlišovaly. Dvě
evidenční šablony to kdysi dělaly a podhodnocovaly tím počet nezávislých
rodin. Chybějící rodina přitom není bezpečná mezera: neznamená
nezávislost, znamená neposouzeno.

## Redakční poznámka je povinná

Tělo záznamu (`content`) je **jediná ručně psaná část** a validátor
požaduje minimální délku. Není to formalita — je to shrnutí toho, co se
z otevření zdroje dozvěděl člověk, který ho otevřel.

Dobrá poznámka odpovídá na tři věci:

1. **Co zdroj dokládá** — doslova, ne parafrází tvrzení.
2. **Jak je nezávislý** — vlastní zjištění, přetisk, primární dokument.
3. **Kde má hranice** — co z něj naopak neplyne.

{% <callout kind="priklad" title="Poznámka, která ušetří hodinu"> %}
*„Primární úřední záznam — dokládá existenci a formulaci úředního údaje,
ne nezávislé redakční posouzení. Profilová stránka téhož webu je
k datu otevření zastaralá (uvádí dřívější funkce), proto je zdrojem
tvrzení seznam členů vlády, ne profil. Sebeprezentační části profilu
dossier jako fakt nepřebírá.“*

Tohle je zápis chyby, na kterou by jinak najel každý další člověk.
{% </callout> %}

{% <kontrola otazka="Zdroj je novinový článek. Jaká data patří do `retrieved` a jak se liší od data vydání?"> %}
`retrieved` je den, kdy jste zdroj **otevřeli a viděli v něm to, co
tvrdíte**. Datum vydání je den, kdy text vyšel.

Odpovídají na dvě různé otázky:

- **Datum vydání** říká, k jakému okamžiku se výpověď vztahuje. Tříletý
  článek o „probíhajícím vyšetřování“ nic neříká o výsledku.
- **`retrieved`** říká, kdy někdo naposledy ověřil, že tam ten obsah pořád
  je. Bez něj nejde říct, jestli obsah někdy existoval, když dnes chybí.

Dvě pravidla, která se porušují nejčastěji:

1. **`retrieved` není den zápisu.** Když přebíráte odkaz z cizí rešerše,
   je to den, kdy jste ho otevřeli **vy**.
2. **Nesmí se aktualizovat automaticky.** Posunout datum bez skutečného
   otevření znamená tvrdit o vlastní práci něco, co se nestalo — a
   protože kontrola dostupnosti je jediné, co drží doklady naživu, je to
   nepravda, která se projeví až ve chvíli, kdy je pozdě.
{% </kontrola> %}
