# Claude Code Prompt — Phase 4 of N

# Bezpečný URL preflight, SSRF hardening a omezená metadata extrakce

Pracuješ v repozitáři:

```text
~/dev/vomaste.cz
```

Toto je **Phase 4** implementace veřejného dossier-intake workflow.

Phase 3 měla dodat:

* deterministický entity matching;
* candidate deduplikaci;
* duplicate intake detection;
* risk classification;
* rozšířený intake manifest;
* rozšířený Markdown report;
* testy a dokumentaci;
* explicitní Phase 4 contract.

Než začneš, najdi a přečti skutečné výstupy předchozích fází.

Preferované cesty:

```text
docs/adr/ADR-public-dossier-intake.md
reports/intake/phase-02-implementation-report.md
reports/intake/phase-03-implementation-report.md
reports/intake/phase-03-matching-inventory.md
docs/intake/intake-manifest.md
docs/intake/entity-matching.md
docs/intake/risk-classification.md
scripts/intake/**
schemas/intake*.json
tests/intake/**
```

Pokud Phase 3 neprojde:

```bash
npm run intake:fixture
npm run test:intake
npm run build
```

neimplementuj síťovou vrstvu na rozbitém základu.

---

# 0. Mise Phase 4

Implementuj bezpečný a přísně omezený technický preflight URL uvedených ve veřejném podnětu.

Cílový tok:

```text
syntakticky validovaná URL
→ canonical parsing
→ protocol policy
→ hostname validation
→ DNS resolution
→ IP classification
→ SSRF policy
→ omezený HTTP request
→ redirect-by-redirect revalidace
→ bounded response
→ omezená metadata extrakce
→ technický výsledek
→ manifest enrichment
→ report
```

Preflight smí odpovědět pouze na technické otázky:

* je URL syntakticky podporovaná;
* lze bezpečně provést request;
* kam URL redirectuje;
* jaký byl HTTP status;
* jaký content type server deklaruje;
* jaký omezený title nebo canonical URL lze extrahovat;
* kdy proběhla kontrola;
* proč byla URL zablokována.

Preflight nesmí rozhodnout:

* zda je zdroj důvěryhodný;
* zda je zdroj nezávislý;
* zda článek potvrzuje tvrzení;
* zda je vydavatel renomovaný;
* zda je obsah pravdivý;
* zda je source family samostatná;
* zda URL opravňuje vytvořit claim;
* zda má být dossier autorizován.

---

# 1. Nepřekročitelné invarianty

## 1.1 HTTP úspěch není redakční ověření

Do kódu, reportu a dokumentace vlož explicitní invariant:

```text
HTTP 200 ≠ důvěryhodný zdroj
reachable ≠ nezávislý zdroj
metadata extracted ≠ článek přečten
URL submitted ≠ tvrzení ověřeno
```

## 1.2 Fail-closed SSRF policy

Pokud nelze bezpečně určit, kam request směřuje:

```text
BLOCK
```

Pokud DNS vrací veřejnou i neveřejnou adresu:

```text
BLOCK
```

Pokud redirect vede na neveřejnou adresu:

```text
BLOCK
```

Pokud hostname po prvním rozlišení změní adresu neočekávaným způsobem:

```text
BLOCK
```

Pokud parser IP nebo hostname nerozumí:

```text
BLOCK
```

## 1.3 Žádné credentials

URL obsahující:

```text
https://user:password@example.cz/
```

musí být zablokována nebo sanitizována podle Phase 3 policy.

Nikdy:

* neposílej credentials;
* neloguj celé credentials;
* neukládej je do reportu;
* nekopíruj je do redirect URL;
* neposílej je mezi hostnames.

## 1.4 Žádné cookies ani session state

Preflight nesmí:

* ukládat cookies;
* přijímat cookies mezi requesty;
* používat přihlášení;
* používat browser session;
* spouštět JavaScript;
* řešit CAPTCHA;
* obcházet paywall;
* používat credentials;
* používat proxy bez explicitního designu.

## 1.5 Žádné automatické stahování příloh

Preflight nesmí ukládat:

* PDF;
* ZIP;
* Office dokumenty;
* obrázky;
* audio;
* video;
* executable;
* archive;
* attachment body.

Může zaznamenat:

```text
content_type
content_length
content_disposition
```

a request ukončit.

---

# 2. Preflight před implementací

Spusť:

```bash
pwd
git rev-parse --show-toplevel
git branch --show-current
git rev-parse HEAD
git status --short
git diff --stat
git diff --cached --stat
```

Potom:

```bash
npm ci
npm run intake:fixture
npm run test:intake
npm run build
```

Zaznamenej baseline.

Zjisti:

* podporovanou Node.js verzi;
* zda lze použít built-in `fetch`;
* zda repo již používá HTTP klienta;
* zda existuje proxy konfigurace;
* zda existuje URL validator;
* zda existuje IP classification utility;
* zda existuje mock HTTP server infrastructure;
* zda CI povoluje lokální loopback test server;
* zda testy mohou monkeypatchovat DNS resolver.

