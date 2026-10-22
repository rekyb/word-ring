// Generates the bundled dictionary from the English Speller Database (ESDB).
//
// Source: https://github.com/en-wl/wordlist (scowl.txt, pinned commit below).
// ESDB is distributed under an MIT-like licence; see the notice in this file.
//
// Usage:
//   node scripts/generate-dictionary.mjs            # generate src/lib/data/words.ts
//   node scripts/generate-dictionary.mjs --stats    # print tier statistics only
//
// The generated file is committed to the repo so the app ships no build step.

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_COMMIT = '7f2f4078354752045ee16a041605686561122185';
const SOURCE_URL = `https://raw.githubusercontent.com/en-wl/wordlist-diff/${SOURCE_COMMIT}/scowl.txt`;
const SOURCE_SHA256 = '3ca0f96ef1377a0e2ec4084025933afab8c8d90562257ae73638460f99d2f09c';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE_PATH = join(REPO_ROOT, '.cache', 'esdb', 'scowl.txt');
const OUTPUT_PATH = join(REPO_ROOT, 'src', 'lib', 'data', 'words.ts');

// Each record is a fixed-width, space-padded word so the bundle can be binary
// searched as a plain string, with no per-word array allocation at runtime.
const RECORD_WIDTH = 8;
const MIN_LENGTH = 3;
const MAX_LENGTH = 8;

// Difficulty tiers. Our own spec, benchmarked against the CEFR scale
// (A1 easiest -> C1 hardest) but derived from ESDB's own frequency "size"
// bands. See plans/2026-10-22-core-logic.md.
const TIER_SIZE_BANDS = [
  { tier: 'A1', maxSize: 35 },
  { tier: 'A2', maxSize: 50 },
  { tier: 'B1', maxSize: 60 },
  { tier: 'B2', maxSize: 70 },
  { tier: 'C1', maxSize: 80 },
];

const PROPER_NOUN_CLASSES = new Set([
  'person',
  'surname',
  'place',
  'name',
  'name?',
  'demonym',
  'trademark',
  'upper',
  'upper?',
]);
const EXCLUDED_POS = new Set(['abbr', 'x', 'wp', 'we', 'pre', 'suf']);
const EXCLUDED_CATEGORIES = new Set(['hacker', 'roman-numerals']);
const PROPER_NOUN_TAGS = new Set(['name', 'town']);
const REGIONS = new Set(['US', 'GB', 'CA', 'AU']);
const ANNOTATIONS = '-*@~!†';
const WORD_PATTERN = /^[a-z]+$/;

