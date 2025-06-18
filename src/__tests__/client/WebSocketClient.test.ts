/** @jest-environment jsdom */
import { WebSocketClient } from '../../client/logic/WebSocketClient';

describe('WebSocketClient', () => {
  const originalWebSocket = global.WebSocket;

  afterEach(() => {
    global.WebSocket = originalWebSocket;
    jest.useRealTimers();
  });

  it('does not reconnect after close', () => {
    jest.useFakeTimers();
    const sockets: Array<{
      send: jest.Mock<void, [string]>;
      triggerOpen: () => void;
      triggerClose: () => void;
    }> = [];
    global.WebSocket = jest.fn(() => {
      let openHandler: (() => void) | undefined;
      let closeHandler: (() => void) | undefined;
      const send = jest.fn() as jest.Mock<void, [string]>;
      const socket = {
        readyState: 1,
        send,
        close: jest.fn(),
        addEventListener: (ev: string, cb: (e: Event) => void) => {
          if (ev === 'open') openHandler = () => cb(new Event('open'));
          if (ev === 'close' || ev === 'error') closeHandler = () => cb(new CloseEvent('close'));
        },
      } as unknown as WebSocket;
      sockets.push({
        send,
        triggerOpen: () => openHandler?.(),
        triggerClose: () => closeHandler?.(),
      });
      return socket;
    }) as unknown as typeof WebSocket;
    (global.WebSocket as unknown as { OPEN: number }).OPEN = 1;

    const client = new WebSocketClient({ url: 'ws://test', onMessage: jest.fn(), reconnectDelay: 1000 });

    client.send('hello');
    sockets[0]?.triggerOpen();
    client.close();
    sockets[0]?.triggerClose();

    jest.advanceTimersByTime(1000);
    jest.runOnlyPendingTimers();

    expect(sockets).toHaveLength(1);
  });

  it('reconnects when sending after close', () => {
    jest.useFakeTimers();
    const sockets: Array<{
      send: jest.Mock<void, [string]>;
      triggerOpen: () => void;
      triggerClose: () => void;
    }> = [];
    global.WebSocket = jest.fn(() => {
      let openHandler: (() => void) | undefined;
      let closeHandler: (() => void) | undefined;
      const send = jest.fn() as jest.Mock<void, [string]>;
      const socket = {
        readyState: 1,
        send,
        close: jest.fn(),
        addEventListener: (ev: string, cb: (e: Event) => void) => {
          if (ev === 'open') openHandler = () => cb(new Event('open'));
          if (ev === 'close' || ev === 'error') closeHandler = () => cb(new CloseEvent('close'));
        },
      } as unknown as WebSocket;
      sockets.push({
        send,
        triggerOpen: () => openHandler?.(),
        triggerClose: () => closeHandler?.(),
      });
      return socket;
    }) as unknown as typeof WebSocket;
    (global.WebSocket as unknown as { OPEN: number }).OPEN = 1;

    const client = new WebSocketClient({ url: 'ws://test', onMessage: jest.fn(), reconnectDelay: 1000 });

    client.send('first');
    sockets[0]?.triggerOpen();
    client.close();
    sockets[0]?.triggerClose();

    jest.advanceTimersByTime(1000);
    jest.runOnlyPendingTimers();
    expect(sockets).toHaveLength(1);

    client.send('second');
    expect(sockets).toHaveLength(2);
    sockets[1]?.triggerOpen();
    expect(sockets[1]?.send).toHaveBeenCalledWith('second');
  });
});

