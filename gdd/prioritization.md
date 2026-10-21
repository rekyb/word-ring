# Product Prioritization

How V1 scope is chosen. Criteria reflect the GDD goals: *ship a polished,
monetizable MVP to the Play Store, ~100 levels, learn/portfolio.*

## Criteria

- **Impact** — how much an item drives shipping a polished, monetizable MVP.
- **Effort** — build cost (S = small, M = medium, L = large).

## Matrix

```
             LOW effort ──────────────── HIGH effort
HIGH impact │  DO FIRST                  │  PLAN CAREFULLY
            │  • scaffold                │  • core logic (dict+generator+scoring)
            │  • progress + level map    │  • playable game screen
            │  • Play build + assets     │  • ads + remove-ads IAP
            │  • accessibility           │
            │  • analytics (quick win)   │
LOW impact  │  QUICK WINS                │  SKIP / DEFER
            │  • SFX / haptics / polish  │  • daily puzzle, leaderboards,
            │                            │    cloud sync, themes, social, i18n
```

## V1 scope (build order)

| # | Item | Effort | Why it's in |
|---|---|---|---|
| 1 | **Scaffold** — Expo + TS + expo-router + Zustand | S | Foundation; nothing else runs without it |
| 2 | **Core logic** — dictionary + `levelGenerator` + `scoring` (+ Jest tests) | L | This *is* the game; hardest part, build first |
| 3 | **Playable game screen** — wheel, submit, feedback, shuffle, progress, stars | M | Can't ship without the loop |
| 4 | **Progress + level map** — AsyncStorage + level grid | S | Structure & retention |
| 5 | **Monetization** — rewarded "reveal" + interstitial + remove-ads IAP | M | A stated goal; IAP is one purchase + a flag |
| 6 | **Analytics** — Firebase events | S | Cheap; tunes difficulty & ad throttle |
| 7 | **Polish + accessibility** — animations, SFX, haptics, tap targets, contrast, screen-reader | S–M | "Polished" is a goal; a11y is non-negotiable |
| 8 | **Ship** — Play assets (icon, screenshots, listing) + EAS build | M | Hard gate to the store |

## Out of V1 (Phase 2)

- Achievements, leaderboards, account transfer (Google Play Games Services)
- Daily streak + rewards, push notifications
- Daily puzzle
- Word definitions, personal stats
- Cloud sync, themes, social sharing, more languages

## Note on the edge case

Remove-ads IAP stays in V1 — it is the smallest monetization to finish (one
non-consumable purchase + a cached boolean) and gives players an escape hatch
from ads. The only item considered optional was Firebase Analytics, which was
kept for its tuning value at low cost.
