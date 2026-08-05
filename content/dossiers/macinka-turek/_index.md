+++
# GENERATED FILE. DO NOT EDIT. Zdroj: data/dossiers/** — regeneruje `npm run data:build`.
title = "Dossier — Petr Macinka a Filip Turek"
description = "Neutrální, zdroji podložený přehled politické kariéry a veřejně řešených kauz Petra Macinky a Filipa Turka. Registr tvrzení, registr zdrojů, graf vztahů. Průběžně sledované, nedokončené případy."
template = "dossier.html"
aliases = ["/dossier/"]

[extra]
generated = true
record_id = "https://vomaste.cz/id/dossiers/macinka-turek"
view_model = "generated/views/dossiers/macinka-turek/overview.json"
dossier = "macinka-turek"
record_type = "dossier"
dossier_type = "aggregate"
lang = "cs"
updated = "2026-07-29"
reviewed_at = "2026-07-29"
+++
<div class="legend">
  <span><span class="status-badge status-corroborated">Ověřeno více zdroji</span> potvrzeno nezávisle více médii</span>
  <span><span class="status-badge status-single">1 zdroj</span> doloženo jedním citovaným zdrojem, bez nezávislého potvrzení druhou redakcí</span>
  <span><span class="status-badge status-quote">Citace</span> přímý výrok, ne hodnocení tohoto webu</span>
  <span><span class="status-badge status-disputed">Sporné</span> neuzavřené, nepotvrzené tvrzení</span>
  <span><span class="status-badge status-opinion">Názor</span> autorský komentář, ne zpravodajství</span>
</div>

## Kdo

- **Petr Macinka** — předseda hnutí Motoristé sobě, poslanec, ministr
  zahraničních věcí a místopředseda vlády; v letech 2025–2026 dočasně
  pověřen i řízením Ministerstva životního prostředí. *(CLM-24, SRC-27)*
- **Filip Turek** — poslanec za Motoristy sobě, do vypuknutí kauzy nehody vládní zmocněnec pro Green Deal. *(CLM-02, CLM-11)*

## Registr tvrzení