Nepřidávej dependency, dokud neověříš, že ji nelze rozumně nahradit standardní knihovnou.

---

# 3. Architektura síťové vrstvy

Preferovaná struktura:

```text
scripts/intake/preflight/
  constants.mjs
  errors.mjs
  parse-url.mjs
  classify-hostname.mjs
  resolve-hostname.mjs
  classify-ip.mjs
  validate-destination.mjs
  request-once.mjs
  follow-redirects.mjs
  limit-response.mjs
  extract-html-metadata.mjs
  preflight-url.mjs
  preflight-urls.mjs
```

Rozděl:

1. čisté funkce bez sítě;
2. DNS adapter;
3. HTTP adapter;
4. orchestration;
5. metadata parser;
6. manifest enrichment.

Core policy nesmí být svázána s konkrétním HTTP klientem.

---

# 4. Adapter contracts

## 4.1 DNS resolver

Navrhni interface například:

```js
resolveHostname(hostname, options) => {
  addresses: [
    {
      address: "203.0.113.10",
      family: 4
    }
  ],
  resolvedAt: "...",
  ttl: null
}
```

Produkční adapter používá Node DNS.

Test adapter používá fixtures.

## 4.2 HTTP requester

Navrhni interface:

```js
requestOnce({
  url,
  method,
  headers,
  timeoutMs,
  maxBodyBytes,
  pinnedAddresses
}) => {
  status,
  headers,
  body,
  remoteAddress,
  timings
}
```

Pokud standardní `fetch` neumožní bezpečné připnutí cílové IP a kontrolu remote address, nepředstírej, že DNS precheck sám řeší DNS rebinding.

Vyhodnoť možnosti:

* custom `http`/`https` request;
* custom lookup function;
* Undici dispatcher;
* existující knihovna v repu.

Vyber řešení, které umožní:

* kontrolovat DNS resolution;
* připojit se pouze k validované IP;
* zachovat původní hostname pro TLS SNI;
* ověřit remote address;
* zakázat proxy environment inheritance;
* omezené redirecty.

## 4.3 Clock

Všechny timestamps musí být injektovatelné.

## 4.4 Logger

Logger musí podporovat redakci.

Nikdy neloguj celé response body.

---

# 5. URL syntax policy

Phase 3 URL parser rozšiř o bezpečnostní klasifikaci.

## 5.1 Povolené protokoly

Povol pouze:

```text
https:
http:
```

Preferuj HTTPS.

HTTP není automaticky blokované, ale označ:

```text
insecure_transport
```

a neprováděj automatický upgrade, pokud server sám neredirectuje.

## 5.2 Zakázané protokoly

Blokuj:

```text
file:
ftp:
ftps:
data:
javascript:
blob:
mailto:
ssh:
git:
gopher:
ws:
wss:
smb:
nfs:
ldap:
ldaps:
```

Neudržuj blacklist jako jedinou obranu. Použij allowlist.

## 5.3 Credentials

Blokuj URL s:

```text
username
password
```

Výstup:

```text
blocked_url_credentials
```

## 5.4 Fragment

Fragment neposílej serveru.

Může být zachován jako input observation, ale request URL jej musí odstranit.

## 5.5 Port policy

Povol standardně:

```text
80
443
```

Vyhodnoť, zda povolit jiné porty.

Bez silného důvodu blokuj nestandardní porty.

Minimálně blokuj běžné interní a administrativní porty:

```text
22
25
53
2375
2376
3000
3306
5432
6379
8080
8443
9200
11211
27017
```

Lepší výchozí politika:

```text
allowed_ports = [80, 443]
```

## 5.6 Hostname

Blokuj:

* prázdný hostname;
* trailing dot podle explicitní policy;
* whitespace;
* control chars;
* invalid IDNA;
* hostname přes maximální délku;
* label přes maximální délku;
* single-label hostnames;
* `.local`;
* `.localhost`;
* `.internal`;
* `.home`;
* `.lan`;
* `.test`;
* `.invalid`;
* `.example`, pokud test adapter explicitně nepovolí fixture režim.

Produkční a test policy odděl.

---

# 6. IP classification

Implementuj vlastní nebo ověřenou klasifikaci IPv4 a IPv6.

## 6.1 IPv4 blokované rozsahy

Minimálně:

```text
0.0.0.0/8
10.0.0.0/8
100.64.0.0/10
127.0.0.0/8
169.254.0.0/16
172.16.0.0/12
192.0.0.0/24
192.0.2.0/24
192.88.99.0/24
192.168.0.0/16
198.18.0.0/15
198.51.100.0/24
203.0.113.0/24
224.0.0.0/4
240.0.0.0/4
255.255.255.255/32
```

Pozor: dokumentační rozsahy jako `192.0.2.0/24` jsou veřejně neroutovatelné a pro production preflight mají být blokované.

## 6.2 IPv6 blokované rozsahy

Minimálně:

