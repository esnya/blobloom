/** @jest-environment jsdom */
import { renderCommitList, fetchCommits } from '../client/commits';
import type { Commit } from '../client/types';

describe('commits module', () => {
  it('fetches commits', async () => {
    const json = jest.fn().mockResolvedValue([
      { commit: { message: 'msg', committer: { timestamp: 1 } } },
    ] as Commit[]);
    await expect(fetchCommits(json)).resolves.toEqual([
      { commit: { message: 'msg', committer: { timestamp: 1 } } },
    ]);
  });

  it('renders commit list', () => {
    const element = document.createElement('ul');
    const commits: Commit[] = [
      { commit: { message: 'a ', committer: { timestamp: 0 } } },
    ];
    renderCommitList(element, commits);
    expect(element.querySelectorAll('li')).toHaveLength(1);
    expect(element.querySelector('li')?.textContent).toBe('a');
  });
});
