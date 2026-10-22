import { WORDS, WORD_COUNT, WORD_RECORD_WIDTH, WORD_TIERS } from '@/lib/data/words';
import { CEFR_LEVELS } from '@/constants/game';
import { cefrLevel, hasWord, wordsFormable } from '@/lib/dictionary';

function wordAt(index: number): string {
  const start = index * WORD_RECORD_WIDTH;
  return WORDS.slice(start, start + WORD_RECORD_WIDTH).trim();
}

describe('bundled dictionary', () => {
  it('exposes a consistent number of words and tiers', () => {
    expect(WORD_COUNT).toBe(WORD_TIERS.length);
    expect(WORDS.length).toBe(WORD_COUNT * WORD_RECORD_WIDTH);
  });

  it('is sorted and free of duplicates', () => {
    const seen = new Set<string>();
    let previous = '';
    for (let i = 0; i < WORD_COUNT; i++) {
      const word = wordAt(i);
      expect(word.length).toBeGreaterThan(0);
      expect(word > previous).toBe(true);
      expect(seen.has(word)).toBe(false);
      seen.add(word);
      previous = word;
    }
  });

  it('contains only lowercase alphabetic words', () => {
    for (let i = 0; i < WORD_COUNT; i++) {
      expect(wordAt(i)).toMatch(/^[a-z]+$/);
    }
  });

  it('gives every word a known tier', () => {
    for (let i = 0; i < WORD_COUNT; i++) {
      const code = Number(WORD_TIERS[i]);
      expect(code).toBeGreaterThanOrEqual(1);
      expect(code).toBeLessThanOrEqual(CEFR_LEVELS.length);
    }
  });

  it('covers every tier', () => {
    const counts = new Map<string, number>();
    for (let i = 0; i < WORD_COUNT; i++) {
      const tier = CEFR_LEVELS[Number(WORD_TIERS[i]) - 1];
      counts.set(tier, (counts.get(tier) ?? 0) + 1);
    }
    CEFR_LEVELS.forEach((tier) => {
      expect(counts.get(tier) ?? 0).toBeGreaterThan(0);
    });
  });

  it('excludes proper nouns', () => {
    expect(hasWord([...Array(WORD_COUNT).keys()].map(wordAt), 'london')).toBe(false);
    expect(hasWord([...Array(WORD_COUNT).keys()].map(wordAt), 'paris')).toBe(false);
  });

  it('includes everyday words', () => {
    const all = [...Array(WORD_COUNT).keys()].map(wordAt);
    expect(hasWord(all, 'cat')).toBe(true);
    expect(hasWord(all, 'house')).toBe(true);
  });

  it('finds words formable from a ring, allowing reuse', () => {
    const all = [...Array(WORD_COUNT).keys()].map(wordAt);
    const found = wordsFormable(all, ['t', 'e', 'n', 'a', 'd', 'o'], 3);
    expect(found).toContain('tenant');
    expect(found).toContain('tea');
    expect(found).not.toContain('dog');
  });

  it('maps words to their tier', () => {
    const index = [...Array(WORD_COUNT).keys()].find((i) => wordAt(i) === 'cat');
    expect(index).toBeDefined();
    const map = { [wordAt(index!)]: CEFR_LEVELS[Number(WORD_TIERS[index!]) - 1] };
    expect(cefrLevel(map, 'cat')).toBe('A1');
  });
});
