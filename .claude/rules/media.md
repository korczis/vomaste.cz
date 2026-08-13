---
paths:
  - "static/images/**"
  - "scripts/media/**"
  - "data/dossiers/_shared/entities/**"
---

# Média — obrázek je publikace cizího díla

Závazné znění: `AGENTS.md`, sekce „Média: fotografie a loga".

1. **Jen svobodná licence.** CC0, public domain, CC BY, CC BY-SA,
   Attribution. Allowlist má jednoho vlastníka —
   `scripts/media/lib/licences.mjs` — a importuje ho stahovač i brána.
   „Fair use", „non-free logo", `©` ani prázdná hodnota neprojdou.
2. **Atribuce je podmínka užití, ne zdvořilost.** U CC BY / BY-SA je
   uvedení autora a licence podmínkou. Proto existuje jediná cesta, jak
   se obrázek zobrazí: `ui::media_figure`.
3. **Bajty patří do repozitáře** (`static/images/{people,logos,media}/`).
   Hotlink znamená rozbitý náhled, až někdo přeuspořádá CDN, a tiché
   posílání každého požadavku čtenáře třetí straně.
4. **Identita se ověřuje, nehádá.** Přes Wikidata (`P31=Q5`, skóre podle
   „žije" + občanství + popisu) a použije se `P18`. Fulltext na Commons
   je jen výslovný fallback (`--allow-search`) — vrátil mimo jiné portrét
   Karla Havlíčka Borovského na dossier ministra Havlíčka.
5. **Žádný placeholder.** Není-li volná fotka, entita zůstane bez
   obrázku a OG karta typografická. Silueta ze stocku se nepoužije.
6. **Nic nepřipsaného v repu.** Soubor v mediálním adresáři, ke kterému
   se nehlásí žádný záznam, shodí build.

Vynucuje `npm run validate:media` (M1–M4, součást `npm run build`)
a `scripts/media/licences.test.mjs`.

Stahování: `npm run media:fetch -- <entity-id>`, vždy **jedna entita na
běh** — každý obrázek je publikační rozhodnutí o konkrétním člověku.

Přehled publikovaných médií se generuje na `/dokumentace/licence-medii/`.
Ručně se nevede.
