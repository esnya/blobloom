import express from 'express';
import { Command } from 'commander';
import { createServer } from 'http';
import { apiMiddleware } from './api-middleware';
import { appSettings } from './app-settings';
import { defaultIgnore } from './ignore-defaults';
import { setupLineCountWs } from './ws';

const collect = (val: string, acc: string[]): string[] => acc.concat(val.split(','));

const program = new Command();
program
  .option('-b, --branch <name>', 'branch to inspect')
  .option('-H, --host <host>', 'host name to listen on', 'localhost')
  .option('-p, --port <number>', 'port to listen on', (v) => Number(v), 3000)
  .option('-i, --ignore <pattern>', 'glob pattern to ignore', collect, [...defaultIgnore]);

program.parse();

const { host, port, branch, ignore } = program.opts<{
  host: string;
  port: number;
  branch?: string;
  ignore: string[];
}>();

const app = express();
app.set(appSettings.branch.description!, branch);
app.set(appSettings.ignore.description!, ignore);

app.use(express.static('dist'));
app.use(apiMiddleware);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
const server = createServer(app);
setupLineCountWs(app, server);

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
