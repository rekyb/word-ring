# Levels & Generation

> **Implementation plan (TRD):** `plans/2026-10-22-core-logic.md`

Levels are **generated deterministically on-device** — there is no server, no bundled
level pack, and no hand-authoring. Level *N* always produces the same wheel and word
set on every device.

## Dictionary

- Bundled, read-only word list derived from the **English Speller Database**
  (ESDB, formerly SCOWLv2), MIT-like licensed so it can be bundled freely.
  ~79k common words, lowercase, 3-8 letters, **proper nouns excluded**.
- **Difficulty tiers** come from ESDB's own frequency bands (35 = smallest and
  most common, 80 = valid but unusual), mapped to five tiers: A1, A2, B1, B2, C1.
  This is our own spec, benchmarked against the CEFR scale but not taken from
  Oxford's data. The tier is never shown to the player.
- Size-optimized for fast lookup at runtime.
- Format: sorted lowercase list with binary-search lookup; the `dictionary`
  module owns lookup and hides the format. Details in the implementation plan.

## Word-length band

Each level declares a `[minWordLength, maxWordLength]` band:

- **Early levels:** 3–3 letters (lots of easy short words).
- **Late levels:** 4–7 letters (drops trivial 3-letter words, demands longer finds).

The band maps to the difficulty tier (see Difficulty ramp). The generator computes
*all* valid 3+ letter words from the 9 letters, then keeps only the words that are
both within the band **and at the level's difficulty tier**. Words outside the
band or tier simply don't count.

## Algorithm

For level index `N`:

1. Derive a **seed** from `N`.
2. **Pick 9 distinct letters**, weighted toward common letters, always including
   enough vowels.
3. **Compute the word set** — every valid 3+ letter word from those letters
   (allowing reuse).
4. **Keep the words at the level's tier** and within the word-length band.
5. **Validate the result**: word count within target range, a good mix of lengths
   including a couple of long words, and every word at the level's tier.
6. If the result is out of range, **advance the seed and re-roll** — still
   deterministic.

## Difficulty ramp

Difficulty is defined by the answer key's **difficulty tier** (derived from word
frequency). The player never sees the tier; it only shows up as words getting
harder.

1. **Tier** (primary): levels progress A1 → A2 → B1 → B2 → C1.
2. **Letter rarity** (mechanism): the generator samples rarer letters at higher
   tiers to produce the target mix.
3. **Word-length band** shifts up and widens (3-3 early, 4-7 late).
4. **Total word count** increases.

The campaign is a fixed **50 levels** (10 per tier). The generator can still
produce any level number if the campaign is extended later.

## Output

Each generated level yields:

- `letters` — the 9 ring letters
- `wordSet` — the valid words (the answer key)
- `minWordLength`, `maxWordLength`
- star thresholds (global constants, or per-level overrides)
- `targetCefr` — the level's internal difficulty tier (hidden from the player)
