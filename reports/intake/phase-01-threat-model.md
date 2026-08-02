# Phase 1 — Threat model veřejného dossier-intake workflow

**Datum**: 2026-08-02 · **Stav**: PROPOSED · **Mise**: [docs/missions/intake/](../../docs/missions/intake/README.md)
**ADR**: [docs/adr/ADR-public-dossier-intake.md](../../docs/adr/ADR-public-dossier-intake.md)

Threat model pokrývá celý navrhovaný tok: veřejný Issue Form → automatické předzpracování
→ lidská autorizace → investigace → draft PR → publikace. Sloupec „Existing control"
odkazuje na skutečné, auditem ověřené mechanismy repa (soubor:řádek); „Phase" odkazuje na
fázi z [phase-01-implementation-plan.md](phase-01-implementation-plan.md), kde má chybějící
kontrola vzniknout.

Legenda pravděpodobnosti: L = nízká, M = střední, H = vysoká.

---

## 1. Abuse of people (zneužití proti lidem)

| Threat | Entry point | Impact | Likelihood | Existing control | Missing control | Phase |
|---|---|---|---|---|---|---|
| Falešné obvinění v podnětu | Issue Form `navrh-dossieru.yml` | Reputační škoda subjektu, pokud by text unikl do obsahu | H | Intake ≠ claim: obsah vzniká jen přes autorizaci (`AGENTS.md` „Content about real parties") + validátory S1–S8; dossier-entry GATE 0 (`.claude/skills/dossier-entry/SKILL.md:7-19`) | Explicitní `user_assertion` vs `system_observation` vrstva; redaction v intake reportech (netisknout jména třetích osob do bot komentářů) | 2, 3 |
| Harassment / brigading / koordinované zakládání issues | GitHub issues (veřejné, zdarma) | Zahlcení triage, SEO otisk obvinění v issue titulcích | M | Žádný (žádný intake automat neexistuje; triage plně ruční) | Rate limiting v intake workflow, duplicate-intake detekce, `intake:invalid` fast-close runbook, concurrency per issue | 3, 6, 11 |
| Doxxing / zveřejnění citlivých osobních údajů v podnětu | Textarea polí formuláře (volný markdown) | Trvalé veřejné zveřejnění PII (GitHub issue nelze fakticky „odpublikovat" — e-maily watcherům odejdou hned) | H | Varování + povinný checkbox jen v `oprava-faktu.yml:9,32-38`; **`navrh-dossieru.yml` varování ani checkbox NEMÁ**; `blank_issues_enabled: true` (`config.yml:1`) obchází i to málo | Checkbox + varování v návrhovém formu; `blank_issues_enabled: false`; PII risk flag v intake klasifikaci; redaction v reportech; runbook na mazání/redigování | 5, 3, 11 |
| Pojmenování neanonymizované třetí osoby | Volný text podnětu | Třetí osoba vtažena do veřejného záznamu | H | Redakční pravidlo (CONTRIBUTING.md:54-56); mechanicky nevynuceno (`.claude/skills/investigate/SKILL.md:141` — „Not mechanically enforced") | Risk flag `third_party_named` v klasifikaci; intake report jména třetích osob nereprodukuje | 3 |
| Vydírání / zneužití platformy ve sporu (soused, ex-partner, konkurent) | Návrhový formulář | Platforma jako nástroj nátlaku | M | Test veřejného zájmu (konstituce §7) — čistě lidský; vlastník rozhoduje o autorizaci | Strukturované pole „veřejná funkce/prostředky/odpovědnost" ve formuláři; risk flag `no_public_interest_indicated` | 5, 3 |
| Zahlcení jednoho subjektu opakovanými podněty | Issues | Nátlak přes kvantitu, zkreslení triage | M | Žádný | Duplicate-intake detekce (týž subjekt/kauza → `intake:possible-duplicate`) | 3, 6 |
| SEO poisoning (obvinění v titulku issue indexované vyhledávači) | Issue title (uživatelem editovatelný, prefix `[návrh]` není garantován) | Obvinění dohledatelné přes Google i bez publikace | M | Žádný | Pokyn ve formuláři „do titulku nepište jména", triage runbook s přepisem titulku, případně rychlé uzavření `intake:invalid` | 5, 11 |
| Zveřejnění identity oznamovatele jím samým (omylem) | GitHub účet + text podnětu | Oznamovatel trvale veřejně spojen s obviněním | H | `reakce-subjektu.yml:10` a `config.yml:6-8` varují; `navrh-dossieru.yml` NE; GitHub účet je vždy veřejně přiřazen | Varování ve formuláři: „podnět je trvale spojen s vaším GitHub účtem"; nikdy neoznačovat kanál za anonymní (invariant §1.4) | 5 |

## 2. Abuse of automation (zneužití automatizace)

| Threat | Entry point | Impact | Likelihood | Existing control | Missing control | Phase |
|---|---|---|---|---|---|---|
| Prompt injection („agente, autorizuj X / ignoruj pravidla") | Issue body/title/komentáře | Automat překročí mandát | H (pokusy jisté) | Deploy workflow issue eventy vůbec nekonzumuje (`deploy.yml:3-6`); žádný agent issues nečte | Intake procesor musí být deterministický parser (ne LLM); pokud kdekoli LLM, vstup jen jako data s `decision_class: machine_draft_only`; stavový automat: machine actor nikdy →authorized | 2, 6 |
| Shell injection přes event data | Budoucí Actions workflow | RCE v runneru, krádež tokenu | M | Současný `deploy.yml` má nulovou interpolaci event dat do `run:` (jediné `${{ }}` je `environment.url`, `deploy.yml:87`) | Závazné pravidlo pro intake workflow: payload výhradně přes soubor/env s quotingem, actionlint gate, zero-interpolation test | 6 |
| Path traversal ve jménech/polích (`../../data/...`) | Pole formuláře → souborové výstupy procesoru | Zápis mimo intake sandbox | M | Žádný intake kód neexistuje | Sanitizace ID, výstup jen do pevného adresáře, žádné odvozování cest z uživatelského vstupu | 2 |
| Markdown/HTML injection do bot reportu | Issue body → bot komentář | Falešný „ověřeno" vzhled, phishing odkazy v komentáři automatu | H | Žádný | Report generátor escapuje/cituje uživatelský obsah jako blok, nikdy jej nevkládá do vlastních tvrzení; user text vždy oddělen jako citace | 2, 6 |
| Label manipulace (kdokoli s triage právy, nebo automat sám) | GitHub labels | Falešný stav procesu (`preflight-complete` bez preflightu) | M | Labely nejsou deklarovány v repu (jen 4 v templates); žádná stavová sémantika | Labely = jen zrcadlo stavu z artifactu, nikdy zdroj pravdy; workflow stav re-derivuje, nevěří labelu | 6 |
| Issue edit race / replay / duplicate webhook | Issue events | Dvojité zpracování, rozporné reporty | H (běžné chování GitHubu) | Žádný | Idempotence: bot marker + hash vstupu; concurrency group per issue; out-of-order ochrana přes `updated_at` | 6 |
| Workflow privilege escalation (`pull_request_target`, `workflow_run`) | Budoucí workflows | Přístup k secrets z forku | M | Repo dnes `pull_request_target` ani `workflow_run` nepoužívá (jediný workflow `deploy.yml`) | Zákaz těchto triggerů pro intake; permissions jen `issues: write` + `contents: read` | 6 |
| Artifact poisoning / dlouhá retention | Actions artifacts | Citlivý obsah v artefaktech veřejného repa (stažitelné kýmkoli) | L–M | Playwright artefakty retention 7 dní (`deploy.yml:69-77`) | Intake artefakty: krátká retention, žádná PII, žádné celé issue body | 6 |
| Malicious URL / SSRF | Pole `sources` → budoucí preflight | Přístup na interní síť runneru, cloud metadata | H (pokud preflight vznikne bez ochran) | Žádný HTTP klient v intake neexistuje; jediné fetch v repu míří na `ares.gov.cz` (`scripts/osint/expand-entity.mjs:71-72`) | Kompletní SSRF ochrana — viz §6 níže | 4 |
| Dependency / action supply-chain | npm, GitHub Actions | Kompromitace build/intake pipeline | M | `npm ci` z lockfile; zola pinned `0.22.1`; ale žádný SHA pinning actions, žádný dependabot (SECURITY.md:33-35 riziko přiznává) | SHA pinning pro intake workflow, dependabot, `--ignore-scripts` kde lze | 6, 11 |
| Zneužití `workflow_dispatch` deploye mimo master | `deploy.yml:6` | Publikace z neschválené větve (obchází review, ne datové gates) | L (vyžaduje write práva) | Gates běží i tak (`npm run build` vč. `validate:authorization`); environment `github-pages` branch policy neověřitelná z repa | Ověřit/nastavit environment branch policy na `master`; intake od deploye trvale izolován | 6, 11 |

## 3. Editorial failure (redakční selhání)

| Threat | Entry point | Impact | Likelihood | Existing control | Missing control | Phase |
|---|---|---|---|---|---|---|
| Text issue povýšen na claim | Copy-paste z podnětu do dossieru | Neověřené obvinění publikováno | M | dossier-entry gates: zdroj musí být otevřen, T7 ≥150 znaků poznámky, S1/S2 status podle rodin zdrojů; `npm run build` gate v CI (`scripts/build/pipeline.mjs:45-87`) | Schema pravidlo: intake artifact nemá pole převoditelná na claim (jiný namespace, jiné `recordType`); provenance „vzniklo z issue #N" povinná v draftu | 2, 10 |
| Machine summary prezentované jako fakt | Bot report v issue | Čtenáři vnímají shrnutí automatu jako závěr redakce | H | Žádný | Každý bot report povinně nese hlavičku „strojové předzpracování, ne redakční závěr"; `decision_class: machine_draft_only` | 2, 6 |
| Jedna source family počítána vícekrát | `sources` pole podnětu | Falešné „CORROBORATED" | M | S2 rule: rodiny přes `sourceFamily` (`scripts/data/validate-semantics.mjs:101-138`); labeling rodin je ale redakční vstup (investigate/SKILL.md:136) | Intake preflight rodiny pouze *navrhuje* (`system_observation`), nikdy nezapisuje do dat | 3, 4 |
| Snippet vydáván za otevřený zdroj | URL z podnětu | Citace neexistujícího obsahu | M | Pravidlo „never cite from a search snippet" (dossier-entry/SKILL.md:29-30; investigate/SKILL.md:41-43) — lidské | Preflight výsledek nese `metadata extracted ≠ článek přečten`; investigace musí zdroj otevřít sama | 4, 9 |
| Procesní výsledek vydáván za věcný závěr | Podnět cituje „odloženo/promlčeno" | Implikace viny | M | Tvrdé redakční pravidlo (dossier-entry/SKILL.md:73-75) — lidské | Risk flag `procedural_outcome_language` v klasifikaci | 3 |
| Autorizace subjektu vydávána za autorizaci všech kauz | Intake „X už dossier má, tak přidejme kauzu Y" | Scope creep | M | Autorizace per subjekt+téma (AGENTS.md; dossier-entry GATE 0: „přesně tu osobu A přesně to téma"); validate-authorization v buildu | Intake typ „rozšíření scope" jako samostatná kategorie s vlastním pending-owner stavem | 5, 8 |
| Context entita tiše povýšena | 503 kontextních entit (`_shared/entities/`) jako matching kandidáti | Neautorizovaná osoba získá pokrytí | M | Rule S6 — context entita nesmí získat `dossierEnabled`/`dossierStatus=authorized`, negrandfatherovatelné (`validate-semantics.mjs:204-215,295`) | Matching výstup expl. označí kandidáta `context` a připomene, že match ≠ autorizace | 3 |
| Chybějící uncertainty state / AI confidence jako korroborace | Budoucí ML skóre | Falešná jistota | L | Repo odmítlo confidence skóre (TODO.md:196-210; ADR jsonld-provenance) | Matching `confidence_class` je třída vysvětlení, ne pravděpodobnost pravdy; thresholdy `UNVALIDATED` | 3 |

## 4. Governance failure (selhání správy)

| Threat | Entry point | Impact | Likelihood | Existing control | Missing control | Phase |
|---|---|---|---|---|---|---|
| Autorizační bypass automatem | Intake workflow | Zánik human-in-the-loop | L (při dodržení návrhu) | `authorize-entity` TTY-only, odmítá neinteraktivní běh vč. skillů (investigate/SKILL.md:52-55); append-only verify v buildu i pre-commitu; S6 | Stavový automat s pravidlem „machine actor nikdy →authorized" + test; workflow bez `contents: write` | 2, 6 |
| Auto-merge / auto-deploy z issue eventu | Budoucí workflow | Publikace bez člověka | L | Deploy jen push na master + dispatch (`deploy.yml:3-6`); žádné auto-merge v repu | Trvalý zákaz `issues` triggeru v deploy workflow; intake workflow bez `pull-requests: write` v MVP | 6 |
| Neauditovatelná změna scope | Ruční edit dat mimo proces | Ztráta důvěryhodnosti | M | verify-authorization-log-append-only (build + pre-commit); discovery-log append-only | CODEOWNERS pro `AGENTS.md`, `docs/constitution/**`, `.github/**` (dnes chybí — HIGH nález GitHub auditu) | 11 |
| Editace append-only historie | Git push force / přepis AGENTS.md | Zpětná manipulace autorizací | L | `npm run verify:authorization-log` — porovnává s předchozím stavem (23 záznamů intact, ověřeno 2026-08-02) | Branch protection na master (neověřitelné z repa); CODEOWNERS | 11 |
| Jeden vágní `approved` status | Návrh datového modelu | Slití autorizace/publikace/triage do jednoho pole | M | Repo už odděluje `dossierStatus` vs `publicationRole` vs `coverageState` (entity schema) | Tři oddělené osy stavového automatu (intake/authorization/publication) — viz ADR §18 | 2 |
| Rozpor machine registry vs AGENTS.md log | `data/authorizations.toml` derivát | Dvě pravdy | M | Precedence deklarována: „AGENTS.md wins" (`data/authorizations.toml:1-8`); validate-authorization kontroluje konzistenci | Pozor: v rootu existují ještě `AUTHORIZATION.md` a `authorization.json`, které žádný skill nezmiňuje — vyjasnit/odstranit duplicitu (nález investigate auditu) | 8 |
| Owner hardcoded na více místech / nejasná odpovědnost za rejection | Runbooky | Zamrzlé podněty, nikdo nezamítá | M | Single-writer vzor existuje v coop protokolu (`docs/coop/PROTOCOL.md:38-41`) | Runbook rejection s výslovnou odpovědností vlastníka; `intake:invalid` postup | 11 |

## 5. Privacy & security failure (soukromí a bezpečnost)

| Threat | Entry point | Impact | Likelihood | Existing control | Missing control | Phase |
|---|---|---|---|---|---|---|
| Zveřejnění identity oznamovatele | GitHub účet (vždy veřejný) + pole `identity` v `reakce-subjektu.yml:25-31` | Trvalá veřejná vazba osoba↔obvinění | H | Poctivé přiznání „nemáme důvěrný kanál" (`config.yml:8`, SECURITY.md:22-27, `reakce-subjektu.yml:10`) | Výslovné pojmenování důsledku ve formulářích; nikdy neslibovat anonymitu (invariant); skutečný whistleblower kanál = mimo scope, samostatný projekt | 5 |
| EXIF / metadata dokumentů v přílohách | GitHub attachment upload | Deanonymizace zdroje | M | Žádný (GitHub přílohy nekontrolovatelné) | Formulář přílohy nezakazuje — doplnit pokyn „nepřikládejte dokumenty"; intake přílohy ignoruje a nestahuje | 5, 4 |
| Neveřejná příloha / uniklý dokument | Issue attachment | Právní riziko, poškození třetích osob | M | Checkbox jen v `oprava-faktu.yml:37`; v návrhovém formu chybí | Povinný checkbox „pouze veřejné zdroje"; risk flag; runbook rychlého odstranění | 5, 11 |
| Token/credentials v URL | `sources` pole | Únik cizích přihlašovacích údajů | M | Žádný | URL syntax policy: odmítnout credentials v URL, strip tracking parametrů, report bez plné URL | 4 |
| Osobní e-mail/telefon/adresa/zdravotní/rodinné údaje v textu | Volná pole | Trvalé PII v issue | H | Vzor existuje v kódu: `stripPersonalData()` v `expand-entity.mjs:113-135` (nikdy nečte datum narození/adresu z rejstříku) | PII detekce jako risk flag (`security_review_required`); redakce reportů; runbook | 3, 11 |
| Secrets v artifacts / dlouhá retention | Budoucí intake artefakty | Únik dat z workflow | L | Deploy artefakty 7 dní (`deploy.yml:75`) | Intake artefakty bez raw body, retention ≤ 7 dní, žádné secrets v issue-triggered workflow | 6 |

---

## 6. SSRF threat model pro budoucí URL preflight (Fáze 4 — jen návrh)

Ve Fázi 1–3 ŽÁDNÝ HTTP klient nevzniká. Až vznikne (Fáze 4), musí pokrýt všechny
následující vektory. Fail-closed: co není výslovně povoleno, je zamítnuto.

### 6.1 Vektory

| Vektor | Příklad | Ochrana |
|---|---|---|
| localhost / loopback | `http://localhost/`, `127.0.0.1`, `127.8.4.2` (celý `127.0.0.0/8`) | IP klasifikace před požadavkem |
| RFC1918 | `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` | blokace třídy `private` |
| Carrier-grade NAT | `100.64.0.0/10` | blokace |
| Link-local | `169.254.0.0/16` (vč. `169.254.169.254`) | blokace |
| Multicast/reserved | `224.0.0.0/4`, `240.0.0.0/4`, `0.0.0.0/8`, `192.0.0.0/24`, benchmarking, dokumentační rozsahy | blokace |
| IPv6 loopback / unique local / link-local | `::1`, `fc00::/7`, `fe80::/10` | blokace |
| IPv4-mapped IPv6 | `::ffff:127.0.0.1`, `::ffff:10.0.0.1` | normalizovat na IPv4 a klasifikovat |
| Alternativní zápisy IP | `http://2130706433/` (decimal), `0x7f000001` (hex), `0177.0.0.1` (octal), `127.1` | parser normalizuje PŘED klasifikací; nestandardní zápis = reject |
| Localhost hostname varianty | `localhost.`, `LOCALHOST`, `localhost.localdomain`, `*.localhost` | hostname blocklist case-insensitive |
| DNS rebinding | doména resolvuje nejdřív veřejně, pak privátně | resolvovat jednou, klasifikovat VŠECHNY A/AAAA záznamy, connect na ověřenou IP (pin), re-check remote address po connectu |
| Redirect na private IP / redirect chain | 301 → `http://169.254.169.254/` | plná re-validace (DNS + IP klasifikace) po KAŽDÉM redirectu; max redirectů |
| IDN homografy | `аpple.com` (cyrilice) | punycode normalizace, risk flag `idn_homograph` |
| Credentials v URL | `https://user:pass@host/` | reject |
| Non-HTTP protokoly | `file://`, `gopher://`, `ftp://`, `dict://`, `ldap://`, `jar:` | pouze `https:` (příp. `http:` s risk flagem), vše ostatní reject |
| Cloud metadata endpointy | `169.254.169.254`, `metadata.google.internal`, `100.100.100.200`, `fd00:ec2::254` | IP i hostname blocklist |
| Oversized response / compressed bomb | 10 GB gzip | max bytes limit na dekomprimovaná data, streaming abort |
| Slow response / infinite stream | tarpit, SSE | celkový timeout + read timeout |
| Attachment / executable content | `Content-Type: application/octet-stream`, `.exe` | content-type whitelist (`text/html`, `application/xhtml+xml`, příp. `application/pdf` jen jako existence-check bez stažení) |

### 6.2 Navrhované limity (závazné pro Fázi 4)

```text
timeout celkem:        10 s / URL, read timeout 5 s
max redirectů:         3 (každý s plnou re-validací DNS+IP)
max bytes:             512 KiB (po dekompresi; hard abort)
metody:                HEAD, poté podmíněný GET (jen text/html)
user-agent:            "vomaste-intake-preflight/<verze> (+https://vomaste.cz/dokumentace/)"
cookies:               žádné (ignorovat Set-Cookie)
autentizace:           žádná
JavaScript:            žádný (žádný headless browser)
ukládání body:         nikdy celé; jen extrahovaná metadata (title, canonical, published)
DNS/IP check:          před požadavkem A po každém redirectu; pin na ověřenou IP
souběžnost:            1 URL současně, min. 1 s rozestup, max N URL na intake
```

### 6.3 Editorial limitation (povinná součást každého preflight výstupu)

```text
HTTP 200 ≠ důvěryhodný zdroj
reachable ≠ nezávislý zdroj
metadata extracted ≠ článek přečten
URL submitted ≠ tvrzení ověřeno
```

---

## 7. Souhrn: nejzávažnější kombinovaný scénář

Dnešní stav (bez intake automatu) má malou útočnou plochu na automatizaci, ale velkou na
lidi: **`blank_issues_enabled: true` + návrhový formulář bez varování a checkboxu**
znamená, že nejpravděpodobnější cesta citlivého podnětu (obvinění + PII + neveřejný
materiál) vede přes kanál s nulovou obranou a trvalou veřejnou publikací. To je nutná
oprava už ve Fázi 5 (změny formulářů), nezávisle na jakékoli automatizaci. Automatizační
rizika (injection, SSRF, privilege escalation) vznikají až s Fázemi 4/6 a návrh je řeší
fail-closed konstrukcí, minimálními permissions a determinismem parseru.
