// Alpine komponenta pod sdíleným makrem advanced_table
// (templates/macros/table.html). Řádky zůstávají prostý Tera markup;
// komponenta vlastní jen reaktivní stav — hledání, řazení, faset a jejich
// promítnutí do URL. Žádný framework navíc, na stránkách bez tabulky no-op.
//
// Tři schopnosti přibyly v T-019 (§ 7 a § 8 mise):
//
// 1. Hledání ignoruje diakritiku. Do té doby se porovnávalo
//    textContent.toLowerCase(), takže „vojtech" nenašlo „Vojtěch" — na
//    česky psaném webu tichá past, protože prázdný výsledek vypadá jako
//    „nic tam není", ne jako „špatně jsi to napsal". normalize() se
//    přebírá ze search-core.js, ať příkazový řádek a tabulky nesoudí
//    shodu různě.
//
// 2. Řazení podle sloupce. Buňka může nést data-sort-value (datum, počet)
//    a pak se řadí podle ní, ne podle zobrazeného textu — jinak by se
//    „10" řadilo před „9".
//
// 3. URL stav, ale jen když si ho tabulka vyžádá přes data-url-state.
//    Stránka smí mít víc tabulek a ty by si jinak přepisovaly tytéž
//    parametry: poslední inicializovaná by vyhrála a sdílený odkaz by
//    obnovil filtr jinde, než ho uživatel nastavil.

import { normalize } from "./search-core.js";
import { readState, syncUrl } from "./url-state.js";

const SPEC = { q: "", sort: "", dir: "asc", f: "" };

// Směr je parametr, ne násobitel výsledku. Prázdná hodnota patří na konec
// v OBOU směrech: řádek bez údaje není „nejmenší", jen neúplný, a kdyby
// chybějící data vyplavala nahoru, byla by nejnápadnějším obsahem tabulky.
// Kdyby volající násobil návratovou hodnotu -1, tohle pravidlo by se
// sestupně obrátilo — proto se dir aplikuje jen na srovnání dvou
// skutečných hodnot.
//
// numeric: true řeší CLM-2 vs CLM-10 — bez něj je řazení lexikografické a
// desítka skončí před dvojkou. Dnešní id jsou nulou doplněná na dvě místa,
// takže by to prošlo; přestane to platit u prvního dossieru se stovkou
// záznamů, a to je tichá vada, ne pád.
export function compareValues(a, b, dir = 1) {
  if (a === b) return 0;
  if (a === "") return 1;
  if (b === "") return -1;
  const na = Number(a);
  const nb = Number(b);
  if (a !== "" && b !== "" && !Number.isNaN(na) && !Number.isNaN(nb)) return (na - nb) * dir;
  return a.localeCompare(b, "cs", { numeric: true }) * dir;
}

function cellValue(row, index) {
  const cell = row.cells[index];
  if (!cell) return "";
  const explicit = cell.dataset ? cell.dataset.sortValue : undefined;
  return (explicit !== undefined && explicit !== "" ? explicit : cell.textContent).trim();
}

export function registerTableFilter() {
  window.Alpine.data("advancedTable", function () {
    return {
      search: "",
      sortKey: "",
      sortDir: "asc",
      facet: "",
      total: 0,
      visible: 0,
      rows: [],
      urlState: false,
      sortIndexes: {},

      init() {
        const table = this.$root.querySelector("table");
        if (!table || !table.tBodies.length) return;
        this.body = table.tBodies[0];
        this.rows = Array.prototype.slice.call(this.body.rows);
        this.rows.forEach(function (row) {
          row.dataset.search = normalize(row.textContent);
        });
        this.total = this.rows.length;
        this.visible = this.rows.length;
        this.urlState = this.$root.dataset.urlState === "true";

        // Řaditelné sloupce se hlásí samy v hlavičce; klíč je čitelný
        // řetězec, aby ?sort=status dávalo smysl i bez znalosti pořadí
        // sloupců (a přežilo jejich případné přeuspořádání).
        const heads = table.querySelectorAll("th[data-sort-key]");
        Array.prototype.forEach.call(heads, (th) => {
          this.sortIndexes[th.dataset.sortKey] = th.cellIndex;
        });

        if (this.urlState) {
          const state = readState(SPEC);
          this.search = state.q;
          this.facet = state.f;
          if (this.sortIndexes[state.sort] !== undefined) {
            this.sortKey = state.sort;
            this.sortDir = state.dir === "desc" ? "desc" : "asc";
          }
        }
        if (this.sortKey) this.applySort();
        this.apply();
      },

      // Řadí se celá množina řádků, ne jen viditelné — jinak by změna
      // filtru po řazení vrátila skryté řádky v původním pořadí.
      applySort() {
        const index = this.sortIndexes[this.sortKey];
        if (index === undefined) return;
        const dir = this.sortDir === "desc" ? -1 : 1;
        const sorted = this.rows.slice().sort(function (x, y) {
          return compareValues(cellValue(x, index), cellValue(y, index), dir);
        });
        const frag = document.createDocumentFragment();
        sorted.forEach(function (row) {
          frag.appendChild(row);
        });
        this.body.appendChild(frag);
      },

      sortBy(key) {
        if (this.sortIndexes[key] === undefined) return;
        if (this.sortKey === key) this.sortDir = this.sortDir === "asc" ? "desc" : "asc";
        else {
          this.sortKey = key;
          this.sortDir = "asc";
        }
        this.applySort();
        this.sync();
      },

      setFacet(value) {
        this.facet = this.facet === value ? "" : value;
        this.apply();
      },

      ariaSort(key) {
        if (this.sortKey !== key) return "none";
        return this.sortDir === "asc" ? "ascending" : "descending";
      },

      apply() {
        const q = normalize(this.search);
        const facet = this.facet;
        let shown = 0;
        this.rows.forEach(function (row) {
          const matchesQuery = !q || row.dataset.search.indexOf(q) !== -1;
          const matchesFacet = !facet || row.dataset.facet === facet;
          const show = matchesQuery && matchesFacet;
          row.hidden = !show;
          if (show) shown++;
        });
        this.visible = shown;
        this.sync();
      },

      sync() {
        if (!this.urlState) return;
        syncUrl(
          { q: this.search.trim(), sort: this.sortKey, dir: this.sortDir, f: this.facet },
          SPEC,
        );
      },
    };
  });
}
