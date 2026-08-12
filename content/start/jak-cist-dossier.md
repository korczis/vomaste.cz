+++
title = "Jak číst dossier"
description = "Co na stránce dossieru vlastně je, co znamenají barevná označení u tvrzení a kde najdete zdroj, ze kterého tvrzení pochází."
template = "learning-lesson.html"
weight = 20

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "start"
estimated_minutes = 5
audience = ["ctenar"]
objectives = [
  "Najdete na stránce dossieru tabulku tvrzení a otevřete detail jednoho z nich.",
  "Přiřadíte každému z pěti stavů, co doopravdy znamená.",
  "Poznáte, že dva odkazy nemusí být dva nezávislé zdroje.",
]
related_kb = ["koncepty/registr-tvrzeni.md", "koncepty/registr-zdroju.md", "koncepty/registr-mezer.md"]
next_route = "@/start/pet-minut.md"
next_label = "Pět minut s vomaste.cz — projít si to naostro"
+++

## Co je na stránce dossieru

Dossier je všechno, co web o jednom subjektu doložil. Hlavní stránka má
čtyři části, které vždycky najdete na stejném místě:

- **Přehledová tabulka tvrzení** — očíslovaný seznam. Každý řádek je jedno
  tvrzení, jeho stav a odkaz na zdroje.
- **Časová osa** — co se kdy stalo, podle citovaného zpravodajství.
- **Vztahy** — s kým nebo s čím je subjekt doloženě spojený.
- **Otevřené mezery** — co se nepodařilo doložit.

Nahoře jsou dlaždice s počty. Nejsou to dekorace — každá je odkaz do
příslušného registru.

## Pět označení a co znamenají

Barva u tvrzení říká, **jak dobře je doložené**. Neříká, jestli je pravdivé.

| Označení | Co doopravdy znamená | Co to **ne**znamená |
|---|---|---|
| Ověřeno více zdroji | Potvrzují to nejméně dva na sobě nezávislé zdroje | „Je to prokázaná pravda“ |
| 1 zdroj | Doloženo, ale zatím jen jednou linií | „Je to pochybné“ |
| Citace | Tenhle výrok podle zdroje opravdu padl | „Obsah výroku je pravda“ |
| Sporné | Tvrzení existuje, ale zdroje si odporují nebo věc není uzavřená | „Spíš to není pravda“ |
| Názor | Autorský komentář, uvedený jako komentář | „Web s tím souhlasí“ |

{% <callout kind="varovani" title="Nejčastější omyl"> %}
„Citace“ svádí k tomu číst obsah výroku jako fakt. Doložené je jen to, že
výrok padl. Když politik řekne „stavbu dokončíme v prosinci“, web dokládá
ten výrok — ne prosincový termín.
{% </callout> %}

## Kde je zdroj

U každého tvrzení jsou odkazy typu `SRC-04`. Klik vede na stránku zdroje,
kde je vydavatel, datum vydání, datum, kdy si to někdo naposledy ověřil,
odkaz na originál a redakční poznámka: co přesně ten zdroj dokládá a kde
jsou jeho hranice.

Když má tvrzení dva odkazy, ještě to nemusí být dvě nezávislá potvrzení.
Když oba texty vycházejí z jedné tiskové zprávy nebo z jedné agenturní
depeše, je to **jeden hlas se dvěma adresami**. Proto se stav neurčuje
podle počtu odkazů, ale podle počtu skutečně nezávislých původů.

{% <kontrola otazka="U tvrzení jsou tři odkazy na tři různé zpravodajské servery. Všechny tři články ale končí větou „Zdroj: ČTK“. Kolik nezávislých potvrzení to je?"> %}
Jedno. Tři redakce převzaly tutéž agenturní zprávu — pořád je to jedna
linie evidence. Druhé nezávislé potvrzení by muselo přijít odjinud: z
vlastního zjištění jiné redakce, z primárního dokumentu, z registru.

Tohle je natolik zásadní, že to web hlídá strojově: tvrzení nemůže dostat
stav „ověřeno více zdroji“, dokud mezi jeho zdroji nejsou aspoň dva, které
se liší původem **i** vydavatelem.
{% </kontrola> %}
