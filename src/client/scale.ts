import type { LineCount } from './types';

export const computeScale = (
  width: number,
  height: number,
  data: ArrayLike<LineCount | number>,
  opts: { linear?: boolean } = {},
): number => {
  const exp = opts.linear ? 1 : 0.5;
  const items = Array.from<LineCount | number>(data);
  let maxLines = 1;
  for (const d of items) {
    const lines =
      typeof d === 'number'
        ? Number.isFinite(d) ? d : 0
        : Number.isFinite(d.lines)
          ? d.lines
          : 0;
    if (lines > maxLines) maxLines = lines;
  }
  const base = Math.min(width, height) / maxLines ** exp;
  let totalArea = 0;
  for (const f of items) {
    const lines =
      typeof f === 'number'
        ? Number.isFinite(f) ? f : 0
        : Number.isFinite(f.lines)
          ? f.lines
          : 0;
    const r = ((lines ** exp) * base) / 2;
    totalArea += 4 * r ** 2;
  }
  const ratio = totalArea / (width * height);
  const threshold = 0.1;
  if (!Number.isFinite(ratio) || ratio <= threshold) return base;
  const easing = (threshold / ratio) ** 0.25;
  return base * easing;
};
