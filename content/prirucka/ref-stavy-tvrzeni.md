+++
title = "Reference: stavy tvrzení"
description = "Pět stavů v tabulce — co znamenají, co neznamenají a které z nich vynucuje validátor."
template = "learning-lesson.html"
weight = 2301

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "prirucka"
category = "reference"
estimated_minutes = 3
audience = ["ctenar", "zdroje", "research", "editor"]
+++

| Stav | Znamená | **Ne**znamená | Vynuceno |
|---|---|---|---|
| Ověřeno více zdroji | aspoň dvě nezávislé linie evidence | „je to pravda“ | ano |
| 1 zdroj | doloženo, zatím jednou linií | „je to pochybné“ | ano |
| Citace | výrok podle zdroje padl | „obsah výroku platí“ | ne |
| Sporné | zdroje si odporují nebo věc není uzavřená | „spíš to není pravda“ | ne |
| Názor | autorský komentář | „web s tím souhlasí“ | ne |

## Co přesně vynucuje validátor

**Ověřeno více zdroji** neprojde bez dvojice zdrojů lišící se **rodinou
zdrojů i registrovanou doménou vydavatele**.

**1 zdroj** neprojde, když taková dvojice existuje.

Zbylé tři stavy popisují povahu tvrzení, ne strukturu dokladů — ty
posuzuje člověk.

## Rozhodovací postup

1. Hodnotící soud autora? → **názor**
2. Předmětem je výrok konkrétní osoby? → **citace**
3. Zdroje si odporují nebo věc není uzavřená? → **sporné**
4. Existuje nezávislá dvojice? → **ověřeno více zdroji**
5. Jinak → **1 zdroj**

Kanonické definice: [ověřeno](@/koncepty/stav-overeno-vice-zdroji.md) ·
[1 zdroj](@/koncepty/stav-jeden-zdroj.md) ·
[citace](@/koncepty/stav-citace.md) ·
[sporné](@/koncepty/stav-sporne.md) ·
[názor](@/koncepty/stav-nazor.md)
