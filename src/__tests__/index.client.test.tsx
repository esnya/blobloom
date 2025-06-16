/** @jest-environment jsdom */
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { App } from '../client/App';

describe('client index', () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      if (typeof input === 'string' && input.startsWith('/api/commits')) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              commits: [
                { commit: { message: 'msg', committer: { timestamp: 1 } } },
              ],
            }),
        });
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

  it('mounts App without crashing', async () => {
    const { container } = render(<App />);
    await waitFor(() => expect(container.firstChild).toBeTruthy());
  });
});
