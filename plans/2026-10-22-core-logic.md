# Core Logic — Technical Requirements & Implementation Plan (Issue #2)

**Status:** DRAFT for final review — nothing implemented yet.

**Goal:** Ship the pure, unit-tested game logic for Word Ring: a bundled
dictionary (SCOWL validity + Oxford CEFR tags), a deterministic seeded level
generator with CEFR-based difficulty, and scoring, all in `src/lib/` with no
React, state, or I/O.

**Spec:** `gdd/gameplay.md`, `gdd/levels.md` (the PRD). This document is the TRD
that fills in the detail the GDD leaves open, and it is what implementation
follows.

**Tech stack:** TypeScript (strict), Jest (`jest-expo`), no new dependencies.

---

## 1. Architecture

Pure modules in `src/lib/`, plus shared types, constants, and bundled data.
Every module is deterministic and takes its inputs as arguments so it is
unit-testable with small fixtures.

| File | Responsibility |
|---|---|
| `src/lib/prng.ts` | Seeded deterministic PRNG (letter selection) |
| `src/lib/dictionary.ts` | Word lookup, formable-words, and CEFR tag lookup |
| `src/lib/level-generator.ts` | Seed + band + target CEFR → `Level`, with difficulty ramp |
| `src/lib/scoring.ts` | Length-based points + star thresholds |
| `src/types/game.ts` | `CefrLevel`, `WordBand`, `Level`, `LevelConfig`, `DictionaryData` |
| `src/constants/game.ts` | Wheel size, star thresholds, score table, letter weights, CEFR config, validation ranges |
| `src/lib/data/words.ts` | Bundled SCOWL validity list (sorted, ~40k) — generated |
| `src/lib/data/cefr.ts` | Bundled Oxford CEFR map (word → level, ~5k) — generated |

`prng` → `level-generator` → `dictionary`; `scoring` is standalone. The
generator receives `DictionaryData` as an argument; only the top-level caller
(a later game screen) wires in the bundled `words.ts` + `cefr.ts`.

---

## 2. Exact interfaces

```ts
// src/types/game.ts
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface WordBand { min: number; max: number }

export interface Level {
  letters: string[];      // 9 distinct lowercase letters
  wordSet: string[];      // every valid word within the band (answer key)
  minWordLength: number;
  maxWordLength: number;
  targetCefr: CefrLevel;  // the difficulty tier this level targets
}

export interface LevelConfig { seed: number; band: WordBand; targetCefr: CefrLevel }

export interface DictionaryData {
  words: readonly string[];                 // sorted, lowercase (SCOWL)
  cefr: Readonly<Record<string, CefrLevel>>; // Oxford overlay (subset)
}
```

```ts
// src/lib/prng.ts
export function mulberry32(seed: number): () => number
// deterministic PRNG; each call yields a float in [0, 1)
```

```ts
// src/lib/dictionary.ts
export function hasWord(sortedWords: readonly string[], word: string): boolean
// binary search over a sorted array (words are lowercase)

export function wordsFormable(
  sortedWords: readonly string[],
  letters: readonly string[],
  minLength: number,
): string[]
// every word with length >= minLength whose characters are all in `letters`
// (letters are distinct, reuse allowed, so this is a membership check per char)

export function cefrLevel(
  cefrMap: Readonly<Record<string, CefrLevel>>,
  word: string,
): CefrLevel | undefined
// Oxford CEFR tag, or undefined for untagged (neutral) words
```

```ts
// src/lib/scoring.ts
export function scoreWord(word: string): number
export function starsFor(foundCount: number, totalCount: number): 0 | 1 | 2 | 3
```

```ts
// src/lib/level-generator.ts
export function generateLevel(
  seed: number,
  band: WordBand,
  targetCefr: CefrLevel,
  dict: DictionaryData,
): Level
// deterministic: same inputs => same Level

export function levelConfig(levelIndex: number): LevelConfig
// pure mapping from 1-based level number to { seed, band, targetCefr }

export function meanCefrRank(
  words: readonly string[],
  cefrMap: Readonly<Record<string, CefrLevel>>,
): number
// mean CEFR rank (A1=1..C1=5); untagged words count as NEUTRAL_CEFR_RANK
```

---

## 3. Constants (proposed values — tunable)

