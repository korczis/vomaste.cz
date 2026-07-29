// Alpine component for the sources registry filter
// (templates/dossier-sources-index.html). Cards stay plain Tera-rendered
// markup with data-* attributes; this only owns the reactive filter state
// that each card's `:hidden="!matches($el)"` binding reads.
export function registerSourcesFilter() {
  window.Alpine.data("sourcesFilter", function () {
    return {
      search: "",
      type: "",
      family: "",
      types: [],
      families: [],
      cards: [],

      init() {
        this.cards = Array.prototype.slice.call(this.$root.querySelectorAll(".src-card"));
        var types = [];
        var families = [];
        this.cards.forEach(function (c) {
          var t = c.dataset.type;
          if (t && types.indexOf(t) === -1) types.push(t);
          var f = c.dataset.family;
          if (f && families.indexOf(f) === -1) families.push(f);
        });
        this.types = types.sort();
        this.families = families.sort();
      },

      matches(card) {
        var q = this.search.trim().toLowerCase();
        var matchesQ = !q || card.dataset.search.toLowerCase().indexOf(q) !== -1;
        var matchesType = !this.type || card.dataset.type === this.type;
        var matchesFamily = !this.family || card.dataset.family === this.family;
        return matchesQ && matchesType && matchesFamily;
      },

      get visibleCount() {
        var self = this;
        return this.cards.filter(function (c) { return self.matches(c); }).length;
      },

      reset() {
        this.search = "";
        this.type = "";
        this.family = "";
      },
    };
  });
}
