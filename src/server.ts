import { Command } from 'commander';
import { createApp } from './app';

const program = new Command();
program
  .requiredOption('-r, --repo <path>', 'path to the git repository')
  .option('-b, --branch <name>', 'branch to inspect')
  .option('-H, --host <host>', 'host name to listen on', 'localhost')
  .option('-p, --port <number>', 'port to listen on', (v) => Number(v), 3000);

program.parse();

const { repo, host, port, branch } = program.opts<{
  repo: string;
  host: string;
  port: number;
  branch?: string;
}>();

const app = await createApp({ repo, branch });

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
