#!/usr/bin/env node
/*
 * View-model builder (T-028 fáze E): z compiled modelu (compileDataset)
 * generuje deterministické view modely do data/generated/views/ —
 * jediného datového vstupu pro budoucí šablony fáze F.
 *
 * Zásady:
 *   - ŽÁDNÉ nové faktické tvrzení — jen projekce kanonických záznamů
 *     + resolved routy/tituly/labely/počty z compiled modelu;
 *   - deterministická serializace: stabilní pořadí klíčů (konstrukční
 *     pořadí v kódu + explicitní sorty), LF, trailing newline, žádné
 *     buildové timestampy — druhý běh nad stejným vstupem nesmí změnit
 *     jediný bajt;
 *   - výstupní adresář se před zápisem čistí (stale soubory z minulých
 *     běhů nesmí přežít).
 *
 * Výstupy (relativně k data/generated/views/):
 *   dossiers/<slug>/overview.json
 *   dossiers/<slug>/<registry>-index.json      (claims|sources|cases|gaps|relations)
 *   dossiers/<slug>/<registry>/<lower-id>.json (detail záznamu)
 *   entities-index.json, entities/<entity-id>.json
 *   dossiers-index.json, landing.json, map.json
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCanonicalDataset, compileDataset } from "./lib/dataset.mjs";
import { readGovernmentRoster } from "./lib/government.mjs";
import { dossierGraphDepths } from "./lib/graph-depth.mjs";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const VIEWS_REL = "data/generated/views";

// Prezentační labely registrů — 1:1 s dnešními titulky registry
// _index.md stránek (content/dossiers/<slug>/<registry>/_index.md).
export const REGISTRY_LABELS = Object.freeze({
  claims: "Registr tvrzení",
  sources: "Registr zdrojů",
  cases: "Registr kauz",
  gaps: "Registr mezer",
  relations: "Registr vztahů",
});
export const VIEW_REGISTRIES = Object.freeze(["claims", "sources", "cases", "gaps", "relations"]);

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const localPart = (iri) => (typeof iri === "string" ? iri.split("/").pop() : null);

// JSON-LD fragment záznamu: kompaktní forma record JSON bez $schema
// (deliberately ne-sémantický klíč, viz validate-jsonld.mjs).
const jsonldFragment = (record) => Object.fromEntries(Object.entries(record).filter(([k]) => k !== "$schema"));

/*
 * buildViewModels(compiled) → Map<posixRelPath, object>
 * relPath je relativní k data/generated/views/.
 */
