import type { LineCount } from './types';
export type D3 = typeof import('d3');

export const fetchLineCounts = async (
  json: (input: string) => Promise<unknown>,
  timestamp?: number,
): Promise<LineCount[]> => {
  const url = timestamp ? `/api/lines?ts=${timestamp}` : '/api/lines';
  return (await json(url)) as LineCount[];
};

export const renderLineChart = (
  d3: D3,
  element: SVGSVGElement,
  data: LineCount[],
): void => {
  const svg = d3.select(element);
  svg.selectAll('*').remove();

  const barHeight = 20;
  const margin = { left: 200, right: 20, top: 20, bottom: 20 };
  const width = 800;
  const height = barHeight * data.length + margin.top + margin.bottom;

  svg.attr('width', width).attr('height', height);

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.lines) ?? 0])
    .range([0, width - margin.left - margin.right]);

  const g = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  g.selectAll('rect')
    .data(data)
    .join('rect')
    .attr('y', (_, i) => i * barHeight)
    .attr('width', (d) => x(d.lines))
    .attr('height', barHeight - 1)
    .attr('fill', 'steelblue');

  g.selectAll('text')
    .data(data)
    .join('text')
    .attr('x', -5)
    .attr('y', (_, i) => i * barHeight + (barHeight - 1) / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .text((d) => d.file);
};