async function ensureSourceFile() {
  try {
    const cached = readFileSync(CACHE_PATH, 'utf8');
    if (createHash('sha256').update(cached).digest('hex') === SOURCE_SHA256) return cached;
  } catch {
    // No usable cache; fall through and download.
  }
  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Failed to download scowl.txt: ${response.status} ${response.statusText}`);
  }
  const body = await response.text();
  const digest = createHash('sha256').update(body).digest('hex');
  if (digest !== SOURCE_SHA256) {
    throw new Error(`scowl.txt checksum mismatch: expected ${SOURCE_SHA256}, got ${digest}`);
  }
  mkdirSync(dirname(CACHE_PATH), { recursive: true });
  writeFileSync(CACHE_PATH, body);
  return body;
}

// The head of a line is a space-separated list of "size specs", each a size
// number followed by optional [tags]. The smallest size decides frequency.
function parseHead(head) {
  const specs = [];
  let current = null;
  for (const token of head.split(/\s+/)) {
    if (token === '') continue;
    if (/^\d+$/.test(token)) {
      current = { size: Number(token), tags: new Set() };
      specs.push(current);
      continue;
    }
    if (token.startsWith('[') && token.endsWith(']')) {
      if (current) current.tags.add(token.slice(1, -1));
      continue;
    }
    if (REGIONS.has(token)) continue;
    if (EXCLUDED_CATEGORIES.has(token)) return null;
  }
  if (specs.length === 0) return null;
  const smallest = specs.reduce((a, b) => (a.size <= b.size ? a : b));
  const isProperNoun = [...smallest.tags].some(tag => PROPER_NOUN_TAGS.has(tag));
  return { size: smallest.size, isProperNoun };
}

function stripAnnotations(text) {
  let word = text.trim();
  while (word.length > 0 && ANNOTATIONS.includes(word[0])) word = word.slice(1);
  return word.replace(new RegExp(`[${ANNOTATIONS}]+$`), '');
}

// The lemma sits before the part-of-speech block, possibly preceded by a
// variant-info prefix such as "B: " or "_: ".
function cleanLemma(text) {
  let lemma = text.trim();
  const colon = lemma.lastIndexOf(': ');
  if (colon !== -1) lemma = lemma.slice(colon + 2);
  return stripAnnotations(lemma);
}

// Derived forms follow the part-of-speech block, separated by ": ". Each entry
// may carry variant info ("B: colour") or parenthesised alternatives.
function parseDerivedForms(text) {
  if (!text.startsWith(': ')) return [];
  return text
    .slice(2)
    .split(',')
    .flatMap(entry => entry.split('|'))
    .flatMap(alternative => alternative.split(/\s+/))
    .map(stripAnnotations);
}

function tierForSize(size) {
  for (const band of TIER_SIZE_BANDS) {
    if (size <= band.maxSize) return band.tier;
  }
  return null;
}

function parseDictionary(source) {
  const sizes = new Map();

  for (const rawLine of source.split('\n')) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) continue;

    const separator = line.indexOf(': ');
    if (separator === -1) continue;

    const head = parseHead(line.slice(0, separator));
    if (!head) continue;

    const body = line.slice(separator + 2);
    const posStart = body.indexOf('<');
    const posEnd = body.indexOf('>');
    if (posStart === -1 || posEnd === -1) continue;

    const posBlock = body.slice(posStart + 1, posEnd);
    const posMatch = /^([a-zA-Z_]+)(?:\/([a-zA-Z?]+))?/.exec(posBlock);
    if (!posMatch) continue;
    if (EXCLUDED_POS.has(posMatch[1])) continue;
    if (posMatch[2] && PROPER_NOUN_CLASSES.has(posMatch[2])) continue;
    if (head.isProperNoun) continue;

    const candidates = [cleanLemma(body.slice(0, posStart)), ...parseDerivedForms(body.slice(posEnd + 1))];

    for (const candidate of candidates) {
      if (candidate.length < MIN_LENGTH || candidate.length > MAX_LENGTH) continue;
      if (!WORD_PATTERN.test(candidate)) continue;
      const previous = sizes.get(candidate);
      if (previous === undefined || head.size < previous) sizes.set(candidate, head.size);
    }
  }

  return sizes;
}

function buildRecords(sizes) {
  const records = [];
  for (const [word, size] of sizes) {
    const tier = tierForSize(size);
    if (tier === null) continue;
    records.push({ word, tier });
  }
  records.sort((a, b) => (a.word < b.word ? -1 : a.word > b.word ? 1 : 0));
  return records;
}

function buildModule(records) {
  const blob = records.map(({ word }) => word.padEnd(RECORD_WIDTH, ' ')).join('');
  // One character per word, so the tier string stays parallel to the word blob.
  const tierCodes = new Map(TIER_SIZE_BANDS.map((band, index) => [band.tier, String(index + 1)]));
  const tiers = records.map(({ tier }) => tierCodes.get(tier)).join('');
  return `// AUTO-GENERATED by scripts/generate-dictionary.mjs. Do not edit by hand.
//
// Source: English Speller Database (ESDB), ${SOURCE_COMMIT}
//   https://github.com/en-wl/wordlist
//   Licensed under an MIT-like licence:
//   "Permission to use, copy, modify, distribute, and sell any part of the
//   English Speller Database (ESDB, previously known as SCOWLv2), or word
//   lists created from it, is hereby granted without fee, provided that the
//   above copyright notice appears in all copies and that both the above
//   copyright notice and this notice appear in supporting documentation."
//
// ${records.length} words, each padded to ${RECORD_WIDTH} characters and sorted.
// The parallel WORD_TIERS string holds one difficulty tier per word.

export const WORD_RECORD_WIDTH = ${RECORD_WIDTH};
export const WORD_COUNT = ${records.length};

export const WORDS = '${blob}';

export const WORD_TIERS = '${tiers}';
`;
}

const source = await ensureSourceFile();
const sizes = parseDictionary(source);
const records = buildRecords(sizes);

const counts = new Map();
for (const { tier } of records) counts.set(tier, (counts.get(tier) ?? 0) + 1);

console.log(`Parsed ${records.length} words from ESDB ${SOURCE_COMMIT}`);
for (const band of TIER_SIZE_BANDS) {
  console.log(`  ${band.tier} (size <= ${band.maxSize}): ${counts.get(band.tier) ?? 0}`);
}

if (process.argv.includes('--stats')) {
  process.exit(0);
}

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, buildModule(records));
console.log(`Wrote ${OUTPUT_PATH}`);
