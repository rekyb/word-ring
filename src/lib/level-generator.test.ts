import { NEUTRAL_CEFR_RANK, VOWELS, WHEEL_SIZE, MIN_VOWELS } from '@/constants/game';
import { generateLevel, isAcceptable, levelConfig, meanCefrRank } from '@/lib/level-generator';
import type { CefrLevel, DictionaryData, WordBand } from '@/types/game';

const FIXTURE_WORDS = [
  'ant',
  'apple',
  'arm',
  'art',
  'bake',
  'band',
  'bat',
  'bear',
  'bed',
  'bell',
  'bet',
  'bird',
  'cake',
  'cat',
  'cats',
  'dance',
  'dog',
  'door',
  'dot',
  'eat',
  'edge',
  'fan',
  'farm',
  'gate',
  'goat',
  'hand',
  'hat',
  'heart',
  'house',
  'ink',
  'kite',
  'lamp',
  'land',
  'late',
  'lemon',
  'lent',
  'mat',
  'mate',
  'meat',
  'moon',
  'nail',
  'near',
  'net',
  'nest',
  'nut',
  'oat',
  'open',
  'pan',
  'park',
  'pen',
  'plan',
  'rain',
  'rat',
  'read',
  'rest',
  'rent',
  'ring',
  'road',
  'sand',
  'seat',
  'sent',
  'shot',
  'sing',
  'star',
  'tan',
  'tank',
  'taken',
  'tale',
  'tail',
  'tame',
  'tea',
  'tenant',
  'tent',
  'tide',
  'tin',
  'toe',
  'tone',
  'tree',
  'ten',
].sort();

const FIXTURE_CEFR: Readonly<Record<string, CefrLevel>> = {
  cat: 'A1',
  dog: 'A1',
  eat: 'A1',
  house: 'A1',
  tent: 'A2',
  tenant: 'B1',
  heart: 'B1',
  taken: 'B2',
};

const DICT: DictionaryData = { words: FIXTURE_WORDS, cefr: FIXTURE_CEFR };
const BAND: WordBand = { min: 3, max: 5 };

describe('levelConfig', () => {
  it('maps the first tier to A1 with its band', () => {
    expect(levelConfig(1)).toMatchObject({
      targetCefr: 'A1',
      band: { min: 3, max: 5 },
    });
  });

  it('moves to the next tier every LEVELS_PER_CEFR levels', () => {
    expect(levelConfig(10).targetCefr).toBe('A1');
    expect(levelConfig(11).targetCefr).toBe('A2');
    expect(levelConfig(50).targetCefr).toBe('C1');
  });

  it('gives each level a distinct, stable seed', () => {
    expect(levelConfig(3).seed).toBe(levelConfig(3).seed);
    expect(levelConfig(3).seed).not.toBe(levelConfig(4).seed);
  });

  it.each([
    [0, 1],
    [-5, 1],
    [999, 50],
  ])('clamps level %i into the campaign range', (requested, clamped) => {
    expect(levelConfig(requested)).toEqual(levelConfig(clamped));
  });
});

describe('generateLevel', () => {
  it('is deterministic for the same inputs', () => {
    const first = generateLevel(12345, BAND, 'A1', DICT);
    const second = generateLevel(12345, BAND, 'A1', DICT);
    expect(second).toEqual(first);
  });

  it.each<CefrLevel>(['A1', 'A2', 'B1', 'B2', 'C1'])(
    'picks %s levels with nine distinct lowercase letters and enough vowels',
    (tier) => {
      const level = generateLevel(7, BAND, tier, DICT);
      expect(level.letters).toHaveLength(WHEEL_SIZE);
      expect(new Set(level.letters).size).toBe(WHEEL_SIZE);
      level.letters.forEach((letter) => expect(letter).toMatch(/^[a-z]$/));
      const vowelCount = level.letters.filter((letter) =>
        (VOWELS as readonly string[]).includes(letter),
      ).length;
      expect(vowelCount).toBeGreaterThanOrEqual(MIN_VOWELS);
    },
  );

  it('only returns words that are in the dictionary, formable, and within the band', () => {
    const level = generateLevel(99, BAND, 'A1', DICT);
    level.wordSet.forEach((word) => {
      expect(FIXTURE_WORDS).toContain(word);
      expect(word.length).toBeGreaterThanOrEqual(BAND.min);
      expect(word.length).toBeLessThanOrEqual(BAND.max);
      [...word].forEach((character) => expect(level.letters).toContain(character));
    });
  });

  it('falls back to a best-effort level instead of throwing on a tiny dictionary', () => {
    const tiny: DictionaryData = { words: ['cat'], cefr: {} };
    const level = generateLevel(1, BAND, 'C1', tiny);
    expect(level.letters).toHaveLength(WHEEL_SIZE);
    expect(level.targetCefr).toBe('C1');
  });
});

describe('meanCefrRank', () => {
  it('treats an empty word set as neutral', () => {
    expect(meanCefrRank([], {})).toBe(NEUTRAL_CEFR_RANK);
  });

  it('averages tagged ranks', () => {
    expect(meanCefrRank(['cat', 'tent'], { cat: 'A1', tent: 'C1' })).toBe(3);
  });

  it('counts untagged words as neutral', () => {
    expect(meanCefrRank(['cat', 'zzz'], { cat: 'A1' })).toBe(2);
  });
});

describe('isAcceptable', () => {
  const cefr: Readonly<Record<string, CefrLevel>> = { cat: 'A1', tent: 'A1' };
  const acceptableSet = [...Array<string>(18).fill('cat'), 'tent', 'tent'];

  it('accepts a set with enough words, long words, and a matching CEFR mean', () => {
    expect(isAcceptable(acceptableSet, BAND, 'A1', cefr)).toBe(true);
  });

  it('rejects a set below the minimum word count', () => {
    expect(isAcceptable(acceptableSet.slice(0, 19), BAND, 'A1', cefr)).toBe(false);
  });

  it('rejects a set without enough long words', () => {
    expect(isAcceptable(Array<string>(20).fill('cat'), BAND, 'A1', cefr)).toBe(false);
  });

  it('rejects a set whose CEFR mean is off target', () => {
    expect(isAcceptable(acceptableSet, BAND, 'C1', cefr)).toBe(false);
  });
});
