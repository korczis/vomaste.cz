// Pure search logic for the global command bar (coop task T-020,
// docs/missions/2026-07-30-workbench-master-prompt.md § 4.2). No DOM, no
// Alpine, no fetch — just functions over the records of
// static/search-index.json, so the ranking/grouping behavior is unit-
// testable in Node (scripts/ui/search-core.test.mjs) and the Alpine
// component (global-search.js) stays a thin view-model.

// Czech-friendly matching: "stastny" must find "Šťastný". NFD +
// stripping combining marks is enough for cs-CZ diacritics.
export function normalize(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Display order and Czech labels of result groups — mirrors the record
// types build-search-index.mjs emits. An unknown type sorts last and
// shows verbatim rather than being silently dropped.
export const GROUPS = [
  ["dossier", "Dossiery"],
  ["entity", "Entity"],
  ["claim", "Tvrzení"],
  ["source", "Zdroje"],
  ["case", "Kauzy"],
  ["gap", "Mezery"],
  ["relation", "Vztahy"],
];

const GROUP_RANK = new Map(GROUPS.map(([type], i) => [type, i]));
const GROUP_LABEL = new Map(GROUPS);

function fieldsOf(record) {
  return [
    ["id", record.id],
    ["title", record.title],
    ["summary", record.summary],
    ["extra", record.extra],
    ["dossier", record.dossier],
  ];
}

// Score one record against normalized query tokens. Every token must
// match SOMEWHERE (AND semantics); the score reflects the best field the
// full query hits, so "CLM-4" ranks id matches above summary mentions.
function scoreRecord(record, tokens, fullQuery) {
  const haystacks = fieldsOf(record).map(([name, value]) => [name, normalize(value)]);
  const all = haystacks.map(([, v]) => v).join(" ");
  for (const t of tokens) {
    if (all.indexOf(t) === -1) return null;
  }
  const id = normalize(record.id);
  if (id === fullQuery) return { score: 100, field: "id" };
  if (id.startsWith(fullQuery)) return { score: 80, field: "id" };
  if (id.indexOf(fullQuery) !== -1) return { score: 60, field: "id" };
  for (const [name, value] of haystacks) {
    if (name !== "id" && value.indexOf(fullQuery) !== -1) {
      return { score: name === "title" ? 40 : 20, field: name };
    }
  }
  return { score: 10, field: "title" }; // tokens matched across fields
}

// First-occurrence highlight segments for safe rendering (three x-text
// spans, never x-html): {before, match, after} on the ORIGINAL string,
// found via the normalized form so diacritics don't break the offsets
// (NFD strip never changes the character count of Czech text).
export function highlight(original, query) {
  const source = original || "";
  const idx = normalize(source).indexOf(normalize(query));
  if (idx === -1 || !query) return { before: source, match: "", after: "" };
  return {
    before: source.slice(0, idx),
    match: source.slice(idx, idx + query.length),
    after: source.slice(idx + query.length),
  };
}

// Main entry: index records + raw query → ordered groups plus the flat
// list the keyboard navigation walks. Caps keep the dropdown scannable;
// they are per-group so one noisy type can't crowd out the rest.
export function searchRecords(index, rawQuery, { perGroup = 5, total = 24 } = {}) {
  const query = normalize(rawQuery.trim());
  if (!query) return { groups: [], flat: [], total: 0 };
  const tokens = query.split(/\s+/).filter(Boolean);

  const matched = [];
  for (const record of index) {
    const hit = scoreRecord(record, tokens, query);
    if (hit) matched.push({ record, ...hit });
  }
  matched.sort((a, b) => {
    const ga = GROUP_RANK.get(a.record.type) ?? GROUPS.length;
    const gb = GROUP_RANK.get(b.record.type) ?? GROUPS.length;
    if (ga !== gb) return ga - gb;
    if (b.score !== a.score) return b.score - a.score;
    return (a.record.id || "").localeCompare(b.record.id || "");
  });

  const groups = [];
  const flat = [];
  for (const m of matched) {
    if (flat.length >= total) break;
    let group = groups[groups.length - 1];
    if (!group || group.type !== m.record.type) {
      group = { type: m.record.type, label: GROUP_LABEL.get(m.record.type) ?? m.record.type, items: [] };
      groups.push(group);
    }
    if (group.items.length >= perGroup) continue;
    const item = {
      ...m.record,
      flatIndex: flat.length,
      hl: highlight(m.field === "id" ? m.record.id : m.record.title || "", rawQuery.trim()),
      hlField: m.field === "id" ? "id" : "title",
    };
    group.items.push(item);
    flat.push(item);
  }
  return { groups: groups.filter((g) => g.items.length > 0), flat, total: matched.length };
}

// ---------------------------------------------------------------------------
// Stránka /hledat/ (plné hledání s filtry a stavem v URL).
//
// Na rozdíl od příkazového řádku nemá strop 24 výsledků a umí filtrovat
// podle typu záznamu, dossieru a stavu tvrzení — i BEZ dotazu, takže jde
// procházet třeba „všechna sporná tvrzení v dossieru X". Stav tvrzení se
// bere doslova z indexu (`extra` u záznamu typu claim = statusLabel
// kanonického záznamu); nic se tu nepřekládá ani nedopočítává.

// Klíče parametrů v URL. České, protože je člověk vidí a sdílí.
export const PAGE_PARAMS = { q: "q", type: "typ", dossier: "dossier", status: "stav" };

export function readPageState(search) {
  const p = new URLSearchParams(search || "");
  return {
    q: p.get(PAGE_PARAMS.q) || "",
    type: p.get(PAGE_PARAMS.type) || "",
    dossier: p.get(PAGE_PARAMS.dossier) || "",
    status: p.get(PAGE_PARAMS.status) || "",
  };
}

// Prázdné hodnoty se do adresy nepíšou: výchozí pohled má čistou URL.
export function writePageState(state) {
  const p = new URLSearchParams();
  for (const [key, param] of Object.entries(PAGE_PARAMS)) {
    const v = (state[key] || "").trim();
    if (v) p.set(param, v);
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

// Volby filtrů odvozené z indexu samotného — žádný seznam dossierů ani
// stavů v kódu. Dossier se popisuje názvem ze záznamu typu "dossier".
export function facetOptions(index) {
  const dossierTitle = new Map();
  for (const r of index) if (r.type === "dossier" && r.dossier) dossierTitle.set(r.dossier, r.title);
  const dossiers = new Set();
  const statuses = new Set();
  const types = new Set();
  for (const r of index) {
    types.add(r.type);
    if (r.dossier) dossiers.add(r.dossier);
    if (r.type === "claim" && r.extra) statuses.add(r.extra);
  }
  return {
    types: GROUPS.filter(([t]) => types.has(t)).map(([value, label]) => ({ value, label }))
      .concat([...types].filter((t) => !GROUP_RANK.has(t)).sort().map((t) => ({ value: t, label: t }))),
    dossiers: [...dossiers]
      .map((value) => ({ value, label: dossierTitle.get(value) || value }))
      .sort((a, b) => a.label.localeCompare(b.label, "cs")),
    statuses: [...statuses].sort((a, b) => a.localeCompare(b, "cs")).map((value) => ({ value, label: value })),
  };
}

function passesFilters(record, { type, dossier, status }) {
  if (type && record.type !== type) return false;
  if (dossier && record.dossier !== dossier) return false;
  // Filtr stavu dává smysl jen u tvrzení; jiný typ záznamu ho nesplní.
  if (status && !(record.type === "claim" && record.extra === status)) return false;
  return true;
}

// Dotaz + filtry → seřazený seznam (stránkovaný přes `limit`) a počty
// podle typu nad celým filtrovaným výsledkem. Prázdný dotaz BEZ filtrů
// nevrací nic: výpis všech ~4 000 záznamů by nebyl odpověď na otázku.
export function searchPage(index, state, { limit = 50 } = {}) {
  const query = normalize((state.q || "").trim());
  const filters = { type: state.type || "", dossier: state.dossier || "", status: state.status || "" };
  const hasFilter = Boolean(filters.type || filters.dossier || filters.status);
  if (!query && !hasFilter) return { items: [], total: 0, byType: {}, truncated: false, empty: true };
  const tokens = query ? query.split(/\s+/).filter(Boolean) : [];

  const matched = [];
  for (const record of index) {
    if (!passesFilters(record, filters)) continue;
    if (!query) {
      matched.push({ record, score: 0, field: "title" });
      continue;
    }
    const hit = scoreRecord(record, tokens, query);
    if (hit) matched.push({ record, ...hit });
  }
  matched.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const ga = GROUP_RANK.get(a.record.type) ?? GROUPS.length;
    const gb = GROUP_RANK.get(b.record.type) ?? GROUPS.length;
    if (ga !== gb) return ga - gb;
    if ((a.record.dossier || "") !== (b.record.dossier || "")) {
      return (a.record.dossier || "").localeCompare(b.record.dossier || "");
    }
    return (a.record.id || "").localeCompare(b.record.id || "", "cs", { numeric: true });
  });

  const byType = {};
  for (const m of matched) byType[m.record.type] = (byType[m.record.type] || 0) + 1;
  const items = matched.slice(0, limit).map((m) => ({
    ...m.record,
    typeLabel: GROUP_LABEL.get(m.record.type) ?? m.record.type,
    hl: highlight(m.field === "id" ? m.record.id : m.record.title || "", (state.q || "").trim()),
    hlField: m.field === "id" ? "id" : "title",
  }));
  return { items, total: matched.length, byType, truncated: matched.length > limit, empty: false };
}
