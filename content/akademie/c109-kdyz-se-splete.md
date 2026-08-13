+++
title = "C109 — Když se Claude splete"
description = "Typické chyby, jak je poznat dřív, než něco způsobí, a proč je normální je čekat."
template = "learning-lesson.html"
weight = 1809

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "C109"
level = "claude-code"
estimated_minutes = 8
audience = ["zdroje", "research", "editor", "vyvojar"]
objectives = [
  "Vyjmenujete typické druhy chyb a jejich příznaky.",
  "Ověříte tvrzení o příkazu nebo souboru dřív, než podle něj jednáte.",
  "Poznáte, kdy je „chyba“ ve skutečnosti nález.",
]
related_kb = ["koncepty/co-je-dossier.md"]
next = "C110"
+++

Claude Code se plete. Ne často a ne náhodně — plete se **předvídatelně**,
a to je dobrá zpráva: předvídatelnou chybu jde chytit.

## Šest typických chyb

**Vymyšlený soubor nebo příkaz.** Zní věrohodně, protože je poskládaný
podle konvencí projektu. `npm run validate:sources` vypadá jako
příkaz, který by tady měl být — a nemusí existovat.

*Jak chytit:* nechte to spustit, nebo se zeptejte, odkud to má. Katalog
příkazů je generovaný ze skutečnosti.

**Zastaralá informace.** Popíše stav, který platil, než se něco změnilo.

*Jak chytit:* zeptejte se, ze kterého souboru to má, a jestli ho otevřel.

**Přeskočený krok.** U dlouhého postupu vynechá kontrolu, která
nevypadá důležitě.

*Jak chytit:* poproste o výčet toho, co se udělalo, včetně toho, co se
záměrně nedělalo.

**Příliš sebejistá formulace.** „Tvrzení je doložené" místo „tvrzení
cituje dva zdroje, jejichž nezávislost jsem neposuzoval".

*Jak chytit:* ptejte se na to, co **nevíme**. Dobrá odpověď to má sama.

**Rozšíření rozsahu.** Zadání znělo „oprav překlep", výsledek je
překlep plus tři vylepšení.

*Jak chytit:* plán předem, věta „nic navíc", a pohled na diff.

**Nepravdivý štítek.** Označí něco jako hotové, ověřené nebo bezpečné,
aniž by to spustil.

*Jak chytit:* „spustil jsi to, nebo to odhaduješ?" je legitimní otázka
a odpověď na ni je vždycky jednoznačná.

{% <callout kind="pravidlo" title="Proto tolik věcí hlídá kód"> %}
Každá z těch šesti chyb má v tomhle projektu mechanickou pojistku:
katalog příkazů generovaný ze skutečnosti, brána na odkazy, která
neexistující příkaz shodí, guardrail na generované soubory, a brána
kvality, která se nedá odsouhlasit slovem. Vynucení kódem existuje
právě proto, že instrukce sama nestačí.
{% </callout> %}

## Kdy to není chyba

Dvě situace vypadají jako selhání a nejsou:

**Odmítnutí.** „Tenhle zdroj se nedá použít, vyšel v satirické rubrice."
„O téhle osobě se psát nesmí." To není neochota, to je funkce.

**Rozpor s dokumentací.** Když se to, co je v kódu, rozchází s tím, co
je v textu, je to **nález**. Někdo to musí opravit — a poznat se to dá
jen tak, že se člověk podívá na obojí.

{% <kontrola otazka="Claude vám nabídne příkaz, který jste nikdy neviděli. Co uděláte?"> %}
Ověříte, že existuje — spuštěním, nebo pohledem do generovaného
katalogu příkazů. Katalog vzniká z `package.json` a z repozitáře, takže
příkaz, který v něm není, neexistuje. Trvá to deset sekund a je to
nejlevnější kontrola, jakou tady máte.
{% </kontrola> %}
