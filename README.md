# blobloom

Git size-history visualizer

Requires Node.js 20 or later.

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

Playwright is included as a development dependency. Install browsers once:

```bash
npx playwright install
```

Run end-to-end tests with:

```bash
npm run test:playwright
```
Playwright tests live in the `playwright` directory.
