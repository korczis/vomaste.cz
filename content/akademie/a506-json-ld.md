+++
title = "A506 — JSON-LD a strojová vrstva"
description = "Každý záznam je zároveň platné JSON-LD. Co to znamená prakticky, kde je lokální kontext a proč data neobsahují hodnocení pravdivosti."
template = "learning-lesson.html"
weight = 1506

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A506"
level = "data"
estimated_minutes = 11
audience = ["vyvojar", "maintainer"]
objectives = [
  "Vysvětlíte, co dělá z kanonického záznamu platné JSON-LD.",
  "Najdete lokální kontext a víte, proč je verzovaný.",
  "Zdůvodníte, proč strukturovaná data neobsahují hodnocení pravdivosti.",
]
prerequisites = ["A505"]
related_kb = ["koncepty/strojove-citelna-data.md", "koncepty/forkovatelnost.md"]
next = "A507"
+++

Kanonické záznamy nejsou „JSON, ze kterého se pak dělá JSON-LD“. Jsou to
rovnou **platné JSON-LD dokumenty**: nesou `@context`, globální `@id` a
`@type`, vedle nichž stojí `recordType` a lokální `identifier` pro UI.

## Lokální kontext

`@context` ukazuje na `https://vomaste.cz/context/v1.jsonld`, který si
projekt hostuje sám. Dvě věci z toho plynou:

- **Expanze funguje bez sítě.** Validátor rozbaluje dokumenty proti
  lokální kopii, takže sestavení nezávisí na dostupnosti cizího serveru.
- **Kontext je verzovaný** (`v1`). Změna významu pole není tichá úprava,
  ale nová verze.

## Kde jsou strojová data k dispozici

Exporty pod `/data/` — tvrzení, zdroje, kauzy, mezery, vztahy, entity,
dossiery — plus JSON-LD grafy. Každá publikovaná stránka navíc nese vlastní
blok strukturovaných dat; kontroluje to samostatná brána po sestavení.

Co ta brána vyžaduje: aspoň jeden parsovatelný blok na každé stránce,
uzel tvrzení nesoucí přesně ty zdroje, které tvrzení deklaruje, citační
uzel na stránce zdroje a přepočitatelné otisky citací.

{% <callout kind="pravidlo" title="Žádné hodnocení pravdivosti ve strukturovaných datech"> %}
Slovník schema.org má značky pro ověřovací verdikty. Tenhle projekt je
**nepoužívá a brána je zakazuje**.

Důvod: stavy tady popisují **sílu doložení**, ne adjudikovanou pravdu.
Vydat „CORROBORATED“ jako strojově čitelný verdikt o pravdivosti by
tvrdilo něco, co web o sobě výslovně netvrdí — a stroje čtou doslovněji
než lidé.
{% </callout> %}

{% <kontrola otazka="Chcete přidat do záznamu tvrzení nové pole. Co všechno se musí změnit, aby to prošlo?"> %}
Tři místa, a musí souhlasit všechna:

1. **Kanonické schéma** (`schemas/canonical/claim.schema.json`). Schémata
   mají zakázané neznámé klíče, takže nové pole bez záznamu ve schématu
   shodí build hned. To je záměr — jinak by data tiše obsahovala cokoli.
2. **Sestavovač pohledových modelů**, aby se pole dostalo do vrstvy,
   ze které čtou šablony.
3. **Konzument** — šablona nebo export, který pole opravdu použije.

Pravidlo, které z toho plyne: **pole, které nikdo nečte, a pole v šabloně
bez pokrytí ve schématu jsou obojí nedodělaná změna.** Ne stylistická
výtka — datový kontrakt to takhle definuje.

A když nové pole mění význam existujících dat, je to i otázka verze
lokálního kontextu.
{% </kontrola> %}
