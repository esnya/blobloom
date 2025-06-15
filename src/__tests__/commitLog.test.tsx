/** @jest-environment jsdom */
import React from 'react';
import { render, act } from '@testing-library/react';
import { CommitLog } from '../client/components/CommitLog';
import type { Commit } from '../client/types';

describe('CommitLog', () => {
  it('highlights current commit on input', () => {
    document.body.innerHTML = '<input id="seek" />';
    const seek = document.getElementById('seek') as HTMLInputElement;
    const commits: Commit[] = [
      { commit: { message: 'new', committer: { timestamp: 2 } } },
      { commit: { message: 'old', committer: { timestamp: 1 } } },
    ];
    seek.value = '1500';
    const { container } = render(<CommitLog commits={commits} seek={seek} visible={2} />);
    expect(container.querySelector('li.current')?.textContent).toBe('old');
    act(() => {
      seek.value = '2500';
      seek.dispatchEvent(new Event('input'));
    });
    expect(container.querySelector('li.current')?.textContent).toBe('new');
    expect(container.querySelectorAll('li').length).toBeGreaterThanOrEqual(1);
  });
});
