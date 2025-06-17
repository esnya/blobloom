jest.mock('../../client/api', () => ({
  fetchCommits: jest.fn(),
}));

describe('commitsResource', () => {
  afterEach(() => {
    jest.resetModules();
  });

  it('caches commits per base URL', async () => {
    const { fetchCommits } = await import('../../client/api');
    const mockFetch = fetchCommits as jest.MockedFunction<typeof fetchCommits>;
    mockFetch.mockResolvedValue([{ id: 'a', message: 'm', timestamp: 1 }]);

    const { readCommits } = await import('../../client/commitsResource');

    let thrown: unknown;
    try {
      readCommits('/base');
    } catch (e) {
      thrown = e;
    }
    await (thrown as Promise<unknown>);

    const first = readCommits('/base');
    const second = readCommits('/base');

    expect(second).toBe(first);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('separates caches for different base URLs', async () => {
    const { fetchCommits } = await import('../../client/api');
    const mockFetch = fetchCommits as jest.MockedFunction<typeof fetchCommits>;
    mockFetch
      .mockResolvedValueOnce([{ id: 'a', message: 'm', timestamp: 1 }])
      .mockResolvedValueOnce([{ id: 'b', message: 'n', timestamp: 2 }]);

    const { readCommits } = await import('../../client/commitsResource');

    let p1: unknown;
    try {
      readCommits('/one');
    } catch (e) {
      p1 = e;
    }
    await (p1 as Promise<unknown>);
    readCommits('/one');

    let p2: unknown;
    try {
      readCommits('/two');
    } catch (e) {
      p2 = e;
    }
    await (p2 as Promise<unknown>);
    readCommits('/two');

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
