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

- [x] Pokus o primární-registr OSINT přes ~/dev/prismatic-platform (2026-07-29)
  - [x] První průchod (živé dotazy na ARES/Justice.cz/ISIR/ČÚZK klienty
        platformy) odhalil, že tyto klienty jsou nefunkční proti reálným
        API (špatná HTTP metoda u ARES, neplatné/rozdílné ISIR URL na
        dvou místech kódu, ČÚZK endpoint blokovaný Radware bot-ochranou).
        Opraveno přímo v prismatic-platform (samostatný worktree, mimo
        tento repozitář) — 4 opravené moduly, přidané regresní testy proti
        živým API, nic z toho neovlivňuje vomaste.cz kód.
  - [x] Druhý průchod s opravenými klienty: ARES nezávisle potvrdil
        přesnost už citovaných rejstříkových údajů (SRC-23, SRC-24) —
        žádná nová firemní vazba ani změna stavu. Osobní ARES dotaz na
        "Filip Turek" vrátil 14 shod OSVČ napříč ČR, které bez data
        narození nelze spolehlivě přiřadit ke skutečnému poslanci —
        vynecháno jako nespolehlivé, ne dopsáno jako fakt. ČÚZK zůstává
        programově nedostupný (potvrzeno: přesměrování na bot-ochranu i
        bez zadaného jména, ne jen u jmenného vyhledávání) — GAP-04
        doplněn a `checked` posunut na 2026-07-29.
  - [ ] Beze změny v CLM/SRC registrech — jde čistě o nezávislé ověření
        existujících dat a upřesnění důvodu nedohledatelnosti u ČÚZK.

- [x] Claude Code bootstrap tooling (2026-07-30), ORCH direct na masteru,
      infra-only — cíl: ať kdokoli/kdykoli snadno nastartuje session v
      tomto repu bez re-derivace pravidel z nuly
  - [x] `.githooks/pre-commit` — rychlá čistě-datová podmnožina build
        gate (`validate:dossier/graph/authorization/dossier-types`,
        `build:routes`, `validate:navigation`); záměrně BEZ
        `lint:historical-coupling` (ten je aktuálně červený kvůli
        probíhající migraci T-001 — zapojit až po jejím dokončení, viz
        coop bus poznámka W-3 2026-07-29)
  - [x] `scripts/setup/install-git-hooks.mjs` — nastaví
        `core.hooksPath` na `.githooks/`, spouští se automaticky přes
        `postinstall` (`npm ci`/`npm install`) i ručně
        (`npm run hooks:install`); best-effort, nikdy nerozbije instalaci
  - [x] `.claude/skills/bootstrap/` — onboarding: pořadí čtení pravidel
        (AGENTS.md → konstituce → coop protokol → CLAUDE.md), kontrola
        prerekvizit, `coop.sh status`, volba role (ORCH přímo vs. worker
        worktree), scope-gate připomínka
  - [x] `.claude/skills/dossier-entry/` — vedený postup pro přidání
        SRC/CLM/CASE/GAP/relation s autorizačním scope-gate jako krokem
        0 a povinnou regenerací (`migrate-claims-to-pages.mjs` /
        `migrate-cases-to-pages.mjs`) před validací
  - [x] Drobné doplňky README.md (Rychlý start, referenční tabulka,
        strom repozitáře) a CLAUDE.md (Claude-Code-specific notes) —
        ne architektonický přepis, ten je scope T-003
  - [x] Ověřeno: hook spuštěný ručně (`bash .githooks/pre-commit`)
        prochází čistě; `npm run build` zelený po změnách
  - [ ] Vědomě neportováno (viz odpověď v konverzaci): plný AIAD
        agent/command ekosystém z prismatic-platform — pro repo této
        velikosti a účelu by to byl over-engineering v rozporu s
        vlastní konstitucí projektu (§10, žádný doktrine/agent sprawl)

