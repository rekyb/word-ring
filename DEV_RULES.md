# DEV_RULES — Word Ring code conventions

Mandatory coding standards, architecture patterns, and workflow rules for the
React Native + Expo app in this repo. Applies to Expo SDK 57 and future SDKs.
Update only when a *principle* changes, not for version bumps.

This document is the single source of truth for structure, naming, and
architecture. `AGENTS.md` references it. When a matching skill exists (in
`.opencode/skills/`), load it for the concrete patterns of a task — this document
stays authoritative on the rules.

---

## 1. Project Structure

```
src/
  app/          # expo-router routes ONLY — read params, render a screen, nothing else
  components/   # reusable UI components (one named export per file)
  screens/      # screen-level UI; a route renders one of these
  hooks/        # shared hooks
  lib/          # PURE game logic (dictionary, level-generator, scoring) — no React/state/UI imports
  services/     # side-effect wrappers (ads, iap, analytics)
  store/        # Zustand stores
  constants/    # constants, theme
  types/        # shared TypeScript types
```

**Rules:**
- `kebab-case` for all files and folders (avoids cross-platform case bugs).
- Path alias `@/*` → `./src/*` (Expo default). Prefer `@/lib/…` over `../../lib/…`.
- `app/` is routes-only — never co-locate components, hooks, or types there.
- Shared, feature-free code goes in `components/`, `hooks/`, `lib/`, `constants/`.
- Pure game logic goes in `lib/`; anything with side effects goes in `services/`.

---

## 2. Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Files / folders | kebab-case | `level-generator.ts`, `word-wheel.tsx`, `use-countdown.ts` |
| Components | PascalCase | `WordWheel`, `LetterButton` |
| Functions / variables | camelCase | `generateLevel`, `foundWords` |
| Constants | UPPER_SNAKE_CASE | `MAX_WHEEL_LETTERS`, `STAR_THRESHOLDS` |
| Types / interfaces | PascalCase | `Level`, `GameState` |
| Hooks | camelCase, `use` prefix | `useGameStore`, `useCountdown` |
| Booleans | `is` / `has` / `can` prefix | `isSolved`, `hasHint`, `canSubmit` |
| Store files | `*-store.ts` | `progress-store.ts` |
| Test files | `<name>.test.ts` (colocated) | `level-generator.test.ts` |

---

## 3. TypeScript & Static Typing

- `strict: true` (tsconfig extends `expo/tsconfig.base`).
- **No `any` on public boundaries** (props, store APIs, `lib/` exports, service methods). Type inference is fine for locals; be explicit when ambiguous.
- Use `import type` for type-only imports.
- Await every promise, or explicitly `void` it — **no floating promises**.
- No `@ts-ignore` / `@ts-expect-error` without a justification comment.
- `.tsx` for JSX, `.ts` otherwise.

```ts
// Always type function signatures
export function generateLevel(seed: number, band: WordBand): Level { ... }

// Inference for obvious locals
const words = level.wordSet;
// Explicit when ambiguous
const store = useGameStore(s => s.level) as Level | null;
```

---

## 4. Components

### Code order (every component file)
```tsx
// 1. imports — external first, then @/ aliases
// 2. type Props = { ... }
// 3. the component (function, hooks only)
// 4. colocated helper sub-components (if only used here)
// 5. StyleSheet.create at the bottom
```

### Rules
- Function components + hooks only — no class components.
- One named export per component file.
- Props typed via `type Props = { ... }`.
- Colocate the `StyleSheet` at the bottom of the same file.
- No inline function / object / array as a prop (breaks memoization).
- `React.memo` list-row components; stable `renderItem` via `useCallback`.

---

## 5. State Management (Zustand)

- Select specific slices — `useGameStore(s => s.foundWords)` — never the whole store.
- Local UI state stays in the component; only shared state goes in a store.
- Persist via the progress store + AsyncStorage; do not read AsyncStorage ad hoc.
- Keep one store per domain (progress, settings); do not grow a single god-store.

---

## 6. Architecture Patterns

### 6.1 Pure game logic (`lib/`)
`dictionary`, `level-generator`, and `scoring` are pure functions — deterministic,
no React, no state, no I/O. This is what makes them unit-testable and safe.

### 6.2 Services for side effects (`services/`)
`ads`, `iap`, `analytics` wrap native/network side effects and **degrade gracefully**
when offline or on failure. Components never call the native SDKs directly.

### 6.3 Store as the communication layer
Cross-component communication goes through the Zustand store (the "event bus"),
not prop drilling and not ad-hoc callbacks.

### 6.4 Composition over inheritance
Reuse via small components + hooks, not class hierarchies or deep HOC nesting.

### 6.5 One accessor, not scattered filters
Provide a single source of truth for repeated queries (e.g. the `dictionary`
module owns "is this a word?", the level store owns "is this word already found?")
rather than re-deriving filters in every screen.

---

## 7. Prohibited Patterns