```text
::/128
::1/128
::ffff:0:0/96
64:ff9b::/96 podle policy
100::/64
2001:db8::/32
2001:10::/28
fc00::/7
fe80::/10
ff00::/8
```

IPv4-mapped IPv6 adresy klasifikuj podle vložené IPv4.

## 6.3 Metadata endpoints

Explicitně blokuj:

```text
169.254.169.254
fd00:ec2::254
metadata.google.internal
metadata.azure.internal
```

Nespoléhej pouze na hostname blacklist. IP classification musí stačit.

## 6.4 Alternative IP representations

Otestuj a blokuj nebo canonicalizuj:

```text
127.1
2130706433
0177.0.0.1
0x7f000001
[::ffff:127.0.0.1]
```

Použij standardní URL parser, ale nepočítej s tím, že všechny runtime verze interpretují historické formy stejně.

---

# 7. DNS resolution policy

## 7.1 A i AAAA

Resolve:

* IPv4;
* IPv6.

Pokud je jediná odpověď neveřejná:

```text
BLOCK
```

Pokud je směs veřejných a neveřejných:

```text
BLOCK
```

Pokud je více veřejných:

* všechny validuj;
* request smí použít pouze jednu z validovaných;
* remote address musí patřit do validované sady.

## 7.2 DNS failure

Rozliš:

```text
dns_not_found
dns_timeout
dns_temporary_failure
dns_invalid_response
dns_private_address
dns_mixed_public_private
```

## 7.3 DNS rebinding

Preflight nesmí dělat pouze:

```text
resolve
→ později fetch hostname
```

protože druhý resolver může vrátit jinou IP.

Použij jednu z bezpečných strategií:

1. připnutí spojení k validované IP;
2. custom lookup vracející pouze validovanou IP;
3. kontrola remote address po navázání spojení;
4. kombinace výše.

TLS musí stále ověřovat certifikát pro původní hostname.

## 7.4 CNAME

Pokud resolver poskytuje CNAME chain:

* validuj každý hostname;
* blokuj interní suffix;
* konečné IP musí projít klasifikací.

Pokud standardní resolver chain neposkytuje, dokumentuj omezení.

---

# 8. HTTP request policy

## 8.1 Method

Preferuj:

```text
GET
```

HEAD může být nespolehlivý a servery se chovají rozdílně.

Můžeš použít HEAD jako první krok pouze pokud fallback na GET je explicitní a testovaný.

Jednodušší MVP:

```text
GET s omezeným body limitem
```

## 8.2 Headers

Použij minimální statické headers:

```text
User-Agent: vomaste.cz-source-preflight/<version>
Accept: text/html,application/xhtml+xml;q=0.9,*/*;q=0.1
Accept-Encoding: identity
```

Neposílej:

* cookies;
* referer;
* authorization;
* browser fingerprint headers;
* issue text;
* user identity.

`Accept-Encoding: identity` omezuje compressed bomb riziko.

Pokud klient automaticky dekomprimuje, explicitně zohledni compressed i decompressed limit.

## 8.3 Timeouty

Definuj odděleně:

```text
dns_timeout_ms
connect_timeout_ms
headers_timeout_ms
body_timeout_ms
total_timeout_ms
```

Příklad rozumného MVP:

```text
DNS: 3 s
connect: 5 s
headers: 8 s
body: 5 s
total: 12 s
```

Použij Phase 1/3 kontrakt, pokud stanovil jiné hodnoty.

## 8.4 Response limit

Pro metadata extrakci stačí malý prefix.

Preferuj:

```text
max_body_bytes = 256 KiB
```

nebo méně.

Při překročení:

```text
body_truncated = true
```

a spojení ukonči.

Nikdy nestahuj celý článek jen kvůli `<title>`.

## 8.5 Content length

Pokud server deklaruje extrémní `Content-Length`, můžeš request ukončit před čtením body.

Neber `Content-Length` jako důvěryhodný, stále enforce stream limit.

## 8.6 Compression

Preferuj žádnou kompresi.

Pokud server kompresi pošle navzdory headers:

* buď blokuj;
* nebo enforce limit před i po dekompresi.

Nevkládej decompression bomb do paměti.

---

# 9. Redirect policy

## 9.1 Maximum

Povol maximálně:

```text
3 redirecty
```

nebo Phase 3 contract.

## 9.2 Každý redirect znovu validuj

Pro každý `Location`:

1. resolve relativní URL;
2. parse;
3. protocol allowlist;
4. credentials check;
5. port check;
6. hostname policy;
7. DNS resolution;
8. IP classification;
9. pinned request.

Nikdy nepřebírej důvěru z původního hostu.

## 9.3 Scheme downgrade

Označ nebo blokuj:

```text
https → http
```

Preferovaně blokuj jako:

```text
redirect_transport_downgrade
```

## 9.4 Credential propagation

Nikdy nepřenášej authorization ani cookies.

Žádné takové headers ostatně neposíláš.

## 9.5 Redirect loop

