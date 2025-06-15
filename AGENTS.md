# Agent Instructions
* Headless tests use Playwright. Installing browsers is heavy (>100MB) and blocked in CI.
* Do not add Playwright to package.json.
* When front-end changes, install Playwright manually and run `npx playwright test` locally.

- Always run `npm run lint`, `npm test`, and `npm run build` before committing changes.
- The GitHub Actions workflow runs these commands. Update it when scripts change.
- TODO: Increase Jest coverage to at least 80%.