```ts
// src/constants/game.ts
export const WHEEL_SIZE = 9;
export const VOWELS = ['a', 'e', 'i', 'o', 'u'] as const;
export const MIN_VOWELS = 3;

export const STAR_THRESHOLDS = [0.4, 0.7, 1.0] as const; // 40 / 70 / 100%

export const SCORE_BY_LENGTH: Readonly<Record<number, number>> = {
  3: 3, 4: 5, 5: 8, 6: 12, 7: 18, 8: 25, 9: 35,
};

// English letter frequency (percent), used as sampling weights.
export const LETTER_WEIGHTS: Readonly<Record<string, number>> = {
  a: 8, b: 1.5, c: 2.8, d: 4.3, e: 12, f: 2.2, g: 2, h: 6, i: 7, j: 0.15,
  k: 0.8, l: 4, m: 2.4, n: 7, o: 7.5, p: 1.9, q: 0.1, r: 6, s: 6.3, t: 9,
  u: 2.8, v: 1, w: 2.4, x: 0.15, y: 2, z: 0.07,
};

// CEFR difficulty model
export const CEFR_ORDER: Readonly<Record<CefrLevel, number>> =
  { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };
export const NEUTRAL_CEFR_RANK = 3;   // untagged words score as B1 (mid)
export const CEFR_TOLERANCE = 0.75;   // accepted distance from target rank
export const LEVELS_PER_CEFR = 10;    // 5 bands * 10 = 50 levels
export const CAMPAIGN_LEVELS = 50;    // A1..C1, fixed campaign

// Word-length band per CEFR tier (short common words early, long advanced late)
export const MIN_BY_CEFR: Readonly<Record<CefrLevel, number>> =
  { A1: 3, A2: 3, B1: 4, B2: 4, C1: 5 };
export const MAX_BY_CEFR: Readonly<Record<CefrLevel, number>> =
  { A1: 5, A2: 6, B1: 7, B2: 8, C1: 8 };

// Level validation (re-roll if out of range)
export const MIN_WORDS = 20;
export const MAX_WORDS = 80;
export const MIN_LONG_WORDS = 2;   // words of length >= band.max - 1
export const MAX_REROLLS = 20;
```

---

## 4. Key decisions

### 4.1 Dictionary format — sorted array + binary search

**SCOWL list**: a sorted lowercase `string[]`, binary search for `hasWord`, one
linear pass for `wordsFormable`. 40k words × ~6 chars per generation is well
under 50ms; no trie build cost. A trie is a later optimization only if
profiling demands it.

### 4.2 Dictionary data — SCOWL validity + Oxford CEFR overlay

Two bundled, generated files:

- `src/lib/data/words.ts` — SCOWL-derived common words (~40k), lowercase,
  sorted, proper nouns excluded. Answer key validity.
- `src/lib/data/cefr.ts` — the Oxford 3000/5000 subset (~5k words), mapping
  `word -> CefrLevel`. Difficulty signal.

Words in `words.ts` but not in `cefr.ts` are valid but **untagged** and count as
neutral difficulty (see 4.6). `dictionary.ts` hides both formats.

### 4.3 Seeded PRNG — mulberry32

`mulberry32(seed)` is a compact, well-known deterministic PRNG sufficient for
weighted letter selection. `Math.random()` is never used in `lib/`.

### 4.4 Letter selection — weighted, vowel-guaranteed

1. Build a letter pool weighted by `LETTER_WEIGHTS`, blended toward uniform as
   `levelIndex` rises (so rarer letters become likelier at high levels).
2. Sample 9 **distinct** letters (weighted, without replacement).
3. Ensure at least `MIN_VOWELS` vowels; if short, deterministically swap the
   lowest-weight selected consonant(s) for vowels.

### 4.5 Word-set computation — filter, then band

`wordsFormable` returns every 3+ letter word whose characters are all in the
ring. The generator keeps only words within `[band.min, band.max]`. "Trim
ultra-rare words" happens at build time (SCOWL is already common words).

### 4.6 CEFR difficulty model (replaces the old letter-rarity-only ramp)

Difficulty is defined by the answer key's CEFR distribution, not by a visible
tier. `levelConfig(levelIndex)` derives the tier and band:

- **targetCefr** = the band for `ceil(levelIndex / LEVELS_PER_CEFR)`, i.e.
  levels 1–10 = A1, 11–20 = A2, 21–30 = B1, 31–40 = B2, 41–50 = C1.
- **band** = `{ min: MIN_BY_CEFR[targetCefr], max: MAX_BY_CEFR[targetCefr] }`.
- **seed** = `levelIndex * LARGE_PRIME` (stable per level; re-roll advances it).
- **letter rarity** = smooth blend `t = clamp(levelIndex / CAMPAIGN_LEVELS, 0, 1)`
  flattening `LETTER_WEIGHTS` toward uniform, so letters get rarer across and
  within tiers.

