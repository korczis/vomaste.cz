# Ověření nasazení (stav k 2026-07-29)

## Baseline (ověřeno tímto auditem)

- CI: posledních 5 běhů `Build and Deploy to GitHub Pages` zelených
  (~45–65 s), nasazení přes actions/deploy-pages (OIDC, žádný PAT).
- Produkce <https://korczis.github.io/vomaste.cz/> ověřena 2026-07-29:
  homepage i /dossiers/macinka-turek/ odpovídaly commitu 3f6438b
  (metriky 44/52/4/6, „updated 2026-07-29", agregát správně označen
  „Generovaný společný pohled", žádné chyby ani placeholder).

## Čekající ověření po dalším pushi

Lokální master je o několik commitů napřed (auditní kolo e3c25ea,
konstituce be24882, README 9456480 + integrace koop tasků T-001/T-002).
Push = deploy dělá výhradně ORCH dle docs/coop/PROTOCOL.md. Po pushi
ověřit:

1. `gh run list` — build zelený, nasazený commit = špička masteru;
2. produkční smoke: `/`, `/dossiers/`, hlavní stránka dossieru (nové
   stavy „1 ZDROJ" v legendě, filtru i tabulce; CLM-45; oprava
   „policie odložila" v kauze trestního oznámení), registr zdrojů
   (54 zdrojů, rodiny vydavatelů), gap-01/gap-06 (aktualizovaná data
   kontroly), graf (nová hrana edge-trestniozn-policie);
3. metriky dlaždic = 45 tvrzení / 54 zdrojů / 4 kauzy / 6 mezer;
4. konzole bez chyb, mobilní šířky 320/375/768 px na tabulce tvrzení.