- [x] Bootstrap tooling, kolo 2 — rozšíření o mechanické vynucení a další
      2 skilly (2026-07-30, ORCH direct na masteru, infra-only)
  - [x] `scripts/dossier/verify-authorization-log-append-only.mjs` —
        nová validace: append-only autorizační log v `AGENTS.md` byl
        dosud jen prozní pravidlo ("never edit or remove an existing
        entry"), teď mechanicky vynucené. Identifikuje existující
        datované sekce podle nadpisu (ne podle zanoření pod "##
        Content about real parties" — novější záznamy jsou připojené
        až za konstitucí/koop sekcemi, takže pozice v souboru není
        spolehlivá), a shodí build, pokud se libovolná stará sekce
        smaže nebo změní byť o bajt; nové sekce na konci jsou v pořádku.
        Otestováno sandboxem mimo repo (fixture repo v scratchpadu):
        no-op → OK, append-only přidání → OK, úprava existující sekce →
        FAIL, smazání existující sekce → FAIL. Zapojeno do
        `npm run build`, `.githooks/pre-commit` i CI
        (`.github/workflows/deploy.yml`).
  - [x] `.claude/skills/adr/` — postup pro sepsání ADR pod `docs/adr/`
        podle existujícího vzoru (`docs/adr/graph-renderer.md`):
        měřit, ne odhadovat, číselný revisit threshold, poctivé
        "co bylo skutečně rozbité a opraveno" místo příklonu k větší
        stack proposal jen proto, že byla navržena.
  - [x] `.claude/skills/commit/` — formát commit zprávy podle
        pozorované historie repa, které gate skutečně platí kdy
        (pre-commit rychlá podmnožina vs. `npm run build` před
        review-requestem/mergem/pushem), coop bus hlášení podle role.
  - [x] `npm run build` zelený po zapojení nového validátoru.

- [x] Bootstrap tooling, kolo 3 — na webu vykreslené řídicí dokumenty +
      trvalý regresní test (2026-07-30, ORCH direct na masteru)
  - [x] `/dokumentace/` — nová sekce webu vykreslující AGENTS.md,
        CONTRIBUTING.md, LICENSE.md, SECURITY.md, konstituci a koop
        protokol build-time přes Zolin `load_data` + `markdown` filtr;
        žádná nová JS závislost (`static/js/app.js` beze změny),
        funguje bez JS. `docs/adr/markdown-and-mermaid-rendering.md`:
        mermaid.js záměrně NEadoptován (naměřeno 0 mermaid bloků v
        repu), zdokumentován levný revisit trigger.
  - [x] `scripts/dossier/verify-authorization-log-append-only.test.mjs`
        — dosud jednorázově ověřeno v mazaném sandboxu, teď trvalý
        regresní test (Node built-in `node --test`, žádná nová
        devDependency): no-op/append → OK, úprava/smazání existující
        sekce → FAIL. Zapojeno jako `npm test`, první krok
        `npm run build` i CI.
  - [x] Vědomě nedotčeno (kolizní riziko se souběžnou session):
        `templates/index.html`, `templates/base.html`, `config.toml`,
        `data/navigation.toml`.
  - [x] `npm run build` (vč. nového `npm test` kroku) zelený.

- [x] JSON-LD provenance research + design (2026-07-30, ORCH direct,
      docs-only — na žádost vlastníka "rozšiř JSON-LD dossiers pomocí
      goodies z prismatic-platform")
  - [x] Prozkoumáno (read-only) ADR-028 (provenance spine:
        Source→Request→Artifact→Extraction→Assertion, content-hash
        artefakty, signed manifesty) a ADR-035 (reference topologie:
        16 typovaných invertibilních hran) z prismatic-platform.
        prismatic's vlastní JSON-LD generátor je čisté SEO, na
        provenance spine vůbec nenavázané — přenositelné jsou datové
        modely, ne kód (jiný stack).
  - [x] `docs/adr/dossier-jsonld-provenance-extension.md` — návrh pro
        T-010: přijato (1) content-hash citace zdrojů, (2) manifest +
        offline verify script (dává T-010 konkrétní tvar), (3) malý
        invertibilní vztahový vocab pro graph.toml hrany (BEZ
        `contradicts` — to by vyžadovalo zvlášť redakční diskuzi).
        Vědomě ODMÍTNUTO: numerické confidence/corroboration skóre
        (prismaticovo `1 - Π(1-confidence_i)`) — přímý rozpor s
        konstitucí §8 ("žádné trust skóre, žádná gamifikace
        obvinění"); existující kategorický stavový enum
        (CORROBORATED/1 ZDROJ/SPORNÉ/CITACE/NÁZOR) je záměrná
        nenumerická odpověď na stejnou otázku.
  - [x] Implementace vědomě NEprovedena — dotýkala by se
        `templates/macros/jsonld.html`, `templates/partials/jsonld.html`,
        `content/dossiers/**` front matter, `scripts/dossier/*.mjs`,
        vše v aktivní scope-check zóně T-001. T-010 na boardu doplněn
        o odkaz na hotový design.
  - [ ] Implementace zůstává T-010, čeká na merge T-001.
