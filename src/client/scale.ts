import type { LineCount } from './types';

export const computeScale = (
  width: number,
  height: number,
  data: LineCount[],
  opts: { linear?: boolean } = {},
): number => {
  if (!Array.isArray(data)) return 0;
  const exp = opts.linear ? 1 : 0.5;
  const maxLines = data.reduce(
    (m, d) => Math.max(m, Number.isFinite(d.lines) ? d.lines : 0),
    1,
  );
  const base = Math.min(width, height) / Math.pow(maxLines, exp);
  const totalArea = data.reduce(
    (sum, f) => {
      const lines = Number.isFinite(f.lines) ? f.lines : 0;
      const r = (Math.pow(lines, exp) * base) / 2;
      return sum + 4 * r ** 2;
    },
    0,
  );
  const ratio = totalArea / (width * height);
  const threshold = 0.1;
  if (!Number.isFinite(ratio) || ratio <= threshold) return base;
  const easing = Math.pow(threshold / ratio, 0.25);
  return base * easing;
};
