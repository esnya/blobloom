/** @jest-environment jsdom */
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { App } from '../client/App';

const commits = [
  { commit: { message: 'new', committer: { timestamp: 2 } } },
  { commit: { message: 'old', committer: { timestamp: 1 } } },
];

describe('App API calls', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '<div id="root"></div>';
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      if (typeof input === 'string' && input.startsWith('/api/commits')) {
        return Promise.resolve({ json: () => Promise.resolve({ commits }) });
      }
      if (typeof input === 'string' && input.startsWith('/api/lines')) {
        return Promise.resolve({ json: () => Promise.resolve({ counts: [{ file: 'a', lines: 1 }] }) });
      }
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input instanceof Request
              ? input.url
              : '';
      return Promise.reject(new Error(`Unexpected url: ${url}`));
    }) as jest.Mock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetches commits once and lines on timestamp change', async () => {
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector('#commit-log')).toBeTruthy());
    const fetchMock = global.fetch as jest.Mock;
    expect(
      fetchMock.mock.calls.filter(([u]) => typeof u === 'string' && u.startsWith('/api/commits')),
    ).toHaveLength(1);
    expect(
      fetchMock.mock.calls.filter(([u]) => typeof u === 'string' && u.startsWith('/api/lines')),
    ).toHaveLength(1);

    const input = container.querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1500' } });

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.filter(([u]) => typeof u === 'string' && u.startsWith('/api/lines')).length,
      ).toBe(2),
    );
    expect(
      fetchMock.mock.calls.filter(([u]) => typeof u === 'string' && u.startsWith('/api/commits')),
    ).toHaveLength(1);
  });
});
