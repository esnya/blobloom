import fs from 'fs';
import { setTimeout as wait } from 'timers/promises';

const [from, to] = process.argv.slice(2);
if (!from || !to) {
  console.error('Usage: tsx legacy/rename-demo.ts <from> <to>');
  process.exit(1);
}

const typeSwitch = async (oldText: string, newText: string) => {
  for (const ch of oldText) {
    process.stdout.write(ch);
    await wait(50);
  }
  await wait(300);
  process.stdout.write('\r' + ' '.repeat(oldText.length) + '\r');
  for (const ch of newText) {
    process.stdout.write(ch);
    await wait(50);
  }
  process.stdout.write('\n');
};

await typeSwitch(from, to);
fs.renameSync(from, to);

