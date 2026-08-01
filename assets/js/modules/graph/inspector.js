// Renders the detail inspector panel (mission § 11) from a Graphology
// node/edge's own attributes — never a second, hand-maintained
// description. Plain DOM, not innerHTML with interpolated strings, so a
// label containing "<" can't be read as markup.
const RECORD_LABEL = { entity: "Entita", claim: "Tvrzení", source: "Zdroj", case: "Kauza", gap: "Mezera" };

function el(tag, props, children) {
  const node = document.createElement(tag);
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (key === "text") node.textContent = value;
      else if (key === "class") node.className = value;
      else node.setAttribute(key, value);
    }
  }
  for (const child of children || []) if (child) node.appendChild(child);
  return node;
}

function row(label, value) {
  if (value == null || value === "") return null;
  return el("div", { class: "graph-inspector-row" }, [el("dt", { text: label }), el("dd", { text: String(value) })]);
}

function openRecordLink(route) {
  if (!route) return null;
  return el("a", { href: route, class: "graph-inspector-open" }, [document.createTextNode("Otevřít celý záznam →")]);
}

export function renderNodeInspector(container, attrs) {
  container.replaceChildren();
  const kind = attrs.recordType;
  const heading = el("h3", { class: "graph-inspector-heading", text: attrs.label });
  const badge = el("p", { class: "graph-inspector-kind", text: RECORD_LABEL[kind] || kind });
  const dl = el("dl", { class: "graph-inspector-fields" });

  if (kind === "entity") {
    dl.append(
      ...[
        row("Typ entity", attrs.entityType),
        row("Dossier(y)", (attrs.dossiers || []).join(", ")),
        row("Deklarovaná tvrzení", attrs.claimCount),
        row("Deklarované zdroje", attrs.sourceCount),
      ].filter(Boolean),
    );
  } else if (kind === "claim") {
    dl.append(...[row("ID", attrs.canonicalId), row("Stav", attrs.status), row("Dossier", attrs.dossier), row("Shrnutí", attrs.summary), row("Citované zdroje", attrs.sourceCount)].filter(Boolean));
  } else if (kind === "source") {
    dl.append(...[row("ID", attrs.canonicalId), row("Vydavatel", attrs.outlet), row("Dossier", attrs.dossier)].filter(Boolean));
  } else if (kind === "case") {
    dl.append(...[row("ID", attrs.canonicalId), row("Stav", attrs.status), row("Dossier", attrs.dossier)].filter(Boolean));
  } else if (kind === "gap") {
    const note = el("p", { class: "graph-inspector-note", text: "Otevřená otázka není nález žádným směrem." });
    dl.append(...[row("ID", attrs.canonicalId), row("Priorita", attrs.priority), row("Dossier", attrs.dossier)].filter(Boolean));
    container.append(heading, badge, dl, note);
    const link = openRecordLink(attrs.route);
    if (link) container.append(link);
    return;
  }

  container.append(heading, badge, dl);
  const link = openRecordLink(attrs.route);
  if (link) container.append(link);
}

export function renderEdgeInspector(container, attrs) {
  container.replaceChildren();
  const heading = el("h3", { class: "graph-inspector-heading", text: attrs.label || attrs.relation || "Vztah" });
  const badge = el("p", { class: "graph-inspector-kind", text: attrs.status ? `Vztah — ${attrs.status}` : "Vztah" });
  const dl = el("dl", { class: "graph-inspector-fields" });
  dl.append(
    ...[
      row("Typ vazby", attrs.relation),
      row("Stav", attrs.status),
      row("Dossier", attrs.dossier),
      row("Doložená tvrzení", (attrs.claims || []).join(", ")),
      row("Doložené zdroje", (attrs.sources || []).join(", ")),
    ].filter(Boolean),
  );
  container.append(heading, badge, dl);
  const link = openRecordLink(attrs.route);
  if (link) container.append(link);
}

// Seznam sousedů = vlastní procházení grafu.
//
// Bez něj se k sousednímu záznamu dostaneš jen tak, že se na plátně s
// 1631 uzly trefíš do správné tečky. To není procházení, to je zručnost
// s myší — a na dotykovém displeji to nejde vůbec.
//
// Sousedé se řadí podle stupně sestupně: uzel s mnoha vazbami je
// zpravidla ten, kudy vede cesta dál. Seznam se zkracuje, protože
// rozbalený seznam dvou set sousedů je stejně nepoužitelný jako žádný —
// zbytek je dostupný přes filtr.
const MAX_SOUSEDU = 12;

export function renderNeighbors(container, graph, nodeId, onPick) {
  const existing = container.querySelector("[data-graph-neighbors]");
  if (existing) existing.remove();
  if (!graph || !graph.hasNode(nodeId)) return;

  const neighbors = graph
    .neighbors(nodeId)
    .map((id) => ({ id, attrs: graph.getNodeAttributes(id), degree: graph.degree(id) }))
    .sort((a, b) => b.degree - a.degree || String(a.attrs.label).localeCompare(String(b.attrs.label), "cs"));

  const box = el("nav", { "data-graph-neighbors": "", class: "graph-inspector-neighbors", "aria-label": "Propojené záznamy" });
  box.append(
    el("h4", {
      class: "graph-inspector-subheading",
      text: neighbors.length === 0 ? "Bez deklarovaných vazeb" : `Propojené záznamy (${neighbors.length})`,
    }),
  );

  if (neighbors.length === 0) {
    // Uzel bez vazeb je legitimní stav, ne chyba — ale musí se říct,
    // jinak vypadá prázdný seznam jako nenačtený seznam.
    box.append(el("p", { class: "graph-inspector-note", text: "Tento záznam nemá v grafu žádnou deklarovanou vazbu." }));
    container.append(box);
    return;
  }

  const list = el("ul", { class: "graph-inspector-neighbor-list" });
  for (const n of neighbors.slice(0, MAX_SOUSEDU)) {
    const btn = el("button", {
      type: "button",
      class: "graph-inspector-neighbor",
      "data-neighbor-id": n.id,
    }, [
      el("span", { class: "graph-inspector-neighbor-label", text: n.attrs.label || n.id }),
      el("span", {
        class: "graph-inspector-neighbor-meta",
        text: `${RECORD_LABEL[n.attrs.recordType] || n.attrs.recordType} · ${n.degree}`,
      }),
    ]);
    btn.addEventListener("click", () => onPick(n.id));
    list.append(el("li", null, [btn]));
  }
  box.append(list);
  if (neighbors.length > MAX_SOUSEDU) {
    box.append(el("p", {
      class: "graph-inspector-note",
      text: `Zobrazeno ${MAX_SOUSEDU} z ${neighbors.length}; zbytek zúžíte filtrem.`,
    }));
  }
  container.append(box);
}

export function clearInspector(container, emptyMessage) {
  container.replaceChildren(el("p", { class: "graph-inspector-empty", text: emptyMessage || "Nic není vybráno. Klikněte na uzel nebo hranu." }));
}
