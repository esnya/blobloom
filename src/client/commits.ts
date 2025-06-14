import type { Commit } from './types.js';

export const renderCommitList = (
  element: HTMLElement,
  commits: Commit[],
): void => {
  element.innerHTML = '';
  for (const c of commits) {
    const li = document.createElement('li');
    li.textContent = c.commit.message.trim();
    element.appendChild(li);
  }
};
