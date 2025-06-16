/** @jest-environment jsdom */
import { fetchLineCounts } from '../client/api';
import { computeScale } from '../client/scale';
import type { LineCount } from '../client/types';

describe('lines module', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetches line counts', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ counts: [{ file: 'a', lines: 1, added: 0, removed: 0 }] }),
    });
    await expect(fetchLineCounts('abc')).resolves.toEqual({
      counts: [{ file: 'a', lines: 1, added: 0, removed: 0 }],
    });
    expect(global.fetch).toHaveBeenCalledWith('/api/commits/abc/lines');
  });

  it('throws on empty counts', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ counts: [] }),
    });
    await expect(fetchLineCounts('abc')).rejects.toThrow('No line counts');
  });

  it('computes scale with easing', () => {
    const scale = computeScale(200, 200, [
      { file: 'a', lines: 1, added: 0, removed: 0 },
      { file: 'b', lines: 2, added: 0, removed: 0 },
    ]);
    expect(scale).toBeLessThan(100);
  });

  it('supports linear scaling option', () => {
    const data: LineCount[] = [
      { file: 'a', lines: 1, added: 0, removed: 0 },
      { file: 'b', lines: 2, added: 0, removed: 0 },
    ];
    const nonlinear = computeScale(200, 200, data);
    const linear = computeScale(200, 200, data, { linear: true });
    expect(linear).toBeLessThan(nonlinear);
  });

  it('returns eased scale when ratio exceeds threshold', () => {
    const scale = computeScale(1000, 200, [{ file: 'a', lines: 1, added: 0, removed: 0 }]);
    expect(scale).toBeCloseTo(186.1, 1);
  });

  it('returns 0 when area is zero', () => {
    const scale = computeScale(0, 200, [{ file: 'a', lines: 1, added: 0, removed: 0 }]);
    expect(scale).toBe(0);
  });
});
