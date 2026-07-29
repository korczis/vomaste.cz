# Co-op task board

Jediný zdroj pravdy o stavu paralelní práce — viz
`docs/coop/PROTOCOL.md`. **Single-writer:** tento soubor edituje pouze
ORCH, pouze na větvi `master`. Workeři hlásí stav přes sběrnici
(`scripts/coop/coop.sh send …`), nikdy editem tohoto souboru.

Stavy: `todo → claimed → in-progress → review → merged`, kdykoliv
`blocked` (důvod do poznámky). Task s dotykem obsahu o reálné osobě
nese štítek `[scope-check]` a před startem se ověřuje proti
autorizačnímu logu v `AGENTS.md`.

## Aktivní zadání

_Žádné — board čeká na rozklad příštího zadání._

| ID | Titul | Scope (soubory/sekce) | Branch | Owner | Stav | Závislosti | Akceptace |
|----|-------|-----------------------|--------|-------|------|------------|-----------|

## Archiv

_(mergnuté tasky se po dokončení zadání přesouvají sem, ať aktivní
tabulka zůstává čitelná)_
