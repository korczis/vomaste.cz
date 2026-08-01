# vomaste.cz — task runner for adopters (and for anyone who does not want to
# memorise which of ~30 npm scripts is the one that actually gates a change).
#
# This file is a THIN WRAPPER, deliberately. Every recipe shells out to the
# npm script or repo script that already exists; none of them reimplements a
# check, and none of them adds a capability the repo does not have. That
# matters here more than usual: the constitution
# (docs/constitution/OPEN_INTELLIGENCE_COMMONS.md, §8) forbids advertising
# capabilities that nothing actually enforces, and a task runner is exactly
# the place where a nice-sounding recipe name can start claiming one.
#
# If a recipe here ever disagrees with package.json, package.json wins and
# this file is the bug.
#
#   just              list every recipe
#   just doctor       check prerequisites before anything else
#   just build        the real quality gate (same as CI)
#
# Installing `just`: https://github.com/casey/just#installation
# `just` is a convenience only — every recipe below is a plain command you
# can also run directly, and nothing in the build, the hooks or CI depends
# on `just` being present.

# Versions the README states as supported. Kept here so `just doctor` checks
# against a single declared value instead of a number written in prose.
node_major := "24"
zola_minor := "0.22"

# Show all recipes (default when you run bare `just`).
[doc("Vypíše všechny recepty")]
default:
    @just --list --unsorted

# --- getting started -------------------------------------------------------

# Verify the toolchain before blaming the repo. Reports, never installs.
[doc("Zkontroluje prerekvizity (node, zola, node_modules, git hooks)")]
doctor:
    #!/usr/bin/env bash
    set -uo pipefail
    fail=0
    check() { printf '  %-22s %s\n' "$1" "$2"; }
    echo "vomaste.cz — prerequisites"
    if command -v node >/dev/null; then
      have=$(node --version)
      major=${have#v}; major=${major%%.*}
      if [ "$major" -ge "{{ node_major }}" ]; then check "node" "$have (ok, >= {{ node_major }})"
      else check "node" "$have (POZOR: README uvádí Node {{ node_major }})"; fail=1; fi
    else check "node" "CHYBÍ — https://nodejs.org"; fail=1; fi
    if command -v zola >/dev/null; then
      have=$(zola --version)
      case "$have" in *"{{ zola_minor }}"*) check "zola" "$have (ok)";;
        *) check "zola" "$have (POZOR: README uvádí Zola {{ zola_minor }}.x)"; fail=1;; esac
    else check "zola" "CHYBÍ — https://www.getzola.org/documentation/getting-started/installation/"; fail=1; fi
    if [ -d node_modules ]; then check "node_modules" "nainstalováno"
    else check "node_modules" "chybí — spusť 'just setup'"; fail=1; fi
    hooks=$(git config --get core.hooksPath || echo "-")
    if [ "$hooks" = ".githooks" ]; then check "git hooks" ".githooks (aktivní)"
    else check "git hooks" "$hooks (spusť 'just hooks')"; fi
    echo
    if [ "$fail" -eq 0 ]; then echo "OK — prostředí odpovídá tomu, co README předpokládá."
    else echo "Něco nesedí (viz výše). Build může selhat z důvodů, které nejsou v obsahu."; fi
    exit "$fail"

# Install dependencies (this also wires up the git hooks via postinstall).
[doc("Nainstaluje závislosti a nastaví git hooks")]
setup:
    npm ci

# Re-point core.hooksPath at .githooks/ (normally done by `just setup`).
[doc("Přeinstaluje git hooks na .githooks/")]
hooks:
    npm run hooks:install

# --- the loop you actually work in ----------------------------------------

# Live preview on http://127.0.0.1:1111 — validators + generators + zola serve.
# Long-running: it never exits on its own.
[doc("Live preview na http://127.0.0.1:1111 (dlouho běžící)")]
dev:
    npm run dev

