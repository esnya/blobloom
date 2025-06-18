/** @jest-environment node */
import { buildWsUrl, deriveWsOptions } from '../../client/ws';

describe('buildWsUrl', () => {
  const originalWindow = global.window;

  afterEach(() => {
    if (originalWindow) {
      global.window = originalWindow;
    } else {
      delete (global as { window?: unknown }).window;
    }
  });

  it('uses ws scheme for http base URLs', () => {
    const url = buildWsUrl('/ws', deriveWsOptions('http://example.com'));
    expect(url).toBe('ws://example.com/ws');
  });

  it('uses wss scheme for https base URLs', () => {
    const url = buildWsUrl('/ws', deriveWsOptions('https://secure.com'));
    expect(url).toBe('wss://secure.com/ws');
  });

  it('uses window.location when no base URL is provided', () => {
    global.window = {
      location: { protocol: 'https:', host: 'my.host:8080' },
    } as unknown as Window & typeof globalThis;
    const url = buildWsUrl('/ws', deriveWsOptions());
    expect(url).toBe('wss://my.host:8080/ws');
  });
});
