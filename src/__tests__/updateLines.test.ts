/** @jest-environment jsdom */
import { createUpdateLines } from '../client/updateLines';
import type { LineCount } from '../client/types';

describe('createUpdateLines', () => {
  it('ignores stale fetch results', async () => {
    const seek = document.createElement('input');
    const update = jest.fn();
    const json = jest.fn();
    const counts1: LineCount[] = [{ file: 'a', lines: 1 }];
    const counts2: LineCount[] = [{ file: 'b', lines: 2 }];

    let resolveFirst: (v: unknown) => void = () => {};
    let resolveSecond: (v: unknown) => void = () => {};
    json
      .mockReturnValueOnce(new Promise((r) => { resolveFirst = r; }))
      .mockReturnValueOnce(new Promise((r) => { resolveSecond = r; }));

    const fetch = createUpdateLines({ seek, update, json, end: 0 });

    seek.value = '1';
    const p1 = fetch();
    seek.value = '2';
    const p2 = fetch();

    resolveSecond(counts2);
    await p2;

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(counts2);

    resolveFirst(counts1);
    await p1;

    expect(update).toHaveBeenCalledTimes(1);
  });
});
