// Sdílený URL stav pro filtrovatelné pohledy (coop T-019, § 8 mise).
//
// Filtr, který nejde nasdílet, je v investigativním nástroji polovičatý:
// kdo najde zajímavý výřez dat, musí být schopen poslat na něj odkaz a
// druhá strana musí vidět totéž. Proto stav filtru žije v query stringu.
//
// Modul vznikl deduplikací: entity-explorer.js si čtení i zápis parametrů
// psal inline a table-filter.js by to psal podruhé. Dvě kopie stejné
// logiky se rozejdou (jedna začne mazat prázdné hodnoty, druhá ne) a
// rozdíl se pozná až na sdíleném odkazu, který vede jinam, než měl.
//
// readState/stateToSearch jsou čisté funkce nad řetězcem — testovatelné
// bez DOM. syncUrl je jediné místo, které sahá na history.

// Přečte stav z query stringu. `spec` je objekt výchozích hodnot; klíče,
// které v něm nejsou, se ignorují (URL může nést cizí parametry, např.
// utm_*, a ty do stavu komponenty nepatří).
export function readState(spec, search) {
  const params = new URLSearchParams(
    typeof search === "string" ? search : window.location.search,
  );
  const out = {};
  for (const key of Object.keys(spec)) {
    const raw = params.get(key);
    out[key] = raw === null || raw === "" ? spec[key] : raw;
  }
  return out;
}

// Serializuje stav zpět do query stringu. Hodnoty shodné s výchozími se
// vynechávají, aby výchozí pohled měl čistou URL — jinak by každé kliknutí
// v UI zanechalo šum v adrese a odkazy by se nedaly porovnat.
export function stateToSearch(state, spec, existingSearch) {
  const params = new URLSearchParams(
    typeof existingSearch === "string" ? existingSearch : "",
  );
  for (const key of Object.keys(spec)) {
    const value = state[key];
    const isDefault = value === undefined || value === null ||
      String(value) === "" || String(value) === String(spec[key]);
    if (isDefault) params.delete(key);
    else params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// Zapíše stav do adresního řádku. Výchozí je replaceState; push si volající
// vyžádá pro akce, které uživatel vnímá jako navigaci. Zdůvodnění obou
// variant je u samotné podmínky níže.
export function syncUrl(state, spec, { push = false } = {}) {
  if (typeof window === "undefined" || !window.history) return;
  const url = new URL(window.location.href);
  const search = stateToSearch(state, spec, url.search);
  const next = url.pathname + search + url.hash;
  // push pro akce, které uživatel vnímá jako navigaci (přepnutí pohledu):
  // tlačítko zpět se pak vrátí k předchozímu pohledu, ne pryč ze stránky.
  // replace pro průběžné ladění filtru — jinak by každý úhoz zaplnil
  // historii a zpět by přestalo dělat to, co uživatel čeká.
  if (push && next !== url.pathname + url.search + url.hash) {
    window.history.pushState({}, "", next);
  } else {
    window.history.replaceState({}, "", next);
  }
}
