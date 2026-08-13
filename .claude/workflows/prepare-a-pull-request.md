---
title: Příprava pull requestu
persona: developer
goal: Dostat hotovou práci do stavu, ve kterém ji někdo může posoudit bez zdržení.
skills: quality diff-explain docs-sync editorial-review commit pr
---

## Pro koho

Kdokoli, kdo má hotovou práci a chce ji odeslat.

## Předpoklady

Práce je hotová. Ne „skoro".

## Kroky

1. **`git status --short --branch`** — správná větev? Nečekané soubory?
2. **`/docs-sync`** — zasáhla změna něco popsaného jinde?
3. **`/editorial-review`**, když se měnila `data/dossiers/**`.
   Mechanická brána redakční kvalitu neposoudí.
4. **`/quality`** — souhrn a **plná brána**.
5. **`/diff-explain`** — podklad pro popis.
6. **`/commit`** — konvenční zpráva, správná brána podle role.
7. **`/pr`** — popis podle šablony, včetně „na co se zaměřit"
   a „co jsem neudělal".

## Lidské checkpointy

- **Krok 4**: READY jen s exit 0.
- **Nečekaný soubor** má přednost před zelenou bránou. Lokální
  konfigurace, `.env` ani dočasné výstupy se necommitují.
- **Obsahová změna bez redakčního review** není připravená, i když je
  brána zelená.

## Co z toho vyleze

Otevřený PR, jehož popis odpovídá na to, co recenzent potřebuje vědět.

## Jak poznat, že je hotovo

Recenzent nemusí nic dohledávat, aby začal.

## Když se to pokazí

Brána padá → oprav, ne obcházej. PR s červenou bránou plýtvá cizím
časem.

Jsi na `master` v hlavním checkoutu → PR nemá co otevřít; commit tam
rovnou nasazuje. Přesuň práci na větev.
