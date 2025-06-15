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
const stopButton = document.getElementById('stop') as HTMLButtonElement;
const sim = document.getElementById('sim') as HTMLDivElement;
const logContainer = document.getElementById('commit-log') as HTMLDivElement;
const timestampEl = document.getElementById('timestamp') as HTMLDivElement;
const simInstance = createFileSimulation(sim);
const { update, resize } = simInstance;

const updateTimestamp = () => {
  const date = new Date(Number(seek.value));
  timestampEl.textContent = date.toLocaleString();
};

const updateLines = async (): Promise<void> => {
  const ts = Number(seek.value);
  const counts = await fetchLineCounts(json, ts);
  update(counts);
  if (ts >= end) {
    console.log('[debug] physics area updated for final commit at', ts);
  }
};

seek.addEventListener('input', () => {
  updateLines();
  updateTimestamp();
});

const player = createPlayer({
  seek,
  duration,
  playButton,
  start,
  end,
  onPlayStateChange: (p) => simInstance.setEffectsEnabled(p),
});
stopButton.addEventListener('click', player.stop);
createCommitLog({ container: logContainer, seek, commits });
updateLines();
updateTimestamp();
window.addEventListener('resize', resize);

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
