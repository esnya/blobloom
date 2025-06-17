/** @jest-environment jsdom */
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { App } from '../../client/App';
import { setupAppTest } from '../helpers/app';

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

  it('does not fetch commits and uses WebSocket for lines', async () => {
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector('#commit-log')).toBeTruthy());
    const fetchMock = global.fetch as jest.Mock;
    expect(fetchMock.mock.calls).toHaveLength(0);

    const input = container.querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1500' } });

    await waitFor(() => expect(fetchMock.mock.calls.length).toBe(0));
  });
});
