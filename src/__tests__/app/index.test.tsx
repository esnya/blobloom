/** @jest-environment jsdom */
import { waitFor } from '@testing-library/react';
import { setupAppTest } from '../helpers/app';

describe('index.tsx', () => {
  let restore: () => void;

  beforeEach(() => {
    jest.resetModules();
    restore = setupAppTest();
  });

  afterEach(() => {
    restore();
  });

  it('mounts the app', async () => {
    const root = document.getElementById('root') as HTMLElement;
    const actual = await import('react-dom/client');
    const spy = jest.fn(actual.createRoot);
    jest.doMock('react-dom/client', () => ({
      ...actual,
      createRoot: (...args: Parameters<typeof actual.createRoot>) => {
        const instance = actual.createRoot(...args);
        spy(...args);
        return instance;
      },
    }));
    await import('../../client/index');
    expect(spy).toHaveBeenCalled();
    await waitFor(() => expect(root.firstChild).toBeTruthy());
  });
});
