import { computeScale } from '../../client/scale';
import type { LineCount } from '../../client/types';

describe('computeScale', () => {
  const data: LineCount[] = [
    { file: 'a', lines: 1, added: 0, removed: 0 },
    { file: 'b', lines: 2, added: 0, removed: 0 },
  ];

  it('calculates expected scale for nonlinear mode', () => {
    expect(computeScale(200, 200, data)).toBeCloseTo(71.86, 2);
  });

  it('supports linear scaling option', () => {
    expect(computeScale(200, 200, data, { linear: true })).toBeCloseTo(53.18, 2);
  });

  it('uses minimum dimension when all counts are zero', () => {
    const zero: LineCount[] = [
      { file: 'z', lines: 0, added: 0, removed: 0 },
    ];
    expect(computeScale(100, 50, zero)).toBe(50);
  });
});
