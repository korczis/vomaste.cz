// Alpine component backing the navbar's global command bar
// (templates/base.html). Fetches static/search-index.json (built by
// scripts/dossier/build-search-index.mjs) once on first use and filters
// client-side — no server, no network call per keystroke. The actual
// matching/ranking/grouping lives in search-core.js (pure, unit-tested);
// this file is only the view-model plus the global keyboard shortcuts.
import { searchRecords } from "./search-core.js";

export function registerGlobalSearch() {
  window.Alpine.data("globalSearch", function (indexUrl) {
    return {
      indexUrl: indexUrl,
      index: [],
      query: "",
      groups: [],
      flat: [],
      totalMatches: 0,
      open: false,
      activeIndex: -1,
      loaded: false,
      loadError: false,

      async ensureLoaded() {
        if (this.loaded) return;
        try {
          const res = await fetch(this.indexUrl);
          // Statický hosting vrací na chybějící soubor HTML stránku 404,
          // ne chybu sítě — bez kontroly res.ok by se pak parsovalo HTML
          // jako JSON a spadlo by to až na výjimce, tedy nejasně.
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          this.index = await res.json();
          this.loaded = true;
          this.loadError = false;
        } catch (e) {
          // Nenačtený index NENÍ prázdný výsledek. Dřív se tu jen tiše
          // nastavilo index = [], takže rozbité hledání hlásilo „Žádný
          // výsledek." — uživatel z toho vyčetl, že záznam neexistuje,
          // místo že hledání nefunguje. To je horší než viditelná chyba.
          this.index = [];
          this.loadError = true;
          // `loaded` se schválně NEnastavuje: dřív se nastavovalo PŘED
          // fetchem, takže jediné selhání (výpadek při načítání stránky)
          // vyřadilo hledání na celou session a další pokus se už ani
          // nezkusil. Teď se při dalším psaní načtení zopakuje.
        }
      },

      async search() {
        await this.ensureLoaded();
        const { groups, flat, total } = searchRecords(this.index, this.query);
        this.groups = groups;
        this.flat = flat;
        this.totalMatches = total;
        this.open = this.query.trim().length > 0;
        this.activeIndex = flat.length > 0 ? 0 : -1;
      },

      move(delta) {
        if (!this.open || this.flat.length === 0) return;
        this.activeIndex = (this.activeIndex + delta + this.flat.length) % this.flat.length;
        const el = document.getElementById("global-search-option-" + this.activeIndex);
        if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
      },

      go() {
        if (this.activeIndex >= 0 && this.flat[this.activeIndex]) {
          window.location.href = this.flat[this.activeIndex].route;
        }
      },

      close() {
        this.open = false;
      },

      // aria-activedescendant target for the combobox input.
      get activeOptionId() {
        return this.activeIndex >= 0 ? "global-search-option-" + this.activeIndex : null;
      },

      // Announced result summary (aria-live) — counts, not colors.
      get resultAnnouncement() {
        if (!this.open) return "";
        if (this.loadError) return "Rejstřík se nepodařilo načíst, hledání je nedostupné.";
        if (this.flat.length === 0) return "Žádný výsledek.";
        const shown = this.flat.length;
        return shown === this.totalMatches
          ? `${shown} výsledků.`
          : `Zobrazeno ${shown} z ${this.totalMatches} výsledků.`;
      },
    };
  });
}

// Global command-bar shortcuts (mission § 4.2): "/" or Cmd/Ctrl+K focus
// the search input from anywhere. "/" is suppressed while typing in any
// editable element — it must not hijack real text entry. Progressive
// enhancement only: without JS the input is still a normal input.
export function initSearchShortcuts() {
  const input = document.getElementById("global-search-input");
  if (!input) return;
  document.addEventListener("keydown", function (e) {
    const target = e.target;
    const editable =
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      input.focus();
      input.select();
    } else if (e.key === "/" && !editable && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });
}
