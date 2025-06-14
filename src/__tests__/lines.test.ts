/** @jest-environment jsdom */
import { fetchLineCounts } from '../client/api';
import { renderFileSimulation } from '../client/lines';
import type { LineCount } from '../client/types';

describe('lines module', () => {
  it('fetches line counts with timestamp', async () => {
    const json = jest.fn().mockResolvedValue([{ file: 'a', lines: 1 }] as LineCount[]);
    await expect(fetchLineCounts(json, 100)).resolves.toEqual([{ file: 'a', lines: 1 }]);
    expect(json).toHaveBeenCalledWith('/api/lines?ts=100');
  });

  it('renders circles', () => {
    const div = document.createElement('div');
    div.getBoundingClientRect = () => ({
      width: 200,
      height: 200,
      top: 0,
      left: 0,
      bottom: 200,
      right: 200,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
    const data: LineCount[] = [
      { file: 'a', lines: 1 },
      { file: 'b', lines: 2 },
    ];
    const callbacks: FrameRequestCallback[] = [];
    const raf = (cb: FrameRequestCallback): number => {
      callbacks.push(cb);
      return 1;
    };
    const stop = renderFileSimulation(div, data, { raf, now: () => 0 });
    callbacks[0]?.(0);
    expect(div.querySelectorAll('.file-circle')).toHaveLength(2);
    stop();
  });
});
