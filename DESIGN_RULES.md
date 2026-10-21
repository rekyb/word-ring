# DESIGN_RULES — Word Ring visual direction

Word Ring's visual identity: a calm, confident, editorial word puzzle. This
document is the **direction** (the soul: palette, typography, mood). It does not
reject slop; that is the anti-slop filter's job (`.opencode/skills/`). Direction
and filter are two separate jobs: this file says what the UI should be,
anti-slop stops what it should not become.

## 1. Identity & mood

- **Personality:** calm, confident, refined. A quiet premium word puzzle, not an arcade toy.
- **Mood:** "pure chill" as a focused ritual. Generous whitespace, nothing shouts.
- **The swap test:** if the word and product name were swapped out, the design
  should still feel specific to Word Ring, because of the ring motif, the serif
  word, and the restrained honey accent.

## 2. Palette

Two neutrals plus one accent (anti-slop R-29). Semantic colors are functional,
not part of the core palette.

| Token | Hex | Use |
|---|---|---|
| cream | `#FBF9F4` | screen background |
| white | `#FFFFFF` | surface (cards, wheel plate) |
| ink | `#1F1B16` | primary text, icons |
| muted | `#6B6357` | secondary text (4.5:1 or better on cream/white) |
| honey | `#D99A2B` | the one accent: stars, progress, correct word |
| amber-ink | `#8A5A00` | accent-colored text (meets contrast) |
| hairline | `#E8E2D8` | borders and dividers (decorative only) |
| danger | `#B5432E` | invalid word (paired with shake, never color alone) |

- `honey` is for graphics and large elements, not small body text. For
  accent-colored text, use `amber-ink`.
- Verify any text/background pairing with
  `.opencode/skills/antislop-human/contrast-check.py` before shipping (R-25).

## 3. Typography

Chosen for character, not as a default (anti-slop R-06).

| Role | Font | Notes |
|---|---|---|
| The word, found words | **Fraunces** (serif) | carries the lexical, editorial identity |
| UI, labels, numbers | **Manrope** (sans) | the quiet, warm workhorse |

- Load via `@expo-google-fonts/fraunces` and `@expo-google-fonts/manrope`.
- Rough scale (finalize in the UI): display word 32–40 Fraunces SemiBold;
  screen title 28 Fraunces; body/labels 16 Manrope; buttons 16 Manrope 600;
  captions 12 Manrope.
- Keep the type scale small and consistent. Hierarchy comes from size and
  weight, not from adding fonts.

## 4. Shape, spacing, elevation

- **Radius:** restrained, not pill-shaped. ~8px cards, ~10px buttons. The wheel
  is a circle, the one deliberate round element.
- **Spacing:** a small 4px-based scale (4, 8, 12, 16, 24, 32, 48). Generous
  vertical whitespace.
- **Elevation:** subtle. One soft shadow for the wheel plate, none elsewhere. No glow.
- **Forbidden by default:** gradients, glassmorphism, background grids, neon,
  glow everywhere. Each of these fails the purpose test unless a stated reason
  overrides it (anti-slop R-01, R-07, R-10, R-13).

## 5. The ring (identity motif)

Nine letters in a circle is the one visual signature, repeated across the game:
the wheel on the game screen, mini-rings as level tiles on the map. One focal
point per screen, and the ring is it.

## 6. Motion

Motion is feedback only, never decoration (anti-slop R-19). The GDD's three beats:

- pop on a valid word,
- shake on an invalid word,
- confetti on level clear.

No entrance, parallax, or floating loops. MOTION dial = 1.

## 7. States & accessibility

- Every data view has empty, loading, and error states (anti-slop R-27).
- Contrast: text 4.5:1 or better, large text 3:1 or better (R-25).
- Tap targets 44px or larger (R-03, antislop-human).
- Colorblind-safe: state is never conveyed by color alone. Correct = honey +
  pop + check; invalid = terracotta + shake. Both read without color.
- Screen-reader labels on every interactive element (wheel letters, buttons, progress).

## 8. anti-slop dials

- ENERGY 1 (calm), RHYTHM 1 (uniform and predictable), MOTION 1 (states only).
- One-line Design Read: "Reading this as: a casual word puzzle for English
  speakers 18–45, in a clean editorial style, dial ENERGY 1 / RHYTHM 1 / MOTION 1."

## 9. The filter

anti-slop is vendored under `.opencode/skills/`
(source: github.com/miqdadbadjuber/anti-slop, v3.2.21, MIT). Before any UI,
copy, accessibility, mobile-layout, or code-comment work, load the core plus the
relevant skill:

- core (always): `@antislop`
- UI / visual: `@antislop-ui`
- copy & text: `@antislop-copywriting`
- accessibility: `@antislop-human`
- mobile / responsive: `@antislop-layoutmobile`
- code comments: `@antislop-code`

This document (direction) and those skills (filter) are complementary. A sterile
result means direction was missing, not that the filter failed (anti-slop R-37).