| Don't | Do |
|---|---|
| `any` / `@ts-ignore` | Typed signatures, narrow types |
| Inline fn/object/array as a prop | Hoist it, or `useCallback`/`useMemo` |
| `.map()` inside a `ScrollView` for lists | `FlatList` |
| Nest a list in a `ScrollView` on the same axis | `ListHeaderComponent` |
| Array index as `keyExtractor` | A real, stable id |
| Business logic in `app/` routes | Thin route → `screens/` |
| Import React/UI/state into `lib/` | Pure functions only |
| Reading AsyncStorage ad hoc | The progress store |
| Silent empty `catch` blocks | Handle or rethrow; log the error |
| Magic numbers in code | Named constants in `constants/` |
| Emoji in code or commit messages | Plain ASCII text |

---

## 8. Lists & Performance

- `FlatList` with `keyExtractor` by a real id (never array index).
- `React.memo` + `useCallback` for list rows.
- `getItemLayout` for fixed-height rows.
- Never nest a scrollable list inside a `ScrollView` on the same axis.
- Profile in release mode before optimizing — dev-mode numbers lie.

---

## 9. Error Handling

### Principles
- **Fail fast at boundaries** — validate inputs to public `lib/` functions and services.
- **No silent failures** — every `catch` logs or handles the error.
- **Graceful degradation** — ads/IAP/analytics never block gameplay.

### When to use what

| Situation | Pattern |
|---|---|
| Invalid input to a `lib/` function | `throw new Error('…')` (caller validates) or a typed `Result` |
| Invalid player action (UI) | Early return + feedback; no crash |
| Async ads/IAP/analytics | `try/catch` + fallback (grant reward, skip interstitial) |
| Invariant that cannot happen | `throw new Error('unreachable: …')` |
| Corrupt persisted data | `try/catch` on read + sane defaults |

### Required
- One top-level **error boundary** (an uncaught JS error = native crash in RN).

---

## 10. Testing & Quality

- **No manual-testing claims** — run the command and report the actual output.
- `npm run check` (lint + `tsc --noEmit` + tests) must pass before finishing work.
- Every pure `lib/` module has unit tests (determinism, edge cases):
  - `level-generator`: same seed → same level; word-set validity; band filtering.
  - `dictionary`: lookup correctness; proper-noun exclusion.
  - `scoring`: point curve; star thresholds.
- Colocate tests: `level-generator.test.ts` beside `level-generator.ts`.
- UI covered lightly via React Native Testing Library; E2E (Detox) deferred.

---

## 11. Git & Commits

- Work on a `feat/...` or `fix/...` branch; open a PR against `main`; CI must pass.
- Commit format: `type: short description` (`feat:`, `fix:`, `docs:`, `chore:`, `test:`).
- No AI attribution in commit messages (`Co-Authored-By`, "Generated with").
- Never commit secrets or `.env` files.
- Do not hand-edit lockfiles; dependency changes go through `npx expo install`.

---

## 12. Scope Enforcement

| Scope | Allowed |
|---|---|
| **V1** | Scaffold, core logic (dictionary + generator + scoring), game screen, progress + level map, ads + remove-ads IAP, analytics, polish + accessibility, ship |
| **Backlog** | Achievements, leaderboards, account transfer, daily streak, push notifications, daily puzzle, word definitions, personal stats, cloud sync, themes, social sharing, more languages |

**Rule:** if a feature is not in V1, do not create files, stubs, or design docs
for it. Park it in the backlog.

---

## 13. Version Upgrade Protocol

When the Expo SDK bumps:
1. Run `npx expo-doctor`; apply fixes with `npx expo install --fix`.
2. Run the app; fix deprecation warnings.
3. Update this document **only if** a rule is invalidated by the SDK change.
4. Do not rewrite working code for new APIs unless it fixes a bug.

---

## Quick Reference: File Templates

### Pure module (`src/lib/level-generator.ts`)
```ts
import type { Level, WordBand } from '@/types';

export function generateLevel(seed: number, band: WordBand): Level {
  // pure, deterministic, no React / state / I/O
}
```

### Component (`src/components/word-wheel.tsx`)
```tsx
import { View, StyleSheet } from 'react-native';

type Props = {
  letters: string[];
  onSelect: (letter: string) => void;
};

export function WordWheel({ letters, onSelect }: Props) {
  return <View style={styles.container}>…</View>;
}

const styles = StyleSheet.create({ container: {} });
```

### Store (`src/store/progress-store.ts`)
```ts
import { create } from 'zustand';

type ProgressState = {
  completedLevels: number[];
  addCompleted: (level: number) => void;
};

export const useProgressStore = create<ProgressState>(set => ({
  completedLevels: [],
  addCompleted: level => set(s => ({ completedLevels: [...s.completedLevels, level] })),
}));
```

### Route (`src/app/play.tsx`)
```tsx
import { PlayScreen } from '@/screens/play';

export default function PlayRoute() {
  return <PlayScreen />; // thin — read params, render the screen
}
```

---

**End of Rules.** This document is the single source of truth for React Native +
Expo development in this repo. All `AGENTS.md` files reference it.
