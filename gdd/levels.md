# Levels & Generation

Levels are **generated deterministically on-device** — there is no server, no bundled
level pack, and no hand-authoring. Level *N* always produces the same wheel and word
set on every device.

## Dictionary

- Bundled, read-only English word list (SCOWL-derived, ~30–50k common words).
- **Proper nouns excluded.**
- Size-optimized for fast lookup at runtime.
- Exact format (plain text + binary search, trie, or packed set) is decided during
  implementation; the `dictionary` module owns lookup and hides the format.

## Word-length band

Each level declares a `[minWordLength, maxWordLength]` band:

- **Early levels:** 3–5 letters (lots of easy short words).
- **Late levels:** 4–8 letters (drops trivial 3-letter words, demands longer finds).

The generator computes *all* valid 3+ letter words from the 9 letters, then keeps
only words within the band as the level's word set. Words outside the band simply
don't count.

## Algorithm

For level index `N`:

1. Derive a **seed** from `N`.
2. **Pick 9 distinct letters**, weighted toward common letters, always including
   enough vowels.
3. **Compute the word set** — every valid 3+ letter word from those letters
   (allowing reuse).
4. **Apply the word-length band** and trim ultra-rare words.
5. **Validate the result**: word count within target range, a good mix of lengths
   including a couple of long words.
6. If the result is out of range, **advance the seed and re-roll** — still
   deterministic.

## Difficulty ramp

Difficulty scales on three levers as levels progress:

1. **Letter rarity** increases (common → rarer letters).
2. **Word-length band** shifts up and widens.
3. **Total word count** increases.

## Output

Each generated level yields:

- `letters` — the 9 ring letters
- `wordSet` — the valid words (the answer key)
- `minWordLength`, `maxWordLength`
- star thresholds (global constants, or per-level overrides)
