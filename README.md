# blobloom

Git size-history visualizer

## Development

Install dependencies and start the server:

```bash
npm install
npm run lint
npm test
npm run build
npm start                # defaults to current directory
# npm start -- --repo path/to/repo
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Headless Tests

Playwright can run browser-based tests, but downloading browsers exceeds 100MB and is blocked in CI.
Install it manually and run tests only when front-end code changes:

```bash
npm install --no-save playwright
npx playwright install chromium
npx playwright test
```
