+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "Příkazy a tooling"
template = "tooling-index.html"
sort_by = "weight"
weight = 90
description = "Katalog všech příkazů repozitáře — npm skripty, Claude skills a just recepty: co dělají, co vynucují a kdy je spustit. Generovaný z package.json, justfile a .claude/skills, takže nemůže zastarat."

[extra]
generated = true
lang = "cs"
seo_type = "CollectionPage"
record_type = "toolingCommandIndex"
view_model = "generated/tooling-catalog.json"
+++

Tenhle katalog odpovídá na otázku, kterou si nový přispěvatel i agent kladou jako první: **co který příkaz dělá, co vynucuje a kdy ho spustit**.

Ručně se u každého příkazu píše jen to, co se ze zdrojů odvodit nedá. Příkazová řádka, zařazení do build pipeline, členství v pre-commit hooku, cíl `just` receptu i frontmatter skillu se dopočítávají ze samotného repozitáře, takže katalog nemůže tvrdit něco jiného, než co se skutečně spouští. Příkaz bez záznamu shodí build — a stejně tak záznam ukazující na příkaz, který zanikl.