Detekuj canonical URL loop.

Výstup:

```text
redirect_loop
```

## 9.6 Cross-host redirects

Povol pouze pokud nový host projde celou validací.

Zaznamenej redirect chain.

---

# 10. TLS policy

Pro HTTPS:

* ověř certifikát;
* ověř hostname;
* nepovoluj self-signed certifikát;
* nepovoluj invalidní chain;
* nepovoluj expired certifikát;
* nepřidávej `rejectUnauthorized: false`;
* neimplementuj insecure fallback na HTTP.

Výstupy:

```text
tls_certificate_error
tls_hostname_mismatch
tls_expired_certificate
tls_protocol_error
```

Nevypisuj celý certifikát do reportu.

---

# 11. Remote address verification

Po navázání spojení ověř:

```text
socket.remoteAddress
```

Musí:

* být validní IP;
* být veřejná;
* patřit do předem validované sady;
* odpovídat family policy.

Pokud ne:

```text
BLOCK
```

Výstup:

```text
remote_address_mismatch
```

To je kritický gate, ne warning.

---

# 12. Metadata extrakce

Extrahuj pouze omezená metadata z HTML prefixu.

## 12.1 Povolená metadata

Maximálně:

```text
<title>
<link rel="canonical">
<meta property="og:title">
<meta property="og:site_name">
<meta property="og:type">
<meta name="description">
<meta property="article:published_time">
<meta property="article:modified_time">
```

Nepřebírej metadata jako fakt bez označení:

```text
declared_by_page
```

## 12.2 Parser

Nepoužívej regex pro plné HTML.

Pokud repo má HTML parser, použij jej.

Pokud ne, zvaž lehkou bezpečnou dependency nebo omezený streaming parser.

Nespouštěj:

* scripts;
* styles;
* external resources;
* images;
* iframe;
* preload;
* fonty.

## 12.3 Metadata limits

Omez:

```text
title: 500 znaků
description: 2 000 znaků
canonical URL: 2 048 znaků
metadata fields: pevný allowlist
```

## 12.4 Canonical URL

Canonical URL pouze zaznamenej.

Neprováděj automaticky další request.

Validuj syntaxi.

Pokud canonical vede na interní adresu, označ ji jako unsafe metadata value.

## 12.5 Charset

Podporuj bezpečně:

* UTF-8;
* případně charset z Content-Type.

Neimplementuj široký encoding zoo, pokud není nutná.

Při neznámém charsetu:

```text
metadata_extraction_skipped
```

---

# 13. Content-type policy

## 13.1 HTML

Pro:

```text
text/html
application/xhtml+xml
```

lze extrahovat metadata.

## 13.2 PDF

Pro:

```text
application/pdf
```

pouze zaznamenej content type a status.

Nestahuj celý PDF.

Neprováděj OCR.

## 13.3 JSON/XML

Pro API nebo feed content types:

* zaznamenej;
* neparsuj do redakčního obsahu;
* neinterpretuj claims.

## 13.4 Binary

Pro binární content:

```text
metadata_extraction = skipped
```

## 13.5 MIME sniffing

Nespoléhej slepě na server.

Můžeš provést omezené bezpečné sniffing prvních bajtů pouze pro klasifikaci, nikoli pro spuštění parseru mimo allowlist.

---

# 14. Preflight result model

Rozšiř manifest o:

```json
{
  "source_preflight": {
    "version": "1.0.0",
    "checked_at": "2026-08-02T00:00:00Z",
    "results": [
      {
        "submitted_url": "https://example.cz/article",
        "normalized_url": "https://example.cz/article",
        "status": "reachable",
        "policy_decision": "allowed",
        "http": {
          "status": 200,
          "content_type": "text/html",
          "content_length_declared": 12345,
          "body_bytes_read": 32768,
          "body_truncated": true
        },
        "network": {
          "resolved_addresses": [
            {
              "address": "93.184.216.34",
              "family": 4,
              "classification": "public"
            }
          ],
          "remote_address": "93.184.216.34"
        },
        "redirects": [],
        "metadata": {
          "title": "...",
          "canonical_url": "...",
          "site_name": "..."
        },
        "editorial_verification": "not_performed",
        "warnings": [],
        "errors": []
      }
    ]
  }
}
```

Přesný tvar přizpůsob schema conventions.

## 14.1 Status enum

Preferuj:

```text
reachable
unreachable
blocked
timeout
invalid
unsupported
partial
```

## 14.2 Policy decision

Odděl:

```text
allowed
blocked
not_attempted
```

od technického statusu.

## 14.3 Editorial verification

Vždy:

```text
not_performed
```

Phase 4 nesmí umět jinou hodnotu.

---

# 15. Risk integration

Preflight výsledky musí doplnit risk flags.

Minimálně:

```text
url_invalid
url_unsupported_protocol
url_contains_credentials
url_nonstandard_port
url_private_destination
url_mixed_public_private_dns
url_dns_failure
url_redirect_private_destination
url_redirect_loop
url_redirect_transport_downgrade
url_tls_error
url_timeout
url_response_too_large
url_unsupported_content_type
url_metadata_extraction_failed
url_preflight_partial
url_preflight_failed
```

