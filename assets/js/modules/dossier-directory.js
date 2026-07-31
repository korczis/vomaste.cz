// Alpine komponenta za adresářem dossierů (templates/dossiers-index.html).
//
// Stejný princip jako entity-explorer.js a table-filter.js: řádky vykreslí
// Tera ze stejných dat, ze kterých vzniká JSON-LD, a tahle komponenta je
// jen přeskupuje. Nic nedogeneruje, nic nefetchuje — bez JavaScriptu
// zůstane plná tabulka seřazená podle jména, jen bez toolbaru.
//
// Řazení se nedělá přes innerHTML, ale přesunem existujících <tr> uzlů;
// hodnota se bere z `data-sort-value` buňky (číslo nebo datum), a když
// chybí, z jejího textu. Číselné sloupce se tak řadí jako čísla, ne
// lexikograficky — „10 tvrzení" nesmí skončit před „9 tvrzení".
//
// Hlavičky tabulky se upgradují na tlačítka až v JS: bez skriptu by to
// byla mrtvá tlačítka, která nic nedělají, a `aria-sort` by lhal.
//
// Stav (hledání, sloupec, směr) žije v URL přes sdílený url-state.js —
// stejný modul jako entity-explorer.js, aby se dvě kopie téže logiky
// nerozešly a sdílený odkaz vedl u obou pohledů na totéž.

import { readState, syncUrl } from "./url-state.js";

const URL_SPEC = { q: "", sort: "", dir: "asc" };

export function registerDossierDirectory() {
  window.Alpine.data("dossierDirectory", function () {
    return {
      search: "",
      sortKey: "",
      sortDir: "asc",
      total: 0,
      visible: 0,
      rows: [],
      keys: [],

      init() {
        const table = this.$root.querySelector("table");
        if (!table || !table.tBodies.length) return;
        this.keys = (this.$root.dataset.sortKeys || "").split(",").map((k) => k.trim());
        this.rows = Array.prototype.slice.call(table.tBodies[0].rows);
        this.rows.forEach(function (row) {
          row.dataset.search = row.textContent.toLowerCase();
        });
        this.total = this.rows.length;
        this.visible = this.rows.length;

        const heads = table.tHead ? table.tHead.rows[0].cells : [];
        Array.prototype.forEach.call(heads, (th, i) => {
          const key = this.keys[i];
          if (!key) return;
          const label = th.textContent.trim();
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "flex items-center gap-1 text-inherit";
          btn.textContent = label;
          const caret = document.createElement("span");
          caret.className = "text-white/30";
          caret.setAttribute("aria-hidden", "true");
          btn.appendChild(caret);
          btn.addEventListener("click", () => this.sortBy(key));
          th.textContent = "";
          th.appendChild(btn);
          th.dataset.sortKey = key;
        });

        const state = readState(URL_SPEC);
        this.search = state.q;
        if (this.keys.indexOf(state.sort) !== -1) this.sortKey = state.sort;
        if (state.dir === "desc") this.sortDir = "desc";
        this.apply();
      },

      sortBy(key) {
        if (this.sortKey === key) {
          this.sortDir = this.sortDir === "asc" ? "desc" : "asc";
        } else {
          this.sortKey = key;
          // Čísla dávají smysl od největšího (kdo má nejvíc tvrzení),
          // text od A. Sloupec sám o sobě neví, čím je — pozná se to
          // podle toho, jestli nese data-sort-value s číslem.
          this.sortDir = this.isNumeric(key) ? "desc" : "asc";
        }
        this.apply();
      },

      isNumeric(key) {
        const i = this.keys.indexOf(key);
        if (i === -1 || !this.rows.length) return false;
        const cell = this.rows[0].cells[i];
        return cell && cell.dataset.sortValue !== undefined && !Number.isNaN(Number(cell.dataset.sortValue));
      },

      // POZOR na jméno: metoda se nesmí jmenovat `valueOf`. Alpine drží stav
      // v reaktivním Proxy a `valueOf` je metoda z Object.prototype, kterou
      // proxy obsluhuje sama — volání pak vrátilo celý objekt místo hodnoty
      // buňky a řazení tiše dopadlo jako vzestupné bez ohledu na směr.
      cellValue(row, key) {
        const i = this.keys.indexOf(key);
        const cell = row.cells[i];
        if (!cell) return "";
        const raw = cell.dataset.sortValue !== undefined ? cell.dataset.sortValue : cell.textContent.trim();
        const num = Number(raw);
        return Number.isNaN(num) || raw === "" ? raw.toLowerCase() : num;
      },

      reset() {
        this.search = "";
        this.sortKey = "";
        this.sortDir = "asc";
        this.apply();
      },

      apply() {
        const q = this.search.trim().toLowerCase();
        let shown = 0;
        this.rows.forEach(function (row) {
          const match = !q || row.dataset.search.indexOf(q) !== -1;
          row.hidden = !match;
          if (match) shown++;
        });
        this.visible = shown;

        const table = this.$root.querySelector("table");
        if (this.sortKey) {
          const dir = this.sortDir === "asc" ? 1 : -1;
          const sorted = this.rows.slice().sort((a, b) => {
            const va = this.cellValue(a, this.sortKey);
            const vb = this.cellValue(b, this.sortKey);
            if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
            return String(va).localeCompare(String(vb), "cs") * dir;
          });
          const body = table.tBodies[0];
          sorted.forEach((row) => body.appendChild(row));
        }

        if (table.tHead) {
          Array.prototype.forEach.call(table.tHead.rows[0].cells, (th) => {
            const key = th.dataset.sortKey;
            if (!key) return;
            const active = key === this.sortKey;
            th.setAttribute("aria-sort", active ? (this.sortDir === "asc" ? "ascending" : "descending") : "none");
            const caret = th.querySelector("button span");
            if (caret) caret.textContent = active ? (this.sortDir === "asc" ? "▲" : "▼") : "";
          });
        }

        syncUrl(
          { q: this.search.trim(), sort: this.sortKey, dir: this.sortKey ? this.sortDir : "asc" },
          URL_SPEC,
        );
      },
    };
  });
}
