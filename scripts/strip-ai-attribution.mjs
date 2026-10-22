// Strips AI attribution lines from a commit message file (husky commit-msg hook).
// DEV_RULES.md §11: no AI attribution in commit messages.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// The husky commit-msg hook passes .git/COMMIT_EDITMSG as $1. Pin to that file
// so a crafted argument can't read or write an arbitrary path.
const commitMsg = resolve('.git/COMMIT_EDITMSG');
if (!process.argv[2] || resolve(process.argv[2]) !== commitMsg) process.exit(0);

const attribution =
  /^(co-authored-by|generated (?:with|by)|created (?:with|by)|assisted (?:with|by)):?\s*[^\n]*/gim;

let message = readFileSync(commitMsg, 'utf8');
message = message.replace(attribution, '');
message = message.replace(/^\n+/, '').replace(/\n{3,}/g, '\n\n').trimEnd();
writeFileSync(commitMsg, `${message}\n`);
