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
        return Promise.resolve({ json: () => Promise.resolve({ counts: [] }) });
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

  it('passes the timestamp in the lines API request', async () => {
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector('#commit-log')).toBeTruthy());
    const fetchMock = global.fetch as jest.Mock;
    const calls = fetchMock.mock.calls as Array<[string]>;
    const first = calls.find(([u]) => typeof u === 'string' && u.startsWith('/api/lines'));
    expect(first?.[0]).toBe('/api/lines?ts=1000');

    const input = container.querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1500' } });

    await waitFor(() =>
      calls.filter(([u]) => typeof u === 'string' && u.startsWith('/api/lines')).length === 2,
    );
    const second = calls.filter(([u]) => typeof u === 'string' && u.startsWith('/api/lines'))[1];
    expect(second?.[0]).toBe('/api/lines?ts=1500');
  });
});
