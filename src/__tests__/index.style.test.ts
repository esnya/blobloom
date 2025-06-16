import fs from 'fs';
import path from 'path';

describe('index.html style', () => {
  it('centers FileCircle text with flexbox', () => {
    const html = fs.readFileSync(path.join(__dirname, '../..', 'index.html'), 'utf8');
    expect(html).toMatch(/\.file-circle {[^}]*flex-direction: column/);
    expect(html).not.toMatch(/\.file-circle .path {[^}]*top:/);
    expect(html).not.toMatch(/\.file-circle .name {[^}]*top:/);
    expect(html).not.toMatch(/\.file-circle .count {[^}]*top:/);
    expect(html).toMatch(/\.file-circle .path {[^}]*width: 90%/);
    expect(html).toMatch(/\.file-circle .name {[^}]*width: 100%/);
    expect(html).toMatch(/\.file-circle .count {[^}]*width: 90%/);
    expect(html).toMatch(/\.file-circle .path {[^}]*max-width: 90%/);
    expect(html).toMatch(/\.file-circle .name {[^}]*max-width: 100%/);
    expect(html).toMatch(/\.file-circle .count {[^}]*max-width: 90%/);
    expect(html).toMatch(/width: calc\(var\(--radius\)/);
  });
});
