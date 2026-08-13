/*
 * The one list of licences under which this site may republish someone else's
 * image — and the one function that decides.
 *
 * It lives alone in a module because the downloader and the build gate BOTH
 * need it, and two copies of a rule like this do not stay equal: the day one
 * grows a licence the other does not, either the gate rejects what was already
 * downloaded, or worse, something gets published that the gate would have
 * refused. One owner, both callers import it.
 *
 * Deliberately an allowlist. Anything not named here — "fair use", "non-free
 * logo", a bare "©", an empty string, or a licence nobody recognised — is
 * refused rather than guessed about. Adding an entry is a deliberate act with
 * a reason, not a convenience.
 */

export const FREE_LICENCES = Object.freeze([
  /^cc0\b/i,
  /^public domain/i,
  /^pd(-|\b)/i,
  /^cc by(-sa)?[ -]?[0-9.]*(\s|$)/i,
  /^attribution$/i,
  /^government open (data )?licen[cs]e/i,
  /^open government licen[cs]e/i,
]);

/** True when the licence label may be redistributed by this site. */
export function isFreeLicence(licence) {
  const value = String(licence ?? "").trim();
  if (!value) return false;
  return FREE_LICENCES.some((re) => re.test(value));
}
