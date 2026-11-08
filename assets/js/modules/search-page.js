// Alpine komponenta stránky /hledat/ (templates/search.html).
//
// Tenká vrstva nad čistou logikou v search-core.js (searchPage,
// facetOptions, readPageState, writePageState — testované v Node,
// scripts/ui/search-page.test.mjs). Čte tentýž static/search-index.json
// jako příkazový řádek v navigaci, takže obě místa hledají v tomtéž.
//
// Stav (dotaz + filtry) žije v URL přes history.replaceState: výsledek
// jde poslat odkazem a tlačítko Zpět nevrací každé písmeno zvlášť.
// Nenačtený index se hlásí jako porucha, nikdy jako „nic nenalezeno" —
// stejné pravidlo jako v global-search.js.
import { searchPage, facetOptions, readPageState, writePageState } from "./search-core.js";

const PAGE_SIZE = 50;

export function registerSearchPage() {
  window.Alpine.data("searchPage", function (indexUrl) {
    return {
      indexUrl,
      index: [],
      loaded: false,
      loadError: false,
      state: { q: "", type: "", dossier: "", status: "" },
      options: { types: [], dossiers: [], statuses: [] },
      result: { items: [], total: 0, byType: {}, truncated: false, empty: true },
      limit: PAGE_SIZE,

      async init() {
        this.state = readPageState(window.location.search);
        await this.load();
        this.run(false);
      },

      async load() {
        try {
          const res = await fetch(this.indexUrl);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          this.index = await res.json();
          this.options = facetOptions(this.index);
          this.loaded = true;
          this.loadError = false;
        } catch (e) {
          this.index = [];
          this.loaded = false;
          this.loadError = true;
        }
      },

      run(resetLimit = true) {
        if (resetLimit) this.limit = PAGE_SIZE;
        // Filtr stavu dává smysl jen u tvrzení: zvolený stav přepne typ —
        // i když přišel z adresy, ne jen ze změny v selectu.
        if (this.state.status && this.state.type !== "claim") this.state.type = "claim";
        this.result = searchPage(this.index, this.state, { limit: this.limit });
        const qs = writePageState(this.state);
        if (qs !== window.location.search) {
          window.history.replaceState(null, "", window.location.pathname + qs + window.location.hash);
        }
      },

      more() {
        this.limit += PAGE_SIZE;
        this.run(false);
      },

      reset() {
        this.state = { q: "", type: "", dossier: "", status: "" };
        this.run();
      },

      dossierLabel(slug) {
        const hit = this.options.dossiers.find((d) => d.value === slug);
        return hit ? hit.label : slug || "";
      },

      countLabel(n) {
        // Česká plurálová pravidla: 1 záznam, 2–4 záznamy, 0/5+ záznamů.
        if (n === 1) return "1 záznam";
        if (n >= 2 && n <= 4) return `${n} záznamy`;
        return `${n} záznamů`;
      },
    };
  });
}
