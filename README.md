# blobloom

![Project logo](logo.svg)

Git size-history visualizer

Requires Node.js 20 or later.

The client includes a simple physics engine that now supports restitution and
basic friction for circles.

## Development

Install dependencies and start the server:

```bash
npm install
npx playwright install   # install browsers for headless tests
npm audit --production
npm run lint
npm test
npm run build            # client build with Vite
npm start                # defaults to current directory
# npm run dev            # start Vite dev server with API
```

CLI options can also be provided via environment variables with the `BLOBLOOM_` prefix.
For example, set `BLOBLOOM_REPO` to specify the repository path.

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Headless Tests

Playwright is included as a development dependency. After `npm install`, install browsers once:

```bash
npx playwright install
```

Run end-to-end tests with:

```bash
npm run build
npm run test:playwright
```
Playwright tests live in the `playwright` directory.
