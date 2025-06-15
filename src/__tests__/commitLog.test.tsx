/** @jest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';
import { CommitLog } from '../client/components/CommitLog';
import type { Commit } from '../client/types';

describe('CommitLog', () => {
  it('highlights current commit when timestamp changes', () => {
    const commits: Commit[] = [
      { commit: { message: 'new', committer: { timestamp: 2 } } },
      { commit: { message: 'old', committer: { timestamp: 1 } } },
    ];
    const { container, rerender } = render(
      <CommitLog commits={commits} timestamp={1500} visible={2} />,
    );
    expect(container.querySelector('li.current')?.textContent).toBe('old');
    rerender(<CommitLog commits={commits} timestamp={2500} visible={2} />);
    expect(container.querySelector('li.current')?.textContent).toBe('new');
    expect(container.querySelectorAll('li').length).toBeGreaterThanOrEqual(1);
  });
});
