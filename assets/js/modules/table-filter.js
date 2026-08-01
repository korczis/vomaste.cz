// Alpine komponenta pod sdíleným makrem advanced_table
// (templates/macros/table.html). Jediná tabulková komponenta v repozitáři:
// registry tvrzení/zdrojů/mezer/kauz i adresář dossierů jedou přes ni.
//
// Vznikla sloučením dvou implementací, které vznikly souběžně (T-018 a
// T-019) a dělaly totéž jinak. Z každé zůstalo to lepší:
//
//   z dossier-directory.js
//     - hlavičky se na tlačítka povyšují až v JS. Bez skriptu by v HTML
//       ležela mrtvá tlačítka, která nic nedělají, a aria-sort by lhal.
//     - výchozí směr podle typu sloupce: čísla sestupně (koho zajímá,
//       kdo má nejvíc), text vzestupně.
//     - varování o valueOf níže — draze zaplacená znalost.
//
//   z table-filter.js
//     - hledání ignoruje diakritiku přes normalize() ze search-core.js.
//       Porovnávat textContent.toLowerCase() znamená, že „vojtech"
//       nenajde „Vojtěch" — na česky psaném webu tichá past, protože
//       prázdný výsledek vypadá jako „nic tam není".
//     - prázdné hodnoty se řadí na konec v OBOU směrech.
//     - řazení číslic v textu (CLM-2 před CLM-10).
//     - fasety: čipy i rozbalovací selektory.
//
// Nové schopnosti (T-019, inspirace funkcemi Flowbite Advanced Tables /
// Datatables, implementace vlastní): přepínání viditelnosti sloupců a
// export právě zobrazeného výřezu do CSV/JSON.
//
// VĚDOMĚ CHYBÍ:
//   - stránkování. Nejdelší registr má desítky řádků, a stránkování by
//     rozbilo Ctrl+F i odkaz na konkrétní řádek. Až bude tabulka nad
//     tisíc řádků, je to první věc k doplnění.
//   - výběr řádků a hromadné akce. Na read-only důkazním webu není co
//     hromadně provést; přepínač bez akce je dekorace.
//   - simple-datatables jako závislost. Knihovna je pod GNU licencí a
//     nesla by s sebou runtime framework; tenhle web staví na tom, že
//     bez JS zůstane použitelná plná tabulka.

import { normalize } from "./search-core.js";
import { readState, syncUrl } from "./url-state.js";

const SPEC = { q: "", sort: "", dir: "asc", f: "" };

// Prázdná hodnota patří na konec bez ohledu na směr: řádek bez údaje není
// „nejmenší", jen neúplný, a kdyby chybějící data vyplavala nahoru, byla
// by nejnápadnějším obsahem tabulky. Proto je směr parametr, ne násobitel
// návratové hodnoty — jinak by se tohle pravidlo sestupně obrátilo.
//
// numeric: true řeší CLM-2 vs CLM-10. Dnešní identifikátory jsou nulou
// doplněné na dvě místa, takže by to prošlo; přestane to platit u prvního
// dossieru se stovkou záznamů, a to je tichá vada, ne pád.
export function compareValues(a, b, dir = 1) {
  if (a === b) return 0;
  if (a === "") return 1;
  if (b === "") return -1;
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return (na - nb) * dir;
  return a.localeCompare(b, "cs", { numeric: true }) * dir;
}

