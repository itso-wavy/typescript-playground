# Task 5 report — diagnostics, generics, and type transforms

## Delivered

- Client lessons: optional diagnostics `d1`–`d4`, generic practice `g01`–`g08`, and type-transform practice `t09`–`t16`.
- Every lesson has Korean scenario, focused concepts, mission, three hints, solution, explanation, official TypeScript source link, check date, compiler version, revision, and editable `index.ts` starter/solution.
- Chapter-end optional reflections are included in D4, G8, and T16. They provide a sample answer and self-check points; prose is not graded.
- Server-only fixtures provide trusted import-based type contracts, an alternate valid implementation, and at least one invalid implementation per lesson. Runtime fixtures are JavaScript bodies that use only injected `learner` and `check` capabilities.

## Verification

- Passed: `npm.cmd test -- tests/curriculum-first.test.ts` — 1 file, 4 tests.
- Passed: isolated TypeScript check for Task 5 client modules, server fixtures, shared contracts, and content-shape test with `npx.cmd tsc --ignoreConfig ...`.
- Repository-wide `npm.cmd run typecheck` is pending Task 6 catalogue modules: its existing `tests/curriculum-rest.test.ts` imports absent `src/curriculum/index.js` and `server/curriculum/index.js`.
- Trusted type-fixture compilation and browser runtime execution are pending the Task 2 runner. Learner JavaScript was not executed on the server.
