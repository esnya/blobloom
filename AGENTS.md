# Agent Instructions
* Headless tests use Playwright. Browsers are cached in CI.
* Playwright is included as a development dependency.
* Run `npx playwright install` locally when dependencies change.

- When fixing a bug:
  1. Write a failing test that reproduces the issue and confirm it fails.
  2. Implement the fix and ensure the test passes.

- Always run `npm run lint`, `npm test`, and `npm run build` before committing changes.
- The GitHub Actions workflow runs these commands. Update it when scripts change.
* Jest coverage threshold set to 80%.
  Tests cover `src/client/index.tsx`.
- Avoid excluding code from coverage unless there is a compelling reason.
  If coverage goals become difficult to meet, document TODO tasks and
  temporarily lower the coverage threshold until those tasks are resolved.
- Run `npm audit` and address reported vulnerabilities.
- Investigate any `deprecated` warnings from package installs.
- Make these checks part of the regular workflow and account for them when updating CI.
* Use React refs only when absolutely necessary and preferably within custom hooks.
  Override the ESLint ref restriction locally in such files or lines.
* Prefer encapsulating `useMemo` and `useEffect` logic in custom hooks. When the logic is short and component-specific, defining the hook in the component file is acceptable. Evaluate frequently used component-related functions for potential hook conversion.
* React components must not modify physics engine state directly except for:
  - Adjusting engine bounds via `PhysicsProvider`
  - Creating or removing bodies through hooks
  - Changing body radius via `useBody`

## TODO
- Add more hook tests and restore coverage threshold to 80.
- Verify character effect rendering once React flushing is reliable (`src/__tests__/lines.test.ts`).
- ~~Move FileCircle refs into custom hooks; restrict `no-restricted-syntax` overrides to necessary lines.~~
- ~~Remove or replace `src/renameDemo.ts` if no longer needed.~~
