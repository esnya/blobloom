import type { Commit } from './types.js';

export interface CommitLogOptions {
  container: HTMLElement;
  seek: HTMLInputElement;
  commits: Commit[];
  visible?: number;
}

export const createCommitLog = ({
  container,
  seek,
  commits,
  visible = 15,
}: CommitLogOptions) => {
  const list = document.createElement('ul');
  list.className = 'commit-list';
  list.style.position = 'absolute';
  list.style.top = '0';
  list.style.width = '100%';
  list.style.transition = 'transform 0.2s ease';
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
    const start = Math.max(0, index - visible);
    const end = Math.min(commits.length, index + visible + 1);
    const slice = commits.slice(start, end);
    list.innerHTML = '';

    const spanMs =
      slice.length > 1
        ?
            (slice[0].commit.committer.timestamp -
              slice[slice.length - 1].commit.committer.timestamp) *
          1000
        : 1;
    const msPerPx = spanMs / Math.max(container.clientHeight, 1);
    slice.forEach((c, i) => {
      const li = document.createElement('li');
      li.textContent = c.commit.message.split('\n')[0];
      if (i > 0) {
        const prev = slice[i - 1];
        const diff =
          (prev.commit.committer.timestamp - c.commit.committer.timestamp) *
          1000;
        li.style.marginTop = `${diff / msPerPx}px`;
      }
      if (start + i === index) {
        li.classList.add('current');
      }
      list.appendChild(li);
    });

    const current = list.querySelector('li.current') as HTMLLIElement | null;
    if (current) {
      const offset =
        container.clientHeight / 2 -
        (current.offsetTop + current.offsetHeight / 2);
      list.style.transform = `translateY(${offset}px)`;
    }
  };

  seek.addEventListener('input', render);
  render();

  return { render };
};
