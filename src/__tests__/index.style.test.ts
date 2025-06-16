import fs from 'fs';
import path from 'path';

describe('index.html style', () => {
  it('scales FileCircle text with radius', () => {
    const html = fs.readFileSync(path.join(__dirname, '../..', 'index.html'), 'utf8');
    expect(html).toMatch(/\.file-circle .path {[^}]*calc\(var\(--r\)/);
    expect(html).toMatch(/\.file-circle .name {[^}]*calc\(var\(--r\)/);
    expect(html).toMatch(/\.file-circle .count {[^}]*calc\(var\(--r\)/);
    expect(html).not.toMatch(/clamp\(/);
  });
});
