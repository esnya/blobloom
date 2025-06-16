import { colorForFile, lightenColor } from '../client/colors';

describe('colorForFile', () => {
  it('handles extension case-insensitively', () => {
    const color = colorForFile('file.TS');
    expect(color.includes('52.222')).toBe(true);
  });

  it('handles files without extension', () => {
    expect(colorForFile('Makefile')).toBe('hsl(8,60%,60%)');
  });

  it('lightens HSL colors', () => {
    expect(lightenColor('hsl(0,0%,50%)', 10)).toBe('hsl(0,0%,60%)');
  });
});
