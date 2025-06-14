import type { Commit } from './types';

export const fetchCommits = async (
  json: (input: string) => Promise<unknown>,
): Promise<Commit[]> => {
  return (await json('/api/commits')) as Commit[];
};

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
