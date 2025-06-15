/** @jest-environment jsdom */
import { createCommitLog } from '../client/commitLog';
import type { Commit } from '../client/types';

describe('createCommitLog', () => {
  it('renders and updates commit list', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientHeight', { value: 100, configurable: true });
    const seek = document.createElement('input');
    const commits: Commit[] = [
      { commit: { message: 'new', committer: { timestamp: 2 } } },
      { commit: { message: 'old', committer: { timestamp: 1 } } },
    ];
    seek.value = '1500';
    createCommitLog({ container, seek, commits, visible: 2 });

    expect(container.querySelector('li.current')?.textContent).toBe('old');
    seek.value = '2500';
    seek.dispatchEvent(new Event('input'));
    expect(container.querySelector('li.current')?.textContent).toBe('new');
    expect(container.querySelector('.commit-marker')).not.toBeNull();
    expect(container.querySelectorAll('li').length).toBeGreaterThanOrEqual(2);
  });
});
