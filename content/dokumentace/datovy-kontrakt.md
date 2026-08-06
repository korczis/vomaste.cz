+++
title = "Datový kontrakt a validační pravidla"
description = "Úplný kontrakt kanonického datasetu: cesta od JSON záznamu k publikované stránce a všechna vynucovaná pravidla — tvar, reference R1–R7, redakční sémantika S1–S10, parita tabulky T1–T8."
template = "docs-viewer.html"
weight = 8

[extra]
lang = "cs"
source_file = "docs/data-contract.md"
+++

**Co to je.** Referenční popis toho, co tenhle web pokládá za platný
záznam — a co build odmítne. Každé pravidlo má jednoho vlastníka: tvar
hlídají JSON schémata, odkazy mezi záznamy pravidla R1–R7, redakční
smysl S1–S10 a shodu přehledové tabulky s kanonickými tvrzeními T1–T8.

**Proč je to zajímavé i pro čtenáře, ne jen pro přispěvatele.** Tady je
černé na bílém, co znamená badge u tvrzení. Například pravidlo **S2**
nepustí stav „ověřeno více zdroji", dokud tvrzení necituje dvojici
zdrojů lišící se zdrojovou rodinou **i** vydavatelem — dva články téže
redakce ani dvě otištění téže agenturní zprávy nestačí (**S10**). Není
to slib v patičce, je to podmínka, na které padá build.

**Co tady nenajdete.** Rozhodnutí o pravdivosti. Všechna pravidla popisují
sílu doložení, ne to, jestli je tvrzení pravdivé — tenhle web nesoudí.
