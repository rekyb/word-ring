# Levels & Generation

> **Implementation plan (TRD):** `plans/2026-10-22-core-logic.md`

Levels are **generated deterministically on-device** — there is no server, no bundled
level pack, and no hand-authoring. Level *N* always produces the same wheel and word
set on every device.

## Dictionary

- Two bundled, read-only lists (no runtime dependency):
  - **Validity** — SCOWL-derived common words (~40k); proper nouns excluded.
  - **CEFR overlay** — the Oxford 3000/5000 subset (~5k words) tagged A1–C1, used
    only for difficulty.
- Size-optimized for fast lookup at runtime.
- Format: sorted lowercase list with binary-search lookup; the `dictionary` module
  owns lookup and hides the format. Details in the implementation plan.

## Word-length band

Each level declares a `[minWordLength, maxWordLength]` band:

- **Early levels:** 3–5 letters (lots of easy short words).
- **Late levels:** 4–8 letters (drops trivial 3-letter words, demands longer finds).

The band maps to the CEFR tier (see Difficulty ramp). The generator computes *all*
valid 3+ letter words from the 9 letters, then keeps only words within the band as
the level's word set. Words outside the band simply don't count.

## Algorithm

For level index `N`:

1. Derive a **seed** from `N`.
2. **Pick 9 distinct letters**, weighted toward common letters, always including
   enough vowels.
3. **Compute the word set** — every valid 3+ letter word from those letters
   (allowing reuse).
4. **Apply the word-length band** and trim ultra-rare words.
5. **Validate the result**: word count within target range, a good mix of lengths
   including a couple of long words, and the CEFR mix matching the level's tier.
6. If the result is out of range, **advance the seed and re-roll** — still
   deterministic.

## Difficulty ramp

Difficulty is defined by the answer key's **CEFR level** (Oxford-tagged words).
The player never sees the tier; it only shows up as words getting harder.

1. **CEFR tier** (primary): levels progress A1 → A2 → B1 → B2 → C1.
2. **Letter rarity** (mechanism): the generator samples rarer letters at higher
   tiers to produce the target CEFR mix.
3. **Word-length band** shifts up and widens (3–5 early, 5–8 late).
4. **Total word count** increases.

The campaign is a fixed **50 levels** (10 per CEFR tier). The generator can still
produce any level number if the campaign is extended later.

## Output

Each generated level yields:

- `letters` — the 9 ring letters
- `wordSet` — the valid words (the answer key)
- `minWordLength`, `maxWordLength`
- star thresholds (global constants, or per-level overrides)
- `targetCefr` — the level's internal difficulty tier (hidden from the player)
