import { colorForFile } from '../client/lines';

describe('colorForFile', () => {
  it('handles extension case-insensitively', () => {
    const color = colorForFile('file.TS');
    expect(color.includes('52.222')).toBe(true);
  });

  it('handles files without extension', () => {
    expect(colorForFile('Makefile')).toBe('hsl(8,60%,60%)');
  });
});
