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
