# CloudFront fallback před GitHub Pages

**Stav: nepoužito, drženo v zásobě.** `vomaste.cz` jede od 2026-07-29 přímo na
GitHub Pages s certifikátem od Let's Encrypt, který vydává a obnovuje GitHub
(`CN=vomaste.cz`, SAN `vomaste.cz` + `www.vomaste.cz`). Tyhle skripty existují
pro jediný scénář: **GitHub certifikát nevydá, nenasadí na edge, nebo ho
neobnoví** — což je jediná část řetězu, kterou jako vlastník domény nemáme jak
ovlivnit (TLS terminuje GitHub, vlastní certifikát na Pages nahrát nelze).

Nespouštěj je proto, že „CloudFront je lepší". Spusť je, když je HTTPS na Pages
rozbité a čekání nepomáhá.

## Kdy to má smysl

| příznak | tohle pomůže? |
|---|---|
| `NET::ERR_CERT_COMMON_NAME_INVALID`, edge servíruje `CN=*.github.io` | až po vyčerpání trpělivosti — obvykle to samo dojde do desítek minut, případně po odebrání a znovupřidání domény v Pages |
| GitHub cert vůbec nevydá (`certificate does not exist yet` hodiny) | ano |
| cert se neobnovil a expiroval | ano |
| web 404 / špatné assety | ne, to je chyba buildu nebo `base_url`, ne TLS |

Než sáhneš sem, zkus levnější věc: `gh api -X PUT repos/<repo>/pages` s
`{"cname": null}` a hned zpátky s `{"cname": "vomaste.cz"}`. Tím se restartuje
ACME autorizace na straně GitHubu. Přesně to 2026-07-29 zabralo (cert naskočil
za ~8,5 minuty).

## Co ta konstrukce dělá

```
prohlížeč ──TLS(ACM cert)──> CloudFront ──TLS(https-only)──> korczis.github.io
                              (apex + www alias v Route 53)      (GitHub Pages)
```

CloudFront přebírá TLS pro `vomaste.cz`, certifikát je z ACM (DNS validace
v Route 53, automatické obnovování). Origin zůstává GitHub Pages, takže deploy
pipeline, `base_url` ani obsah se nemění.

### Dva režimy originu

`CF_ORIGIN_MODE=host-override` (**výchozí, doporučený**)
: CloudFront přeposílá viewer `Host: vomaste.cz` na `korczis.github.io`
  (managed origin request policy `AllViewer`). Pages podle Host hlavičky
  obslouží custom-domain web přímo, bez redirectu. Custom domain v Pages
  **zůstává připojená** a `static/CNAME` zůstává v repu — nulová změna v repu,
  nulový výpadek, jediná změna je přehození apex/www v Route 53.

`CF_ORIGIN_MODE=origin-path`
: CloudFront se ptá na `korczis.github.io/vomaste.cz/...` s vlastní Host
  hlavičkou (`AllViewerExceptHostHeader`). Vyžaduje **odebrat custom domain
  z Pages a smazat `static/CNAME` z repa** — jinak Pages odpoví 301 na apex a
  request se přes CloudFront zacyklí. Znamená to commit + deploy a krátký
  výpadek mezi odpojením domény a přehozením DNS. Použij, jen když
  `host-override` nefunguje.

Pozor na vazbu: `static/CNAME` je load-bearing. Při workflow deployi Pages
custom doménu čte právě z něj, takže samotné odebrání přes API bez smazání
souboru se při dalším deployi vrátí zpátky.

## Postup

```bash
cd scripts/infra/cloudfront-fallback

./01-acm-request.sh        # ACM cert v us-east-1 + validační CNAME v Route 53
./02-cloudfront-create.sh  # distribuce + smoke test přes její vlastní hostname
./03-route53-switch.sh     # CUTOVER: apex + www alias na distribuci
./04-verify.sh             # DNS, TLS subject, redirecty, spot-check rout
```

Kroky 1 a 2 jsou pro návštěvníky bez efektu — nic na distribuci nemíří, dokud
neproběhne krok 3. Krok 2 se sám otestuje přes hostname distribuce (`--resolve`),
takže cutover děláš až s vědomím, že origin odpovídá 200.

Vizuální kontrola po cutoveru — `visual-check.mjs` v téhle složce je přesně ten
skript, kterým se validoval přechod na custom doménu 2026-07-29. Jede dvakrát:
se striktním TLS (co vidí prohlížeč) a s `ignoreHTTPSErrors` (aby se odlišil
rozbitý certifikát od rozbitého webu). Bar je `strict-tls: LOADED status=200`,
0 console errors, 0 failed/4xx requestů:

```bash
npx --yes playwright@1.62.0 install chromium
npm --prefix /tmp/pw i --no-save playwright@1.62.0
NODE_PATH=/tmp/pw/node_modules node visual-check.mjs ./shots https://vomaste.cz
```

Rollback zpátky na GitHub Pages:

```bash
./99-rollback.sh                          # obnoví apex/www ze zálohy v state dir
./99-rollback.sh --disable-distribution    # a navíc vypne distribuci
```

## Parametry

Všechno se konfiguruje z prostředí (`env.sh`), nic není zadrátované — fork si
nastaví svou doménu a repo bez editace skriptů:

| proměnná | default | poznámka |
|---|---|---|
| `DOMAIN` | `vomaste.cz` | apex |
| `WWW_DOMAIN` | `www.$DOMAIN` | |
| `GH_REPO` | `korczis/vomaste.cz` | pro `gh api` v rollbacku |
| `GH_PAGES_HOST` | `korczis.github.io` | origin |
| `GH_PAGES_PATH` | `/vomaste.cz` | jen pro `origin-path`; `""` pro user site |
| `CF_ORIGIN_MODE` | `host-override` | viz výše |
| `CF_PRICE_CLASS` | `PriceClass_100` | NA + EU |
| `HOSTED_ZONE_ID` | dohledá se z `DOMAIN` | |
| `STATE_DIR` | `$TMPDIR/$DOMAIN-cf-fallback` | cert ARN, id distribuce, záloha DNS |

`STATE_DIR` je záměrně **mimo repo**: jsou to identifikátory vázané na konkrétní
AWS účet, které do gitu nepatří. Záloha DNS v něm je zároveň jediný zdroj pro
rollback — nemazat, dokud běží CloudFront varianta.

## Co to stojí a co si to bere

- ACM certifikát pro CloudFront: zdarma, obnovuje se sám při DNS validaci.
- CloudFront: platí se za requesty a transfer; free tier tohle měřítko webu
  pravděpodobně pokryje, ale na rozdíl od Pages to **není** garantovaně zdarma.
- Přidává to do řetězu AWS účet a jednu vrstvu, kterou musí forkující instance
  vlastnit. Proto je to fallback, ne default: default zůstává čistý GitHub
  Pages, který se forkne bez jakékoli privátní infrastruktury.
- Cache: `Managed-CachingOptimized`. Po deployi se nové soubory prosadí až po
  expiraci cache; při potřebě okamžitě použij
  `aws cloudfront create-invalidation --distribution-id <id> --paths '/*'`.
