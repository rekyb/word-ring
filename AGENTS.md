# AGENTS.md

## Project

Word Ring — a hyper-casual word puzzle game for Android. Spell words from a ring
of 9 letters to clear levels. Built with React Native + Expo (TypeScript), shipped
to the Google Play Store.

## Stack

- React Native + Expo (managed) + TypeScript
- expo-router, Zustand, AsyncStorage
- AdMob (ads), react-native-iap (remove-ads), Firebase Analytics
- Docs: MkDocs (Material), source in `/gdd`

## Repo layout

- `gdd/` — game design docs (MkDocs source). All design docs live here.
- `site/` — MkDocs build output (gitignored, generated).
- `mkdocs.yml` — MkDocs config.
- `app/` — the Expo app (added during V1; not present yet).

## Workflow

- Trunk-based: `main` is always releasable.
- One branch per task/issue: `feat/<short-desc>` or `fix/<short-desc>`.
- Open a PR against `main`; CI must pass before merge.
- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `test:`.

## Where work is tracked

GitHub Issues. V1 items are labeled `v1`; future work is `backlog`. Pull the next
issue, branch, implement, PR.

## Docs

- Game design docs live under `/gdd`, rendered by MkDocs.
- Preview: `mkdocs serve`; validate: `mkdocs build --strict`.
- Update the relevant `/gdd` page when a design decision changes.

## Conventions

- TypeScript, strict mode.
- Keep pure game logic (dictionary, level generator, scoring) as pure, unit-tested
  functions.
