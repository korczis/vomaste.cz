// Alpine component backing the navbar's global search box (templates/base.html).
// Fetches static/search-index.json (built by scripts/dossier/build-search-index.mjs)
// once on init and filters client-side — no server, no network call per keystroke.
export function registerGlobalSearch() {
  window.Alpine.data("globalSearch", function (indexUrl) {
    return {
      indexUrl: indexUrl,
      index: [],
      query: "",
      results: [],
      open: false,
      activeIndex: -1,
      loaded: false,

      async ensureLoaded() {
        if (this.loaded) return;
        this.loaded = true;
        try {
          const res = await fetch(this.indexUrl);
          this.index = await res.json();
        } catch (e) {
          this.index = [];
        }
      },

      async search() {
        await this.ensureLoaded();
        const q = this.query.trim().toLowerCase();
        if (!q) {
          this.results = [];
          this.open = false;
          this.activeIndex = -1;
          return;
        }
        this.results = this.index
          .filter((r) => {
            const haystack = (r.id + " " + r.title + " " + r.summary + " " + (r.extra || "")).toLowerCase();
            return haystack.indexOf(q) !== -1;
          })
          .slice(0, 8);
        this.open = true;
        this.activeIndex = this.results.length > 0 ? 0 : -1;
      },

      move(delta) {
        if (!this.open || this.results.length === 0) return;
        this.activeIndex = (this.activeIndex + delta + this.results.length) % this.results.length;
      },

      go() {
        if (this.activeIndex >= 0 && this.results[this.activeIndex]) {
          window.location.href = this.results[this.activeIndex].route;
        }
      },

      close() {
        this.open = false;
      },
    };
  });
}
