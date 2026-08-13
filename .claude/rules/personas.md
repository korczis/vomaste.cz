# Persony — slovník rolí

Devět rolí, kterými se v tomhle repozitáři popisuje, **pro koho** je
která schopnost a **co ta role smí**. Slovník je jeden a je závazný:
katalog schopností (`data/tooling/*.json`, pole `personas`) i schéma
ho vynucují, `/help` a `/bootstrap` podle něj směrují.

Persona **není** oprávnění ani identita. Je to popis toho, co člověk
právě dělá. Jeden člověk během jedné session projde třemi.

| Persona | Co dělá |
|---|---|
| `reader` | čte web a chce mu rozumět; nic nemění |
| `verifier` | ověřuje existující tvrzení proti zdrojům; nic nemění |
| `source-contributor` | přináší zdroj nebo opravu, ale sám nezapisuje |
| `researcher` | vede rešerši, připravuje důkazní balíček, navrhuje záznamy |
| `editor` | rozhoduje o zněních, stavech a publikaci záznamů |
| `developer` | mění šablony, skripty, validátory, UI |
| `reviewer` | posuzuje cizí změnu, sám ji neslučuje |
| `maintainer` | mění sdílený stav: schéma, pipeline, závislosti, merge |
| `orchestrator` | koordinuje souběžnou práci víc instancí (co-op ORCH) |

## Matice — co která persona smí

`✓` smí · `návrh` smí připravit, ale ne publikovat · `✗` nesmí

| Persona | Číst | Rešerše | Kanonická data | Tvrzení | Kód | Merge |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| reader | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| verifier | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| source-contributor | ✓ | ✓ | návrh | ✗ | ✗ | ✗ |
| researcher | ✓ | ✓ | návrh | návrh | ✗ | ✗ |
| editor | ✓ | ✓ | ✓ | ✓ | omezeně | ✗ |
| developer | ✓ | omezeně | technická | ✗ | ✓ | ✗ |
| reviewer | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| maintainer | ✓ | ✓ | ✓ | ✓ | ✓ | řízeně |
| orchestrator | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

Co matice **neříká** a nikdy říkat nebude: že by některá persona směla
rozšířit rozsah pokrytí osob. To nesmí žádná — viz
[`authorization.md`](authorization.md).

## Úrovně rizika

Druhá polovina téhož slovníku. Každý skill, agent i workflow nese
právě jednu úroveň (`riskLevel` v katalogu).

| Úroveň | Znamená |
|---|---|
| `read-only` | nic nezapisuje; můžeš pustit naslepo |
| `safe-write` | zapisuje do pracovního stromu, `git checkout` to vrátí |
| `review-required` | zapisuje do kanonických dat nebo obsahu; výsledek musí projít člověkem |
| `maintainer` | mění sdílený stav (schéma, pipeline, merge, deploy) |
| `owner-authorization` | dotýká se rozsahu pokrytí osob; bez rozhodnutí vlastníka na to nesahá nikdo |

Když u schopnosti nevíš, do které úrovně patří, je to `review-required`
nebo výš. Podhodnocené riziko je horší než žádný štítek — štítek se čte
jako záruka.
