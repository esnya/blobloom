import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { fetchCommits, renderCommitList } from './commits';
import { createPlayer } from './player';

const commits = await fetchCommits(d3.json);

const start = commits[commits.length - 1].commit.committer.timestamp * 1000;
const end = commits[0].commit.committer.timestamp * 1000;

const seek = document.getElementById('seek') as HTMLInputElement;
const speed = document.getElementById('speed') as HTMLSelectElement;
const playButton = document.getElementById('play') as HTMLButtonElement;
const list = document.getElementById('commits') as HTMLUListElement;

createPlayer({ seek, speed, playButton, start, end });
renderCommitList(list, commits);
