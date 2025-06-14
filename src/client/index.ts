import { fetchCommits, fetchLineCounts } from './api.js';
import { createPlayer } from './player.js';
import { createFileSimulation } from './lines.js';
import { createCommitLog } from './commitLog.js';

const json = (input: string) => fetch(input).then((r) => r.json());
const commits = await fetchCommits(json);

const start = commits[commits.length - 1].commit.committer.timestamp * 1000;
const end = commits[0].commit.committer.timestamp * 1000;

const seek = document.getElementById('seek') as HTMLInputElement;
const duration = document.getElementById('duration') as HTMLInputElement;
const playButton = document.getElementById('play') as HTMLButtonElement;
const sim = document.getElementById('sim') as HTMLDivElement;
const logContainer = document.getElementById('commit-log') as HTMLDivElement;
const simInstance = createFileSimulation(sim);
const { update } = simInstance;

const updateLines = async (): Promise<void> => {
  const counts = await fetchLineCounts(json, Number(seek.value));
  update(counts);
};

seek.addEventListener('input', updateLines);

const player = createPlayer({ seek, duration, playButton, start, end });
createCommitLog({ container: logContainer, seek, commits });
updateLines();

let wasPlaying = false;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    wasPlaying = player.isPlaying();
    player.pause();
    simInstance.pause();
  } else {
    simInstance.resume();
    if (wasPlaying) player.resume();
  }
});
