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

export function clearInspector(container, emptyMessage) {
  container.replaceChildren(el("p", { class: "graph-inspector-empty", text: emptyMessage || "Nic není vybráno. Klikněte na uzel nebo hranu." }));
}
