import { WORDS, WORD_COUNT, WORD_RECORD_WIDTH, WORD_TIERS } from '@/lib/data/words';
import { CEFR_LEVELS, LEVELS_PER_CEFR, MAX_WORDS, MIN_WORDS } from '@/constants/game';
import { generateLevel, isAcceptable, levelConfig } from '@/lib/level-generator';
import type { CefrLevel, DictionaryData } from '@/types/game';

const words: string[] = [];
for (let i = 0; i < WORD_COUNT; i++) {
  const start = i * WORD_RECORD_WIDTH;
  words.push(WORDS.slice(start, start + WORD_RECORD_WIDTH).trim());
}
const cefr: Record<string, CefrLevel> = {};
words.forEach((word, index) => {
  cefr[word] = CEFR_LEVELS[Number(WORD_TIERS[index]) - 1];
});
const DICT: DictionaryData = { words, cefr };

describe('generation against the bundled dictionary', () => {
  it.each(CEFR_LEVELS)('produces a playable %s level', (tier) => {
    const config = levelConfig(CEFR_LEVELS.indexOf(tier) * LEVELS_PER_CEFR + 1);
    const level = generateLevel(config.seed, config.band, tier, DICT);
    expect(level.letters).toHaveLength(9);
    expect(level.wordSet.length).toBeGreaterThanOrEqual(MIN_WORDS);
    expect(level.wordSet.length).toBeLessThanOrEqual(MAX_WORDS);
    level.wordSet.forEach((word) => {
      expect(DICT.words).toContain(word);
      [...word].forEach((character) => expect(level.letters).toContain(character));
    });
  });

  it('produces a deterministic level for a given seed', () => {
    const config = levelConfig(25);
    expect(generateLevel(config.seed, config.band, config.targetCefr, DICT)).toEqual(
      generateLevel(config.seed, config.band, config.targetCefr, DICT),
    );
  });

  it('keeps every level within the campaign range', () => {
    for (let levelIndex = 1; levelIndex <= 50; levelIndex++) {
      const config = levelConfig(levelIndex);
      const level = generateLevel(config.seed, config.band, config.targetCefr, DICT);
      expect(level.targetCefr).toBe(config.targetCefr);
      expect(level.minWordLength).toBe(config.band.min);
      expect(level.maxWordLength).toBe(config.band.max);
      expect(isAcceptable(level.wordSet, config.band, config.targetCefr, DICT.cefr)).toBe(true);
    }
  });
});
