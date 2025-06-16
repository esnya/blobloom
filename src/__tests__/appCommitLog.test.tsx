/** @jest-environment jsdom */
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { App } from '../client/App';

const commits = [
  { message: 'new', timestamp: 2 },
  { message: 'old', timestamp: 1 },
];

describe('App commit log', () => {
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

  it('renders commit log after loading', async () => {
    const { container } = render(<App />);
    await waitFor(() =>
      expect(container.querySelectorAll('#commit-log li')).toHaveLength(2),
    );
  });
});
