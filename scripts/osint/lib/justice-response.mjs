// Odpověď API Sbírky listin (verejnerejstriky.msp.gov.cz) → JSON, nebo
// srozumitelná chyba.
//
// PROČ: týdenní `archive:refresh-public` (.github/workflows/archive-refresh.yml)
// padal od 2026-09 každý týden na
//   SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
// Portál totiž místo JSON vracel HTML stránku webového firewallu
// („Service unavailable — The request is blocked.", HTTP 403) — z runneru
// GitHub Actions i z lokálního stroje. Z hlášky nebylo poznat, že nejde
// o chybu dat ani skriptu, ale o zablokovaný přístup.
//
// Tady se proto rozliší tři případy a nic se nehádá:
//  - tělo je JSON → vrátí se, i při HTTP 400 (portál tak hlásí IČO bez
//    subjektu ve Sbírce listin; to je platná negativní odpověď);
//  - tělo je HTML → chyba s HTTP kódem, IČO a titulkem stránky;
//  - cokoli jiného neparsovatelného → chyba s HTTP kódem a začátkem těla.
// Blokaci to neobchází a obcházet nemá: archiv se v tom případě
// neobnoví a běh správně selže.

const STATUS_MARKER = "\n__HTTP_STATUS__ ";

// Argumenty pro curl, které za tělo odpovědi připíšou HTTP kód a typ obsahu.
export const CURL_STATUS_ARGS = ["-w", `${STATUS_MARKER}%{http_code} %{content_type}`];

export function splitCurlOutput(output) {
  const i = output.lastIndexOf(STATUS_MARKER);
  if (i === -1) return { body: output, status: null, contentType: "" };
  const [status, ...ct] = output.slice(i + STATUS_MARKER.length).trim().split(" ");
  return { body: output.slice(0, i), status: Number(status) || null, contentType: ct.join(" ") };
}

export function parseJusticeResponse({ body, status = null, contentType = "" }, ico) {
  const text = body ?? "";
  try {
    return JSON.parse(text);
  } catch {
    const where = `IČO ${ico}: portál Sbírky listin odpověděl${status ? ` HTTP ${status}` : ""}${contentType ? ` (${contentType})` : ""} místo JSON`;
    if (/^\s*<(!doctype|html)/i.test(text)) {
      const title = (text.match(/<title>([^<]*)<\/title>/i) ?? [])[1]?.trim();
      const h2 = (text.match(/<h2>([^<]*)<\/h2>/i) ?? [])[1]?.trim();
      const page = [title, h2].filter(Boolean).join(" — ");
      throw new Error(`${where} HTML stránku${page ? ` „${page}"` : ""}. `
        + "Obvykle jde o blokaci webovým firewallem nebo výpadek portálu, ne o chybu dat; "
        + "archiv se neobnovil a pro toto IČO se nic nezapsalo.");
    }
    throw new Error(`${where} neparsovatelný obsah: ${JSON.stringify(text.slice(0, 120))}`);
  }
}
