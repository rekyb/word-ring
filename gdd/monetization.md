# Monetization

Three monetization surfaces, in order of player friction:

## 1. Rewarded ads (opt-in)

- **"Reveal" hint** — watch an ad to reveal a random unfound word.
- The reward is granted even if the ad fails to load — never block a player.

## 2. Interstitial ads (on level clear)

- Shown after a level clears, before the next level.
- **Throttled** (e.g., max 1 per 2–3 levels) to avoid annoyance.

## 3. Remove Ads IAP (one-time, non-consumable)

- Disables both rewarded-for-hint friction and interstitials for the paying player.
- Cached flag locally; **restore purchase** available in settings.

## Offline behavior

Ads, IAP, and analytics **no-op gracefully** when offline. Gameplay is fully offline.

## Analytics events

Tracked via Firebase Analytics to tune difficulty and monetization:

- `level_start` (level index)
- `level_complete` (level, stars, words found, duration)
- `word_found` (length)
- `hint_shuffle_used`
- `hint_reveal_used`
- `ad_reward_granted`
- `interstitial_shown`
- `iap_remove_ads_purchased`
