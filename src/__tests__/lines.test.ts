/** @jest-environment jsdom */
import { fetchLineCounts, renderLineChart } from '../client/lines';
import type { LineCount } from '../client/types';

describe('lines module', () => {
  it('fetches line counts with timestamp', async () => {
    const json = jest.fn().mockResolvedValue([{ file: 'a', lines: 1 }] as LineCount[]);
    await expect(fetchLineCounts(json, 100)).resolves.toEqual([{ file: 'a', lines: 1 }]);
    expect(json).toHaveBeenCalledWith('/api/lines?ts=100');
  });

  it('renders bar chart', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const data: LineCount[] = [{ file: 'a', lines: 1 }];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chain = (): any => ({
      selectAll: jest.fn(() => chain()),
      data: jest.fn(() => chain()),
      join: jest.fn(() => chain()),
      append: jest.fn(() => chain()),
      attr: jest.fn(() => chain()),
      text: jest.fn(() => chain()),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svgSel: any = { selectAll: jest.fn(() => ({ remove: jest.fn() })), attr: jest.fn(() => svgSel), append: jest.fn(() => chain()) };
    const d3 = {
      select: jest.fn(() => svgSel as unknown as ReturnType<typeof chain>),
      scaleLinear: jest.fn(() => ({ domain: jest.fn(() => ({ range: jest.fn() })) })),
      max: jest.fn(() => 1),
    } as unknown as import('../client/lines').D3;
    renderLineChart(d3, svg, data);
    expect(d3.select).toHaveBeenCalledWith(svg);
  });
});
