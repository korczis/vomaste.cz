# TODO

- [x] Prohloubit dossier Macinka/Turek (kolo 1, 2026-07-22)
  - [x] Detailní text: rozšířeny sekce o dopravní nehodě (GAP-01) a kauze
        2025 (GAP-03) — policejní vyjádření ke značení, Turkova verze,
        vzdání se imunity, trestní oznámení na Deník N
  - [x] Detailní rozbor: doplněny interpretační odstavce (protichůdné
        verze nehody vedeny vedle sebe, ne jako rozhodnutá otázka viny)
  - [x] Rozbor zdrojů: přidáno SRC-17 až SRC-27 (11 nových), poznámky k
        nezávislosti/zdrojovým rodinám doplněny v zdroje/_index.md
  - [x] OSINT dohledání (GAP-04, GAP-05): místo přímého volání
        ~/dev/prismatic-platform (těžká Elixir platforma, vyžaduje
        vlastní infra) použity stejné kategorie veřejných registrů přes
        web — Hlídač státu (obchodní rejstřík, sponzoring stran) —
        odhaleno: Macinkova nepřiznaná ukrajinská firma GMR GAS UA LLC,
        firemní/spolkové vazby obou aktérů, 1 310 000 Kč darů Macinky a
        210 000 Kč darů Turka směrem k Motoristům sobě
  - [x] Update grafů: přidány uzly GMR GAS UA LLC a Klub motoristů, z.s.
        + hrany do templates/dossier.html
  - [x] Reference: stats přepočítány (27 zdrojů, 24 tvrzení), `updated`/
        `reviewed_at` na 2026-07-22, `zola build`/`zola check` bez chyb
  - [ ] Zbývá nedohledáno (viz GAP-04/GAP-05 v dossieru): katastr
        nemovitostí (ČÚZK) a úplné financování volební kampaně 2025
        nad rámec darů 2017–2024 — další kolo

- [x] Prohloubit dossier o Turkovi (kolo 2, 2026-07-22) — scope extension
      z AGENTS.md, owner-schváleno na záznam 2026-07-22
  - [x] Nová 4. kauza: trestní oznámení pro domácí násilí/znásilnění
        (SRC-28–31, CLM-25–27) — explicitní rámování "promlčení ≠
        rozhodnutí o vině", nová GAP-06 (výsledek stížnosti)
  - [x] 5 menších témat (SRC-32–37, CLM-28–33): saúdská ambasáda 2017,
        černé stavby 2026, Zapper Club (varování MZ/SZPI), nesoulad
        závodní kariéry, kritizovaná setkání s íránským velvyslancem
  - [x] Stats přepočítány (37 zdrojů, 33 tvrzení, 4 kauzy), graf
        vztahů doplněn o uzel "Trestní oznámení", `zola build`/`check`
        bez chyb
  - [ ] GAP-06 zůstává otevřená — sledovat výsledek odvolání

- [x] Prohloubit dossier o majetku/financích (kolo 3, 2026-07-22)
  - [x] Turkovy nemovitosti dohledány (pozemek Dubeč + byt Strahov 18M Kč,
        SRC-38, CLM-34); Macinkovy nemovitosti nedohledány (ČÚZK
        neumožňuje jmenné vyhledávání) — GAP-04 downgradováno na nízkou
  - [x] Oficiální dárcovské přehledy kampaně PS 2025 (UDHPSH/SRC-40),
        velcí dárci Šťastný a Fabičovic (SRC-39), rozpor u sponzora
        Chlada — oficiálně 638 864 Kč vs. jím tvrzené ~2 mil. Kč
        (SRC-41/42/43, CLM-35–37) — GAP-05 downgradováno na nízkou
  - [x] 43 zdrojů, 37 tvrzení, graf doplněn o uzel Chlad, `zola build`/
        `check` bez chyb

- [x] Landing page redesign + registr mezer + kolo 4 OSINT (2026-07-23)
  - [x] `templates/index.html` přepsán na skutečnou landing page (hero s
        CSS/SVG pozadím, sekce "Jak pracujeme", footer); `base.html`
        doplněn o favicon, funkční og:image/twitter meta, odstraněn
        nepoužívaný Alpine.js skript, `minify_html` znovu zapnuto
  - [x] Sladěno s paralelně vzniklým nav shellem (Milestone 1) — odstraněn
        duplicitní skip-link a plovoucí logo z index.html
  - [x] GAP-01 až GAP-06 dostaly vlastní stránky pod `content/dossier/mezery/`
        (šablony `dossier-gap.html` / `dossier-gaps-index.html`), hlavní
        tabulka mezer nahrazena odkazem na registr (stejný vzor jako
        registr zdrojů)
  - [x] Research kolo 4 (4 paralelní OSINT dotazy, jen Macinka/Turek,
        stejná pravidla zdrojování): nové poznatky doplněny do GAP-01/02/03/04/05,
        GAP-06 znovu ověřena beze změny
  - [x] Nová sekce "Jmenování ministrem životního prostředí" (CLM-38–40,
        SRC-44–46): prezident Pavel v 1/2026 odmítl jmenovat Turka
        ministrem ŽP, Turek podal žalobu na ochranu osobnosti, Macinkovo
        dočasné pověření vedením MŽP (CLM-24) tímto dovysvětleno jako
        přímý důsledek — GAP-02 poznámka doplněna, ať se to nepřičítá
        nehodě
  - [x] 46 zdrojů, 40 tvrzení, graf doplněn o uzel "Jmenování ministrem ŽP
        (2026)", `npm run build` (validate + css + js + zola + anchors)
        bez chyb
  - [ ] Nedohledáno/neověřeno: "kompetenční žaloba" avizovaná v jednom
        titulku (odlišná od Turkovy skutečně podané žaloby na ochranu
        osobnosti) — ukázalo se jako hypotetická právní analýza, ne
        reálný krok; viz odstavec o právní skepsi. Sledovat výsledek
        Turkovy žaloby na ochranu osobnosti proti prezidentovi.