## 15.1 Workflow effect

Bezpečnostní blokace:

```text
security_review_required
```

Běžná nedostupnost veřejného článku:

```text
triage
```

nebo warning, nikoli automatické zamítnutí.

Rozliš:

```text
unsafe URL
```

a:

```text
safe destination, but server unavailable
```

---

# 16. Concurrency a rate limiting

## 16.1 URL count

Použij Phase 2 limit, například max 100 URL.

Pro první MVP omez skutečně preflightované URL například na:

```text
20
```

Zbytek označ:

```text
not_attempted_limit
```

## 16.2 Concurrency

Použij nízkou concurrency:

```text
2 až 4
```

Neposílej desítky paralelních requestů.

## 16.3 Per-host limit

Maximálně:

```text
1 současný request na hostname
```

## 16.4 Delay

Zvaž malý delay mezi requesty na stejný host.

Není cílem crawlovat web.

## 16.5 Retry

Výchozí:

```text
žádné automatické retry
```

Případně jeden retry pouze pro vybrané transient DNS/network chyby.

Nikdy nerepeat request po timeoutu bez limitu.

---

# 17. User-Agent a identifikace

Použij čestný User-Agent:

```text
vomaste.cz-source-preflight/1.0 (+https://vomaste.cz/)
```

Neimituj Chrome.

Neskrývej automatizaci.

Nevkládej issue number ani uživatelská data do User-Agent.

---

# 18. Robots a crawling boundary

Preflight není crawler.

Rozhodni a zdokumentuj, zda respektovat `robots.txt`.

Protože se načítá pouze uživatelem předaná konkrétní URL a malý HTML prefix, může být `robots.txt` mimo MVP.

Pokud jej neimplementuješ:

* explicitně to dokumentuj;
* neprováděj následné crawling;
* neprocházej odkazy;
* nestahuj sitemap;
* nehledej další stránky.

---

# 19. Testovací infrastruktura

Všechny automatické testy musí být deterministické.

Nepoužívej veřejný internet v test suite.

## 19.1 Lokální mock server

Vytvoř test server, který umí simulovat:

* 200 HTML;
* 301/302/307/308;
* redirect loop;
* redirect na private IP;
* slow headers;
* slow body;
* oversized body;
* chunked response;
* wrong content length;
* gzip despite identity;
* invalid HTML;
* PDF content type;
* binary body;
* malformed Location;
* HTTPS s test certifikátem, pokud bezpečně proveditelné.

## 19.2 DNS adapter fixtures

Simuluj:

* public IPv4;
* public IPv6;
* private IPv4;
* private IPv6;
* mixed public/private;
* multiple public;
* NXDOMAIN;
* timeout;
* changed answer;
* IPv4-mapped IPv6;
* metadata endpoint.

## 19.3 Production policy versus test transport

Lokální test server běží na loopback, který production policy správně blokuje.

Proto odděl:

* production destination policy;
* injected test transport.

Nikdy nepřidávej `ALLOW_PRIVATE_NETWORK=true` do production CLI.

Test harness smí použít explicitní interní adapter dostupný pouze z test kódu.

Žádný env bypass použitelný v GitHub workflow.

---

# 20. Povinné SSRF test cases

Testuj minimálně:

## IPv4

```text
http://127.0.0.1/
http://127.1/
http://0.0.0.0/
http://10.0.0.1/
http://172.16.0.1/
http://192.168.1.1/
http://169.254.169.254/
http://100.64.0.1/
http://2130706433/
http://0x7f000001/
```

## IPv6

```text
http://[::1]/
http://[::]/
http://[fc00::1]/
http://[fe80::1]/
http://[::ffff:127.0.0.1]/
```

## Hostnames

```text
http://localhost/
http://localhost.localdomain/
http://metadata.google.internal/
http://example.local/
```

## Redirects

* public → private;
* public → localhost;
* public → metadata endpoint;
* public HTTPS → public HTTP;
* public → URL with credentials;
* loop;
* chain over maximum.

## DNS

* public při prechecku, private při connection lookup;
* mixed answers;
* public remote address mimo pinned set;
* CNAME na interní hostname, pokud adapter podporuje.

---

# 21. HTTP robustness test cases

Testuj:

* timeout před headers;
* timeout během body;
* connection reset;
* invalid status line;
* malformed headers;
* příliš mnoho headers;
* oversized header;
* chunked endless body;
* declared small body, skutečně velký;
* content encoding bomb;
* unsupported charset;
* HTML bez title;
* title přes limit;
* duplicate canonical;
* invalid canonical;
* hostile metadata HTML;
* embedded script, který se nesmí spustit;
* base tag ovlivňující canonical resolution.

---

# 22. Logging a error model

## 22.1 Error classes

Definuj explicitní chyby:

