// Alpine component backing the optional search input of the shared
// advanced_table macro (templates/macros/table.html, searchable=true).
// Same pattern as claims-filter.js: rows stay plain Tera-rendered markup,
// init() indexes each row's textContent into data-search, apply() hides
// rows that don't match. No new framework — one small component, safe
// no-op on pages without a searchable table.
export function registerTableFilter() {
  window.Alpine.data("advancedTable", function () {
    return {
      search: "",
      total: 0,
      visible: 0,
      rows: [],

      init() {
        var table = this.$root.querySelector("table");
        if (!table || !table.tBodies.length) return;
        this.rows = Array.prototype.slice.call(table.tBodies[0].rows);
        this.rows.forEach(function (row) {
          row.dataset.search = row.textContent.toLowerCase();
        });
        this.total = this.rows.length;
        this.visible = this.rows.length;
      },

      apply() {
        var q = this.search.trim().toLowerCase();
        var shown = 0;
        this.rows.forEach(function (row) {
          var show = !q || row.dataset.search.indexOf(q) !== -1;
          row.hidden = !show;
          if (show) shown++;
        });
        this.visible = shown;
      },
    };
  });
}
