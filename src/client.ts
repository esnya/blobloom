import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

interface Commit {
  commit: {
    message: string;
    committer: {
      timestamp: number;
    };
  };
}

const commits = (await d3.json('/api/commits')) as Commit[];

const start = commits[commits.length - 1].commit.committer.timestamp * 1000;
const end = commits[0].commit.committer.timestamp * 1000;

const seek = document.getElementById('seek') as HTMLInputElement;
seek.min = start.toString();
seek.max = end.toString();
seek.value = start.toString();

const speed = document.getElementById('speed') as HTMLSelectElement;
const playButton = document.getElementById('play') as HTMLButtonElement;

let playing = false;
let lastTime = 0;

const tick = (time: number): void => {
  if (!playing) {
    lastTime = time;
    requestAnimationFrame(tick);
    return;
  }
  const dt = (time - lastTime) * parseFloat(speed.value);
  lastTime = time;
  const next = Math.min(Number(seek.value) + dt, end);
  seek.value = next.toString();
  if (next < end) {
    requestAnimationFrame(tick);
  } else {
    playing = false;
    playButton.textContent = 'Play';
  }
};

playButton.addEventListener('click', () => {
  playing = !playing;
  playButton.textContent = playing ? 'Pause' : 'Play';
  if (playing) {
    lastTime = performance.now();
    requestAnimationFrame(tick);
  }
});

const list = d3.select('#commits');
list
  .selectAll('li')
  .data(commits)
  .enter()
  .append('li')
  .text((d: Commit) => d.commit.message.trim());
