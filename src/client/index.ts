import { fetchCommits, renderCommitList } from './commits';
import { createPlayer } from './player';
import { fetchLineCounts, renderFileSimulation } from './lines';

const json = (input: string) => fetch(input).then((r) => r.json());
const commits = await fetchCommits(json);

const start = commits[commits.length - 1].commit.committer.timestamp * 1000;
const end = commits[0].commit.committer.timestamp * 1000;

const seek = document.getElementById('seek') as HTMLInputElement;
const speed = document.getElementById('speed') as HTMLSelectElement;
const playButton = document.getElementById('play') as HTMLButtonElement;
const list = document.getElementById('commits') as HTMLUListElement;
const sim = document.getElementById('sim') as HTMLDivElement;

let stop = () => {};
const updateLines = async (): Promise<void> => {
  const counts = await fetchLineCounts(json, Number(seek.value));
  stop();
  stop = renderFileSimulation(sim, counts);
};

seek.addEventListener('input', updateLines);

createPlayer({ seek, speed, playButton, start, end });
renderCommitList(list, commits);
updateLines();
