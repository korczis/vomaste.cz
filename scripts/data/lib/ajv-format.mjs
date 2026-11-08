// Jediný formátovač chyb AJV pro kanonická data (validate-shape.mjs
// i lib/dataset.mjs — dřív měl každý vlastní kopii a ta v dataset.mjs
// neuměla ani jméno cizího pole).
//
// PROČ: holá hláška AJV „/status must be equal to one of the allowed
// values" přispěvateli neřekne, co má napsat — povolené hodnoty jsou
// zahrabané ve schématu. Formátovač proto ke klíčovým chybám doplní to,
// co z chyby samotné a ze záznamu plyne:
//   enum                  → povolené hodnoty (a co bylo zadáno)
//   const                 → očekávaná hodnota
//   additionalProperties  → jméno cizího pole
//   pattern / format      → zadaná hodnota
//   type                  → zadaný typ
// Začátek hlášky („<soubor>: <cesta> <zpráva AJV>") zůstává beze změny,
// takže se na něj dál dá spolehnout v testech i v grepu.

const MAX_ALLOWED = 12;

// RFC 6901 JSON pointer → hodnota v záznamu (undefined, když neexistuje).
export function valueAt(data, pointer) {
  if (!pointer) return data;
  let cur = data;
  for (const raw of pointer.split("/").slice(1)) {
    const key = raw.replace(/~1/g, "/").replace(/~0/g, "~");
    if (cur == null || typeof cur !== "object" || !(key in cur)) return undefined;
    cur = cur[key];
  }
  return cur;
}

const show = (v) => {
  const s = JSON.stringify(v);
  return s && s.length > 80 ? `${s.slice(0, 77)}…` : s;
};

function hint(e, data) {
  const given = data === undefined ? undefined : valueAt(data, e.instancePath);
  const was = given === undefined ? "" : ` (zadáno: ${show(given)})`;
  switch (e.keyword) {
    case "enum": {
      const allowed = e.params?.allowedValues ?? [];
      const list = allowed.slice(0, MAX_ALLOWED).map(show).join(", ");
      const more = allowed.length > MAX_ALLOWED ? `, … (+${allowed.length - MAX_ALLOWED})` : "";
      return ` — povolené hodnoty: ${list}${more}${was}`;
    }
    case "const":
      return ` — očekávaná hodnota: ${show(e.params?.allowedValue)}${was}`;
    case "additionalProperties":
      return ` (cizí pole "${e.params.additionalProperty}")`;
    case "pattern":
    case "format":
      return was;
    case "type":
      return given === undefined ? "" : ` (zadáno: ${given === null ? "null" : Array.isArray(given) ? "pole" : typeof given})`;
    default:
      return "";
  }
}

export function formatAjvErrors(relPath, ajvErrors, data) {
  return (ajvErrors ?? []).map((e) => `${relPath}: ${e.instancePath || "(root)"} ${e.message}${hint(e, data)}`);
}
