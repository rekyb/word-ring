import { cefrLevel, hasWord, wordsFormable } from '@/lib/dictionary';

const WORDS = ['ant', 'apple', 'cat', 'cats', 'dog', 'eat', 'net', 'tan', 'tenant', 'tent'];

describe('hasWord', () => {
  it('finds words present in the sorted list', () => {
    expect(hasWord(WORDS, 'cat')).toBe(true);
    expect(hasWord(WORDS, 'tenant')).toBe(true);
  });

  it('rejects words missing from the list', () => {
    expect(hasWord(WORDS, 'cow')).toBe(false);
    expect(hasWord(WORDS, 'zebra')).toBe(false);
  });

  it('normalizes case and surrounding whitespace before lookup', () => {
    expect(hasWord(WORDS, 'CAT')).toBe(true);
    expect(hasWord(WORDS, '  dog ')).toBe(true);
  });
});

describe('wordsFormable', () => {
  it('returns words whose characters are all in the letters, reuse allowed', () => {
    const letters = ['t', 'e', 'n', 'a', 'd', 'o'];
    expect(wordsFormable(WORDS, letters, 3)).toEqual([
      'ant',
      'eat',
      'net',
      'tan',
      'tenant',
      'tent',
    ]);
  });

  it('respects the minimum length', () => {
    const letters = ['t', 'e', 'n', 'a', 'd', 'o'];
    expect(wordsFormable(WORDS, letters, 5)).toEqual(['tenant']);
  });

  it('returns an empty list when no letters are given', () => {
    expect(wordsFormable(WORDS, [], 3)).toEqual([]);
  });
});

describe('cefrLevel', () => {
  const CEFR = { cat: 'A1', tent: 'A2' } as const;

  it('returns the CEFR tag for a tagged word', () => {
    expect(cefrLevel(CEFR, 'cat')).toBe('A1');
  });

  it('returns undefined for an untagged word', () => {
    expect(cefrLevel(CEFR, 'tenant')).toBeUndefined();
  });

  it('does not treat inherited object keys as tags', () => {
    expect(cefrLevel(CEFR, 'constructor')).toBeUndefined();
  });
});
