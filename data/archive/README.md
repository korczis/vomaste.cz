# Registry preservation archive

Structured public-registry snapshots, preserved because a primary
source can disappear from the internet and this project otherwise
cites it only by URL. See
`docs/constitution/OPEN_INTELLIGENCE_COMMONS.md` §4, "Doplnění,
2026-08-08" for the rule this directory implements: **source
publicness and content safety are two different axes.**

- `ares-snapshots/<ico>.json` — structured ARES VR data (registered
  officers, shareholders, share sizes, registered seat). Personal data
  of natural persons (date of birth, home address — both of which ARES
  actually returns in full, not just a birth year) is intentionally
  excluded in code, the same way `scripts/osint/expand-entity.mjs`
  already excludes it for context entities. Safe for the public
  repository without per-record review.
- `sbirka-listin-index/<ico>.json` — which Sbírka listin documents
  exist for a company and when we last confirmed it (reference code,
  human-readable type, a checksum). Metadata only, no document content.

**What is deliberately NOT here**: the scanned PDF documents
themselves. They routinely name third parties (co-founders, notaries,
witnesses) and carry personal identifiers that a document's source
being a state institution does not excuse from this project's own
data-minimization and third-party-proportionality rules — verified in
practice 2026-08-06/07 on martin-pavlik, where a HYDROPROGRESS notarial
deed pulled from or.justice.cz named an unrelated new shareholder. Raw
PDFs are downloaded to a **local, non-Git** archive
(`~/dev/vomaste-archive/sbirka-listin/<ico>/`, path configurable via
`VOMASTE_ARCHIVE_ROOT`) for the site owner's own reference, each with a
`manifest.json` (retrieval date, source URL, sha256). Publishing any
one of them requires a human to open it, redact third-party personal
data, and add the result as a reviewed derivative — a separate,
still-manual step this tooling does not perform.

Regenerate with:

```
node scripts/osint/archive-registry-snapshots.mjs --ico=<ico>[,<ico>...]
```

Live network calls, never part of `npm run build`.
