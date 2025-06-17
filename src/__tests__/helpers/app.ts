export interface SetupAppOptions {
  commits?: { id: string; message: string; timestamp: number }[];
  lineCounts?: { file: string; lines: number; added?: number; removed?: number }[];
}

const defaultCommits = [
  { id: 'n', message: 'new', timestamp: 2 },
  { id: 'o', message: 'old', timestamp: 1 },
];

const defaultLineCounts = [
  { file: 'a', lines: 1 },
];

export const setupAppTest = (
  options: SetupAppOptions = {},
): (() => void) => {
  const { commits = defaultCommits, lineCounts = defaultLineCounts } = options;
  const originalFetch = global.fetch;
  const originalWs = (global as unknown as { WebSocket?: typeof WebSocket }).WebSocket;

  document.body.innerHTML = '<div id="root"></div>';

  global.WebSocket = jest.fn(() => {
    let messageHandler: ((e: MessageEvent) => void) | undefined;
    return {
      send: jest.fn((raw: string) => {
        const { token } = JSON.parse(raw) as { token?: number };
        messageHandler?.(
          new MessageEvent('message', {
            data: JSON.stringify({ type: 'range', start: 1000, end: 2000, token }),
          }),
        );
        messageHandler?.(
          new MessageEvent('message', {
            data: JSON.stringify({ type: 'data', counts: lineCounts, commits, token }),
          }),
        );
        messageHandler?.(new MessageEvent('message', { data: JSON.stringify({ type: 'done', token }) }));
      }),
      close: jest.fn(),
      addEventListener: (ev: string, cb: (e: MessageEvent) => void) => {
        if (ev === 'open') cb(new MessageEvent('open'));
        if (ev === 'message') messageHandler = cb;
      },
    } as unknown as WebSocket;
  }) as unknown as typeof WebSocket;

  global.fetch = jest.fn(() => Promise.reject(new Error('Unexpected fetch')));

  return () => {
    global.fetch = originalFetch;
    if (originalWs) {
      global.WebSocket = originalWs;
    } else {
      delete (global as unknown as { WebSocket?: unknown }).WebSocket;
    }
  };
};
