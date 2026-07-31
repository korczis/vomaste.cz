/*
 * Pure helpers for expand-entity.mjs: slug derivation and the "does a page
 * for this subject already exist under a different slug" check.
 *
 * Extracted so they can be tested without a network call. Both bugs this
 * module now guards against were found by running the real script and
 * knowing the right answer in advance — which is not a test strategy:
 *
 *   1. the identifying fields (ico, name, slugSource) never reached the
 *      check, so it silently never fired;
 *   2. surname matching was substring-based, so "mraz" matched "mrazova"
 *      and suppressed the creation of a different person.
 *
 * A false match here does not merely warn — it skips creation — so the
 * checks are deliberately conservative about what counts as "the same".
 */

export function slugify(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

/* Legal-form suffixes carry no identity: "AGROFERT, a.s." and an existing
   page titled "Agrofert" are the same company. */
const LEGAL_FORM =
  /\b(a\.?\s?s\.?|s\.?\s?r\.?\s?o\.?|spol\.?\s+s\s+r\.?\s?o\.?|z\.?\s?s\.?|z\.?\s?u\.?|o\.?\s?p\.?\s?s\.?|k\.?\s?s\.?|v\.?\s?o\.?\s?s\.?|se|družstvo)\b/gi;

export function baseName(name) {
  return slugify(String(name).replace(LEGAL_FORM, " ").replace(/,/g, " "));
}

const titleOf = (text) => text.match(/^title = "(.*)"$/m)?.[1] ?? "";
const tokens = (s) => slugify(s).split("-").filter(Boolean);

/**
 * @param candidate {{id: string, ico?: string, name?: string, slugSource?: string}}
 * @param entityTexts Map<entityId, rawFileContents>
 * @returns {{id: string, why: string} | null}
 */
export function findPossibleDuplicate(candidate, entityTexts) {
  if (candidate.ico) {
    for (const [id, text] of entityTexts) {
      if (id !== candidate.id && text.includes(candidate.ico)) {
        return { id, why: `zmiňuje IČO ${candidate.ico}` };
      }
    }
    const base = baseName(candidate.name ?? "");
    if (base.length >= 4) {
      for (const [id, text] of entityTexts) {
        if (id === candidate.id) continue;
        if (id === base || baseName(titleOf(text)) === base) {
          return { id, why: `stejný název bez právní formy (${base})` };
        }
      }
    }
    return null;
  }

  const surname = (candidate.slugSource ?? candidate.name ?? "").split(/\s+/).pop();
  if (!surname || surname.length < 4) return null;
  const needle = slugify(surname);
  /* Whole-token comparison, not substring: "mraz" is a substring of
     "mrazova", but Josef Mráz and Zuzana Mrázová are two people. Czech
     feminine surnames therefore stay distinct — which is correct, they are
     separate entries in the register. */
  for (const [id, text] of entityTexts) {
    if (id === candidate.id) continue;
    if (tokens(id).includes(needle) || tokens(titleOf(text)).includes(needle)) {
      return { id, why: `shodné příjmení (${surname})` };
    }
  }
  return null;
}