```text
UrlPolicyError
DnsResolutionError
DestinationBlockedError
NetworkTimeoutError
TlsError
RedirectPolicyError
ResponseLimitError
MetadataExtractionError
```

## 22.2 User-facing message

Krátká a bezpečná.

## 22.3 Internal diagnostic

Může obsahovat technické detaily, ale:

* ne credentials;
* ne celé body;
* ne secrets;
* ne stack trace v issue reportu.

## 22.4 Stable codes

Každá chyba musí mít stabilní `code`.

Report a workflow se nesmí rozhodovat podle textu message.

---

# 23. CLI integration

Rozšiř lokální procesor.

Preferovaný příkaz:

```bash
node scripts/intake/process-issue.mjs \
  --event tests/intake/fixtures/valid-new-dossier.json \
  --output-dir .tmp/intake \
  --generated-at 2026-08-02T00:00:00Z \
  --repository-commit 0123456789abcdef \
  --preflight
```

## 23.1 Default

Rozhodni, zda je preflight opt-in.

Pro Phase 4 preferuj:

```text
default offline
--preflight explicitně zapne síť
```

To zachová bezpečnou lokální reprodukovatelnost.

## 23.2 Offline tests

Stávající `npm run intake:fixture` může zůstat offline.

Přidej:

```text
npm run intake:preflight-fixture
```

s mock transportem.

## 23.3 Production transport

Produkční transport se smí použít pouze explicitním příkazem.

Žádné automatické network requesty při běžném buildu.

---

# 24. Build a CI boundary

`npm run build` nesmí otevírat veřejný internet.

Build může:

* spustit unit tests;
* spustit mock preflight tests;
* validovat schemas;
* spustit static security gates.

Build nesmí:

* preflightovat skutečné URL;
* záviset na DNS;
* záviset na internet connectivity.

---

# 25. Schema versioning

Rozšíření o `source_preflight` pravděpodobně mění manifest schema.

Dodrž Phase 2/3 versioning policy.

Zvaž:

```text
1.1.0
```

pokud je pole optional a backward-compatible.

Nebo:

```text
2.0.0
```

pokud mění required structure.

Nevytvářej schema chaos.

## 25.1 Preflight schema

Může být samostatné:

```text
schemas/intake-source-preflight.schema.json
```

a referencované z hlavního manifestu.

Preferuj modularitu, pokud repo používá `$ref`.

---

# 26. Report

Rozšiř Markdown report:

```markdown
## Technická kontrola uvedených URL

> Tato kontrola ověřuje pouze technickou dostupnost a bezpečnost cíle.
> Neověřuje pravdivost, nezávislost ani redakční kvalitu zdroje.

| URL | Výsledek | HTTP | Typ obsahu | Redirecty | Poznámka |
|---|---|---:|---|---:|---|

### Blokované adresy

...

### Technická metadata

- Deklarovaný název stránky:
- Deklarovaný web:
- Canonical URL:
- Editorial verification: neprovedeno
```

## 26.1 URL display

V reportu:

* neutralizuj credentials;
* zkrať extrémně dlouhé URL;
* zachovej bezpečný odkaz pouze pokud destination policy dovolila;
* blocked URL nemusí být aktivní clickable link.

## 26.2 Redaction

Query může obsahovat token.

Detekuj citlivé parametry:

```text
token
access_token
auth
key
apikey
api_key
signature
sig
password
session
```

V reportu hodnotu redactuj.

Manifest policy rozhodni podle ADR. Preferuj redakci i v derived normalized URL, raw submission zůstává oddělený.

---

# 27. Dokumentace

Aktualizuj:

```text
docs/intake/url-preflight.md
docs/intake/security-boundary.md
docs/intake/intake-manifest.md
docs/intake/local-processor.md
reports/intake/phase-04-implementation-report.md
```

## 27.1 URL preflight dokumentace

Popiš:

* účel;
* non-goals;
* protocol policy;
* port policy;
* hostname policy;
* IP ranges;
* DNS rebinding defense;
* redirect policy;
* timeouty;
* body limits;
* metadata allowlist;
* error codes;
* test adapter;
* production adapter;
* known limitations.

## 27.2 Security boundary

Výslovně popiš:

* proč samotný DNS precheck nestačí;
* jak se pinuje IP;
* jak se ověřuje remote address;
* proč build nepoužívá síť;
* proč GitHub Actions bude potřebovat zvláštní threat model;
* jak se redigují URL secrets.

## 27.3 ADR

Aktualizuj decision log.

---

# 28. Statické bezpečnostní gates

Přidej kontroly:

* žádný `rejectUnauthorized: false`;
* žádný global proxy inheritance;
* žádný unrestricted redirect mode;
* žádný `fetch(url)` mimo schválený transport;
* žádné `child_process` volání curl/wget;
* žádný env bypass privátních IP;
* žádný test-only bypass importovatelný production entrypointem;
* žádný network request při buildu;
* žádné credentials v snapshots.

---

# 29. Performance

Měř:

* DNS classification;
* jeden mock request;
* 20 URL s concurrency 3;
* oversized response abort;
* redirect chain;
* metadata parsing maximálního prefixu.

Cílem není scraping throughput.

Cílem je bounded, předvídatelné chování.

---

# 30. Co Phase 4 neimplementuje

Neimplementuj:

* source trust scoring;
* source family classification;
* article body extraction;
* full-text storage;
* archiving;
* screenshot;
* PDF parsing;
* OCR;
* browser automation;
* JavaScript rendering;
* paywall bypass;
* robots crawler;
* recursive link discovery;
* AI summary;
* claim extraction;
* redakční ověření;
* GitHub Actions;
* issue comments;
* web CTA;
* autorizaci;
* investigation;
* PR;
* merge;
* deploy.

---

# 31. Akceptační kritéria

Phase 4 je hotová pouze tehdy, když:

1. Phase 3 baseline projde.
2. Existuje oddělený DNS adapter.
3. Existuje oddělený HTTP adapter.
4. Core policy je testovatelná bez sítě.
5. Produkční URL policy je fail-closed.
6. Povolené jsou pouze HTTP a HTTPS.
7. URL credentials jsou blokované.
8. Nestandardní porty jsou blokované nebo explicitně řízené.
9. Single-label hostnames jsou blokované.
10. Interní suffixy jsou blokované.
11. IPv4 private ranges jsou blokované.
12. IPv6 private ranges jsou blokované.
13. Link-local ranges jsou blokované.
14. Loopback je blokovaný.
15. Metadata endpoints jsou blokované.
16. IPv4-mapped IPv6 je správně klasifikované.
17. Alternative IPv4 representations jsou testované.
18. Mixed public/private DNS je blokované.
19. DNS failure je bezpečně reportovaný.
20. DNS rebinding je mitigovaný.
21. Spojení používá validovanou IP.
22. TLS ověřuje původní hostname.
23. Remote address je ověřená.
24. Remote mismatch je blokovaný.
25. Redirect limit je omezený.
26. Každý redirect se znovu validuje.
27. Redirect na private IP je blokovaný.
28. HTTPS downgrade je blokovaný nebo explicitně označený podle schválené policy.
29. Redirect loop je detekovaný.
30. Cookies nejsou používány.
31. Authorization headers nejsou používány.
32. Proxy env není nekontrolovaně děděna.
33. JavaScript se nespouští.
34. Body limit je mechanicky vynucen.
35. Timeouty jsou mechanicky vynuceny.
36. Compression bomb je řešena.
37. Attachments se nestahují.
38. PDF se neparsuje.
39. HTML metadata parser má allowlist.
40. Metadata mají délkové limity.
41. Canonical URL se dále automaticky neotevírá.
42. Editorial verification je vždy `not_performed`.
43. Manifest obsahuje source preflight výsledky.
44. Report obsahuje disclaimer.
45. Report rediguje credentials.
46. Report rediguje token query params.
47. Risk flags jsou doplněny.
48. Security review precedence je deterministická.
49. Existuje lokální mock server.
50. Existuje mock DNS adapter.
51. Testy nepoužívají veřejný internet.
52. Build nepoužívá veřejný internet.
53. Existují SSRF testy pro IPv4.
54. Existují SSRF testy pro IPv6.
55. Existují redirect SSRF testy.
56. Existují DNS rebinding testy.
57. Existují remote address mismatch testy.
58. Existují timeout testy.
59. Existují oversized body testy.
60. Existují malformed response testy.
61. Existují metadata parser testy.
62. Existují redaction testy.
63. Existuje static insecure TLS gate.
64. Existuje static unrestricted fetch gate.
65. Procesor zůstává bez autorizační schopnosti.
66. Publication status zůstává blocked.
67. Nevznikla produkční entita.
68. Nevznikl dossier.
69. Nebyl vytvořen GitHub workflow.
70. Nebyla změněna autorizace.
71. `npm run intake:fixture` projde.
72. `npm run intake:preflight-fixture` projde.
73. `npm run test:intake` projde.
74. `npm run build` projde.
75. `git diff --check` projde.
76. Dokumentace odpovídá implementaci.
77. Phase 5 contract je explicitní.
78. Nevznikl commit bez explicitního pokynu.

---

# 32. Doporučené pořadí implementace

## Step 1

Ověř Phase 3 baseline.

## Step 2

Audituj existující HTTP a DNS utilities.

## Step 3

Definuj URL policy constants.

## Step 4

Implementuj pure IP classification.

## Step 5

Implementuj hostname policy.

## Step 6

Implementuj DNS adapter contract.

## Step 7

Implementuj production DNS adapter.

## Step 8

Implementuj mock DNS adapter.

## Step 9

Implementuj destination validator.

## Step 10

Vyber a implementuj pinned HTTP transport.

## Step 11

Implementuj remote address verification.

## Step 12

Implementuj timeouty a response limits.

## Step 13

Implementuj redirect orchestrator.

## Step 14

