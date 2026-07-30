+++
title = "Co-op protokol pro více instancí"
description = "Operační protokol pro paralelní práci více instancí Claude Code (nebo lidí) nad jedním repozitářem — role, task board, sběrnice zpráv, worktrees."
template = "docs-viewer.html"
weight = 6

[extra]
lang = "cs"
source_file = "docs/coop/PROTOCOL.md"
+++

**Co to je.** Provozní protokol pro situaci, kdy na repozitáři pracuje víc
lidí nebo víc instancí AI agenta současně — jedna úloha = jedna větev =
jeden worktree, jediný zapisovatel do task boardu, merge až se zeleným
buildem.

**Proč je to zveřejněné.** Protože podstatná část tohohle webu vzniká
asistovaně a je poctivější to popsat než to zamlčet. Zároveň je to
kontrolovatelné: každý commit má autora, čas a diff —
[verzováno v Gitu](@/koncepty/verzovano-v-gitu.md).

**Co protokol nemění.** Je čistě operační. Nikdy nepřebíjí redakční
pravidla, autorizační log ani build gate: úloha, která se dotýká obsahu o
reálné osobě, prochází stejnou kontrolou rozsahu jako každá jiná změna.
