# Agent Instructions

- Always run `npm run lint`, `npm test`, and `npm run build` before committing changes.
- The GitHub Actions workflow runs these commands. Update it when scripts change.
- TODO: Increase Jest coverage to at least 80%. Add tests for
  `src/client/commitLog.ts` and `src/client/index.tsx`.
- Avoid excluding code from coverage unless there is a compelling reason.
  If coverage goals become difficult to meet, document TODO tasks and
  temporarily lower the coverage threshold until those tasks are resolved.
