import { spawn } from 'child_process';
import { mkdirSync } from 'fs';
import { chromium } from 'playwright';

async function startServer(): Promise<() => void> {
  const proc = spawn('npx', ['tsx', 'src/server/index.ts'], {
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  await new Promise<void>((resolve) => {
    proc.stdout.on('data', (chunk: Buffer) => {
      if (chunk.toString().includes('Server running')) resolve();
    });
  });
  return () => proc.kill();
}

void (async (): Promise<void> => {
  const stop = await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');

  const midTimestamp: number = await page.evaluate(async () => {
    const res = await fetch('/api/commits');
    const data = (await res.json()) as { commits: { timestamp: number }[] };
    const mid = Math.floor(data.commits.length / 2);
    return data.commits[mid]!.timestamp * 1000;
  });

  await page.evaluate((ts) => {
    const input = document.querySelector<HTMLInputElement>('input[type=range]');
    if (input) {
      input.value = String(ts);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, midTimestamp);

  await page.waitForTimeout(3000);
  mkdirSync('docs', { recursive: true });
  const buf = await page.screenshot({ path: 'docs/timeline-mid.png' });
  console.log(buf.toString('base64'));

  await browser.close();
  stop();
})();