Implementuj content-type policy.

## Step 15

Implementuj metadata parser.

## Step 16

Implementuj redaction.

## Step 17

Implementuj preflight result model.

## Step 18

Integruj risk flags.

## Step 19

Rozšiř schema.

## Step 20

Rozšiř report.

## Step 21

Přidej mock server.

## Step 22

Přidej SSRF test matrix.

## Step 23

Přidej HTTP robustness testy.

## Step 24

Přidej package scripts.

## Step 25

Aktualizuj dokumentaci a ADR.

## Step 26

Spusť kompletní gates.

---

# 33. Phase 5 contract

Na konci definuj přesný kontrakt pro Phase 5:

```text
GitHub Issue Form a lokální end-to-end fixture
```

Phase 5 dostane:

* versioned form parser;
* intake schema;
* matching;
* risk classification;
* safe URL preflight;
* local processor;
* report renderer;
* žádné GitHub write operations.

Phase 5 má navrhnout a implementovat:

* finální Issue Form;
* hidden version marker;
* přesné headings;
* acknowledgements;
* unstructured text field;
* public-boundary warning;
* lokální fixture generovanou z reálného formátu;
* parser compatibility tests;
* end-to-end fixture bez GitHub API;
* dokumentaci pro veřejnost.

Neimplementuj Phase 5 nyní.

---

# 34. Průběžný report

Aktualizuj:

```text
reports/intake/phase-04-implementation-report.md
```

Obsah:

* base commit;
* baseline;
* transport decision;
* DNS strategy;
* rebinding defense;
* IP policy;
* redirect policy;
* timeouty;
* response limits;
* metadata allowlist;
* schema changes;
* test matrix;
* performance;
* known limitations;
* Phase 5 contract.

---

# 35. Závěrečný report

Na konci vypiš:

```text
PHASE=04
NAME=SAFE_URL_PREFLIGHT_AND_SSRF_HARDENING
STATUS=<VERIFIED|PARTIAL|BLOCKED>

REPOSITORY=<absolute-path>
BRANCH=<branch>
BASE_COMMIT=<sha>
FINAL_COMMIT=<sha-or-UNCHANGED>
WORKTREE_WAS_CLEAN=<true|false>

PHASE_03_BASELINE=<PASS|FAIL|PARTIAL>
DNS_ADAPTER=<path>
HTTP_ADAPTER=<path>
PREFLIGHT_ENTRYPOINT=<path>
IP_RANGE_TEST_COUNT=<number>
SSRF_TEST_COUNT=<number>
HTTP_TEST_COUNT=<number>

PUBLIC_INTERNET_USED_IN_TESTS=false
BUILD_USED_NETWORK=false
GITHUB_API_USED=false
AI_USED=false
AUTHORIZATION_CHANGED=false
PRODUCTION_DATA_CHANGED=false
WORKFLOW_CREATED=false
DOSSIER_CREATED=false
COMMIT_CREATED=false
PUSH_PERFORMED=false

INTAKE_FIXTURE=<PASS|FAIL|NOT_RUN>
PREFLIGHT_FIXTURE=<PASS|FAIL|NOT_RUN>
INTAKE_TESTS=<PASS|FAIL|NOT_RUN>
FINAL_BUILD=<PASS|FAIL|NOT_RUN>

RECOMMENDED_NEXT_PHASE=05
NEXT_PHASE_NAME=GITHUB_ISSUE_FORM_AND_LOCAL_END_TO_END_FIXTURE
```

Potom:

## Implemented

## Network architecture

## SSRF defenses

## Redirect policy

## Response limits

## Metadata extraction

## Security guarantees

## Test matrix

## Commands run

## Files changed

## Deviations

## Known limitations

## Phase 5 contract

---

# 36. Finální validace

Spusť minimálně:

```bash
npm run intake:fixture
npm run intake:preflight-fixture
npm run test:intake
npm run build
git diff --check
git status --short
git diff --stat
```

Ověř:

```bash
git diff -- AGENTS.md
git diff -- data/authorizations.toml
git diff -- .github/workflows
```

Očekávání:

```text
žádné změny
```

Pokud změny existovaly před Phase 4, přesně je označ jako pre-existing.

---

# 37. Pracovní styl

Buď paranoidní tam, kde je paranoia jen jiné slovo pro základní síťovou hygienu.

Nevěř hostname.

Nevěř DNS.

Nevěř redirectu.

Nevěř Content-Length.

Nevěř Content-Type.

Nevěř HTML metadata.

Nevěř tomu, že `fetch()` vyřeší bezpečnost tím, že má pěkné API.

Každý síťový krok musí mít:

```text
policy
limit
timeout
validation
stable error code
test
```

Výsledkem nemá být crawler.

Výsledkem má být malá, sevřená technická sonda:

```text
„Tuto konkrétní veřejnou URL lze bezpečně oslovit a server deklaruje tento technický výsledek.“
```

Nic víc.

Začni nyní Phase 4. Neimplementuj Phase 5.
