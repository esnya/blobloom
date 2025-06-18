/** @jest-environment jsdom */
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { App } from '../../client/App';
import { setupAppTest } from '../helpers/app';

const commits = [
  { id: 'n', message: 'new', timestamp: 2 },
  { id: 'o', message: 'old', timestamp: 1 },
];

describe('App hides UI until timeline ready', () => {
  let restore: () => void;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();
    restore = setupAppTest({ commits, doneDelay: 100 });
  });

  afterEach(() => {
    jest.useRealTimers();
    restore();
  });

  it('renders loading placeholder before initial data', () => {
    const { container } = render(<App />);
    expect(container.textContent).toContain('Loading timeline...');
  });

  it('shows timestamp after data arrives', async () => {
    const { container } = render(<App />);
    jest.advanceTimersByTime(100);
    await waitFor(() =>
      expect(container.querySelector('#timestamp')).not.toBeNull(),
    );
  });
});
