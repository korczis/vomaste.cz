+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/verify-source — Prověření zdroje"
template = "tooling-command.html"
weight = 121
description = "Prověření zdroje: Otevře zdroj a oddělí, co doopravdy dokládá, od toho, co se z něj běžně vyvozuje a neplyne. Claude skill, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-verify-source"
tooling_command = "skill-verify-source"
view_model = "generated/tooling-catalog.json"
+++

Otevře zdroj a oddělí, co doopravdy dokládá, od toho, co se z něj běžně vyvozuje a neplyne. Zjišťuje vydavatele, autora, datum vydání i pořízení, rubriku, primární versus převzatý původ, kandidáta na zdrojovou rodinu, doslovné citace a jmenované třetí osoby. Navrhuje stav tvrzení s odůvodněním. Nic nezapisuje.

## Kdy ho spustit {#kdy}

Pokaždé, než se zdroj použije u tvrzení, a při revizi existujícího SRC záznamu (mrtvý odkaz, změněný text, doplněná oprava).

## Pro koho a s jakým rizikem {#persona}

- **Persona:** ověřovatel, přispěvatel zdrojem, rešeršista, editor
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Zdroj musí být OTEVŘENÝ a přečtený. Worked example, který to stál: URL z Reflex.cz vypadala jako běžné zpravodajství a po otevření se ukázalo, že vyšla v satirické rubrice označené jako fikce — téma bylo vyřazeno z autorizace.
- Rubrika se hledá na stránce, ne v URL. Komentář, názor, satira i inzerce vypadají ve výsledku vyhledávání stejně jako zpravodajství.
- Nedostupná stránka (403, paywall, mrtvý odkaz) je výsledek, ne překážka k obejití. Obsah se neodhaduje.
- Neposuzuje nezávislost dvou zdrojů — na to je /source-family.

