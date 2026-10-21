# Testing & QA

## Unit tests (Jest)

Pure logic is unit-tested without a device:

- **`levelGenerator`**
  - Determinism: same seed → same level.
  - Word-set validity: every word is a real dictionary word made from the letters.
  - Band filtering: all words fall within `[minWordLength, maxWordLength]`.
  - Word count within target range.
  - Letter distribution includes vowels.
- **`dictionary`** — lookup correctness, proper-noun exclusion.
- **`scoring`** — point curve, star thresholds.

## Manual QA checklist

- Difficulty feel across the level ramp.
- Hint flow (shuffle + rewarded reveal).
- IAP purchase and restore.
- Offline behavior (no crashes, graceful degradation).
- Accessibility pass (contrast, tap targets, screen-reader).

## Deferred

- Detox end-to-end tests (deferred).