Každé tvrzení má stav ověřenosti a odkaz na zdroj v [registru zdrojů](#registr-zdroju). Stav vyjadřuje, co pokrývá **náš** citovaný výběr zdrojů (viz sloupec Zdroj) — ne vyčerpávající mediální pokrytí jako celek.

<div x-data="claimsFilter()" x-cloak class="mb-4 flex flex-wrap items-end gap-3" role="search" aria-label="Filtrovat registr tvrzení">
  <div class="flex flex-col gap-1">
    <label for="clm-search" class="text-xs text-white/50">Hledat (ID, text, zdroj)</label>
    <input type="text" id="clm-search" x-model="search" @input="apply()" class="src-filter-input w-64" placeholder="např. CLM-07, Turek, SRC-15…" autocomplete="off">
  </div>
  <div class="flex flex-col gap-1">
    <label for="clm-status-filter" class="text-xs text-white/50">Stav</label>
    <select id="clm-status-filter" x-model="status" @change="apply()" class="src-filter-select">
      <option value="">Všechny stavy</option>
      <option value="status-corroborated">CORROBORATED</option>
      <option value="status-single">1 ZDROJ</option>
      <option value="status-quote">CITACE</option>
      <option value="status-disputed">SPORNÉ</option>
      <option value="status-opinion">NÁZOR</option>
    </select>
  </div>
  <button type="button" @click="search = ''; status = ''; apply()" class="src-filter-reset">Zrušit filtry</button>
  <p class="text-xs text-white/50"><span x-text="visible">0</span> z <span x-text="total">0</span> tvrzení</p>
</div>

| ID | Tvrzení | Stav | Zdroj |
|---|---|---|---|
| <a id="clm-01"></a>[CLM-01](@/dossiers/macinka-turek/claims/clm-01.md) | Turek zvolen europoslancem v červnu 2024 za společnou kandidátku Motoristů a Přísahy | <span class="status-badge status-corroborated">CORROBORATED</span> | [SRC-11](@/dossiers/macinka-turek/sources/src-11.md), [SRC-12](@/dossiers/macinka-turek/sources/src-12.md), [SRC-13](@/dossiers/macinka-turek/sources/src-13.md) |
| <a id="clm-02"></a>[CLM-02](@/dossiers/macinka-turek/claims/clm-02.md) | Turek v říjnu 2025 zvolen poslancem, nejvyšší počet preferenčních hlasů Motoristů ve Středočeském kraji | <span class="status-badge status-corroborated">CORROBORATED</span> | [SRC-11](@/dossiers/macinka-turek/sources/src-11.md), [SRC-13](@/dossiers/macinka-turek/sources/src-13.md) |
| <a id="clm-03"></a>[CLM-03](@/dossiers/macinka-turek/claims/clm-03.md) | Macinka předsedou Motoristů sobě od 2022; zvolen poslancem 2025 za Jihomoravský kraj; Motoristé sobě 13 mandátů, vstup do vlády s ANO a SPD | <span class="status-badge status-corroborated">CORROBORATED</span> | [SRC-11](@/dossiers/macinka-turek/sources/src-11.md), [SRC-13](@/dossiers/macinka-turek/sources/src-13.md) |
| <a id="clm-04"></a>[CLM-04](@/dossiers/macinka-turek/claims/clm-04.md) | V roce 2024 čelil Turek kritice kvůli fotografii se zdviženou pravicí (2013) a sbírce svícnů s hákovými kříži | <span class="status-badge status-corroborated">CORROBORATED</span> | [SRC-12](@/dossiers/macinka-turek/sources/src-12.md), [SRC-14](@/dossiers/macinka-turek/sources/src-14.md) |
| <a id="clm-05"></a>[CLM-05](@/dossiers/macinka-turek/claims/clm-05.md) | Turek fotografii/sbírku označil za „špatný humor" / sběratelský zájem | <span class="status-badge status-quote">CITACE</span> | [SRC-12](@/dossiers/macinka-turek/sources/src-12.md), [SRC-14](@/dossiers/macinka-turek/sources/src-14.md) |
| <a id="clm-06"></a>[CLM-06](@/dossiers/macinka-turek/claims/clm-06.md) | Macinka kauzu 2024 veřejně hájil, označil ji za „pseudoproblém" | <span class="status-badge status-quote">CITACE</span> | [SRC-12](@/dossiers/macinka-turek/sources/src-12.md), [SRC-14](@/dossiers/macinka-turek/sources/src-14.md) |
| <a id="clm-07"></a>[CLM-07](@/dossiers/macinka-turek/claims/clm-07.md) | Deník N v říjnu 2025 zveřejnil údajné smazané příspěvky připisované Turkovi s rasistickým/homofobním obsahem | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-15](@/dossiers/macinka-turek/sources/src-15.md) |
| <a id="clm-08"></a>[CLM-08](@/dossiers/macinka-turek/claims/clm-08.md) | Turek odmítl autorství nejzávažnějších z těchto příspěvků | <span class="status-badge status-quote">CITACE</span> | [SRC-16](@/dossiers/macinka-turek/sources/src-16.md) |
| <a id="clm-09"></a>[CLM-09](@/dossiers/macinka-turek/claims/clm-09.md) | Pravost/autorství screenshotů z CLM-07 nebyla nezávisle prokázána ani vyvrácena | <span class="status-badge status-disputed">SPORNÉ</span> | [SRC-15](@/dossiers/macinka-turek/sources/src-15.md), [SRC-16](@/dossiers/macinka-turek/sources/src-16.md), [SRC-22](@/dossiers/macinka-turek/sources/src-22.md) |
| <a id="clm-10"></a>[CLM-10](@/dossiers/macinka-turek/claims/clm-10.md) | Auto Turka se v červenci 2026 v Praze střetlo se zdravotnickým vozem; dle záběrů předjížděl frontu v odbočovacím pruhu | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-02](@/dossiers/macinka-turek/sources/src-02.md) |
| <a id="clm-11"></a>[CLM-11](@/dossiers/macinka-turek/claims/clm-11.md) | Turek dočasně opustil funkci zmocněnce pro Green Deal, přislíbil rezignaci při prokázání viny | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-06](@/dossiers/macinka-turek/sources/src-06.md), [SRC-07](@/dossiers/macinka-turek/sources/src-07.md) |
| <a id="clm-12"></a>[CLM-12](@/dossiers/macinka-turek/claims/clm-12.md) | Babiš dle zdrojů řekl Macinkovi, že pokud se záběry potvrdí, měl by Turek rezignovat | <span class="status-badge status-corroborated">CORROBORATED</span> | [SRC-06](@/dossiers/macinka-turek/sources/src-06.md), [SRC-08](@/dossiers/macinka-turek/sources/src-08.md) |
| <a id="clm-13"></a>[CLM-13](@/dossiers/macinka-turek/claims/clm-13.md) | Macinka veřejně opakovaně prohlásil, že se Turka nevzdá | <span class="status-badge status-quote">CITACE</span> | [SRC-01](@/dossiers/macinka-turek/sources/src-01.md), [SRC-04](@/dossiers/macinka-turek/sources/src-04.md) |
| <a id="clm-14"></a>[CLM-14](@/dossiers/macinka-turek/claims/clm-14.md) | Macinka (od prosince 2025 ministr zahraničí) nepřiznal v majetkovém přiznání 20% podíl v ukrajinské firmě GMR GAS UA LLC (od 2017); po upozornění Investigace.cz podíl dodatečně přiznal, hrozí mu pokuta až 50 000 Kč | <span class="status-badge status-corroborated">CORROBORATED</span> | [SRC-17](@/dossiers/macinka-turek/sources/src-17.md), [SRC-18](@/dossiers/macinka-turek/sources/src-18.md) |
| <a id="clm-15"></a>[CLM-15](@/dossiers/macinka-turek/claims/clm-15.md) | Macinkovo vysvětlení: firma „de facto neexistuje" kvůli válce na Ukrajině, plánovaná likvidace se zpozdila | <span class="status-badge status-quote">CITACE</span> | [SRC-17](@/dossiers/macinka-turek/sources/src-17.md), [SRC-18](@/dossiers/macinka-turek/sources/src-18.md) |
| <a id="clm-16"></a>[CLM-16](@/dossiers/macinka-turek/claims/clm-16.md) | Policie potvrdila, že dopravní značení na místě nehody odpovídalo projektové dokumentaci — v rozporu s Turkovým tvrzením, že o odbočovací pruh nešlo | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-19](@/dossiers/macinka-turek/sources/src-19.md) |
| <a id="clm-17"></a>[CLM-17](@/dossiers/macinka-turek/claims/clm-17.md) | Turkova verze nehody: jel na zelenou křižovatkou Ječná/Sokolská, sanitka vjela na červenou s majáky | <span class="status-badge status-quote">CITACE</span> | [SRC-20](@/dossiers/macinka-turek/sources/src-20.md) |
| <a id="clm-18"></a>[CLM-18](@/dossiers/macinka-turek/claims/clm-18.md) | Turek se vzdal poslanecké imunity pro případ trestního stíhání; dechová zkouška negativní; řidič sanitky utrpěl středně těžké poranění hlavy a zranění lokte | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-20](@/dossiers/macinka-turek/sources/src-20.md) |
| <a id="clm-19"></a>[CLM-19](@/dossiers/macinka-turek/claims/clm-19.md) | Motoristé sobě v říjnu 2025 podali trestní oznámení na Deník N a autory článku o Turkových příspěvcích pro pomluvu a křivé obvinění | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-21](@/dossiers/macinka-turek/sources/src-21.md) |
| <a id="clm-20"></a>[CLM-20](@/dossiers/macinka-turek/claims/clm-20.md) | Turek je/byl 2016–2023 statutárním orgánem nebo společníkem v pěti firmách/spolcích (Art of Performance, Aston Martin klub ČR, Transgas, Jaguar klub ČR, Zapper-Club) | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-23](@/dossiers/macinka-turek/sources/src-23.md) |
| <a id="clm-21"></a>[CLM-21](@/dossiers/macinka-turek/claims/clm-21.md) | Turek osobně daroval Motoristům sobě celkem 210 000 Kč (10 000 Kč v 2019, 200 000 Kč v 2025) | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-25](@/dossiers/macinka-turek/sources/src-25.md) |
| <a id="clm-22"></a>[CLM-22](@/dossiers/macinka-turek/claims/clm-22.md) | Macinka je/byl statutárním orgánem nebo společníkem v sedmi firmách/spolcích (DRILL COMPANY, Kauppias, Centrum pro výzkum terorismu, Motoristé Praha, PG Contract, Klub motoristů, MEAS Consulting); u DRILL COMPANY a Motoristé Praha skončil počátkem ledna 2026 | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-24](@/dossiers/macinka-turek/sources/src-24.md) |
| <a id="clm-23"></a>[CLM-23](@/dossiers/macinka-turek/claims/clm-23.md) | Macinka osobně daroval 510 000 Kč (ODS 2017, Motoristé sobě 2× 2022) a přes Klub motoristů z.s., kde je statutárním orgánem, přišlo Motoristům sobě v roce 2024 dalších 800 000 Kč — celkem 1 310 000 Kč | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-26](@/dossiers/macinka-turek/sources/src-26.md) |
| <a id="clm-24"></a>[CLM-24](@/dossiers/macinka-turek/claims/clm-24.md) | Macinka byl od 2025 zároveň ministrem zahraničí, místopředsedou vlády a 2025–2026 dočasně pověřen i řízením Ministerstva životního prostředí | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-27](@/dossiers/macinka-turek/sources/src-27.md) |
| <a id="clm-25"></a>[CLM-25](@/dossiers/macinka-turek/claims/clm-25.md) | Bývalá partnerka v červnu 2025 podala trestní oznámení, ve kterém Turka viní z několikaletého domácího násilí, vyhrožování střelnou zbraní a jednoho případu znásilnění, k nimž mělo dojít podle jejího popisu před 15–20 lety | <span class="status-badge status-corroborated">CORROBORATED</span> | [SRC-28](@/dossiers/macinka-turek/sources/src-28.md), [SRC-29](@/dossiers/macinka-turek/sources/src-29.md), [SRC-30](@/dossiers/macinka-turek/sources/src-30.md) |
| <a id="clm-26"></a>[CLM-26](@/dossiers/macinka-turek/claims/clm-26.md) | Turek trestní jednání a násilí kategoricky odmítl, označil oznámení za „mediální lynč" s politickým motivem; nevěru v tomto kontextu připustil | <span class="status-badge status-quote">CITACE</span> | [SRC-29](@/dossiers/macinka-turek/sources/src-29.md), [SRC-30](@/dossiers/macinka-turek/sources/src-30.md) |
| <a id="clm-27"></a>[CLM-27](@/dossiers/macinka-turek/claims/clm-27.md) | V květnu 2026 policie trestní oznámení odložila z důvodu promlčení (oznámilo Obvodní státní zastupitelství pro Prahu 4); rozhodnutí není pravomocné, žena proti němu podala stížnost. Jde o procesní důsledek uplynutí promlčecí doby, ne o rozhodnutí o vině nebo nevině | <span class="status-badge status-corroborated">CORROBORATED</span> | [SRC-31](@/dossiers/macinka-turek/sources/src-31.md), [SRC-54](@/dossiers/macinka-turek/sources/src-54.md) |
| <a id="clm-28"></a>[CLM-28](@/dossiers/macinka-turek/claims/clm-28.md) | V roce 2017 Turek nechal na autě zaměstnance saúdskoarabské ambasády kresbu oprátky a loveckou nábojnici; policie věc uzavřela jako pravděpodobnou záměnu osob a vyřešila jako přestupek | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-32](@/dossiers/macinka-turek/sources/src-32.md) |
| <a id="clm-29"></a>[CLM-29](@/dossiers/macinka-turek/claims/clm-29.md) | Turkovo vysvětlení: bránil tehdejší přítelkyni, odmítl rasový motiv i vědomí, že jde o zaměstnance ambasády | <span class="status-badge status-quote">CITACE</span> | [SRC-32](@/dossiers/macinka-turek/sources/src-32.md) |
| <a id="clm-30"></a>[CLM-30](@/dossiers/macinka-turek/claims/clm-30.md) | V roce 2026 dostal Turek pokuty v součtu 200 000 Kč za dvě nepovolené stavby na pozemku v Praze-Dubči (80 000 Kč nedbalost, 120 000 Kč úmysl); obě dodatečně zlegalizoval | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-33](@/dossiers/macinka-turek/sources/src-33.md) |
| <a id="clm-31"></a>[CLM-31](@/dossiers/macinka-turek/claims/clm-31.md) | Turkova firma Zapper-Club s.r.o. nabízela za pandemie „Imunitní balíček ANTI-COVID-19"; přístroj zapper byl předmětem varování Ministerstva zdravotnictví a SZPI mu odebrala certifikát | <span class="status-badge status-corroborated">CORROBORATED</span> | [SRC-34](@/dossiers/macinka-turek/sources/src-34.md), [SRC-35](@/dossiers/macinka-turek/sources/src-35.md) |
| <a id="clm-32"></a>[CLM-32](@/dossiers/macinka-turek/claims/clm-32.md) | Z 27 dokumentovaných startů Turkovy závodní kariéry (2015–2017, Formula 4 Trophy) měl 12 výher; čtyřikrát jel sám, šestkrát proti jedinému soupeři | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-36](@/dossiers/macinka-turek/sources/src-36.md) |
| <a id="clm-33"></a>[CLM-33](@/dossiers/macinka-turek/claims/clm-33.md) | Turek se (spolu s Kateřinou Konečnou a Václavem Klausem) setkal s íránským velvyslancem; všichni tři schůzku potvrdili a označili ji za zdvořilostní návštěvu | <span class="status-badge status-corroborated">CORROBORATED</span> | [SRC-36](@/dossiers/macinka-turek/sources/src-36.md), [SRC-37](@/dossiers/macinka-turek/sources/src-37.md) |
| <a id="clm-34"></a>[CLM-34](@/dossiers/macinka-turek/claims/clm-34.md) | Turek si v dubnu 2026 koupil byt na Strahově za 18 mil. Kč na hypotéku — jediná další nemovitost vedle pozemku v Praze-Dubči | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-38](@/dossiers/macinka-turek/sources/src-38.md) |
| <a id="clm-35"></a>[CLM-35](@/dossiers/macinka-turek/claims/clm-35.md) | Motoristé sobě zveřejnili povinné přehledy dárců kampaně PS 2025 (UDHPSH); mezi velké dárce patřili Boris Šťastný (~5 mil. Kč přes Medical Investments) a František Fabičovic (1 mil. Kč) | <span class="status-badge status-corroborated">CORROBORATED</span> | [SRC-39](@/dossiers/macinka-turek/sources/src-39.md), [SRC-40](@/dossiers/macinka-turek/sources/src-40.md) |
| <a id="clm-36"></a>[CLM-36](@/dossiers/macinka-turek/claims/clm-36.md) | Podnikatel Richard Chlad (dřívější osobní vazba na Radovana Krejčíře) oficiálně daroval Motoristům sobě v roce 2025 evidovaných 638 864 Kč, zatímco sám veřejně uváděl podporu v hodnotě „necelých dvou milionů" Kč — do té podle CNN Prima News počítal i nepeněžní plnění (zápůjčky vozů), obě čísla tedy neměří totéž | <span class="status-badge status-corroborated">CORROBORATED</span> | [SRC-41](@/dossiers/macinka-turek/sources/src-41.md), [SRC-42](@/dossiers/macinka-turek/sources/src-42.md) |
| <a id="clm-37"></a>[CLM-37](@/dossiers/macinka-turek/claims/clm-37.md) | Turek i Macinka veřejně odmítali, že by Chlad hrál v okolí strany významnější roli; Macinka uváděl vlastní nižší částky (2× 50 000 Kč před eurovolbami) než sám Chlad | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-43](@/dossiers/macinka-turek/sources/src-43.md) |
| <a id="clm-38"></a>[CLM-38](@/dossiers/macinka-turek/claims/clm-38.md) | V lednu 2026 prezident Petr Pavel odmítl jmenovat Turka ministrem životního prostředí; jako důvod uvedl opakovaný nedostatek respektu k právnímu řádu, zlehčování nacistického Německa a zpochybňování důstojnosti a rovnosti žen a příslušníků menšin | <span class="status-badge status-corroborated">CORROBORATED</span> | [SRC-44](@/dossiers/macinka-turek/sources/src-44.md), [SRC-45](@/dossiers/macinka-turek/sources/src-45.md) |
| <a id="clm-39"></a>[CLM-39](@/dossiers/macinka-turek/claims/clm-39.md) | Turek 9. 1. 2026 oznámil, že na prezidenta podá žalobu na ochranu osobnosti a bude žádat omluvu za toto zdůvodnění | <span class="status-badge status-quote">CITACE</span> | [SRC-44](@/dossiers/macinka-turek/sources/src-44.md) |
| <a id="clm-40"></a>[CLM-40](@/dossiers/macinka-turek/claims/clm-40.md) | Turek namísto ministerského postu působil jako vládní zmocněnec pro klimatickou změnu a Green Deal (funkci po nehodě v červenci 2026 dočasně opustil, viz CLM-11); premiér Babiš označil jeho jmenování ministrem za „uzavřenou kapitolu"; řízením ministerstva byl dočasně pověřen Petr Macinka | <span class="status-badge status-corroborated">CORROBORATED</span> | [SRC-45](@/dossiers/macinka-turek/sources/src-45.md), [SRC-46](@/dossiers/macinka-turek/sources/src-46.md) |
| <a id="clm-41"></a>[CLM-41](@/dossiers/macinka-turek/claims/clm-41.md) | Dne 28. 7. 2026 policie odložila prověřování Turkových výroků z CLM-07 pro promlčení; rozhodnutí není pravomocné. Jde o procesní důsledek uplynutí promlčecí doby, ne o posouzení pravosti nebo obsahu výroků. Policie zároveň nepotvrdila verzi Motoristů, že zveřejněné materiály byly zfalšované | <span class="status-badge status-corroborated">CORROBORATED</span> | [SRC-47](@/dossiers/macinka-turek/sources/src-47.md), [SRC-48](@/dossiers/macinka-turek/sources/src-48.md) |
| <a id="clm-42"></a>[CLM-42](@/dossiers/macinka-turek/claims/clm-42.md) | Policie zároveň odložila trestní oznámení, které v říjnu 2025 podali Motoristé sobě na Deník N a autory článku (CLM-19), s odůvodněním, že zveřejnění informací nebylo trestným činem | <span class="status-badge status-corroborated">CORROBORATED</span> | [SRC-47](@/dossiers/macinka-turek/sources/src-47.md), [SRC-48](@/dossiers/macinka-turek/sources/src-48.md) |
| <a id="clm-43"></a>[CLM-43](@/dossiers/macinka-turek/claims/clm-43.md) | Dne 23. 2. 2026 prezident Petr Pavel jmenoval ministrem životního prostředí Igora Červeného (Motoristé sobě); tím skončilo dočasné pověření Petra Macinky vedením tohoto úřadu zmiňované v CLM-24 a CLM-40 | <span class="status-badge status-corroborated">CORROBORATED</span> | [SRC-49](@/dossiers/macinka-turek/sources/src-49.md), [SRC-50](@/dossiers/macinka-turek/sources/src-50.md) |
| <a id="clm-44"></a>[CLM-44](@/dossiers/macinka-turek/claims/clm-44.md) | Dne 27. 7. 2026 Turek oznámil, že žalobu na ochranu osobnosti proti prezidentu Pavlovi (avizovanou v CLM-39) nakonec nepodá; jako důvod uvedl, že „z mnoha důvodů" svůj postoj přehodnotil, bez bližšího upřesnění | <span class="status-badge status-corroborated">CORROBORATED</span> | [SRC-51](@/dossiers/macinka-turek/sources/src-51.md), [SRC-52](@/dossiers/macinka-turek/sources/src-52.md) |
| <a id="clm-45"></a>[CLM-45](@/dossiers/macinka-turek/claims/clm-45.md) | V listopadu 2024 policie odložila případ Turkova údajného hajlování (fotografie z roku 2013, CLM-04) z důvodu promlčení trestní odpovědnosti; sbírky svícnů se rozhodnutí netýkalo. Jde o procesní důsledek uplynutí promlčecí doby, ne o rozhodnutí o vině | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-53](@/dossiers/macinka-turek/sources/src-53.md) |
| <a id="clm-46"></a>[CLM-46](@/dossiers/macinka-turek/claims/clm-46.md) | Českou společností za GMR GAS UA LLC je podle obchodního rejstříku GMR GAS s.r.o., IČO 28274318, se sídlem v Brně, zapsaná 2008 pod jménem KADAR s.r.o. a přejmenovaná 2015; mezi jejími zapsanými činnostmi je montáž, opravy a revize plynových zařízení | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-55](@/dossiers/macinka-turek/sources/src-55.md) |
| <a id="clm-47"></a>[CLM-47](@/dossiers/macinka-turek/claims/clm-47.md) | Podle Investigace.cz je GMR GAS UA LLC ukrajinskou pobočkou české společnosti vyrábějící regulátory tlaku plynu a vedle Macinky v ní drží podíl i tato česká společnost a podnikatel Tomáš Cabal | <span class="status-badge status-corroborated">CORROBORATED</span> | [SRC-17](@/dossiers/macinka-turek/sources/src-17.md), [SRC-57](@/dossiers/macinka-turek/sources/src-57.md) |
| <a id="clm-48"></a>[CLM-48](@/dossiers/macinka-turek/claims/clm-48.md) | Jediným společníkem (podíl 100 %, vklad 200 000 Kč) a jednatelem GMR GAS s.r.o. je Petr Vencálek, jednatelem od prosince 2014 | <span class="status-badge status-corroborated">CORROBORATED</span> | [SRC-17](@/dossiers/macinka-turek/sources/src-17.md), [SRC-55](@/dossiers/macinka-turek/sources/src-55.md) |
| <a id="clm-49"></a>[CLM-49](@/dossiers/macinka-turek/claims/clm-49.md) | K odložení věci pro promlčení dozorující státní zástupce Jan Vychyta uvedl, že k danému skutku došlo a že by byl trestným činem, ale trestní odpovědnost zanikla promlčením; policie podle citovaného zdroje zjištění Deníku N nezpochybnila. Turek autorství konkrétního komentáře odmítal, za některé jiné výroky se omluvil | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-56](@/dossiers/macinka-turek/sources/src-56.md) |
| <a id="clm-55"></a>[CLM-55](@/dossiers/macinka-turek/claims/clm-55.md) | Vojtěch Dobeš (autor screenshotů z CLM-07) podle Deníku N uvedl, že policii kromě screenshotů předal i URL adresy původních příspěvků a metadata, a odložení věci pro promlčení hodnotí slovy: „Policie a státní zastupitelství daly naprosto jasně za pravdu nám, nikoliv Turkovi.“ Jde o jeho vlastní hodnocení procesního odložení, ne o nezávisle potvrzený forenzní nález ani o výrok orgánů činných v trestním řízení k pravosti materiálů | <span class="status-badge status-quote">CITACE</span> | [SRC-61](@/dossiers/macinka-turek/sources/src-61.md) |
| <a id="clm-50"></a>[CLM-50](@/dossiers/macinka-turek/claims/clm-50.md) | Podle ukrajinského registrového agregátoru YouControl (USREOU) je GMR GAS UA LLC k 2026-08-01 ve stavu „Registered" (formálně zaregistrována, nikoli v likvidaci ani vymazaná) | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-57](@/dossiers/macinka-turek/sources/src-57.md) |
| <a id="clm-51"></a>[CLM-51](@/dossiers/macinka-turek/claims/clm-51.md) | Podle YouControlu drží v GMR GAS UA LLC podíly GMR GAS s.r.o. (40 %), Petr Macinka (20 %) a Tomáš Čábal (40 %); Čábal je zapsán jako statutární orgán (s omezením jednat samostatně nad 50 000 EUR) a jako skutečný majitel s přímým rozhodujícím vlivem | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-57](@/dossiers/macinka-turek/sources/src-57.md) |
| <a id="clm-52"></a>[CLM-52](@/dossiers/macinka-turek/claims/clm-52.md) | Státní zástupkyně Obvodního státního zastupitelství pro Prahu 4 rozhodnutím ze dne 27. 7. 2026 zamítla stížnost bývalé partnerky Filipa Turka proti odložení trestního oznámení pro promlčení; odložení věci je tím pravomocné. Jde i nadále výhradně o procesní rozhodnutí o promlčení, ne o posouzení viny nebo neviny — které už z tohoto důvodu žádný orgán nikdy neučiní | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-58](@/dossiers/macinka-turek/sources/src-58.md) |
| <a id="clm-53"></a>[CLM-53](@/dossiers/macinka-turek/claims/clm-53.md) | ÚDHPSH uložil Motoristům sobě v listopadu 2025 pokutu 25 000 Kč za porušení pravidel kampaně 2025 — chybějící povinné údaje o zadavateli/zpracovateli volebního materiálu a využití komunikačních médií obce Vražné (Instagram, Facebook, obecní rozhlas) k propagaci; obec dostala vlastní pokutu 15 000 Kč | <span class="status-badge status-single">1 ZDROJ</span> | [SRC-59](@/dossiers/macinka-turek/sources/src-59.md) |
| <a id="clm-54"></a>[CLM-54](@/dossiers/macinka-turek/claims/clm-54.md) | Petr Macinka na pokutu ÚDHPSH reagoval 7. 11. 2025 na Facebooku slovy „Nevím, jaké drogy berou pracovníci z Úřadu..., ale asi se začnu mnohem více zajímat" — Deník N tento výrok popsal jako výhrůžku úřadu | <span class="status-badge status-quote">CITACE</span> | [SRC-60](@/dossiers/macinka-turek/sources/src-60.md) |