export function buildViewModels(compiled, { governmentRoster = new Map() } = {}) {
  const views = new Map();
  const byId = compiled.indexes.byId;

  const dossierWrappers = compiled.records.filter((w) => w.registry === "dossier");
  const dossierBySlug = new Map(dossierWrappers.map((w) => [w.dossier, w]));

  // Záznamy per dossier per registry (compiled.records už jsou
  // deterministicky seřazené: dossier → registry → identifier numericky).
  const recordsOf = new Map(); // slug -> registry -> [wrapper]
  for (const w of compiled.records) {
    if (w.registry === "dossier") continue;
    const perRegistry = recordsOf.get(w.dossier) ?? new Map();
    recordsOf.set(w.dossier, perRegistry);
    perRegistry.set(w.registry, [...(perRegistry.get(w.registry) ?? []), w]);
  }
  // Prezentační pořadí = kanonické `order` (redakční pořadí, dřív front
  // matter weight). U claims/sources/cases/gaps se shoduje s numerickým
  // pořadím identifierů, u relations NE (macinka-turek) — stránky řadily
  // podle weight, view modely musí dát totéž pořadí. Sort je stabilní,
  // takže záznamy bez `order` drží compiled pořadí.
  const byOrder = (a, b) => (a.record.order ?? 0) - (b.record.order ?? 0);
  for (const perRegistry of recordsOf.values()) {
    for (const list of perRegistry.values()) list.sort(byOrder);
  }

  // Viditelné záznamy dossieru: entity view (canonicalDossier != slug) je
  // deterministický filtr nad záznamy kanonického dossieru podle subject
  // taggingu (stejný mechanismus jako dnešní entity-dossier šablony);
  // ostatní dossiery vlastní své záznamy přímo.
  const visibleRecords = (slug, registry) => {
    const dossier = dossierBySlug.get(slug)?.record;
    const isView = dossier?.canonicalDossier && dossier.canonicalDossier !== slug;
    const owner = isView ? dossier.canonicalDossier : slug;
    const rows = recordsOf.get(owner)?.get(registry) ?? [];
    return isView ? rows.filter((w) => (w.record.subjects ?? []).includes(dossier.subject)) : rows;
  };

  const dossierRoute = (slug) => `/dossiers/${slug}/`;
  const registryRoute = (slug, registry) => `/dossiers/${slug}/${registry}/`;

  const dossierLink = (slug) => {
    const w = dossierBySlug.get(slug);
    return { slug, title: w?.record.title ?? null, route: dossierRoute(slug) };
  };
  const entityLink = (iri) => {
    const w = byId[iri];
    return { "@id": iri, entityId: localPart(iri), title: w?.record.title ?? null, route: `/entities/${localPart(iri)}/` };
  };
  const claimRef = (ref) => {
    const w = byId[ref["@id"]];
    return {
      "@id": ref["@id"],
      identifier: w?.record.identifier ?? localPart(ref["@id"]),
      route: w?.route ?? null,
      text: w?.record.text ?? null,
      status: w?.record.status ?? null,
      statusLabel: w?.record.statusLabel ?? null,
    };
  };
  const sourceRef = (ref) => {
    const w = byId[ref["@id"]];
    return {
      "@id": ref["@id"],
      identifier: w?.record.identifier ?? localPart(ref["@id"]),
      route: w?.route ?? null,
      title: w?.record.title ?? null,
      outlet: w?.record.outlet ?? null,
      description: w?.record.description ?? null,
      published: w?.record.published ?? null,
      url: w?.record.url ?? null,
    };
  };
  const shortRef = (w) => ({ "@id": w.record["@id"], identifier: w.record.identifier, route: w.route });

  // Reverse reference mapy (related records) — z forward polí záznamů.
  const referencedBy = new Map(); // target @id -> [{ registry, wrapper }]
  const addReverse = (refs, wrapper) => {
    for (const ref of refs ?? []) {
      const list = referencedBy.get(ref["@id"]) ?? [];
      list.push(wrapper);
      referencedBy.set(ref["@id"], list);
    }
  };
  // Iteruje se přes order-sorted seznamy (ne compiled.records), aby
  // related.* držely prezentační pořadí registrů — viz byOrder výše.
  for (const perRegistry of recordsOf.values()) {
    for (const [registry, list] of perRegistry.entries()) {
      for (const w of list) {
        if (registry === "cases" || registry === "relations") {
          addReverse(w.record.claims, w);
          addReverse(w.record.sources, w);
        } else if (registry === "gaps") {
          addReverse(w.record.claims, w);
        }
      }
    }
  }
  const relatedOf = (recordIri) => {
    const grouped = { cases: [], gaps: [], relations: [] };
    for (const w of referencedBy.get(recordIri) ?? []) {
      if (w.registry === "cases") grouped.cases.push({ ...shortRef(w), title: w.record.title });
      else if (w.registry === "gaps") grouped.gaps.push({ ...shortRef(w), title: w.record.title });
      else if (w.registry === "relations")
        grouped.relations.push({
          ...shortRef(w),
          label: w.record.label,
          title: `${entityLink(w.record.sourceEntity["@id"]).title} — ${w.record.label} — ${entityLink(w.record.targetEntity["@id"]).title}`,
        });
    }
    return grouped;
  };

  // fallbackSubjects: case bez explicitního taggingu patří subjektu svého
  // dossieru — stejné pravidlo, kterým [[extra.cases]] mirror bloky nesly
  // subjects i u netagovaných case záznamů (single-subject dossiery).
  const caseCard = (w, fallbackSubjects = []) => ({
    "@id": w.record["@id"],
    identifier: w.record.identifier,
    title: w.record.title,
    period: w.record.period,
    status: w.record.status,
    statusLabel: w.record.statusLabel,
    summary: w.record.summary,
    anchor: w.record.anchor,
    route: w.route,
    subjects: w.record.subjects?.length ? w.record.subjects : fallbackSubjects,
    claims: (w.record.claims ?? []).map((ref) => ({
      "@id": ref["@id"],
      identifier: byId[ref["@id"]]?.record.identifier ?? localPart(ref["@id"]),
      route: byId[ref["@id"]]?.route ?? null,
    })),
  });

  // counts.entities = globální entity, jejichž `dossiers` obsahuje slug
  // (fáze H — dřívější stats.toml entities_total; entity nevlastní žádný
  // dossier, je to filtr členství).
  const countsOf = (slug) => ({
    ...Object.fromEntries(VIEW_REGISTRIES.map((registry) => [registry, visibleRecords(slug, registry).length])),
    entities: compiled.entities.filter((w) => (w.record.dossiers ?? []).includes(slug)).length,
  });

  // Registr dossierů v redakčním (autorizačním) pořadí — kanonické pole
  // dossier.order (fáze H, dřívější pořadí bloků data/dossiers.toml).
  const registryOrdered = dossierWrappers
    .slice()
    .sort((a, b) => (a.record.order ?? 0) - (b.record.order ?? 0));
  // Kanonický vlastník záznamů: bez canonicalDossier (agregát/samostatný)
  // nebo canonicalDossier == vlastní slug.
  const isOwnerDossier = (record) => !record.canonicalDossier || record.canonicalDossier === record.slug;

  // Update záznamy dossieru (kanonický registr updates, pořadí = compiled
  // pořadí identifikátorů = chronologické append-only pořadí) —
  // prezentační tvar pro šablony (dřívější updates.toml).
  const updatesOf = (slug) =>
    (recordsOf.get(slug)?.get("updates") ?? []).map((uw) => ({
      date: uw.record.date,
      summary: uw.record.summary,
      addedClaims: (uw.record.addedClaims ?? []).map((ref) => localPart(ref["@id"])),
      updatedClaims: (uw.record.updatedClaims ?? []).map((ref) => localPart(ref["@id"])),
      addedGaps: (uw.record.addedGaps ?? []).map((ref) => localPart(ref["@id"])),
      closedGaps: (uw.record.closedGaps ?? []).map((ref) => localPart(ref["@id"])),
      reviewedSources: (uw.record.reviewedSources ?? []).map((ref) => localPart(ref["@id"])),
    }));

  // --- dossiery ---------------------------------------------------------
  for (const w of dossierWrappers) {
    const slug = w.dossier;
    const record = w.record;
    const breadcrumbRoot = [{ title: "Dossiery", route: "/dossiers/" }];
    const overview = {
      "@id": record["@id"],
      slug,
      title: record.title,
      description: record.description,
      dossierType: record.dossierType,
      route: w.route,
    };
    if (record.aliases) overview.aliases = record.aliases;
    if (record.canonicalDossier) overview.canonicalDossier = record.canonicalDossier;
    if (record.subject) overview.subject = record.subject;
    if (record.aggregates) overview.aggregates = record.aggregates;
    overview.language = record.language;
    overview.navigationVisible = record.navigationVisible;
    overview.updated = record.updated;
    overview.authorization = record.authorization ?? null;
    overview.seo = {
      title: record.seo?.title ?? record.title,
      description: record.seo?.description ?? record.description,
      seoType: record.seo?.seoType ?? null,
    };
    overview.breadcrumb = [...breadcrumbRoot, { title: record.title }];
    overview.counts = countsOf(slug);
    overview.contentBlocks = record.contentBlocks ?? [];
    {
      const ownerSlug = record.canonicalDossier && record.canonicalDossier !== slug ? record.canonicalDossier : slug;
      const ownerSubject = dossierBySlug.get(ownerSlug)?.record.subject;
      overview.cases = visibleRecords(slug, "cases").map((cw) => caseCard(cw, ownerSubject ? [ownerSubject] : []));
    }
    overview.registries = Object.fromEntries(
      VIEW_REGISTRIES.map((registry) => [
        registry,
        { title: REGISTRY_LABELS[registry], route: registryRoute(slug, registry) },
      ]),
    );
    // Subjektové entity dossieru (fáze H — dřívější front matter
    // subject_entities): vlastní subjekt, u agregátu subjekty
    // agregovaných dossierů.
    overview.subjectEntities = record.subject
      ? [record.subject]
      : (record.aggregates ?? []).map((s) => dossierBySlug.get(s)?.record.subject).filter(Boolean);
    // Historie aktualizací viditelná NA STRÁNCE dossieru (fáze H —
    // dřívější load_data updates.toml): kanonický vlastník má vlastní
    // updates, entity view sdílí updates kanonického vlastníka.
    {
      const ownerSlug = record.canonicalDossier && record.canonicalDossier !== slug ? record.canonicalDossier : slug;
      overview.updates = updatesOf(ownerSlug);
    }
    // Agregát: rozklad na zdrojové dossiery s tituly/routami/počty
    // (dřívější registry lookup v šabloně dossier.html).
    if (record.aggregates?.length) {
      overview.aggregatesResolved = record.aggregates.map((s) => ({
        slug: s,
        title: dossierBySlug.get(s)?.record.title ?? s,
        route: dossierRoute(s),
        claims: countsOf(s).claims,
      }));
    }
    // Entity dossier: kanonický vlastník + sourozenci (dřívější registry
    // lookup v šabloně entity-dossier.html). U self-canonical dossieru
    // ukazuje sám na sebe a siblings je prázdné — stejně jako dřív.
    if (record.canonicalDossier) {
      const canonicalRecord = dossierBySlug.get(record.canonicalDossier)?.record;
      overview.canonical = {
        slug: record.canonicalDossier,
        title: canonicalRecord?.title ?? record.canonicalDossier,
        route: dossierRoute(record.canonicalDossier),
        siblings: (canonicalRecord?.aggregates ?? [])
          .filter((s) => s !== slug)
          .map((s) => ({ slug: s, title: dossierBySlug.get(s)?.record.title ?? s })),
      };
    }
    // Kurátorovaný graf dossieru (fáze H — dřívější graph.toml): per-dossier
    // popisky uzlů, cluster membership a DETERMINISTICKY POČÍTANÁ hloubka
    // (BFS od subjektových uzlů, scripts/data/lib/graph-depth.mjs) — depth
    // už není kurátorované pole.
    if (record.graph) {
      const depths = dossierGraphDepths(compiled, slug);
      overview.graph = {
        nodes: record.graph.nodes.map((n) => {
          const node = { entity: n.entity, label: n.label, subject: n.subject === true, depth: depths.get(n.entity) ?? null };
          if (n.cluster !== undefined) node.cluster = n.cluster;
          if (n.claims !== undefined) node.claims = n.claims;
          if (n.sources !== undefined) node.sources = n.sources;
          return node;
        }),
        edges: [...record.graph.edges],
        clusters: record.graph.clusters ?? [],
        sourceFamilies: record.graph.sourceFamilies ?? [],
      };
    }
    overview.jsonld = jsonldFragment(record);
    views.set(`dossiers/${slug}/overview.json`, overview);

    // registry indexy ----------------------------------------------------
    for (const registry of VIEW_REGISTRIES) {
      const rows = visibleRecords(slug, registry).map((rw) => {
        const r = rw.record;
        const base = { "@id": r["@id"], identifier: r.identifier, route: rw.route };
        if (registry === "claims") {
          return {
            ...base,
            text: r.text,
            status: r.status,
            statusLabel: r.statusLabel,
            // Subjekt tagging — entity-dossier-registry ukazuje badge
            // „sdílené" u záznamu s víc než jedním subjektem.
            subjects: r.subjects ?? [],
            sources: (r.sources ?? []).map((ref) => ({
              "@id": ref["@id"],
              identifier: byId[ref["@id"]]?.record.identifier ?? localPart(ref["@id"]),
              route: byId[ref["@id"]]?.route ?? null,
            })),
          };
        }
        if (registry === "sources") {
          const row = { ...base, title: r.title, outlet: r.outlet, description: r.description ?? null };
          if (r.sourceFamily !== undefined) row.sourceFamily = r.sourceFamily;
          row.sourceType = r.sourceType;
          row.url = r.url;
          if (r.published !== undefined) row.published = r.published;
          row.retrieved = r.retrieved;
          row.claims = (r.claims ?? []).map((ref) => ({
            "@id": ref["@id"],
            identifier: byId[ref["@id"]]?.record.identifier ?? localPart(ref["@id"]),
            route: byId[ref["@id"]]?.route ?? null,
          }));
          return row;
        }
        if (registry === "cases") {
          return { ...base, title: r.title, period: r.period, status: r.status, statusLabel: r.statusLabel, summary: r.summary, anchor: r.anchor };
        }
        if (registry === "gaps") {
          return {
            ...base,
            title: r.title,
            description: r.description,
            priority: r.priority,
            checked: r.checked,
            claims: (r.claims ?? []).map((ref) => ({
              "@id": ref["@id"],
              identifier: byId[ref["@id"]]?.record.identifier ?? localPart(ref["@id"]),
              route: byId[ref["@id"]]?.route ?? null,
            })),
          };
        }
        // relations
        return {
          ...base,
          label: r.label,
          relationType: r.relationType,
          status: r.status,
          subjects: r.subjects ?? [],
          from: entityLink(r.sourceEntity["@id"]),
          to: entityLink(r.targetEntity["@id"]),
          claims: (r.claims ?? []).map((ref) => ({
            "@id": ref["@id"],
            identifier: byId[ref["@id"]]?.record.identifier ?? localPart(ref["@id"]),
            route: byId[ref["@id"]]?.route ?? null,
          })),
        };
      });
      views.set(`dossiers/${slug}/${registry}-index.json`, {
        dossier: slug,
        // Titulek/vlastník dossieru pro breadcrumby filtrovaných pohledů
        // (fáze H — dřívější front matter dossier_title/canonical_dossier).
        dossierTitle: record.title,
        canonicalDossier: record.canonicalDossier ?? null,
        registry,
        title: REGISTRY_LABELS[registry],
        route: registryRoute(slug, registry),
        breadcrumb: [...breadcrumbRoot, { title: record.title, route: w.route }, { title: REGISTRY_LABELS[registry] }],
        count: rows.length,
        rows,
      });
    }

    // detaily záznamů (jen vlastní záznamy dossieru — entity views mají
    // detailní routy pouze u kanonického vlastníka, viz routes.json) ----
    for (const registry of VIEW_REGISTRIES) {
      const owned = recordsOf.get(slug)?.get(registry) ?? [];
      for (const [i, rw] of owned.entries()) {
        const r = rw.record;
        const resolved = {};
        if (r.sources) resolved.sources = r.sources.map(sourceRef);
        if (r.claims) resolved.claims = r.claims.map(claimRef);
        if (registry === "relations") {
          resolved.sourceEntity = entityLink(r.sourceEntity["@id"]);
          resolved.targetEntity = entityLink(r.targetEntity["@id"]);
        }
        // Subjekt → dossier(y) subjektu (fáze H — dřívější registry lookup
        // v šabloně dossier-claim.html): pořadí = subjects × registr.
        if (registry === "claims" && r.subjects?.length) {
          resolved.subjectDossiers = r.subjects.flatMap((subj) =>
            registryOrdered
              .filter((dw) => dw.record.subject === subj)
              .map((dw) => ({ subject: subj, slug: dw.dossier, title: dw.record.title, route: dossierRoute(dw.dossier) })),
          );
        }
        const detail = {
          dossier: slug,
          registry,
          identifier: r.identifier,
          route: rw.route,
          breadcrumb: [
            ...breadcrumbRoot,
            { title: record.title, route: w.route },
            { title: REGISTRY_LABELS[registry], route: registryRoute(slug, registry) },
            { title: r.identifier },
          ],
          record: r,
          resolved,
          neighbors: {
            prev: i > 0 ? shortRef(owned[i - 1]) : null,
            next: i < owned.length - 1 ? shortRef(owned[i + 1]) : null,
          },
          related: relatedOf(r["@id"]),
          jsonld: jsonldFragment(r),
        };
        views.set(`dossiers/${slug}/${registry}/${String(r.identifier).toLowerCase()}.json`, detail);
      }
    }
  }

  // --- entity -----------------------------------------------------------
  // Order-sorted per dossier (viz byOrder) — entity stránky vypisují
  // vztahy per dossier v prezentačním pořadí registru.
  const relationWrappers = compiled.records
    .filter((w) => w.registry === "relations")
    .slice()
    .sort((a, b) => cmp(a.dossier, b.dossier) || byOrder(a, b));
  for (const w of compiled.entities) {
    const r = w.record;
    const iri = r["@id"];
    const touching = relationWrappers.filter(
      (rel) => rel.record.sourceEntity["@id"] === iri || rel.record.targetEntity["@id"] === iri,
    );
    const claimIds = new Map();
    const sourceIds = new Map();
    for (const rel of touching) {
      for (const ref of rel.record.claims ?? []) claimIds.set(ref["@id"], byId[ref["@id"]]);
      for (const ref of rel.record.sources ?? []) sourceIds.set(ref["@id"], byId[ref["@id"]]);
    }
    const refList = (map) =>
      [...map.entries()]
        .sort(([a], [b]) => cmp(a, b))
        .map(([id, rw]) => ({
          "@id": id,
          identifier: rw?.record.identifier ?? localPart(id),
          dossier: rw?.dossier ?? null,
          route: rw?.route ?? null,
        }));
    const view = {
      "@id": iri,
      entityId: r.entityId,
      title: r.title,
      entityType: r.entityType,
      publicationRole: r.publicationRole,
      dossierEnabled: r.dossierEnabled,
      dossierStatus: r.dossierStatus,
      coverageState: r.coverageState,
      route: w.route,
    };
    if (r.routeAliases) view.routeAliases = r.routeAliases;
    if (r.snapshotDate) view.snapshotDate = r.snapshotDate;
    if (r.description !== undefined) view.description = r.description;
    // Provenience objevení (fáze H — kanonická, viz entity.schema.json);
    // government_* z data/government.toml (kanonický vlastník, injektuje
    // se jako governmentRoster mapou — view model je čistá projekce).
    if (r.provenance !== undefined) view.provenance = r.provenance;
    // Resolved provenienční chipy pro šablonu entity.html (fáze H —
    // dřívější resolve přes registry sekce a content front matter):
    // lokální id se resolvují per dossier členství, ve STEJNÉM vnořeném
    // pořadí (dossier × id) jako dřívější šablona — composite-key id se
    // legitimně resolvuje ve VÍCE dossierech na různé stránky.
    if (r.provenance !== undefined) {
      const chipsFor = (ids, registry, detail = false) =>
        (r.dossiers ?? []).flatMap((slug) =>
          (ids ?? []).flatMap((id) => {
            const rw = compiled.indexes.byDossierIdentifier[`${slug}:${id}`];
            if (!rw || rw.registry !== registry) return [];
            const chip = { dossier: slug, identifier: id, route: rw.route };
            if (detail) {
              chip.status = rw.record.status;
              chip.statusLabel = rw.record.statusLabel;
              chip.text = rw.record.text;
            }
            return [chip];
          }),
        );
      view.provenanceResolved = {
        discoveredVia: chipsFor(r.provenance.discoveredVia, "relations"),
        claims: chipsFor(r.provenance.claimRefs, "claims", true),
        sources: chipsFor(r.provenance.sourceRefs, "sources"),
      };
    }
    {
      const gov = governmentRoster.get(r.entityId);
      if (gov) view.government = { office: gov.office, party: gov.party };
    }
    view.breadcrumb = [{ title: "Registr entit", route: "/entities/" }, { title: r.title }];
    view.content = r.content ?? [];
    view.dossiers = (r.dossiers ?? []).map(dossierLink);
    view.relations = touching.map((rel) => {
      const outgoing = rel.record.sourceEntity["@id"] === iri;
      return {
        "@id": rel.record["@id"],
        identifier: rel.record.identifier,
        dossier: rel.dossier,
        route: rel.route,
        label: rel.record.label,
        relationType: rel.record.relationType,
        status: rel.record.status,
        direction: outgoing ? "outgoing" : "incoming",
        other: entityLink(outgoing ? rel.record.targetEntity["@id"] : rel.record.sourceEntity["@id"]),
      };
    });
    view.claims = refList(claimIds);
    view.sources = refList(sourceIds);
    view.jsonld = jsonldFragment(r);
    views.set(`entities/${r.entityId}.json`, view);
  }

  // Řádky registru entit v redakčním pořadí (order = dřívější front
  // matter weight; stabilní sort drží abecední pořadí u shodných hodnot).
  const orderedEntities = compiled.entities.slice().sort(byOrder);
  views.set("entities-index.json", {
    route: "/entities/",
    count: compiled.entities.length,
    // Registr dossierů v redakčním pořadí (fáze H — dřívější
    // load_data("data/dossiers.toml") pro počet a popisky skupin).
    dossierRegistry: registryOrdered.map((w) => ({ slug: w.dossier, title: w.record.title })),
    rows: orderedEntities.map((w) => {
      const row = {
        "@id": w.record["@id"],
        entityId: w.record.entityId,
        title: w.record.title,
        entityType: w.record.entityType,
        publicationRole: w.record.publicationRole,
        coverageState: w.record.coverageState,
        route: w.route,
        dossiers: (w.record.dossiers ?? []).map(dossierLink),
      };
      const gov = governmentRoster.get(w.record.entityId);
      if (gov) row.government = { office: gov.office, party: gov.party };
      return row;
    }),
  });

  // --- dossiers index + landing ----------------------------------------
  const cards = dossierWrappers.map((w) => ({
    "@id": w.record["@id"],
    slug: w.dossier,
    title: w.record.title,
    description: w.record.description,
    dossierType: w.record.dossierType,
    route: w.route,
    updated: w.record.updated,
    navigationVisible: w.record.navigationVisible,
    counts: countsOf(w.dossier),
  }));
  const totals = {
    dossiers: dossierWrappers.length,
    entities: compiled.entities.length,
    claims: compiled.counts.perType.claim ?? 0,
    sources: compiled.counts.perType.source ?? 0,
    cases: compiled.counts.perType.case ?? 0,
    gaps: compiled.counts.perType.gap ?? 0,
    relations: compiled.counts.perType.relation ?? 0,
  };
  views.set("dossiers-index.json", { route: "/dossiers/", count: cards.length, totals, cards });
  // Landing (fáze H): kanoničtí vlastníci v redakčním pořadí registru
  // (dossier.order) + jejich update historie + součty se sémantikou
  // dřívějších stats.toml dlaždic (entities = Σ členství per dossier,
  // entita ve víc dossierech se počítá vícekrát — stejné číslo jako dřív).
  const canonicalOrdered = registryOrdered.filter((w) => isOwnerDossier(w.record));
  const canonicalTotals = { claims: 0, sources: 0, cases: 0, gaps: 0, entities: 0, relations: 0 };
  for (const w of canonicalOrdered) {
    const c = countsOf(w.dossier);
    canonicalTotals.claims += c.claims;
    canonicalTotals.sources += c.sources;
    canonicalTotals.cases += c.cases;
    canonicalTotals.gaps += c.gaps;
    canonicalTotals.entities += c.entities;
    canonicalTotals.relations += c.relations;
  }
  views.set("landing.json", {
    totals,
    dossiers: cards.filter((c) => c.navigationVisible),
    canonicalTotals,
    primaryCanonical: canonicalOrdered[0]?.dossier ?? null,
    canonicalDossiers: canonicalOrdered.map((w) => ({
      slug: w.dossier,
      title: w.record.title,
      updates: updatesOf(w.dossier),
    })),
  });

  // --- mapa (graf) ------------------------------------------------------
  views.set("map.json", {
    nodes: compiled.graph.nodes.map((n) => ({ ...n, route: `/entities/${n.id}/` })),
    edges: compiled.graph.edges.map((e) => ({ ...e, route: `/dossiers/${e.dossier}/relations/${e.id}/` })),
  });

  return views;
}

/*
 * Deterministický zápis: cílový adresář se nejdřív čistí (stale soubory
 * nesmí přežít), pak se soubory zapisují v seřazeném pořadí — LF,
 * trailing newline, žádné timestampy.
 */
export function writeViewModels(views, outDir) {
  rmSync(outDir, { recursive: true, force: true });
  for (const [relPath, view] of [...views.entries()].sort(([a], [b]) => cmp(a, b))) {
    const file = join(outDir, ...relPath.split("/"));
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, `${JSON.stringify(view, null, 2)}\n`);
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  // data:build volá data:validate před tímto krokem — tady se dataset už
  // jen načte a zkompiluje (loader hází tvrdou chybu na nečitelný soubor).
  const model = await loadCanonicalDataset();
  const compiled = compileDataset(model);
  const views = buildViewModels(compiled, { governmentRoster: readGovernmentRoster(REPO_ROOT) });
  writeViewModels(views, join(REPO_ROOT, VIEWS_REL));
  console.log(`View modely: ${views.size} souborů → ${VIEWS_REL}/`);
  console.log("OK");
}
