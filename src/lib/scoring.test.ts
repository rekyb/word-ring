import { scoreWord, starsFor } from '@/lib/scoring';

describe('scoreWord', () => {
  it('scores by word length from the table', () => {
    expect(scoreWord('cat')).toBe(3);
    expect(scoreWord('house')).toBe(8);
    expect(scoreWord('planets')).toBe(18);
  });

  it('falls back to the nearest table value above the max length', () => {
    expect(scoreWord('assessment')).toBe(35);
  });

  it('clamps words shorter than the minimum to the minimum score', () => {
    expect(scoreWord('go')).toBe(3);
  });
});

describe('starsFor', () => {
  it('returns 0 when there are no words to find', () => {
    expect(starsFor(0, 0)).toBe(0);
  });

  it.each([
    [39, 100, 0],
    [40, 100, 1],
    [69, 100, 1],
    [70, 100, 2],
    [99, 100, 2],
    [100, 100, 3],
  ])('found %i of %i gives %i stars', (found, total, stars) => {
    expect(starsFor(found, total)).toBe(stars);
  });
});