## Politická kariéra

- **Filip Turek** byl v červnu 2024 zvolen europoslancem za společnou
  kandidátku Motoristů sobě a Přísahy (druhý nejvyšší počet preferenčních
  hlasů v zemi, přes 150 000). Dne 30. května 2025 oznámil kandidaturu do
  Poslanecké sněmovny za Motoristy ve Středočeském kraji. V říjnu 2025
  získal v kraji nejvyšší počet preferenčních hlasů ze všech kandidátů
  Motoristů (20 232 hlasů, 34,54 % preferenčních hlasů strany v kraji),
  stal se poslancem a uvolnil mandát europoslance (nahradil ho Antonín
  Staněk). *(Zdroj: Seznam Zprávy, iROZHLAS, Aktuálně.cz)*
- **Petr Macinka** je předsedou hnutí Motoristé sobě od jeho založení v roce
  2022. V říjnu 2025 byl zvolen poslancem za Jihomoravský kraj. Motoristé
  sobě získali ve volbách do Poslanecké sněmovny 2025 13 mandátů (kolem
  6,77–6,78 % hlasů) poté, co interní hlasování (86 % ku 14 %) odmítlo
  předvolební koalici s Přísahou a hnutí šlo do voleb samostatně. Po volbách
  se Motoristé sobě stali součástí vlády vedené ANO a SPD. *(Zdroj: Seznam
  Zprávy, iROZHLAS)*

