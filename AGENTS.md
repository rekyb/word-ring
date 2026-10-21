# AGENTS.md

Word Ring: a hyper-casual word puzzle game for Android (React Native + Expo,
TypeScript).

## Code rules

**Follow `DEV_RULES.md` for all code.** It is the single source of truth for
structure, TypeScript, components, state, boundaries, testing, and git.

## Design rules

**Follow `DESIGN_RULES.md` for all UI/visual direction** (palette, typography,
mood). anti-slop is the filter: before any UI, copy, accessibility,
mobile-layout, or code-comment work, load the relevant skill and follow it.

- Core filter (always): `@antislop`
- UI / visual: `@antislop-ui`
- Copy & text: `@antislop-copywriting`
- Accessibility: `@antislop-human`
- Mobile / responsive: `@antislop-layoutmobile`
- Code comments: `@antislop-code`

`DESIGN_RULES.md` supplies the direction; the anti-slop skills reject slop.

## Hard guardrails

- Work on a `feat/...` or `fix/...` branch; never commit directly to `main`.
  Merge via PR.
- Don't hand-edit lockfiles or run `npm install`/`yarn install` without an
  explicit ask. Dependency changes go through `npx expo install`.
- Never commit secrets or `.env` files.
- Keep pure game logic (dictionary, level generator, scoring) in `src/lib/` as
  pure, unit-tested functions.

## Stack

React Native + Expo (managed) + TypeScript (strict), expo-router, Zustand,
AsyncStorage, AdMob, react-native-iap, Firebase Analytics. Docs: MkDocs in `/gdd`.

## Workflow

- Trunk-based: `main` is always releasable; feature branches + PRs; CI must pass.
- Conventional Commits: `type: short description`.

## Where work is tracked

GitHub Issues (`v1` = current scope, `backlog` = future). Pull the next issue,
branch, implement, PR.

## Docs

Game design docs live under `/gdd` (MkDocs). Preview `mkdocs serve`; validate
`mkdocs build --strict`. Update the relevant page when a design decision changes.
