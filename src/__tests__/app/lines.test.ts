/** @jest-environment jsdom */
import { fetchLineCounts } from '../../client/api';
import { computeScale } from '../../client/scale';
import type { LineCount } from '../../client/types';

describe('lines module', () => {
  const originalWebSocket = global.WebSocket;

  afterEach(() => {
    global.WebSocket = originalWebSocket;
  });

  it('fetches line counts', async () => {
    const socket = {
      send: jest.fn(),
      close: jest.fn(),
      addEventListener: (event: string, cb: (ev: MessageEvent) => void) => {
        if (event === 'open') cb(new MessageEvent('open'));
        if (event === 'message')
          cb(
            new MessageEvent('message', {
              data: JSON.stringify({ type: 'data', counts: [{ file: 'a', lines: 1, added: 0, removed: 0 }], commits: [] }),
            }),
          );
      },
    } as unknown as WebSocket;
    global.WebSocket = jest.fn(() => socket) as unknown as typeof WebSocket;
    await expect(fetchLineCounts(1)).resolves.toEqual({
      counts: [{ file: 'a', lines: 1, added: 0, removed: 0 }],
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(socket.send).toHaveBeenCalledWith(
      JSON.stringify({ timestamp: 1, parent: undefined }),
    );
  });

  it('throws on empty counts', async () => {
    const socket = {
      send: jest.fn(),
      close: jest.fn(),
      addEventListener: (event: string, cb: (ev: MessageEvent) => void) => {
        if (event === 'open') cb(new MessageEvent('open'));
        if (event === 'message') cb(new MessageEvent('message', { data: JSON.stringify({ type: 'data', counts: [], commits: [] }) }));
      },
    } as unknown as WebSocket;
    global.WebSocket = jest.fn(() => socket) as unknown as typeof WebSocket;
    await expect(fetchLineCounts(1)).rejects.toThrow('No line counts');
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
    expect(scale).toBeCloseTo(168.2, 1);
  });

  it('returns 0 when area is zero', () => {
    const scale = computeScale(0, 200, [{ file: 'a', lines: 1, added: 0, removed: 0 }]);
    expect(scale).toBe(0);
  });
});