## Jmenování ministrem životního prostředí

Po vzniku vlády byl Turek navrhován jako ministr životního prostředí.
V lednu 2026 prezident Petr Pavel jeho jmenování odmítl — i po hodinovém
přesvědčování premiérem Babišem během novoročního oběda svůj postoj
nezměnil a odmítnutí následně potvrdil písemně. Jako důvod uvedl, že
Turek „opakovaně prokazoval nedostatek respektu vůči českému právnímu
řádu", opakovaně glorifikoval nebo přinejmenším zlehčoval nacistické
Německo jako jeden z nejhorších totalitních režimů 20. století, a vážně
zpochybňoval důstojnost a rovnost žen a příslušníků různých menšin —
odkazoval tím na již zdokumentované kauzy fotografie/sbírky svícnů a
smazaných příspěvků na Facebooku výše, ne na nové, dosud nepopsané
chování. *(Zdroj: Deník.cz, HN.cz)*

Turek na zdůvodnění reagoval oznámením 9. 1. 2026, že na prezidenta podá
žalobu na ochranu osobnosti a bude žádat omluvu:

> „Jeho zdůvodnění se mě hluboce dotýká, v nejbližších dnech podám žalobu
> na ochranu osobnosti a požádám prezidenta o omluvu." — Turek, podle
> Deníku.cz

