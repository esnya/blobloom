import fs from 'fs';
import path from 'path';

describe('index.html style', () => {
  it('positions FileCircle text with percentages', () => {
    const html = fs.readFileSync(path.join(__dirname, '../..', 'index.html'), 'utf8');
    expect(html).toMatch(/\.file-circle .path {[^}]*top: 30%/);
    expect(html).toMatch(/\.file-circle .name {[^}]*top: 50%/);
    expect(html).toMatch(/\.file-circle .count {[^}]*top: 70%/);
    expect(html).toMatch(/\.file-circle .path {[^}]*width: 90%/);
    expect(html).toMatch(/\.file-circle .name {[^}]*width: 100%/);
    expect(html).toMatch(/\.file-circle .count {[^}]*width: 90%/);
    expect(html).toMatch(/\.file-circle .path {[^}]*max-width: 90%/);
    expect(html).toMatch(/\.file-circle .name {[^}]*max-width: 100%/);
    expect(html).toMatch(/\.file-circle .count {[^}]*max-width: 90%/);
    expect(html).not.toMatch(/calc\(var\(--r\)/);
  });
});
