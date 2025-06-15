/** @jest-environment jsdom */

describe('index.tsx', () => {
  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '<div id="root"></div>';
  });

  it('mounts the app', async () => {
    const createRoot = jest.fn(() => ({ render: jest.fn() }));
    jest.doMock('react-dom/client', () => ({ createRoot }));
    await import('../client/index');
    expect(createRoot).toHaveBeenCalled();
  });
});
