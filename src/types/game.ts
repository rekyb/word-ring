export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface WordBand {
  min: number;
  max: number;
}

export interface Level {
  letters: string[];
  wordSet: string[];
  minWordLength: number;
  maxWordLength: number;
  targetCefr: CefrLevel;
}

export interface LevelConfig {
  seed: number;
  band: WordBand;
  targetCefr: CefrLevel;
}

export interface DictionaryData {
  words: readonly string[];
  cefr: Readonly<Record<string, CefrLevel>>;
}
