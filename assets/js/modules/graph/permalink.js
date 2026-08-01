// URL state for one graph workbench (mission § 12), scoped to what this
// build actually implements: layer, selection, search query, the two
// filters, and focus depth. Camera position is intentionally NOT
// round-tripped through the URL — Sigma's camera state already persists
// per layer in the controller for the lifetime of the page (mission
// § 6.2), and encoding float camera coordinates in every URL would make
// every pan/zoom rewrite the address bar, which is not "a significant
// navigational step".
//
// Every write uses replaceState (no history entry per interaction — only
// real navigation should be back-button-able), and reading NEVER
// executes anything from the URL: values are compared against known
// node ids / a fixed layer allowlist, nothing is eval'd or templated.
export function readStateFromUrl(validLayers) {
  const params = new URLSearchParams(window.location.search);
  const layer = params.get("layer");
  return {
    layer: validLayers.includes(layer) ? layer : undefined,
    node: params.get("node") || undefined,
    query: params.get("q") || undefined,
    recordType: params.get("record_type") || undefined,
    dossier: params.get("dossier") || undefined,
    depth: params.get("depth") || undefined,
  };
}

export function writeStateToUrl(state, defaultLayer) {
  const params = new URLSearchParams();
  if (state.layer && state.layer !== defaultLayer) params.set("layer", state.layer);
  if (state.selected && state.selected.kind === "node") params.set("node", state.selected.id);
  if (state.query) params.set("q", state.query);
  if (state.filters.recordType) params.set("record_type", state.filters.recordType);
  if (state.filters.dossier) params.set("dossier", state.filters.dossier);
  if (state.focusDepth && state.focusDepth !== 0) params.set("depth", String(state.focusDepth));
  const qs = params.toString();
  const url = `${window.location.pathname}${qs ? "?" + qs : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", url);
}