// Buňka tabulky do jednoho pole CSV.
//
// Escapuje se uvozovkami podle RFC 4180. Navíc apostrof před =, +, - a @:
// tabulkové procesory takový text vyhodnotí jako vzorec, takže hodnota
// zkopírovaná ze zdroje by mohla v cizím Excelu spustit odkaz nebo výpočet.
// Na webu, jehož smyslem je předávat doložené záznamy dál, je export do
// tabulky očekávaná cesta — tohle je vstup pro cizí software, ne jen text.
export function csvCell(value) {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function toCsv(headers, rows) {
  return [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
}

function cellText(cell) {
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
      selectFacets: [],
      facetOptions: {},
      facetValues: {},
      columns: [],
      hiddenColumns: {},
      exportName: "",
      inspected: "",
      inspectedFields: [],
      inspectedHref: "",
      // Vrstva adresáře: tatáž kolekce vykreslená ve třech projekcích.
      // Není to druhý filtrovací engine — hledání, řazení i URL stav
      // zůstávají tady, takže se tři pohledy nemůžou rozejít.
      directory: false,
      view: "table",
      allowedViews: ["table", "list", "grid"],
      records: new Map(),

      // Klíče v URL jsou názvy atributů (?type=…), aby adresa popisovala,
      // co filtruje, a ne pořadí selectů v šabloně.
      spec() {
        const spec = Object.assign(
          {},
          SPEC,
          this.$root.dataset.inspector ? { inspect: "" } : {},
          this.$root.dataset.dossierDirectory !== undefined
            ? { view: this.$root.dataset.defaultView || "table" }
            : {},
        );
        this.selectFacets.forEach(function (attr) {
          spec[attr] = "";
        });
        return spec;
      },

      init() {
        const table = this.$root.querySelector("table");
        if (!table || !table.tBodies.length) return;
        this.table = table;
        this.body = table.tBodies[0];
        this.rows = Array.prototype.slice.call(this.body.rows);
        this.rows.forEach(function (row) {
          row.dataset.search = normalize(row.textContent);
        });
        this.total = this.rows.length;
        this.visible = this.rows.length;
        this.urlState = this.$root.dataset.urlState === "true";
        this.exportName = this.$root.dataset.exportName || "";

        this.directory = this.$root.dataset.dossierDirectory !== undefined;
        if (this.directory) this.initDirectory();

        this.upgradeHeaders();
        this.readFacetOptions();

        if (this.urlState) {
          const state = readState(this.spec());
          this.search = state.q;
          this.facet = state.f;
          this.selectFacets.forEach((attr) => {
            // Hodnota z URL se přijme jen když ji data skutečně nabízejí.
            // Jinak by zastaralý odkaz zobrazil prázdnou tabulku bez
            // vysvětlení, místo aby spadl zpět na plný pohled.
            if (this.facetOptions[attr].indexOf(state[attr]) !== -1) {
              this.facetValues[attr] = state[attr];
            }
          });
          if (this.sortIndexes[state.sort] !== undefined) {
            this.sortKey = state.sort;
            this.sortDir = state.dir === "desc" ? "desc" : "asc";
          }
        }
        // Přečíst PŘED apply(): apply() volá sync(), a ten zapisuje
        // this.inspected (v tu chvíli prázdné) zpátky do adresy, čímž by
        // parametr ze sdíleného odkazu smazal dřív, než ho stihneme použít.
        const wantedInspect = this.$root.dataset.inspector && this.urlState
          ? readState(this.spec()).inspect
          : "";

        this.apply();

        if (this.$root.dataset.inspector) {
          // Esc zavírá panel odkudkoli z tabulky — očekávané chování,
          // které nesmí záviset na tom, jestli má fokus zrovna tlačítko.
          this.$root.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.inspected) {
              e.stopPropagation();
              this.closeInspector();
            }
          });
          // Otevření ze sdíleného odkazu až tady, aby se řádek nehledal
          // mezi ještě neinicializovanými.
          if (wantedInspect) this.openInspector(wantedInspect);
        }
      },

      // Hlavičky se na tlačítka povyšují až tady. Šablona vypisuje prostý
      // text s data-sort-key; bez JS tedy nikde neleží ovládací prvek,
      // který nic nedělá, a aria-sort se objeví jen když řazení funguje.
      upgradeHeaders() {
        const heads = this.table.tHead ? this.table.tHead.rows[0].cells : [];
        Array.prototype.forEach.call(heads, (th, index) => {
          this.columns.push({ index: index, label: th.textContent.trim() });
          const key = th.dataset.sortKey;
          if (!key) return;
          this.sortIndexes[key] = index;
          const label = th.textContent.trim();
          const button = document.createElement("button");
          button.type = "button";
          button.className =
            "flex w-full items-center gap-1 text-left uppercase tracking-wide transition-colors hover:text-white";
          button.textContent = label;
          const caret = document.createElement("span");
          caret.className = "font-mono text-[0.65rem] text-white/25";
          caret.setAttribute("aria-hidden", "true");
          caret.textContent = "↕";
          button.appendChild(caret);
          button.addEventListener("click", () => this.sortBy(key));
          th.textContent = "";
          th.appendChild(button);
          // Řaditelný, ale zatím neseřazený sloupec má hlásit "none".
          // Bez toho odečítač neví, že se sloupcem jde řadit — vidoucí to
          // pozná podle ikony, nevidomý nemá z čeho.
          th.setAttribute("aria-sort", "none");
        });
      },

      // Volby selektorů se sbírají z řádků, ne z výčtu v šabloně — nová
      // hodnota v datech se objeví sama, jinak by seznam tiše zastaral.
      readFacetOptions() {
        this.selectFacets = (this.$root.dataset.selectFacets || "")
          .split("|")
          .filter(Boolean);
        this.selectFacets.forEach((attr) => {
          const values = [];
          this.rows.forEach(function (row) {
            const v = row.dataset[attr];
            if (v && values.indexOf(v) === -1) values.push(v);
          });
          this.facetOptions[attr] = values.sort(function (a, b) {
            return a.localeCompare(b, "cs");
          });
          this.facetValues[attr] = "";
        });
      },

      // Sloupec sám o sobě neví, čím je; pozná se to podle toho, jestli
      // jeho buňky nesou číselné data-sort-value. U čísel dává smysl
      // začít od největšího, u textu od A.
      isNumeric(key) {
        const index = this.sortIndexes[key];
        if (index === undefined || !this.rows.length) return false;
        const cell = this.rows[0].cells[index];
        if (!cell || cell.dataset.sortValue === undefined) return false;
        return cell.dataset.sortValue !== "" && !Number.isNaN(Number(cell.dataset.sortValue));
      },

      // POZOR na jméno: metoda se nesmí jmenovat `valueOf`. Alpine drží
      // stav v reaktivním Proxy a `valueOf` je metoda z Object.prototype,
      // kterou proxy obsluhuje sama — volání pak vrátilo celý objekt místo
      // hodnoty buňky a řazení tiše dopadlo jako vzestupné bez ohledu na
      // směr. (Znalost z T-018.)
      cellValue(row, index) {
        return cellText(row.cells[index]);
      },

      // Řadí se celá množina řádků, ne jen viditelné — jinak by změna
      // filtru po řazení vrátila skryté řádky v původním pořadí.
      applySort() {
        const index = this.sortIndexes[this.sortKey];
        if (index === undefined) return;
        const dir = this.sortDir === "desc" ? -1 : 1;
        const self = this;
        const sorted = this.rows.slice().sort(function (x, y) {
          return compareValues(self.cellValue(x, index), self.cellValue(y, index), dir);
        });
        const frag = document.createDocumentFragment();
        sorted.forEach(function (row) {
          frag.appendChild(row);
        });
        this.body.appendChild(frag);
        this.markSortedHeader();
      },

      markSortedHeader() {
        if (!this.table.tHead) return;
        Array.prototype.forEach.call(this.table.tHead.rows[0].cells, (th) => {
          const key = th.dataset.sortKey;
          if (!key) return;
          const active = key === this.sortKey;
          th.setAttribute("aria-sort", active ? (this.sortDir === "asc" ? "ascending" : "descending") : "none");
          const caret = th.querySelector("button span");
          if (!caret) return;
          caret.textContent = active ? (this.sortDir === "asc" ? "▲" : "▼") : "↕";
          caret.className = active
            ? "font-mono text-[0.65rem] text-[#f3e5c0]"
            : "font-mono text-[0.65rem] text-white/25";
        });
      },

      sortBy(key) {
        if (this.sortIndexes[key] === undefined) return;
        if (this.sortKey === key) {
          this.sortDir = this.sortDir === "asc" ? "desc" : "asc";
        } else {
          this.sortKey = key;
          this.sortDir = this.isNumeric(key) ? "desc" : "asc";
        }
        if (this.directory) this.applyDirectorySort();
        else this.applySort();
        this.sync();
      },

      setFacet(value) {
        this.facet = this.facet === value ? "" : value;
        this.apply();
      },

      toggleColumn(index) {
        this.hiddenColumns[index] = !this.hiddenColumns[index];
        this.renderColumnVisibility();
      },

      renderColumnVisibility() {
        const hidden = this.hiddenColumns;
        const apply = function (cells) {
          Array.prototype.forEach.call(cells, function (cell, i) {
            cell.hidden = !!hidden[i];
          });
        };
        if (this.table.tHead) apply(this.table.tHead.rows[0].cells);
        this.rows.forEach(function (row) {
          apply(row.cells);
        });
      },

      reset() {
        this.search = "";
        this.facet = "";
        this.sortKey = "";
        this.sortDir = "asc";
        this.selectFacets.forEach((attr) => {
          this.facetValues[attr] = "";
        });
        this.markSortedHeader();
        this.apply();
      },

      get filtered() {
        if (this.search) return true;
        if (this.facet) return true;
        if (this.sortKey) return true;
        return this.selectFacets.some((attr) => this.facetValues[attr]);
      },

      apply() {
        if (this.directory) return this.applyDirectory();
        const q = normalize(this.search);
        const facet = this.facet;
        const selects = this.selectFacets;
        const values = this.facetValues;
        let shown = 0;
        this.rows.forEach(function (row) {
          const matchesQuery = !q || row.dataset.search.indexOf(q) !== -1;
          const matchesFacet = !facet || row.dataset.facet === facet;
          const matchesSelects = selects.every(function (attr) {
            return !values[attr] || row.dataset[attr] === values[attr];
          });
          const show = matchesQuery && matchesFacet && matchesSelects;
          row.hidden = !show;
          if (show) shown++;
        });
        this.visible = shown;
        if (this.sortKey) this.applySort();
        this.sync();
      },

      // Exportuje PRÁVĚ ZOBRAZENÝ výřez — filtr, řazení i skryté sloupce.
      // To je smysl toho tlačítka: co uživatel vidí, to si odnese. Kdyby
      // se exportovalo vždy všechno, byl by výsledek v rozporu s tím, co
      // je na obrazovce, a to je horší než žádný export.
      //
      // Plná data v strojové podobě jsou v /data/*.json; tohle je výřez,
      // ne náhrada datasetu.
      visibleMatrix() {
        const cols = this.columns
          .map((c) => c.index)
          .filter((i) => !this.hiddenColumns[i]);
        const headers = cols.map((i) => this.columns[i].label);
        const rows = this.rows
          .filter((row) => !row.hidden)
          .map((row) => cols.map((i) => (row.cells[i] ? row.cells[i].textContent.trim().replace(/\s+/g, " ") : "")));
        return { headers, rows };
      },

      download(blob, suffix) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${this.exportName || "tabulka"}-${suffix}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      },

      exportCsv() {
        const { headers, rows } = this.visibleMatrix();
        // BOM, aby Excel poznal UTF-8 a nerozsypal diakritiku.
        const blob = new Blob(["﻿" + toCsv(headers, rows)], {
          type: "text/csv;charset=utf-8",
        });
        this.download(blob, "vyrez.csv");
      },

      exportJson() {
        const { headers, rows } = this.visibleMatrix();
        const objects = rows.map(function (row) {
          const o = {};
          headers.forEach(function (h, i) {
            o[h] = row[i];
          });
          return o;
        });
        const blob = new Blob([JSON.stringify(objects, null, 1)], {
          type: "application/json;charset=utf-8",
        });
        this.download(blob, "vyrez.json");
      },

      // ---- adresář: jedna kolekce, tři projekce ----------------------

      initDirectory() {
        // Záznam existuje v každé projekci jednou; pojí je data-record-key.
        // Filtrování a řazení pak pracuje s POJMEM záznamu, ne s řádkem
        // tabulky, takže se seznam a dlaždice nemůžou lišit od tabulky.
        this.$root.querySelectorAll("[data-record-key]").forEach((node) => {
          const key = node.dataset.recordKey;
          if (!this.records.has(key)) this.records.set(key, []);
          this.records.get(key).push(node);
          node.dataset.search = normalize(node.textContent);
        });
        this.total = this.records.size;
        this.visible = this.records.size;
        // Výchozí pořadí je to, ve kterém dorazilo z buildu — abecední.
        // Bez jeho zapamatování by „zrušit řazení" nechalo seznam v pořadí
        // podle naposledy zvoleného sloupce, což vypadá jako že tlačítko
        // nefunguje.
        this.baseOrder = [...this.records.keys()];

        // Povolené projekce určuje šablona; komponenta si je nevymýšlí.
        const allowed = (this.$root.dataset.allowedViews || "").split(",").map((s) => s.trim()).filter(Boolean);
        if (allowed.length) this.allowedViews = allowed;
        this.view = this.resolveInitialView();
        this.applyView();

        this.handleHash();
        window.addEventListener("hashchange", () => this.handleHash());

        // Back/Forward musí obnovit pohled i filtr. Bez toho by tlačítko
        // zpět po přepnutí projekce odešlo ze stránky, což uživatel nečeká.
        window.addEventListener("popstate", () => {
          const s = readState(this.spec());
          if (this.allowedViews.includes(s.view)) {
            this.view = s.view;
            this.applyView();
          }
          this.search = s.q || "";
          this.apply();
        });
      },

      // Pořadí priorit: URL > uložená preference > šířka displeje.
      // URL vyhrává, aby sdílený odkaz ukázal to, co odesílatel viděl.
      resolveInitialView() {
        // Číst proti prázdné výchozí hodnotě, ne proti spec(): tam má `view`
        // jako výchozí data-default-view, takže by readState u chybějícího
        // parametru vrátil tuhle hodnotu a větev „z URL" by vždycky vyhrála.
        // Rozlišení „parametr chybí" vs. „parametr má výchozí hodnotu" je
        // přesně to, na čem tohle rozhodování stojí.
        const fromUrl = this.urlState ? readState({ view: "" }).view : "";
        if (this.allowedViews.includes(fromUrl)) return fromUrl;
        let stored = "";
        try {
          stored = window.localStorage.getItem("vomaste:directory-view") || "";
        } catch (e) {
          stored = "";
        }
        if (this.allowedViews.includes(stored)) return stored;
        const fallback = this.$root.dataset.defaultView || "table";
        // Na úzkém displeji je tabulka nepoužitelná; seznam je hustý
        // a čitelný. Rozhoduje se jednou při startu, ne při každé změně
        // šířky — přepnutí pohledu pod rukama je horší než nepohodlí.
        if (window.matchMedia("(max-width: 767px)").matches && this.allowedViews.includes("list")) {
          return "list";
        }
        return this.allowedViews.includes(fallback) ? fallback : "table";
      },

      // Odkaz na konkrétní záznam musí dovést k záznamu, i když míří do
      // právě skryté projekce. Kotvy jsou tvaru <sekce>-<projekce>-<slug>,
      // protože tentýž záznam je v DOM třikrát a duplicitní id by bylo
      // neplatné HTML. Bez tohohle by ale sdílený odkaz na dlaždici při
      // aktivní tabulce nikam nevedl — prohlížeč by cíl nenašel, protože
      // je uvnitř kontejneru s `hidden`.
      //
      // Postup: z hashe se přečte projekce, přepne se na ni a teprve pak
      // se scrolluje. Kdyby se scrollovalo dřív, cíl by ještě byl skrytý.
      handleHash() {
        const raw = (window.location.hash || "").replace(/^#/, "");
        if (!raw) return;
        const prefix = `${this.$root.id}-`;
        if (!raw.startsWith(prefix)) return;
        const rest = raw.slice(prefix.length);
        const view = this.allowedViews.find((v) => rest.startsWith(`${v}-`));
        if (!view) return;
        const key = rest.slice(view.length + 1);
        if (!this.records.has(key)) return;

        if (view !== this.view) {
          this.view = view;
          this.applyView();
          this.sync();
        }
        // Skrytý filtr by cíl nechal neviditelný; sdílený odkaz na záznam
        // má přednost před dřív nastaveným filtrem.
        const nodes = this.records.get(key);
        if (nodes.every((n) => n.hidden)) {
          this.search = "";
          this.apply();
        }
        this.$nextTick(() => {
          const target = document.getElementById(raw);
          if (!target) return;
          target.scrollIntoView({ block: "center", behavior: "auto" });
          // Fokus na první odkaz v záznamu: uživatel na klávesnici pokračuje
          // od cíle, ne od začátku stránky.
          target.querySelector("a")?.focus({ preventScroll: true });
        });
      },

      setView(next) {
        if (!this.allowedViews.includes(next) || next === this.view) return;
        this.view = next;
        this.applyView();
        try {
          window.localStorage.setItem("vomaste:directory-view", next);
        } catch (e) {
          /* soukromý režim: preference se neuloží, funkčnost to nemění */
        }
        this.sync({ push: true });
      },

      // `hidden` na kontejneru, ne jen CSS: skrytá projekce nesmí být
      // dosažitelná tabulátorem ani odečítačem, jinak by uživatel na
      // klávesnici procházel tři kopie téhož seznamu.
      applyView() {
        this.$root.querySelectorAll("[data-view]").forEach((el) => {
          el.hidden = el.dataset.view !== this.view;
        });
      },

      // Řazení adresáře: pořadí určí řádky tabulky (ty nesou data-sort-value),
      // ostatní projekce se pak přeskládají podle stejného klíče. Jedna
      // pravda o pořadí, tři vykreslení.
      applyDirectorySort() {
        const index = this.sortIndexes[this.sortKey];
        const dir = this.sortDir === "desc" ? -1 : 1;
        const keys = [...(this.baseOrder ?? this.records.keys())];
        if (!this.sortKey) {
          // Zpět na výchozí abecední pořadí z buildu.
          this.reorderProjections(keys);
          this.markSortedHeader();
          return;
        }
        if (index !== undefined) {
          const valueOfKey = (k) => {
            const row = this.records.get(k).find((n) => n.tagName === "TR");
            return row ? cellText(row.cells[index]) : "";
          };
          keys.sort((a, b) => compareValues(valueOfKey(a), valueOfKey(b), dir));
        } else {
          keys.sort((a, b) => a.localeCompare(b, "cs"));
        }
        this.reorderProjections(keys);
        // I v režimu projekcí musí hlavička ohlásit stav řazení. Bez toho
        // se seznam sice seřadí, ale odečítač obrazovky se o tom nedozví —
        // informace by byla dostupná jen vidoucím.
        this.markSortedHeader();
      },

      // Přeskládá každou projekci v jejím vlastním kontejneru podle
      // společného pořadí klíčů — jedna pravda o pořadí, tři vykreslení.
      reorderProjections(keys) {
        const containers = new Map();
        for (const key of keys) {
          for (const node of this.records.get(key) ?? []) {
            const parent = node.parentElement;
            if (!containers.has(parent)) containers.set(parent, document.createDocumentFragment());
            containers.get(parent).appendChild(node);
          }
        }
        for (const [parent, frag] of containers) parent.appendChild(frag);
      },

      // Panel se plní Z ŘÁDKU: popisky ze záhlaví, hodnoty z buněk téhož
      // řádku. Nevzniká tedy druhá kopie dat, která by se mohla rozejít
      // s tabulkou — je to tatáž data, jen jinak vypsaná.
      openInspector(id) {
        const row = this.rows.find((r) => r.dataset.inspectId === id);
        if (!row) return;
        this.inspected = id;
        this.inspectedFields = this.columns
          .filter((c) => !this.hiddenColumns[c.index])
          .map((c) => ({
            label: c.label,
            value: (row.cells[c.index]?.textContent ?? "").trim().replace(/\s+/g, " "),
          }))
          .filter((f) => f.value);
        const link = row.querySelector("a[href]");
        this.inspectedHref = link ? link.getAttribute("href") : "";
        this.rows.forEach((r) => {
          r.classList.toggle("is-inspected", r === row);
        });
        this.sync();
        this.$nextTick(() => this.$refs.inspectorClose?.focus());
      },

      closeInspector() {
        // Fokus se vrací na řádek, ze kterého se panel otevřel. Bez toho
        // by uživatel na klávesnici skončil na začátku stránky a musel se
        // k místu, kde byl, znovu proklikat.
        const row = this.rows.find((r) => r.dataset.inspectId === this.inspected);
        this.inspected = "";
        this.inspectedFields = [];
        this.inspectedHref = "";
        this.rows.forEach((r) => r.classList.remove("is-inspected"));
        this.sync();
        row?.querySelector("button, a")?.focus();
      },

      // Filtruje ZÁZNAMY: skryje nebo zobrazí všechny jeho uzly napříč
      // projekcemi najednou. Kdyby se filtrovalo po projekcích zvlášť,
      // vznikly by tři nezávislé stavy a přepnutí pohledu by ukázalo jiný
      // výsledek než ten, který uživatel právě viděl.
      applyDirectory() {
        const q = normalize(this.search);
        const facet = this.facet;
        const selects = this.selectFacets;
        const values = this.facetValues;
        let shown = 0;
        for (const [, nodes] of this.records) {
          // Fasety se musí uplatnit i tady. Dřív se v režimu projekcí
          // filtrovalo jen podle textu, takže se čipy vykreslily a nic
          // nedělaly — což je horší, než kdyby chyběly: ovládací prvek,
          // který nic neudělá, tvrdí uživateli nepravdu.
          const match =
            (!q || nodes.some((n) => (n.dataset.search || "").indexOf(q) !== -1)) &&
            (!facet || nodes.some((n) => n.dataset.facet === facet)) &&
            selects.every((attr) => !values[attr] || nodes.some((n) => n.dataset[attr] === values[attr]));
          nodes.forEach((n) => {
            n.hidden = !match;
          });
          if (match) shown++;
        }
        this.visible = shown;
        this.applyDirectorySort();
        this.sync();
      },

      sync(opts) {
        if (!this.urlState) return;
        const state = {
          q: this.search.trim(),
          sort: this.sortKey,
          dir: this.sortKey ? this.sortDir : "asc",
          f: this.facet,
        };
        if (this.$root.dataset.inspector) state.inspect = this.inspected;
        if (this.directory) state.view = this.view;
        this.selectFacets.forEach((attr) => {
          state[attr] = this.facetValues[attr];
        });
        syncUrl(state, this.spec(), opts);
      },
    };
  });
}
