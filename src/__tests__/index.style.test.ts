import fs from 'fs';
import path from 'path';

describe('index.html style', () => {
  it('clamps FileCircle text size', () => {
    const html = fs.readFileSync(path.join(__dirname, '../..', 'index.html'), 'utf8');
    expect(html).toMatch(/\.file-circle .count {[^}]*clamp\(/);
  });
});
