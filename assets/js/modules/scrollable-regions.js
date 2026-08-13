// Posuvné oblasti v renderovaném textu zpřístupní klávesnici.
//
// PROBLÉM. Markdown vydává `<pre>` i `<table>` bez obalu, takže scroll
// kontejnerem je sám ten prvek (`static/css/input.css`, `.dossier-prose pre`
// a `.dossier-prose table` mají `overflow-x: auto`). Kdo ovládá web
// klávesnicí, se do takové oblasti nemá jak dostat — nedá se zaostřit, tedy
// se v ní nedá posouvat, a část obsahu je pro něj fakticky nedostupná.
// Plošná přístupnostní kontrola to hlásí jako `scrollable-region-focusable`
// (WCAG 2.1 AA, závažnost serious) a padalo to mimo jiné na
// `/dokumentace/agents/` — dlouhé bloky kódu a široké tabulky.
//
// PROČ TO NEJDE VYŘEŠIT V ŠABLONĚ. Obsah těch stránek je markdown a
// `tabindex` je HTML atribut; generátor ho na `<pre>` ani `<table>`
// nedoplňuje a obal, kam by šel pověsit, neexistuje. CSS atribut přidat
// neumí.
//
// PROČ NE PŘES CSS „ať se to zalomí“. U `<pre>` by to šlo (`white-space:
// pre-wrap`), ale zalomení rozbije ASCII diagramy a odsazený kód — proto
// tam `white-space: pre` je schválně. U tabulek vodorovný posuv nahradit
// nelze vůbec.
//
// CO TENHLE MODUL DĚLÁ. Prvkům, které se opravdu posouvají, doplní
// `tabindex="0"`. Nic víc:
//
//   * `role` se nenastavuje. Na `<table>` by přebilo tabulkovou sémantiku
//     a odečítač obrazovky by přišel o hlavičky, řádky i navigaci po
//     buňkách — tedy oprava přístupnosti, která přístupnost zhorší.
//   * `tabindex` dostane jen prvek, který skutečně přetéká. Zaostřitelný
//     blok, ve kterém se nedá nikam posunout, je jen zastávka navíc při
//     procházení stránky tabulátorem.
//
// Bez JavaScriptu zůstává chování jako dosud (myš a dotyk posouvají) — je
// to progresivní vylepšení, ne podmínka čitelnosti.

const SELECTOR = ".dossier-prose pre, .dossier-prose table";

// Kolik pixelů přetečení už považujeme za posuvnou oblast. Sub-pixelové
// rozdíly vznikají zaokrouhlením při zoomu a při některých šířkách okna;
// bez tolerance by prvek dostával a ztrácel tabindex podle náhody.
const TOLERANCE = 2;

function sync(el) {
  const scrolls = el.scrollWidth - el.clientWidth > TOLERANCE;
  if (scrolls) {
    if (el.getAttribute("tabindex") === null) el.setAttribute("tabindex", "0");
    return;
  }
  // Odebírá se jen to, co jsme sami přidali — cizí tabindex zůstává.
  if (el.getAttribute("tabindex") === "0" && !el.dataset.keepTabindex) {
    el.removeAttribute("tabindex");
  }
}

export function initScrollableRegions() {
  const elements = Array.from(document.querySelectorAll(SELECTOR));
  if (elements.length === 0) return;

  for (const el of elements) sync(el);

  // Přetečení závisí na šířce okna: tabulka, která se na širokém displeji
  // vejde, se po zúžení posouvat začne. Bez sledování změn by tabindex
  // odpovídal jen tomu, jak byla stránka široká při načtení.
  if (typeof ResizeObserver === "undefined") return;
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) sync(entry.target);
  });
  for (const el of elements) observer.observe(el);
}
