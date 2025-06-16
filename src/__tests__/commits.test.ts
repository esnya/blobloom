/** @jest-environment jsdom */
import { fetchCommits } from '../client/api';

describe('commits module', () => {
  it('fetches commits', async () => {
    const json = jest.fn().mockResolvedValue({
      commits: [
        { commit: { message: 'msg', committer: { timestamp: 1 } } },
      ],
    });
    await expect(fetchCommits(json)).resolves.toEqual([
      { commit: { message: 'msg', committer: { timestamp: 1 } } },
    ]);
  });
});
