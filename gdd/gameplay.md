# Gameplay

## The wheel

- A ring of **9 distinct letters** (no duplicate letters, no special center letter).
- The word currently being built is shown in the center of the ring.
- Tap letters in any order to build a word.
- **Letters may be reused** within a single word.

## Rules

- **Minimum word length:** set per level by the word-length band (see
  [Levels & Generation](levels.md)). Default minimum is 3.
- Submit a word by tapping the submit control. Three outcomes:

| Outcome | Feedback | Penalty |
|---|---|---|
| Valid & new | Added to the found list, progress fills, pop + haptic | none |
| Invalid (not a word) | Gentle shake | none |
| Already found | Subtle toast | none |

- **No fail state.** There is no way to lose a level.

## Progression & stars

A level clears when the player finds enough of the level's valid words. Stars are
awarded by **percentage of the level's word set found**:

| Stars | Words found |
|---|---|
| ★ | 40% |
| ★★ | 70% |
| ★★★ | 100% |

Thresholds are tunable constants, not hard-coded per level.

## Scoring

- Each word earns length-based points; longer words are worth disproportionately more.
- Score is a fun number only — **stars, not score, gate progression.**

## Hints

- **Shuffle** — free, reorders the letters on the ring.
- **Reveal** — rewarded ad; reveals a random unfound word.

## Session length

1–3 minutes per level. No timer forces the session to end; the player leaves when
they choose.
