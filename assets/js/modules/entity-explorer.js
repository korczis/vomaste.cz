// Alpine component za registrem entit (templates/entities-index.html).
//
// Stejný princip jako claims-filter.js a table-filter.js: řádky jsou plná
// Tera markup vygenerovaná ze stejných dat, ze kterých vzniká JSON-LD
// (front matter stránek entit → /data/entities.json → @graph). Tahle
// komponenta žádná data nevymýšlí ani nenačítá — jen čte fasety, které
// každý řádek nese v `data-*` atributech, a přeskupuje existující DOM
// uzly do skupin. Důsledky, na kterých záleží:
//
//   - bez JavaScriptu zůstane viditelný plochý seznam všech entit, takže
//     stránka je použitelná i tak (žádný prázdný <div> čekající na fetch);
//   - řádek nese `data-jsonld-id`, takže co uživatel vidí ve skupině, je
//     dohledatelné jako uzel v exportu — UI a strojová data nemůžou tvrdit
//     každé něco jiného;
//   - seskupení, hledání a filtr role se propisují do URL (?q=&group=&role=),
//     takže konkrétní pohled jde poslat odkazem.
//
// Skupiny se staví z hodnot v datech, ne z výčtu napsaného tady — nová
// hodnota `entity_type` nebo nový dossier se objeví sám, bez zásahu do
// téhle komponenty.

const GROUPINGS = {
  type: { label: "Typ entity", key: (el) => splitList(el.dataset.entityType) },
  dossier: { label: "Dossier", key: (el) => splitList(el.dataset.dossiers) },
  role: { label: "Role v publikaci", key: (el) => splitList(el.dataset.role) },
  letter: { label: "Abecedně", key: (el) => [(el.dataset.name || "?").charAt(0).toUpperCase()] },
};

function splitList(value) {
  if (!value) return ["—"];
  return value
    .split("|")
    .map((v) => v.trim())
    .filter(Boolean);
}

// Popisky skupin nese sama stránka (data-label-* na kořeni komponenty),
// protože jen šablona zná lidský název dossieru nebo typu entity. Když
// popisek chybí, zobrazí se syrová hodnota — nikdy se nevymýšlí.
function labelFor(root, groupBy, value) {
  const map = root.dataset[groupBy + "Labels"];
  if (!map) return value;
  try {
    return JSON.parse(map)[value] || value;
  } catch (err) {
    return value;
  }
}

export function registerEntityExplorer() {
  window.Alpine.data("entityExplorer", function () {
    return {
      search: "",
      groupBy: "type",
      role: "",
      total: 0,
      visible: 0,
      groupCount: 0,
      groupings: Object.keys(GROUPINGS).map((k) => ({ id: k, label: GROUPINGS[k].label })),
      items: [],
      openGroups: {},

      init() {
        const pool = this.$refs.pool;
        if (!pool) return;
        this.items = Array.prototype.slice.call(pool.querySelectorAll("[data-entity-id]"));
        this.items.forEach(function (el) {
          el.dataset.search = el.textContent.toLowerCase();
        });
        this.total = this.items.length;

        const params = new URLSearchParams(window.location.search);
        if (params.get("q")) this.search = params.get("q");
        if (GROUPINGS[params.get("group")]) this.groupBy = params.get("group");
        if (params.get("role")) this.role = params.get("role");

        this.apply();
      },

      setGroup(id) {
        if (!GROUPINGS[id]) return;
        this.groupBy = id;
        this.apply();
      },

      toggleRole(value) {
        this.role = this.role === value ? "" : value;
        this.apply();
      },

      setAllOpen(open) {
        const details = this.$refs.groups.querySelectorAll("details");
        Array.prototype.forEach.call(details, function (d) {
          d.open = open;
        });
      },

      reset() {
        this.search = "";
        this.role = "";
        this.apply();
      },

      apply() {
        const q = this.search.trim().toLowerCase();
        const role = this.role;
        const grouping = GROUPINGS[this.groupBy];
        const root = this.$root;
        const buckets = new Map();
        let shown = 0;

        this.items.forEach(function (el) {
          const matches =
            (!q || el.dataset.search.indexOf(q) !== -1) &&
            (!role || splitList(el.dataset.role).indexOf(role) !== -1);
          if (!matches) return;
          shown++;
          grouping.key(el).forEach(function (value) {
            if (!buckets.has(value)) buckets.set(value, []);
            buckets.get(value).push(el);
          });
        });

        this.visible = shown;
        this.groupCount = buckets.size;

        // Skupiny řadíme podle počtu sestupně a při shodě abecedně, aby
        // pořadí nezáviselo na pořadí souborů na disku. U abecedního
        // seskupení dává smysl jen abeceda.
        const alphabetical = this.groupBy === "letter";
        const keys = Array.from(buckets.keys()).sort(function (a, b) {
          if (!alphabetical && buckets.get(b).length !== buckets.get(a).length) {
            return buckets.get(b).length - buckets.get(a).length;
          }
          return a.localeCompare(b, "cs");
        });

        const groups = this.$refs.groups;
        const wasOpen = {};
        Array.prototype.forEach.call(groups.querySelectorAll("details"), function (d) {
          wasOpen[d.dataset.groupKey] = d.open;
        });
        groups.textContent = "";

        keys.forEach((key, index) => {
          const details = document.createElement("details");
          details.dataset.groupKey = key;
          details.className =
            "overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition-colors hover:border-white/20";
          // Poprvé otevřeme první skupinu, jinak držíme předchozí stav —
          // překliknutí faseti nemá uživateli zavřít, co si rozbalil.
          details.open = key in wasOpen ? wasOpen[key] : index === 0;

          const summary = document.createElement("summary");
          summary.className =
            "flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-white focus-visible:outline-none";
          const name = document.createElement("span");
          name.textContent = labelFor(root, this.groupBy, key);
          const count = document.createElement("span");
          count.className =
            "rounded-full bg-white/10 px-2 py-0.5 text-xs font-normal tabular-nums text-white/60";
          count.textContent = String(buckets.get(key).length);
          summary.appendChild(name);
          summary.appendChild(count);

          const list = document.createElement("ul");
          list.className = "grid gap-2 border-t border-white/10 p-3 sm:grid-cols-2 xl:grid-cols-3";
          buckets.get(key).forEach(function (el) {
            // Uzel může patřit do víc skupin (entita ve dvou dossierech),
            // proto se klonuje. Klon nese tytéž data-* atributy včetně
            // data-jsonld-id, takže dohledatelnost zůstává.
            list.appendChild(el.cloneNode(true));
          });

          details.appendChild(summary);
          details.appendChild(list);
          groups.appendChild(details);
        });

        const url = new URL(window.location.href);
        const setParam = (k, v) => (v ? url.searchParams.set(k, v) : url.searchParams.delete(k));
        setParam("q", this.search.trim());
        setParam("group", this.groupBy === "type" ? "" : this.groupBy);
        setParam("role", this.role);
        window.history.replaceState({}, "", url.pathname + (url.search || "") + url.hash);
      },
    };
  });
}
