import { fetchCommits, fetchLineCounts } from './api.js';
import { createPlayer } from './player.js';
import { createFileSimulation } from './lines.js';

const json = (input: string) => fetch(input).then((r) => r.json());
const commits = await fetchCommits(json);

const start = commits[commits.length - 1].commit.committer.timestamp * 1000;
const end = commits[0].commit.committer.timestamp * 1000;

const seek = document.getElementById('seek') as HTMLInputElement;
const duration = document.getElementById('duration') as HTMLInputElement;
const playButton = document.getElementById('play') as HTMLButtonElement;
const sim = document.getElementById('sim') as HTMLDivElement;
const { update } = createFileSimulation(sim);

const updateLines = async (): Promise<void> => {
  const counts = await fetchLineCounts(json, Number(seek.value));
  update(counts);
};

seek.addEventListener('input', updateLines);

createPlayer({ seek, duration, playButton, start, end });
updateLines();
