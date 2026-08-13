+++
title = "C104 — Oprávnění a hranice"
description = "Proč se vás Claude někdy ptá, co nesmí ani po povolení, a která pravidla vynucuje kód místo textu."
template = "learning-lesson.html"
weight = 1804

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "C104"
level = "claude-code"
estimated_minutes = 8
audience = ["ctenar", "zdroje", "research", "editor", "vyvojar"]
objectives = [
  "Vysvětlíte rozdíl mezi „nesmí“ a „zeptá se“.",
  "Vyjmenujete dvě věci, které jsou blokované mechanicky, ne instrukcí.",
  "Popíšete, proč instrukce sama o sobě není záruka.",
]
related_kb = ["koncepty/co-je-dossier.md"]
next = "C105"
+++

Claude Code se občas zeptá, jestli smí něco udělat. Není to zdvořilost —
je to bod, kde se rozhoduje.

## Tři různé situace

**Ptá se.** Chystá se použít nástroj, na který nemá předschválení.
Odpověď je vaše rozhodnutí a nese odpovědnost.

**Nesmí, protože to blokuje kód.** Existují operace, které projekt
zastaví bez ohledu na to, co si kdo myslí. Ty se nedají odsouhlasit.

**Neměl by, protože to říká pravidlo.** Text v `CLAUDE.md` nebo
v pravidlech. Tohle je nejslabší vrstva — a proto se na ni projekt
spoléhá co nejmíň.

{% <callout kind="pravidlo" title="Instrukce není vynucení"> %}
Pravidlo napsané textem se dodržuje **většinou**. Pravidlo vynucené
kódem se dodržuje **vždycky**. Proto tenhle projekt raději napíše
validátor než další odstavec — a proto v jeho ústavě stojí, že politika,
kterou nic nevynucuje, se nepočítá za implementovanou.
{% </callout> %}

## Co je blokované mechanicky

Dvě věci, a obě mají důvod z praxe:

**Zápis do autorizačního logu.** Seznam toho, o kom se smí psát, je
append-only. Existující záznam se neupravuje ani neodstraňuje, ani kvůli
překlepu — je to auditní stopa toho, co bylo schváleno a kdy. Pokus
o editaci uvnitř logu se zastaví.

**Zápis do generovaného souboru.** Stránky dossierů v `content/` nejsou
zdroj, jsou výstup. Ruční editace by se **tiše ztratila**: build
generuje dřív, než kontroluje, takže by se změna přepsala, build zůstal
zelený a nikdo by se nic nedozvěděl. Tohle je nejhůř viditelná chyba
v celém repozitáři, a proto ji hlídá kód.

{% <prikaz kind="output"> %}
P2: content/dossiers/…/claims/clm-01.md je generovaný soubor, ne zdroj.
Kanonická oprava: uprav data/dossiers/<slug>/… a spusť npm run data:build.
{% </prikaz> %}

## Co Claude nesmí nikdy

Ani po povolení, ani na výslovné přání:

- **udělit autorizaci** — rozhodnout, že se o někom smí psát;
- **vydat vlastní výstup za zdroj**;
- **publikovat bez lidského review** to, co se dotýká obsahu o lidech.

První dvě jsou zapsané v pravidlech i v každé dotčené schopnosti. Třetí
drží celý postup: mezi změnou a webem stojí brána a člověk.

{% <kontrola otazka="Řeknete Claudovi „ten odstavec na stránce tvrzení uprav rovnou, ať to je rychlé“. Co se stane?"> %}
Zápis se zastaví s vysvětlením, že jde o generovaný soubor. A je to
dobře: kdyby prošel, změna by po nejbližším buildu zmizela a vy byste
se to nedozvěděli. Rychlejší cesta neexistuje — kanonická oprava je
v `data/`, a je stejně rychlá, jen vede jinam.
{% </kontrola> %}
