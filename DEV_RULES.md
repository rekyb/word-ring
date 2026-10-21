# DEV_RULES — Word Ring code conventions

Rules every agent MUST follow when writing code. When in doubt, prefer the
simpler, stricter option.

## 1. Stack & tooling

- Expo (managed) + React Native + TypeScript (**strict**).
- Navigation: expo-router (file-based).
- State: Zustand.
- Lint/format: **ESLint + Prettier** via `npx expo lint`.
- Tests: Jest (`jest-expo`) + React Native Testing Library.
- Git hooks: **husky** — pre-commit runs lint/format; commit-msg strips AI attribution.

## 2. Project structure

```
src/
  app/          # expo-router routes ONLY — keep thin
  components/   # reusable UI components
  screens/      # screen-level UI (a route renders a screen)
  hooks/        # shared hooks
  lib/          # PURE game logic (dictionary, level-generator, scoring) — no React/state/UI imports
  services/     # side-effect wrappers (ads, iap, analytics)
  store/        # Zustand stores
  constants/    # constants, theme
  types/        # shared TS types
```

- **kebab-case** filenames: `level-generator.ts`, `word-wheel.tsx`.
- Path alias `@/*` → `./src/*` (Expo default). Prefer `@/lib/...` over `../../lib/...`.
- One named export per component file.

## 3. TypeScript

- `strict: true` (tsconfig extends `expo/tsconfig.base`).
- No `any`, no `@ts-ignore`/`@ts-expect-error` without a justification comment.
- Use `import type` for type-only imports.
- Await every promise, or explicitly `void` it — **no floating promises**.
- `.tsx` for JSX, `.ts` otherwise.

## 4. Components

- Function components + hooks only (no classes).
- Props typed via `type Props = { ... }`.
- Colocate the `StyleSheet` at the bottom of the same file.
- No inline function/object/array as a prop (breaks memoization).
- `React.memo` list-row components; stable `renderItem` via `useCallback`.

## 5. State (Zustand)

- Select specific slices (`useGameStore(s => s.foundWords)`), never the whole store.
- Local UI state stays in the component; only shared state goes in the store.
- Persist via the progress store + AsyncStorage; don't read AsyncStorage ad hoc.

## 6. Architecture boundaries

- `lib/` is **PURE**: no imports from React, React Native, `store/`, `services/`,
  or `components/`. Enforced by lint (`no-restricted-imports`).
- `services/` wraps side effects (ads/iap/analytics) and degrades gracefully
  when offline or on failure.
- `app/` routes only read params and render a screen — no business logic in routes.

## 7. Lists & performance

- `FlatList` with `keyExtractor` by a real id (never array index).
- `React.memo` + `useCallback` for list rows.
- Never nest a scrollable list inside a `ScrollView` on the same axis.
- Add `getItemLayout` for fixed-height rows.

## 8. Error handling

- One top-level error boundary (an uncaught JS error = native crash in RN).
- Ads/IAP/analytics must fail gracefully (offline or load failure never blocks gameplay).
- Guard AsyncStorage reads with try/catch + sane defaults.

## 9. Testing

- Colocate tests next to source: `level-generator.test.ts` beside `level-generator.ts`.
- Every pure `lib/` module has unit tests (determinism, edge cases).
- UI covered lightly via React Native Testing Library; E2E (Detox) deferred.

## 10. Naming & comments

- kebab-case files; PascalCase components; camelCase functions/variables.
- `testID` on interactive components (for QA/automation).
- English comments, only for non-obvious *why* — never restate the code.

## 11. Git & commits

- Work on a `feat/...` or `fix/...` branch; open a PR against `main`.
- Commit format: `type: short description` (`feat:`, `fix:`, `docs:`, `chore:`, `test:`).
- No AI attribution in commit messages (`Co-Authored-By`, "Generated with").
- Never commit secrets or `.env` files.

## 12. Validation

- Before finishing: `npm run check` (lint + `tsc --noEmit` + tests) must pass.
- CI (GitHub Actions) runs the same on every push/PR; `main` requires CI to pass.
- husky pre-commit runs lint/format on staged files.
