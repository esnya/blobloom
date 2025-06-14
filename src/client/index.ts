import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { fetchCommits, renderCommitList } from './commits';
import { createPlayer } from './player';
import { fetchLineCounts, renderLineChart } from './lines';

const commits = await fetchCommits(d3.json);

const start = commits[commits.length - 1].commit.committer.timestamp * 1000;
const end = commits[0].commit.committer.timestamp * 1000;

const seek = document.getElementById('seek') as HTMLInputElement;
const speed = document.getElementById('speed') as HTMLSelectElement;
const playButton = document.getElementById('play') as HTMLButtonElement;
const list = document.getElementById('commits') as HTMLUListElement;
const chart = document.getElementById('lines-chart') as SVGSVGElement;

const updateLines = async () => {
  const counts = await fetchLineCounts(d3.json, Number(seek.value));
  renderLineChart(d3, chart, counts);
};

seek.addEventListener('input', updateLines);

createPlayer({ seek, speed, playButton, start, end });
renderCommitList(list, commits);
updateLines();
