/** @jest-environment jsdom */
import { fetchCommits } from '../client/api';
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
});
