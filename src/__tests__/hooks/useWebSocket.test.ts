/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from '../../client/hooks/useWebSocket';

describe('useWebSocket', () => {
  const originalWebSocket = global.WebSocket;

  afterEach(() => {
    global.WebSocket = originalWebSocket;
    jest.useRealTimers();
  });

  it('queues messages until connection opens and resends on reconnect', () => {
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
          if (ev === 'close') closeHandler = () => cb(new CloseEvent('close'));
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
    (global.WebSocket as unknown as { OPEN: number }).OPEN = 1;

    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://test', onMessage: jest.fn() }),
    );

    act(() => {
      result.current.send('hello');
    });

    act(() => {
      sockets[0]?.triggerOpen();
    });
    expect(sockets[0]?.send).toHaveBeenCalledWith('hello');

    act(() => {
      sockets[0]?.triggerClose();
      jest.advanceTimersByTime(1000);
      jest.runOnlyPendingTimers();
    });

    expect(sockets[1]).toBeDefined();
    act(() => {
      sockets[1]?.triggerOpen();
    });
    expect(sockets[1]?.send).toHaveBeenCalledWith('hello');
  });

  it('forwards messages to the handler', () => {
    let messageHandler: ((e: MessageEvent) => void) | undefined;
    const sockets: Array<{ triggerOpen: () => void }> = [];
    global.WebSocket = jest.fn(() => {
      let openHandler: (() => void) | undefined;
      const socket = {
        readyState: 1,
        send: jest.fn(),
        close: jest.fn(),
        addEventListener: (ev: string, cb: (e: Event) => void) => {
          if (ev === 'message') messageHandler = cb as (e: MessageEvent) => void;
          if (ev === 'open') openHandler = () => cb(new Event('open'));
        },
      } as unknown as WebSocket;
      sockets.push({ triggerOpen: () => openHandler?.() });
      return socket;
    }) as unknown as typeof WebSocket;

    const onMessage = jest.fn();
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://test', onMessage }),
    );

    act(() => {
      result.current.send('ping');
      sockets[0]?.triggerOpen();
    });

    act(() => {
      messageHandler?.(new MessageEvent('message', { data: 'x' }));
    });

    expect(onMessage).toHaveBeenCalled();
  });
});
