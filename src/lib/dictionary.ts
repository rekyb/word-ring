import type { CefrLevel } from '@/types/game';

export function hasWord(sortedWords: readonly string[], word: string): boolean {
  const target = word.trim().toLowerCase();
  let low = 0;
  let high = sortedWords.length - 1;
  while (low <= high) {
    const mid = (low + high) >>> 1;
    const candidate = sortedWords[mid];
    if (candidate === target) return true;
    if (candidate < target) low = mid + 1;
    else high = mid - 1;
  }
  return false;
}

export function wordsFormable(
  sortedWords: readonly string[],
  letters: readonly string[],
  minLength: number,
): string[] {
  const allowed = new Set(letters);
  return sortedWords.filter(
    (word) => word.length >= minLength && [...word].every((character) => allowed.has(character)),
  );
}

export function cefrLevel(
  cefrMap: Readonly<Record<string, CefrLevel>>,
  word: string,
): CefrLevel | undefined {
  const key = word.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(cefrMap, key) ? cefrMap[key] : undefined;
}