Právní komentátoři (mj. Česká justice, s odkazem na historické precedenty
žalob na prezidenty) i bývalý advokát Miloše Zemana pro Seznam Zprávy
vyjádřili k vyhlídkám žaloby skepsi s odkazem na ústavní neodpovědnost
prezidenta z výkonu funkce. Babiš podle HN.cz kompetenční žalobu vlády
na prezidenta kvůli nejmenování nezvažuje. Dne 27. 7. 2026 Turek oznámil,
že žalobu nakonec nepodá — jako důvod uvedl, že „z mnoha důvodů" svůj
postoj přehodnotil, bez bližšího upřesnění (CLM-44). *(Zdroj: Česká
justice, Seznam Zprávy, HN.cz; k nepodání žaloby Blesk.cz, Deník N)*

Turek namísto ministerského postu získal roli vládního zmocněnce pro
klimatickou změnu a Green Deal s kanceláří na ministerstvu — tutéž
funkci po dopravní nehodě v červenci 2026 dočasně opustil (viz
[Bezprostřední reakce](#bezprostredni-reakce)). Premiér Babiš v únoru
2026 zopakoval, že Turkovo jmenování ministrem je „uzavřená kapitola", a
čeká na nový návrh. Řízením ministerstva byl mezitím dočasně pověřen
Petr Macinka — přímý důsledek této nedohody, ne samostatné politické
rozhodnutí popsané jinde v tomto přehledu. *(Zdroj: Deník.cz, HN.cz)*

Toto dočasné uspořádání skončilo 23. 2. 2026: prezident Pavel jmenoval
ministrem životního prostředí Igora Červeného (Motoristé sobě), čímž se
vláda premiéra Babiše po zhruba dvou měsících stala kompletní. Macinka
tak řízení resortu předal a zůstává ministrem zahraničí a
místopředsedou vlády. *(Zdroj: Deník.cz, Úřad vlády ČR)*

## Majetkové, podnikatelské a finanční vazby

*(Doplněno na základě veřejných rejstříkových dat — Hlídač státu — a
investigativní žurnalistiky; jde o novou vrstvu dossieru adresující dříve
otevřené mezery [GAP-04](@/dossiers/macinka-turek/gaps/gap-04.md) a [GAP-05](@/dossiers/macinka-turek/gaps/gap-05.md).)*

**Petr Macinka** neuvedl ve svém majetkovém přiznání dvacetiprocentní
podíl (od roku 2017) v kyjevské firmě GMR GAS UA LLC, byť to zákon
vyžadoval; po upozornění serveru Investigace.cz podíl dodatečně přiznal a
hrozí mu pokuta až 50 000 Kč. Vysvětlil to tím, že firma „de facto
neexistuje" od začátku ruského ostřelování Kyjeva a její plánovanou
likvidaci zdržela válka. *(Zdroj: Investigace.cz, Seznam Zprávy)*

Podle rejstříkových dat byl nebo je Macinka zapojen v sedmi dalších
firmách a spolcích (mj. DRILL COMPANY, Kauppias, Motoristé Praha, Klub
motoristů) — u dvou z nich (DRILL COMPANY, Motoristé Praha) jeho
angažmá skončilo začátkem ledna 2026. Osobně daroval politickým stranám
celkem 510 000 Kč (ODS 2017, Motoristé sobě 2022) a přes Klub motoristů
z.s., kde je statutárním orgánem, přišlo Motoristům sobě v roce 2024
dalších 800 000 Kč — dohromady 1 310 000 Kč. *(Zdroj: Hlídač státu)*

**Filip Turek** byl nebo je zapojen v pěti firmách a spolcích spjatých s
jeho dlouhodobým zájmem o automobilismus (Art of Performance, Transgas,
Aston Martin klub ČR, Jaguar klub ČR, Zapper-Club) a osobně daroval
Motoristům sobě celkem 210 000 Kč (2019, 2025). *(Zdroj: Hlídač státu)*

Jedna z těchto firem, Zapper-Club s.r.o. (Turek u ní veden jako společník
2016–2023), za pandemie covidu-19 nabízela přes e-shop parazitivnas.cz
„Imunitní balíček ANTI-COVID-19". Ministerstvo zdravotnictví před
používáním přístroje zapper důrazně varovalo a Státní zemědělská a
potravinářská inspekce mu odebrala certifikát; podle inspekce šlo o
zakázaná léčebná tvrzení. *(Zdroj: Manipulátoři.cz, Forum24)*

Tato data pocházejí ze strojově agregovaných veřejných rejstříků (Hlídač
státu), ne z redakčně ověřené žurnalistiky — samotná existence
podnikatelské/spolkové vazby nebo daru není v dossieru vedena jako
pochybení, jen jako zdokumentovaný fakt.

**Nemovitosti**: u Turka se podařilo dohledat pozemek v Praze-Dubči (viz
černé stavby výše) a byt na Strahově koupený v dubnu 2026 za 18 mil. Kč
na hypotéku. U Macinky se v citovaném výběru zdrojů žádnou nemovitost
dohledat nepodařilo — veřejný katastr nemovitostí neumožňuje vyhledávání
podle jména z důvodu ochrany osobních údajů, a žádná žurnalistika k
tomuto tématu u Macinky nebyla nalezena; nejde o zjištění, že by
nemovitosti neměl, jen že se je tímto způsobem hledání nepodařilo najít.

**Dárci kampaně 2025**: Motoristé sobě povinně zveřejnili přehledy
dárců (SRC-40). Mezi větší dárce patřili Boris Šťastný (~5 mil. Kč přes
firmu Medical Investments) a František Fabičovic (1 mil. Kč, dlouholetý
přítel otce Petra Macinky). Samostatně dokumentovaný je podnikatel
Richard Chlad (hazard, energetika, dřívější osobní vazba na Radovana
Krejčíře): oficiálně evidovaný dar 638 864 Kč (2025) je výrazně nižší
než částka, kterou sám veřejně uváděl („necelé dva miliony" Kč) — sám
Chlad ale podle CNN Prima News do své částky počítal i nepeněžní plnění
(zápůjčky vozů pro rallye a natáčení), takže obě čísla neměří totéž.
Turek i Macinka veřejně odmítali, že by Chlad hrál v okolí strany
významnější roli.

Zbývá nedohledáno: majetek/nemovitosti Macinky a úplná rekonciliace
sporných čísel u Chladova sponzoringu (oficiální evidence vs. jeho
vlastní vyjádření) — viz aktualizovaný stav [GAP-04](@/dossiers/macinka-turek/gaps/gap-04.md) a [GAP-05](@/dossiers/macinka-turek/gaps/gap-05.md).

**Pokuta za vedení kampaně (listopad 2025)**: ÚDHPSH uložil Motoristům
sobě pokutu 25 000 Kč za chybějící povinné údaje o zadavateli/
zpracovateli volebního materiálu a za využití komunikačních médií obce
Vražné k propagaci; obec dostala vlastní pokutu 15 000 Kč. Macinka na
pokutu reagoval na Facebooku slovy „Nevím, jaké drogy berou pracovníci
z Úřadu..., ale asi se začnu mnohem více zajímat" — Deník N to popsal
jako výhrůžku úřadu. *(Zdroj: ČT24, Deník N)*

## Kauza z roku 2024: fotografie a sbírka svícnů

Před volbami do Evropského parlamentu v červnu 2024 čelil Turek kritice kvůli
fotografii z roku 2013 zachycující ho se zdviženou pravicí, připomínající
nacistický pozdrav, a kvůli jeho sbírce svícnů/kandelábrů zdobených hákovými
kříži. Turek to označil za "špatný humor", resp. sběratelský zájem; věcí se
zabývala policie a kvůli kauze mu byly zrušeny některé předvolební debaty.
Předseda Motoristů Petr Macinka jej veřejně hájil a kauzu označil za
"pseudoproblém." *(Zdroj: iROZHLAS, Deník N)*

V listopadu 2024 policie případ údajného hajlování (fotografie z roku
2013) odložila z důvodu promlčení trestní odpovědnosti. Jde o procesní
krok — důsledek uplynutí zákonné lhůty, ne rozhodnutí o vině nebo nevině;
sbírky svícnů se toto rozhodnutí netýkalo (CLM-45). *(Zdroj: ČT24)*

## Trestní oznámení: obvinění z domácího násilí a znásilnění

*(Nejzávažnější a právně nejcitlivější položka v tomto přehledu. Dossier
neuvádí jméno oznamovatelky, protože ho neuvádí ani citované zdroje, a
nehodnotí vinu ani nevinu — jde o probíhající, neuzavřenou věc.)*

V červnu 2025 podala bývalá partnerka Filipa Turka trestní oznámení, ve
kterém ho viní z několik let trvajícího domácího násilí, vyhrožování
střelnou zbraní a jednoho případu znásilnění. Incidenty měly podle jejího
popisu proběhnout před 15 až 20 lety, tedy dávno před začátkem Turkovy
politické kariéry.

Turek jakékoliv trestní jednání a násilí kategoricky odmítl a označil
oznámení za pokus o „mediální lynč" s politickým motivem před volbami;
nevěru a nevázaný vztahový život v tomto kontextu připustil, trestní
jednání ne.

V květnu 2026 policie trestní oznámení odložila z důvodu promlčení;
oznámil to vedoucí Obvodního státního zastupitelství pro Prahu 4 Jan
Vychyta. **Toto rozhodnutí je čistě procesní** — vyplývá z uplynutí
zákonné promlčecí doby (v době skutku 5, resp. 12 let u těžké újmy na
zdraví), **ne z posouzení, zda k činům došlo, nebo ne.** Rozhodnutí
tehdy nebylo pravomocné: žena proti němu podala stížnost.
*(Zdroj: Deník.cz, Blesk.cz, HN.cz, ČT24, Echo24)*

**Aktualizace 27.–28. 7. 2026**: státní zástupkyně stížnost zamítla,
odložení věci je tak pravomocné (single-sourced, ČT24 s odkazem na
iROZHLAS). **I toto je jen procesní rozhodnutí o promlčení, ne o vině.**
Protože je věc pravomocně uzavřena právě z důvodu promlčení, otázka,
zda k obviněnému jednání došlo, už nikdy nebude věcně posouzena žádným
orgánem činným v trestním řízení — pravomocnost tu neznamená vyřešení
sporu, jen konec procesní cesty k jeho vyřešení. Dossier to tak i nadále
vede, viz [GAP-06](@/dossiers/macinka-turek/gaps/gap-06.md).
*(Zdroj: ČT24)*

## Kauza z října 2025: smazané příspěvky na Facebooku

V říjnu 2025 zveřejnil Deník N investigativní text s printscreeny
příspěvků, které měly být smazané a připisované Filipu Turkovi z let
přibližně 2010–2014. Podle Deníku N měly příspěvky obsahovat rasistické,
sexistické a homofobní výroky — mimo jiné komentář zlehčující žhářský útok
ve Vítkově z roku 2009 a hanlivé označení Baracka Obamy — a odkazy na
Hitlera a holokaust.

Turek autorství nejzávažnějších příspěvků odmítl. Podle Deníku.cz uvedl:
„Přijímám zodpovědnost opravdu za mnoho nesmyslů, co jsem kdy napsal,
protože jsem milovník černého humoru, ale absolutně odmítám to hlavní, o
čem to celé bylo," a rasismus u sebe odmítl s odkazem na svou spolupráci s
romským podnikatelským sdružením. Nešlo o jeho první obdobnou obhajobu — už
v lednu 2024 v pořadu Xaver Live řekl, že nevhodné příspěvky na jeho účtech
někdy psali cizí lidé v hospodě, kterým půjčil odemčený telefon.

Pravost a autorství původních screenshotů zůstává sporné a nebylo k datu
psaní tohoto přehledu nezávisle prokázáno ani vyvráceno — jde o otevřenou,
neuzavřenou otázku, ne o potvrzený fakt. *(Zdroj: Deník N, Deník.cz)*

Motoristé sobě krátce po zveřejnění (12. října 2025) oznámili podání
trestního oznámení na redakci Deníku N a autory článku pro pomluvu a
křivé obvinění, s argumentem, že zveřejněný materiál „lze vytvořit pomocí
umělé inteligence a photoshopu". Deník N si za texty stojí. K technické
otázce důkazní hodnoty experti uvádějí, že samotné screenshoty nejsou
dostatečným důkazem, ale že Deník N tvrdí, že disponuje i URL adresami
originálních příspěvků, které by šlo u poskytovatele služby ověřit — tato
verifikace k datu psaní přehledu podle dostupných zdrojů neproběhla.
*(Zdroj: Deník.cz, Seznam Zprávy)*

**Aktualizace 28. 7. 2026**: Policie odložila jak prověřování samotných
Turkových výroků, tak trestní oznámení Motoristů na Deník N — u výroků
z důvodu promlčení, u oznámení na Deník N s odůvodněním, že zveřejnění
informací nebylo trestným činem. Obě rozhodnutí jsou procesní a nejsou
pravomocná. Policie výslovně **nepotvrdila** verzi Motoristů, že
zveřejněné materiály byly zfalšované — otázka nezávislého forenzního
ověření pravosti tím ale zůstává otevřená, viz [GAP-03](@/dossiers/macinka-turek/gaps/gap-03.md).
*(Zdroj: Deník N, Aktuálně.cz)*

## Dopravní nehoda (2026)

*(Co se stalo, podle více nezávislých zdrojů)*

Auto Filipa Turka se v červenci 2026 v Praze střetlo se zdravotnickým
vozem — část zpravodajství jej popisovala jako „sanitku" záchranné
služby, podle Turkovy verze i navazujícího zpravodajství šlo o vozidlo
Nemocnice Na Homolce převážející biologický materiál (obojí dossier
uvádí, protože citované zdroje se v označení vozu liší; na procesním
stavu věci to nic nemění).
Podle záběrů, které rozebíral Echo24, Turek před střetem předjížděl frontu
aut v pruhu určeném k odbočení; do křižovatky pak vjelo jako jediné z kolony
právě jeho vozidlo a narazilo do boku zdravotnického vozu, který náraz
vymrštil do vzduchu — u přechodu poblíž přitom podle popisu stála skupina chodců.
Vyšetřování příčiny a viny (přestupek, nebo trestný čin) probíhalo v době
psaní tohoto přehledu a jeho výsledek nebyl uzavřen. *(Zdroj: Echo24 — "Jízda
s majáky, stejná křižovatka a viníkem byl řidič sanitky. O nehodě Turka
zatím není jasno")*

V polovině července 2026 mluvčí pražské policie Eva Kropáčová uvedla, že
dopravní značení na místě bylo v pořádku a odpovídalo projektové
dokumentaci — což nepřímo odporuje Turkovu vlastnímu tvrzení, že
nešlo o odbočovací pruh. Turek prohlásil, že se v případě trestního
stíhání nechá vydat a imunitu jako poslanec nevyužije; podle jeho verze
projížděl křižovatkou Ječná/Sokolská na zelenou, zatímco vozidlo
Nemocnice Na Homolce mělo vjet na červenou se zapnutými výstražnými
světly a sirénou. Jeho dechová zkouška na alkohol byla negativní. Řidič
sanitky utrpěl středně těžké poranění hlavy a zranění lokte a zůstal v
pracovní neschopnosti. Tyto dvě protichůdné verze (policejní zjištění o
značení vs. Turkovo líčení průjezdu na zelenou) dossier vede vedle sebe —
otázka viny ([GAP-01](@/dossiers/macinka-turek/gaps/gap-01.md)) tím není rozhodnuta, jen doplněna o víc zdokumentovaných
detailů. *(Zdroj: Blesk.cz, Česká justice)*

## Bezprostřední reakce

- Turek oznámil, že do uzavření vyšetřování nebude vykonávat funkci vládního
  zmocněnce pro Green Deal, a přislíbil, že pokud policie shledá jeho vinu,
  z funkce zmocněnce odstoupí. *(ČeskéNoviny.cz, ČT24)*
- Premiér Andrej Babiš podle ČeskýchNovin/iRozhlas řekl Macinkovi, že pokud
  se záběry potvrdí, měl by Turek nést odpovědnost a rezignovat.
- Macinka podle [Života v Česku](@/dossiers/macinka-turek/sources/src-10.md) ocenil, že
  Turkovo dočasné stažení z funkce je "vyzrálý přístup", zároveň se ale
  opřel do prezidenta Pavla za jeho vyjádření ke kauze.
- Opozice (mimo jiné TOP 09) žádala Turkův okamžitý odchod ze všech funkcí
  včetně poslaneckého mandátu, s odůvodněním, že mohl vážně ohrozit životy a
  zdraví více lidí. *(ČeskéNoviny.cz)*

## Macinkova obrana Turka

Macinka opakovaně veřejně deklaroval, že za Turkem stojí:

> „Turka se nikdy nevzdám, budu mu odřezávat oprátku." — Macinka, podle Echo24

> „Nikdy se ho nevzdám, budu za něj bojovat!" — Macinka po nehodě, podle Blesk.cz

> „Je, byl a bude to Turek," řekl Macinka k jeho nominaci na ministra
> životního prostředí. *([SRC-05](@/dossiers/macinka-turek/sources/src-05.md), ČT24)*

Tyto výroky jsou citace, ne hodnocení tohoto dossieru.

## Další zaznamenané kontroverze

*(Menší rozsahem než čtyři výše sledované kauzy — bez otevřeného
trestního řízení, ale zdokumentované a veřejně publikované.)*

- **2017 — incident u saúdské ambasády**: Turek nechal na autě
  zaměstnance saúdskoarabské ambasády kresbu oprátky a loveckou
  nábojnici. Policie případ nejprve prošetřovala jako vyhrožování s
  rasovým motivem, později uzavřela jako pravděpodobnou záměnu osob a
  vyřešila jako přestupek. Turek tvrdil, že bránil tehdejší přítelkyni,
  a rasový motiv odmítl. *(Zdroj: Deník.cz)*
- **2026 — černé stavby**: Turek dostal pokuty v součtu 200 000 Kč za
  dvě nepovolené stavby na svém pozemku v Praze-Dubči — sadařský domek
  (80 000 Kč, nedbalost) a stavbu připomínající dvojgaráž, kterou během
  výstavby označoval jako moštárnu (120 000 Kč, úmysl). Obě dodatečně
  zlegalizoval. *(Zdroj: Blesk.cz)*
- **Závodní kariéra**: nezávislá analýza dokumentovaných startů
  Turkovy automobilové kariéry (2015–2017, kategorie Formula 4 Trophy)
  zjistila 12 výher z 27 startů — čtyřikrát jel sám, šestkrát proti
  jedinému soupeři. Dossier to vede jako doklad řídké obsazenosti těchto
  závodů, ne jako tvrzení o neplatnosti výsledků. *(Zdroj: Aktuálně.cz)*
- **Setkání s diplomaty**: Turek se (spolu s Kateřinou Konečnou a
  Václavem Klausem) setkal s íránským velvyslancem Seyedem Majidem
  Ghafelehem Bashim; všichni tři politici schůzku potvrdili, ale
  označili ji za pouhou zdvořilostní návštěvu. Turek se hájil členstvím
  v delegaci Evropského parlamentu pro Írán. *(Zdroj: Aktuálně.cz,
  Neovlivní.cz)*

## Komentáře a analýzy (názor, ne fakt)

Server [HlídacíPes.org](@/dossiers/macinka-turek/sources/src-09.md) publikoval komentář
Aleše Rozehnala "Macinka a Turek si hrají na mazáky. Čeká je návrat k
bezvýznamnosti". Server [Info.cz](@/dossiers/macinka-turek/sources/src-03.md) v lednu 2026
(tedy ještě před nehodou) publikoval komentář Martina Schmarcze "Macinka
už ví, že musí hodit Turka přes palubu", argumentující, že dvojvedení
Motoristů dlouhodobě nefunguje. Jde o autorské komentáře, ne zpravodajství,
a jsou zde uvedeny odděleně a zřetelně jako názor.

## Mezery a otevřené otázky

Šest otázek zůstává k datu poslední kontroly otevřených — čtyři s vysokou
prioritou (výsledek vyšetřování nehody, jeho dopad na mandát/vládu,
ověření pravosti smazaných příspěvků, výsledek stížnosti proti odložení
trestního oznámení) a dvě s nízkou prioritou (Macinkovy nemovitosti,
rekonciliace sponzorských částek). Každá má vlastní stránku s tím, co
přesně chybí, proč, a kdy a jak byla naposledy ověřena.

> **[Otevřít registr mezer →](@/dossiers/macinka-turek/gaps/_index.md)**
> GAP-01 – GAP-06, priorita, související tvrzení (CLM-##) a datum
> poslední kontroly u každé položky.

## Co tento přehled nezkoumal

Přehled nyní částečně čerpá z veřejných rejstříkových dat (Hlídač státu —
obchodní rejstřík a přehled dárců politických stran), viz sekce
"Majetkové, podnikatelské a finanční vazby" výše. I tak jde stále o
dílčí, ne o vyčerpávající korporátní due-diligence. Nadále chybí:

- majetková přiznání a evidence střetu zájmů nad rámec toho, co
  zveřejnila žurnalistika (registr oznámení dle zákona č. 159/2006 Sb.
  jako celek nebyl systematicky procházen);
- katastr nemovitostí (ČÚZK) — majetek/nemovitosti Turka a Macinky
  nebyly dohledávány;
- osobní/rodinný život nad rámec toho, co bylo citovanými médii samo
  zveřejněno ve vztahu k výše popsaným kauzám;
- úplné financování volební kampaně Motoristů sobě 2025 (výše uvedené
  dary z let 2017–2024 dokládají vzorec, ne kompletní rozpočet kampaně).

Nejde o zjištění, že by v těchto oblastech něco chybělo nebo bylo v pořádku
či nepořádku — jde o oblasti, které tento přehled **prostě nezkoumal**.
Rozšíření o tyto oblasti by vyžadovalo samostatný sběr z primárních registrů.

## Registr zdrojů

Všech 54 citovaných zdrojů má vlastní stránku s typem, originálním
odkazem, datem sestavení a přehledem toho, která tvrzení podporuje.

> **[Otevřít registr zdrojů →](@/dossiers/macinka-turek/sources/_index.md)**
> 54 zdrojů (SRC-01 – SRC-54), typ média, originální odkaz, podporovaná
> tvrzení a poznámka k nezávislosti redakcí.

*Tento přehled shrnuje mediálně publikované informace k datu 2026-07-29. Kauzy se dále vyvíjí a přehled bude podle potřeby aktualizován. Nejde o právní hodnocení viny — otázky odpovědnosti (za nehodu i za pravost příspěvků z roku 2025) jsou předmětem probíhajícího šetření, resp. sporu.*
