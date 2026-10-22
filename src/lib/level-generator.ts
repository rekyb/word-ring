import {
  CAMPAIGN_LEVELS,
  CEFR_LEVELS,
  CEFR_ORDER,
  LEVEL_SEED_STEP,
  LEVELS_PER_CEFR,
  LETTER_WEIGHTS,
  MAX_BY_CEFR,
  MAX_REROLLS,
  MAX_WORDS,
  MIN_BY_CEFR,
  MIN_LONG_WORDS,
  MIN_VOWELS,
  MIN_WORDS,
  VOWELS,
  WHEEL_SIZE,
} from '@/constants/game';
import { cefrLevel, wordsFormable } from '@/lib/dictionary';
import { mulberry32 } from '@/lib/prng';
import type { CefrLevel, DictionaryData, Level, LevelConfig, WordBand } from '@/types/game';

const LETTERS = Object.keys(LETTER_WEIGHTS);
const UNIFORM_WEIGHT =
  Object.values(LETTER_WEIGHTS).reduce((sum, weight) => sum + weight, 0) / LETTERS.length;
const VOWEL_SET: ReadonlySet<string> = new Set<string>(VOWELS);

type Attempt = {
  letters: string[];
  wordSet: string[];
  acceptable: boolean;
};

export function levelConfig(levelIndex: number): LevelConfig {
  const requested = Number.isFinite(levelIndex) ? Math.trunc(levelIndex) : 1;
  const index = Math.min(Math.max(requested, 1), CAMPAIGN_LEVELS);
  const targetCefr = CEFR_LEVELS[Math.ceil(index / LEVELS_PER_CEFR) - 1];
  return {
    seed: index * LEVEL_SEED_STEP,
    band: { min: MIN_BY_CEFR[targetCefr], max: MAX_BY_CEFR[targetCefr] },
    targetCefr,
  };
}

/**
 * Words a level offers: every word the ring can spell that belongs to the
 * level's own difficulty tier and fits the length band. A level therefore
 * asks for words of a particular kind of difficulty, and the ring's letters
 * are chosen to make that set land in the target size.
 */
export function levelWords(
  dict: DictionaryData,
  letters: readonly string[],
  band: WordBand,
  targetCefr: CefrLevel,
): string[] {
  return wordsFormable(dict.words, letters, band.min).filter(
    (word) => word.length <= band.max && cefrLevel(dict.cefr, word) === targetCefr,
  );
}

export function isAcceptable(
  wordSet: readonly string[],
  band: WordBand,
  targetCefr: CefrLevel,
  cefrMap: Readonly<Record<string, CefrLevel>>,
): boolean {
  if (wordSet.length < MIN_WORDS || wordSet.length > MAX_WORDS) return false;
  const longWords = wordSet.filter((word) => word.length >= band.max - 1).length;
  if (longWords < MIN_LONG_WORDS) return false;
  return wordSet.every((word) => cefrLevel(cefrMap, word) === targetCefr);
}

export function generateLevel(
  seed: number,
  band: WordBand,
  targetCefr: CefrLevel,
  dict: DictionaryData,
): Level {
  let best = evaluateAttempt(seed, band, targetCefr, dict, 0);
  if (best.acceptable) return toLevel(best, band, targetCefr);

  for (let attempt = 1; attempt <= MAX_REROLLS; attempt++) {
    const candidate = evaluateAttempt(seed, band, targetCefr, dict, attempt);
    if (candidate.acceptable) return toLevel(candidate, band, targetCefr);
    if (candidate.wordSet.length > best.wordSet.length) best = candidate;
  }
  return toLevel(best, band, targetCefr);
}

function evaluateAttempt(
  seed: number,
  band: WordBand,
  targetCefr: CefrLevel,
  dict: DictionaryData,
  attempt: number,
): Attempt {
  const rand = mulberry32(seed + attempt);
  const rarity = (CEFR_ORDER[targetCefr] - 1) / (CEFR_LEVELS.length - 1);
  const letters = ensureVowels(pickLetters(rand, rarity));
  const wordSet = levelWords(dict, letters, band, targetCefr);
  return {
    letters,
    wordSet,
    acceptable: isAcceptable(wordSet, band, targetCefr, dict.cefr),
  };
}

function pickLetters(rand: () => number, rarity: number): string[] {
  const pool = LETTERS.map((letter) => ({
    letter,
    weight: UNIFORM_WEIGHT + (LETTER_WEIGHTS[letter] - UNIFORM_WEIGHT) * (1 - rarity),
  }));
  const picked: string[] = [];
  while (picked.length < WHEEL_SIZE) {
    const total = pool.reduce((sum, candidate) => sum + candidate.weight, 0);
    let roll = rand() * total;
    let index = 0;
    while (index < pool.length - 1 && roll >= pool[index].weight) {
      roll -= pool[index].weight;
      index++;
    }
    picked.push(pool[index].letter);
    pool.splice(index, 1);
  }
  return picked;
}

function ensureVowels(letters: string[]): string[] {
  const result = [...letters];
  let vowelCount = result.filter((letter) => VOWEL_SET.has(letter)).length;
  for (const vowel of VOWELS) {
    if (vowelCount >= MIN_VOWELS) break;
    if (result.includes(vowel)) continue;
    const swapIndex = lowestWeightConsonantIndex(result);
    if (swapIndex === -1) break;
    result[swapIndex] = vowel;
    vowelCount++;
  }
  return result;
}

function lowestWeightConsonantIndex(letters: readonly string[]): number {
  let found = -1;
  letters.forEach((letter, index) => {
    if (VOWEL_SET.has(letter)) return;
    if (found === -1 || LETTER_WEIGHTS[letter] < LETTER_WEIGHTS[letters[found]]) {
      found = index;
    }
  });
  return found;
}

function toLevel(attempt: Attempt, band: WordBand, targetCefr: CefrLevel): Level {
  return {
    letters: attempt.letters,
    wordSet: attempt.wordSet,
    minWordLength: band.min,
    maxWordLength: band.max,
    targetCefr,
  };
}
