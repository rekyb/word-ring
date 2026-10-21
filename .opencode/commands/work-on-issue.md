---
description: Work a GitHub issue end to end: branch, implement, verify, commit locally, stop before push
---

Work the issue or task described by: $ARGUMENTS

Follow the repo workflow in `AGENTS.md` and `DEV_RULES.md` exactly.

1. If the argument is an issue number, read it with `gh issue view` to get the
   title, body, and labels. Otherwise treat the argument as the task description.

2. Create a feature branch from an up-to-date `main`. Use `feat/<slug>` for a
   feature or `fix/<slug>` for a bug fix, deriving a short kebab-case slug from
   the title. Never work directly on `main`.

3. Implement:
   - Follow `DEV_RULES.md` for structure, TypeScript, state, boundaries, and testing.
   - For any UI, copy, accessibility, mobile-layout, or code-comment work, load
     and follow `@antislop` plus the relevant skill, and read `DESIGN_RULES.md`
     for direction.
   - Add or change dependencies only via `npx expo install`.

4. Add the tests or checks the change needs, then run the project's validation
   (`npm run check`, or the lint/typecheck/test that exists) and confirm it
   passes before finishing. Do not claim a manual test you did not run.

5. Commit locally with a Conventional Commit message (`type: short description`).

6. Stop. Do NOT push to `origin`, open a PR, or merge. Report what was committed
   and which branch it is on, then wait for an explicit push or merge instruction.
