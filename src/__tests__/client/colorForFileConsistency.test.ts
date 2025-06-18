import { colorForFile, fileColors } from '../../client/colors';

describe('colorForFile consistency', () => {
  it('returns the same color for repeated calls with known extensions', () => {
    Object.keys(fileColors).forEach((ext) => {
      const name = `file${ext}`;
      expect(colorForFile(name)).toBe(colorForFile(name));
    });
  });

  it('produces different colors for different names with the same extension', () => {
    const ext = Object.keys(fileColors)[0];
    expect(colorForFile(`a${ext}`)).not.toBe(colorForFile(`b${ext}`));
  });
});
