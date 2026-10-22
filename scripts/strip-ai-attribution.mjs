// Strips AI attribution lines from a commit message file (husky commit-msg hook).
// DEV_RULES.md §11: no AI attribution in commit messages.
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) process.exit(0);

const attribution = /^(co-authored-by|generated (with|by)|created (with|by)|assisted (with|by)):?\s*.*$/gim;

let message = readFileSync(file, 'utf8');
message = message.replace(attribution, '');
message = message.replace(/^\n+/, '').replace(/\n{3,}/g, '\n\n').trimEnd();
writeFileSync(file, `${message}\n`);
