# Architecture

## Stack

- **Expo (managed workflow) + TypeScript**
- **EAS Build** for the Play Store `.aab`
- **expo-router** for navigation (file-based)
- **Zustand** for light global state
- **AsyncStorage** for persisted progress
- **AdMob** (`react-native-google-mobile-ads` via Expo config plugin) — rewarded + interstitial
- **react-native-iap** for the remove-ads purchase (Google Play Billing)
- **Firebase Analytics** for event tracking

## Modules

Each module has a single responsibility:

| Module | Job |
|---|---|
| `dictionary` | Load the bundled word list; fast "is this a word?" lookup |
| `levelGenerator` | Pure, seeded: letters → word set → band filter → level spec |
| `scoring` | Points from word length; star rating from % found |
| `progress` | Persist/load stars and completed levels via AsyncStorage |
| `ads` | Wrapper for rewarded + interstitial; graceful offline/failure |
| `iap` | Remove-ads purchase + restore + cached flag |
| `analytics` | Thin wrapper around Firebase events |

`dictionary`, `levelGenerator`, and `scoring` are **pure functions** so they can be
unit-tested with Jest without a device.

## Data flow

```
launch → load dictionary (lazy) → load progress → level map
open level N → levelGenerator(N) → {letters, wordSet, band, thresholds} → render wheel
tap letters → build candidate → submit → dictionary.lookup:
   valid+new → scoring → progress fill → save → feedback (pop + haptic)
   invalid    → shake (no penalty)
   duplicate  → toast (no penalty)
progress ≥ ★1 → level cleared → confetti → interstitial (throttled) → next level
```

## Error handling & edge cases

- **Dictionary gaps:** comprehensive list; a rare "not a word" rejection is
  low-stakes since there is no fail state.
- **Offline:** fully playable; ads/IAP/analytics degrade silently.
- **Ad/IAP failure:** fall back gracefully — grant the reward, skip the interstitial,
  restore the cached purchase flag.
- **Corrupt progress:** try/catch on AsyncStorage reads with sane defaults.
- **Proper nouns** excluded from the dictionary.
