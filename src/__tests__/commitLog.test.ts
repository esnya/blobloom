/** @jest-environment jsdom */
import { createCommitLog } from '../client/commitLog';
import type { Commit } from '../client/types';

describe('createCommitLog', () => {
  it('highlights current commit on input', () => {
    document.body.innerHTML = '<div id="log"></div><input id="seek" />';
    const container = document.getElementById('log') as HTMLDivElement;
    const seek = document.getElementById('seek') as HTMLInputElement;
    const commits: Commit[] = [
      { commit: { message: 'new', committer: { timestamp: 2 } } },
      { commit: { message: 'old', committer: { timestamp: 1 } } },
    ];
    seek.value = '1500';
    const { render } = createCommitLog({ container, seek, commits, visible: 2 });
    let current = container.querySelector('li.current')?.textContent;
    expect(current).toBe('old');
    seek.value = '2500';
    seek.dispatchEvent(new Event('input'));
    current = container.querySelector('li.current')?.textContent;
    expect(current).toBe('new');
    expect(container.querySelectorAll('li').length).toBeGreaterThanOrEqual(1);
    render();
  });
});
