import type { Commit } from './types.js';

export interface CommitLogOptions {
  container: HTMLElement;
  seek: HTMLInputElement;
  commits: Commit[];
  visible?: number;
  msPerPx?: number;
}

export const createCommitLog = ({
  container,
  seek,
  commits,
  visible = 20,
  msPerPx = 1e6,
}: CommitLogOptions) => {
  const list = document.createElement('ul');
  list.className = 'commit-list';
  container.appendChild(list);

  const marker = document.createElement('div');
  marker.className = 'commit-marker';
  marker.textContent = '•';
  container.appendChild(marker);

  const render = (): void => {
    const ts = Number(seek.value);
    let index = commits.findIndex(
      (c) => c.commit.committer.timestamp * 1000 <= ts,
    );
    if (index === -1) index = commits.length - 1;
    const start = Math.max(0, index - visible + 1);
    const slice = commits.slice(start, index + 1).reverse();
    list.innerHTML = '';
    slice.forEach((c, i) => {
      const li = document.createElement('li');
      li.textContent = c.commit.message.split('\n')[0];
      if (i > 0) {
        const prev = slice[i - 1];
        const diff =
          (c.commit.committer.timestamp - prev.commit.committer.timestamp) *
          1000;
        li.style.marginTop = `${diff / msPerPx}px`;
      }
      if (start + (slice.length - 1 - i) === index) {
        li.classList.add('current');
      }
      list.appendChild(li);
    });
  };

  seek.addEventListener('input', render);
  render();

  return { render };
};