# THE quality gate. Same sequence CI runs. A change is not done until this
# exits clean — the pre-commit hook is a fast subset, not a substitute.
[doc("TA brána kvality — stejná sekvence jako CI; bez ní není hotovo")]
build:
    npm run build

# The fast pre-commit subset on demand: referential integrity and
# authorization scope, no CSS/JS bundling, no Zola build, no anchor/JSON-LD
# verification. Runs the hook itself so this can never drift from it.
[doc("Rychlá podmnožina z pre-commitu (integrita + autorizace), bez buildu")]
check:
    ./.githooks/pre-commit

# Regression tests for the tooling scripts (part of `just build` too).
[doc("Regresní testy tooling skriptů")]
test:
    npm test

# Delete build output. Nothing here is a source of truth.
[doc("Smaže build output (public/)")]
clean:
    rm -rf public

# --- content work ---------------------------------------------------------

# T-028 fáze H: dřívější `just regen` (migrate-claims/cases-to-pages)
# zanikl — content/** je generovaný adaptér kanonických dat. Edituj
# data/dossiers/**/*.json a spusť `npm run data:build`; paritu tabulky
# s kanonickými záznamy hlídá validate-registry-table (data:validate).
[doc("Regeneruje content adaptéry z kanonických dat")]
regen:
    npm run data:build

# Scaffold nového KANONICKÉHO dossier balíčku (data/dossiers/<slug>/:
# dossier.json + prázdné registry adresáře). Odmítne subjekt bez
# odpovídajícího záznamu v data/authorizations.toml — autorizace vzniká
# jen přes `just authorize` (append-only log v AGENTS.md). Adaptéry
# content/** pak vygeneruje `npm run data:build`.
#   just scaffold jana-novakova "Jana Nováková" novakova AUTH-2026-08-01-X
[doc("Scaffold kanonického dossier balíčku — odmítne neautorizovaný subjekt")]
scaffold slug title subject auth_record_id:
    npm run dossier:scaffold -- --slug={{ slug }} --title="{{ title }}" --subject={{ subject }} --authorization-record-id={{ auth_record_id }}

# Record a new authorization for an entity. INTERACTIVE ON PURPOSE: it needs a
# real terminal and a human typing the scope in their own words, and it is the
# only thing that may write to the authorization log. No flag skips that.
[doc("Zapíše autorizaci — INTERAKTIVNÍ, vyžaduje člověka u klávesnice")]
authorize entity:
    npm run authorize:entity {{ entity }}

# --- research (live network, never part of the build) ---------------------

# Query ARES, the Czech primary business register, by IČO or by name.
# Proves identity/seat/legal form/status. Does NOT prove ownership, beneficial
# owners, or since when anyone controlled anything.
#   just ares --ico=28274318
#   just ares --name="GMR GAS"
[doc("Dotaz do ARES podle --ico= nebo --name= (živá síť, ne součást buildu)")]
ares *args:
    node scripts/osint/ares-lookup.mjs {{ args }}

# Rozbalí rejstříkové okolí firmy na kontextové entity (ARES VR). Výchozí je
# dry run; --write teprve zapisuje. Nikdy nepřepisuje existující stránku a
# hlásí podezření na duplicitu pod jiným slugem.
#   just expand 28274318
#   just expand 28274318 --write
[doc("Rozbalí rejstříkové okolí firmy na kontextové entity (dry run bez --write)")]
expand ico *args:
    node scripts/osint/expand-entity.mjs --ico={{ ico }} {{ args }}

# --- multi-agent co-op ----------------------------------------------------

# Board, worktrees and the last messages on the co-op bus.
[doc("Stav co-op: board, worktrees, poslední zprávy")]
coop:
    ./scripts/coop/coop.sh status

# Messages addressed to this agent (see docs/coop/PROTOCOL.md).
[doc("Zprávy adresované tomuto agentovi")]
inbox:
    ./scripts/coop/coop.sh inbox
