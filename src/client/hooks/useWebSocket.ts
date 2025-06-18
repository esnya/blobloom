// eslint-disable-next-line no-restricted-syntax
import { useCallback, useEffect, useRef } from 'react';
import { useLatest } from './useLatest';
import { WebSocketClient } from '../logic/WebSocketClient';

interface UseWebSocketOptions {
  url: string;
  onMessage: (ev: MessageEvent) => void;
  reconnectDelay?: number;
}

export const useWebSocket = ({
  url,
  onMessage,
  reconnectDelay = 1000,
}: UseWebSocketOptions) => {
  const messageRef = useLatest(onMessage);
  // eslint-disable-next-line no-restricted-syntax
  const clientRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    clientRef.current?.dispose();
    clientRef.current = new WebSocketClient({
      url,
      onMessage: (ev) => messageRef.current(ev),
      reconnectDelay,
    });
    return () => clientRef.current?.dispose();
  }, [url, reconnectDelay, messageRef]);

  const send = useCallback((data: string) => clientRef.current?.send(data), []);
  const close = useCallback(() => clientRef.current?.close(), []);

  return { send, close } as const;
};
