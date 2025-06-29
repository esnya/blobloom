/** @jest-environment jsdom */
import React from 'react';
import { render, act } from '@testing-library/react';
import { CommitLog } from '../../client/components/CommitLog';
import type { Commit } from '../../client/types';

describe('CommitLog', () => {
  it('highlights current commit on timestamp change', () => {
    const commits: Commit[] = [
      { id: '1', message: 'new', timestamp: 2 },
      { id: '2', message: 'old', timestamp: 1 },
    ];
    const { container, rerender } = render(
      <CommitLog commits={commits} timestamp={1500} visible={2} />,
    );
    expect(container.querySelector('li.current')?.textContent).toBe('old');
    act(() => {
      rerender(<CommitLog commits={commits} timestamp={2500} visible={2} />);
    });
    expect(container.querySelector('li.current')?.textContent).toBe('new');
    expect(container.querySelectorAll('li').length).toBeGreaterThanOrEqual(1);
  });
});
