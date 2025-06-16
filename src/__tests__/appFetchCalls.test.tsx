/** @jest-environment jsdom */
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { App } from '../client/App';
import { setupAppTest } from './helpers/app';

const commits = [
  { id: 'n', message: 'new', timestamp: 2 },
  { id: 'o', message: 'old', timestamp: 1 },
];

describe('App API calls', () => {
  let restore: () => void;

  beforeEach(() => {
    jest.resetModules();
    restore = setupAppTest({ commits });
  });

  afterEach(() => {
    restore();
  });

  it('fetches commits once and lines on timestamp change', async () => {
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector('#commit-log')).toBeTruthy());
    const fetchMock = global.fetch as jest.Mock;
    expect(
      fetchMock.mock.calls.filter(
        ([u]) => typeof u === 'string' && u.startsWith('/api/commits') && !u.includes('/lines'),
      ),
    ).toHaveLength(1);
    expect(fetchMock.mock.calls.some(([u]) => typeof u === 'string' && u.includes('/lines'))).toBe(false);

    const input = container.querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1500' } });

    await waitFor(() => expect(fetchMock.mock.calls.length).toBe(1));
    expect(
      fetchMock.mock.calls.filter(
        ([u]) => typeof u === 'string' && u.startsWith('/api/commits') && !u.includes('/lines'),
      ),
    ).toHaveLength(1);
  });
});
