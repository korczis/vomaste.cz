// Plain, per-instance UI state for one graph workbench (mission § 6.1).
// Deliberately not a framework store — a graph container only ever has
// one active controller, so a small object with a change callback is
// enough, and it keeps this dependency-free.
export function createGraphState(onChange) {
  const state = {
    layer: "curated",
    selected: null, // { kind: "node"|"edge", id } | null
    focusDepth: 0, // 0 = off, 1/2 = neighborhood steps, "component" = whole component
    filters: { recordType: null, dossier: null },
    query: "",
  };
  const emit = () => {
    if (typeof onChange === "function") onChange(state);
  };
  return {
    get: () => state,
    setLayer(layer) {
      state.layer = layer;
      emit();
    },
    setSelected(selected) {
      state.selected = selected;
      emit();
    },
    setFocusDepth(depth) {
      state.focusDepth = depth;
      emit();
    },
    setFilter(key, value) {
      state.filters[key] = value;
      emit();
    },
    setQuery(query) {
      state.query = query;
      emit();
    },
    reset() {
      state.selected = null;
      state.focusDepth = 0;
      state.filters = { recordType: null, dossier: null };
      state.query = "";
      emit();
    },
  };
}
