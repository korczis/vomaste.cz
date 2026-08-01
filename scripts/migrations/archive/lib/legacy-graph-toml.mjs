// LEGACY parser data/dossiers/<slug>/graph.toml (T-028 fáze H).
//
// Do fáze H žil v scripts/dossier/lib/jsonld-shared.mjs jako jediný
// sdílený parser grafových TOML souborů. Od fáze H je graph.toml
// zrušen (kurátorovaná vrstva žije v dossier.json `graph` + relations)
// — tenhle modul zůstává JEN pro jednorázový migrátor
// scripts/migrations/migrate-graph-curation-to-canonical.mjs a jeho
// testy; žádný build krok ho nesmí importovat.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export function parseGraphTomlBlocks(text) {
  const blocks = { nodes: [], edges: [], clusters: [], source_families: [], updates: [] };
  const re = /^\[\[(nodes|edges|clusters|source_families|updates)\]\]\s*$/gm;
  const matches = [...text.matchAll(re)];
  for (let i = 0; i < matches.length; i++) {
    const kind = matches[i][1];
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const body = text.slice(start, end);
    const obj = {};
    for (const m of body.matchAll(/^(\w+)\s*=\s*(.+)$/gm)) {
      const key = m[1];
      const raw = m[2].trim();
      if (raw.startsWith("[")) {
        obj[key] = [...raw.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1].replace(/\\"/g, '"'));
      } else if (raw.startsWith('"')) {
        obj[key] = raw.slice(1, -1).replace(/\\"/g, '"');
      } else if (raw === "true" || raw === "false") {
        obj[key] = raw === "true";
      } else if (/^-?\d+$/.test(raw)) {
        obj[key] = parseInt(raw, 10);
      } else {
        obj[key] = raw;
      }
    }
    if (blocks[kind]) blocks[kind].push(obj);
  }
  return blocks;
}

export function readGraphTomlBlocks(root, slug) {
  const file = join(root, "data/dossiers", slug, "graph.toml");
  if (!existsSync(file)) return { nodes: [], edges: [], clusters: [], source_families: [], updates: [] };
  return parseGraphTomlBlocks(readFileSync(file, "utf8"));
}
