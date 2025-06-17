# blobloom

![Project logo](logo.svg)

Git size-history visualizer

Requires Node.js 20 or later. A `.nvmrc` file is included, so run `nvm use`
to ensure the correct version.

The client includes a simple physics engine that now supports restitution and
basic friction for circles.

## Development

Install dependencies and start the server:

```bash
npm install
npm run typecheck        # ensure type checking passes before building
npm audit --production
npm run lint
npm test
npm run build            # client build with Vite
npm start                # defaults to current directory
# npm run dev            # start Vite dev server with API
```

CLI options can also be provided via environment variables with the `BLOBLOOM_` prefix.
For example, set `BLOBLOOM_REPO` to specify the repository path.
`BLOBLOOM_HOST` overrides the host name.
`BLOBLOOM_PORT` sets the listening port.
`BLOBLOOM_BRANCH` chooses the branch to inspect.
`BLOBLOOM_IGNORE` is a comma-separated list of glob patterns to ignore.

Then open [http://localhost:3000](http://localhost:3000) in your browser.


## Attribution

All code in this project was written by Codex.