The generator accepts a level when `|meanCefrRank(wordSet) - CEFR_ORDER[targetCefr]|`
is within `CEFR_TOLERANCE`, alongside the count and length checks. `meanCefrRank`
is a pure, directly-tested helper.

The player never sees the CEFR tier; it is internal. It shows up only as
"words get harder".

### 4.7 Validation and re-roll

After computing the band-filtered word set:

1. Accept if word count is in `[MIN_WORDS, MAX_WORDS]`, at least `MIN_LONG_WORDS`
   words of length `>= band.max - 1`, and the CEFR mean is within tolerance.
2. Otherwise advance the seed (`seed + 1`) and regenerate, up to `MAX_REROLLS`.
3. If still invalid, return the best attempt seen (closest CEFR mean, then
   highest word count) — still deterministic, never fails.

### 4.8 Scoring

`scoreWord` returns `SCORE_BY_LENGTH[word.length]`; for a length with no entry
(> 9), fall back to `Math.min(length, 9)`. Score is a fun number only and does
not gate progression. `starsFor` returns 3 at `>= 100%`, 2 at `>= 70%`, 1 at
`>= 40%`, else 0.

---

## 5. Task breakdown

Each task is independently testable and commits on its own. Tests are colocated
(`<name>.test.ts`) per `DEV_RULES.md §10`.

### Task 1: Types and constants
- Create `src/types/game.ts`, `src/constants/game.ts` (§2, §3).
- No logic; `npm run check` passes.

### Task 2: Seeded PRNG
- Create `src/lib/prng.ts` + `prng.test.ts`.
- Tests: same seed → same sequence; different seeds → different; values in `[0,1)`.

### Task 3: Scoring
- Create `src/lib/scoring.ts` + `scoring.test.ts`.
- Tests: point curve per length; fallback above max; `starsFor` at 0/39/40/69/70/99/100%.

### Task 4: Dictionary
- Create `src/lib/dictionary.ts` + `dictionary.test.ts` (small fixture list + map).
- Tests: `hasWord` hit/miss/case; `wordsFormable` correctness with reuse, min-length, empty letters; `cefrLevel` tagged/untagged.

### Task 5: Level generator
- Create `src/lib/level-generator.ts` + `level-generator.test.ts` (fixture `DictionaryData` injected).
- Tests: determinism (same inputs → same level); 9 distinct letters; >= 3 vowels; every word set entry is a real word within band; word count within range; `meanCefrRank` math; `levelConfig` returns the expected `{ seed, band, targetCefr }` per level index.

### Task 6: Bundled data (SCOWL validity + Oxford CEFR map)
- Create `scripts/generate-dictionary.mjs` + generated `src/lib/data/words.ts` and `src/lib/data/cefr.ts`.
- Script sources SCOWL (~40k common, proper nouns excluded) and the Oxford 3000/5000 CEFR tags, then emits both modules.
- Test: smoke assertions that `words.ts` is sorted with no duplicates and `cefr.ts` keys are a subset of `words.ts`.

---

## 6. Review focus (inputs most likely to bite a real player)

| # | Input / condition | Expected behavior | Pinned by |
|---|---|---|---|
| 1 | A word longer than 9 letters (reuse) | Still scores and is counted if in band | Task 3 fallback, Task 4 |
| 2 | Letters with repeated chars in the wheel | Must be 9 *distinct* letters, never duplicated | Task 5 |
| 3 | `foundCount` 0 with `totalCount` 0 | `starsFor` returns 0, no divide-by-zero | Task 3 |
| 4 | Level index 0, negative, or > CAMPAIGN_LEVELS | `levelConfig` clamps to a valid tier/band | Task 5 |
| 5 | Word set with no target-CEFR words | Re-rolls, then returns best attempt rather than failing | Task 5 |
| 6 | Dictionary entry with uppercase/whitespace | Normalized (lowercased) before lookup | Task 4 |

---

## 7. Decisions confirmed with the user

1. **Dictionary source**: SCOWL validity list + Oxford 3000/5000 CEFR overlay
   (option b) — no runtime external dependency; both lists bundled and generated.
2. **Difficulty span**: A1–C1 (C2 dropped). 5 CEFR tiers.
3. **Campaign**: fixed, 50 levels (10 per CEFR tier); CEFR tier hidden from the player.
4. **Scoring table**: proposed values above accepted as a starting point.
