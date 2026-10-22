import type { CefrLevel } from '@/types/game';

export const WHEEL_SIZE = 9;
export const VOWELS = ['a', 'e', 'i', 'o', 'u'] as const;
export const MIN_VOWELS = 3;

export const STAR_THRESHOLDS = [0.4, 0.7, 1.0] as const;

export const SCORE_BY_LENGTH: Readonly<Record<number, number>> = {
  3: 3,
  4: 5,
  5: 8,
  6: 12,
  7: 18,
  8: 25,
  9: 35,
};

export const LETTER_WEIGHTS: Readonly<Record<string, number>> = {
  a: 8,
  b: 1.5,
  c: 2.8,
  d: 4.3,
  e: 12,
  f: 2.2,
  g: 2,
  h: 6,
  i: 7,
  j: 0.15,
  k: 0.8,
  l: 4,
  m: 2.4,
  n: 7,
  o: 7.5,
  p: 1.9,
  q: 0.1,
  r: 6,
  s: 6.3,
  t: 9,
  u: 2.8,
  v: 1,
  w: 2.4,
  x: 0.15,
  y: 2,
  z: 0.07,
};

export const CEFR_ORDER: Readonly<Record<CefrLevel, number>> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
};
export const NEUTRAL_CEFR_RANK = 3;
export const CEFR_TOLERANCE = 0.75;
export const CEFR_LEVELS: readonly CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
export const LEVELS_PER_CEFR = 10;
export const CAMPAIGN_LEVELS = 50;
export const LEVEL_SEED_STEP = 2654435761;

export const MIN_BY_CEFR: Readonly<Record<CefrLevel, number>> = {
  A1: 3,
  A2: 3,
  B1: 4,
  B2: 4,
  C1: 5,
};
export const MAX_BY_CEFR: Readonly<Record<CefrLevel, number>> = {
  A1: 5,
  A2: 6,
  B1: 7,
  B2: 8,
  C1: 8,
};

export const MIN_WORDS = 20;
export const MAX_WORDS = 80;
export const MIN_LONG_WORDS = 2;
export const MAX_REROLLS = 20;
