/** @jest-environment jsdom */
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { App } from '../../client/App';
import { setupAppTest } from '../helpers/app';

const commits = [
  { id: 'n', message: 'new', timestamp: 2 },
  { id: 'o', message: 'old', timestamp: 1 },
];

describe('App commit log', () => {
  let restore: () => void;

  beforeEach(() => {
    jest.resetModules();
    restore = setupAppTest({ commits });
  });

  afterEach(() => {
    restore();
  });

  it('renders commit log after loading', async () => {
    const { container } = render(<App />);
    await waitFor(() =>
      expect(container.querySelectorAll('#commit-log li')).toHaveLength(2),
    );
  });
});
