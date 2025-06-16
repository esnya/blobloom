/** @jest-environment jsdom */
import { fetchCommits } from '../client/api';

describe('commits module', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetches commits', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          commits: [
            { commit: { message: 'msg', committer: { timestamp: 1 } } },
          ],
        }),
    });
    await expect(fetchCommits()).resolves.toEqual([
      { commit: { message: 'msg', committer: { timestamp: 1 } } },
    ]);
  });
});
