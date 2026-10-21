# Word Ring — Game Design Document

**Working title:** Word Ring
**Genre:** Hyper-casual word puzzle
**Platform:** Android (React Native + Expo, cross-platform-ready)
**Audience:** Casual word-game players, English speakers, 18–45, short play sessions
**Status:** Design approved — pre-implementation

## Pitch

Spell words from a ring of nine letters. Fill the progress bar to clear each level
and earn up to three stars. No timer, no lives, no pressure — a pure-chill word
puzzle you can pick up for one level or an hour.

## Core loop

```
open level → spell words from a letter ring → fill progress → earn 1–3 stars → next level
```

## Design pillars

1. **Chill first.** No fail state, no timer, no lives. Wrong guesses cost nothing.
2. **One-tap, one-word.** The core action is tapping letters; anything else is a light touch.
3. **Short sessions.** A level takes 1–3 minutes; ideal for commutes and breaks.
4. **Endless, free content.** Levels are generated deterministically on-device, so
   hundreds of levels cost nothing to produce.

## Success criteria

- Ship a polished MVP to the Google Play Store.
- Reach ~100 playable levels at launch (effectively free to scale via generation).
- Retain via the 1–3 star loop; monetize via rewarded ads, interstitial ads, and a
  one-time "remove ads" purchase.
- Serve as a portfolio piece demonstrating a full RN + Expo game from design to release.
