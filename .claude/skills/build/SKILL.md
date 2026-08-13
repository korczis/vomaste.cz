---
name: build
description: Spustí kanonickou bránu kvality (npm run build) a vysvětlí výsledek strukturovaně — který krok padl, co znamená a co s tím. Použij ho, když se má práce prohlásit za hotovou, před merge nebo review-requestem, nebo když někdo řekne „spusť build", „proč to nejde postavit".
argument-hint: "[check — bez zola build, rychlejší]"
disable-model-invocation: true
---

Brána kvality. Je to **jediná věc, která se počítá jako „hotovo"**.

> `disable-model-invocation: true`: build trvá minuty a v hlavním
> checkoutu na `master` navazuje na auto-push. Spouští ho člověk.

## Kdy ho použít

- Než cokoli ohlásíš jako hotové.
- Před merge nebo review-requestem.
- Po změně, která se dotýká generovaných výstupů nebo šablon.

## Kdy ho NEPOUŽÍT

- **Během rychlé iterace.** Trvá minuty. Na smyčku je `/test`
  a `npm run data:validate -- --file <cesta>`.
- **Ke zjištění, co je špatně v datech.** Konkrétní validátor odpoví
  rychleji a se stejnou přesností.

## Co se spustí

```bash
npm run build     # plná brána, včetně zola build a kontrol nad HTML
npm run check     # totéž bez zola build — když tě nezajímá web
npm run dev       # generátory + živý server (neskončí sám)
```

Pořadí kroků vlastní `scripts/build/pipeline.mjs` (`MODES`). Zhruba:
validace dat → view modely → generované adaptéry → testy a validátory →
generátory → CSS/JS → `zola build` → kontroly nad postaveným webem
(kotvy, JSON-LD, Open Graph, plnohodnotné stránky, responzivita).

## Postup

1. **Spusť** a nech doběhnout. Nepřerušuj kvůli varování.
2. **Přečti první selhání**, ne poslední. Kroky na sebe navazují
   a pozdější chyby bývají následek.
3. **Zařaď selhání** podle tabulky níž.
4. **Oprav příčinu**, ne symptom.
5. **Spusť znovu** a ověř **exit 0**.

## Kde to typicky padá

| Krok | Co to znamená |
|---|---|
| `data:validate` | chyba v kanonických datech — hláška uvádí pravidlo (S/R/T) |
| `data:check-generated:content` | někdo editoval generovanou stránku ručně |
| `verify:tooling-catalog` | přibyl příkaz nebo schopnost bez záznamu v `data/tooling/` |
| `verify:source-catalog` | katalog zdrojů se rozešel s daty, nebo v novém worktree nikdy nevznikl |
| `lint:component-reuse` | šablona nepoužívá povinnou komponentu |
| `archive:check` | chybí pokrytí ARES/Sbírky listin u entity s IČO |
| `zola build` | chyba v šabloně nebo mrtvý interní odkaz |
| `verify:anchors` | odkaz na kotvu, která v postaveném HTML není |
| `verify:jsonld` | stránka bez JSON-LD, špatný tvar uzlu, nebo truth-rating značka |
| `verify:og` | metadata neodpovídají `data/seo.toml` |

**V čerstvém worktree** padá build nejčastěji proto, že vygenerované
vstupy nikdy nevznikly. To není rozejitá data — spusť
`npm run generate:all`.

## Výstup

```
PŘÍKAZ:      npm run build
VÝSLEDEK:    PASS | FAIL na kroku <n>/<celkem>: <název>
EXIT:        <kód>
TRVÁNÍ:      <čas>
CO PADLO:    <hláška, zkráceně, ale doslovně>
ZNAMENÁ:     <příčina>
OPRAVA:      <konkrétně>
```

**Nikdy nehlas hotovo bez exit 0.** Ani „prošlo to skoro celé".

## Co skill NEUDĚLÁ

- Neopraví data, aby build prošel.
- Nespustí build s vypnutým krokem.
- Nepushne ani nenasadí. Na `master` to udělá hook po commitu —
  což je důvod, proč build patří **před** commit, ne po něm.

## Příklady

**Základní.** `npm run build` → PASS, exit 0, 45 kroků. Další krok:
commit.

**Realistický.** FAIL na `verify:anchors`: odkaz na `#clm-14`, který
v HTML není. Příčina: tvrzení bylo přečíslované a odkaz v textu kauzy
zůstal starý. Oprava v kanonických datech, ne v `content/`.

**Selhání.** FAIL na `data:check-generated:content` po ruční editaci
stránky v `content/`. Vysvětlení musí obsahovat past: uvnitř buildu
běží sync **dřív** než tahle brána, takže se editace obvykle tiše
přepíše a build zůstane zelený. Že se tentokrát ozvala, znamená, že
brána běžela na nesynchronizovaném stromu.

## Související

`/test` (rychlá smyčka), `/quality` (souhrn před PR),
`/diagnose` (když je rozbité prostředí, ne data),
`docs/TOOLING.md` (co který krok dělá).
