// Words excluded from the bundled dictionary because they are unsuitable for a
// chill, family-friendly word game.
//
// ESDB is a spelling dictionary, not a suitability dictionary. It flags the
// slurs it knows about with usage notes, but plenty of mild profanity and
// crude words carry no note at all ("bitch", "damn", "penis", "poop") and
// would otherwise ship in the answer key.
//
// Kept separate from the generator so the list is reviewable on its own.
export const BLOCKED_WORDS = [
  // Slurs and identity-based insults.
  'chink', 'coon', 'dyke', 'fag', 'faggot', 'gook', 'kike', 'nigger', 'paki',
  'retard', 'retarded', 'spic', 'tranny', 'wop', 'yid',
  // Sexual and crude terms.
  'anal', 'anus', 'arse', 'arsehole', 'ass', 'asshole', 'ballsack', 'bastard',
  'bitch', 'bollocks', 'boner', 'boob', 'boobs', 'bugger', 'clit', 'cock',
  'coon', 'crap', 'cum', 'cunt', 'dick', 'dildo', 'ejaculate', 'fanny', 'fuck',
  'goddamn', 'hell', 'hump', 'jackoff', 'jerkoff', 'jism', 'jizz', 'knob',
  'labia', 'nutsack', 'orgasm', 'penis', 'piss', 'pissed', 'porn', 'pube',
  'prick', 'pussy', 'queef', 'scrotum', 'sex', 'shit', 'slag', 'slut', 'spunk',
  'tit', 'tits', 'turd', 'twat', 'vagina', 'wank', 'whore',
  // Crude or unpleasant filler.
  'burp', 'damn', 'fart', 'mucus', 'pee', 'phlegm', 'poop', 'puke', 'snot',
  'vomit',
];

export const BLOCKED_WORD_SET = new Set(BLOCKED_WORDS);
