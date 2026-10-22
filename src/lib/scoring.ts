import { SCORE_BY_LENGTH, STAR_THRESHOLDS } from '@/constants/game';

const MIN_SCORED_LENGTH = 3;
const MAX_SCORED_LENGTH = 9;

export function scoreWord(word: string): number {
  const length = Math.min(Math.max(word.length, MIN_SCORED_LENGTH), MAX_SCORED_LENGTH);
  return SCORE_BY_LENGTH[length];
}

export function starsFor(foundCount: number, totalCount: number): 0 | 1 | 2 | 3 {
  if (totalCount <= 0) return 0;
  const ratio = foundCount / totalCount;
  let stars = 0;
  STAR_THRESHOLDS.forEach((threshold, index) => {
    if (ratio >= threshold) stars = index + 1;
  });
  return stars as 0 | 1 | 2 | 3;
}
