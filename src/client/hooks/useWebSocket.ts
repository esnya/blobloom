/* eslint-disable no-restricted-syntax */
import { useCallback, useEffect, useRef } from 'react';
import { useLatest } from './useLatest';

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
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);
  const activeRef = useRef(true);
  const queuedRef = useRef<string | null>(null);
  const lastRef = useRef<string | null>(null);

  const sendQueued = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && queuedRef.current) {
      socketRef.current.send(queuedRef.current);
      queuedRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current || !activeRef.current) return;
    const socket = new WebSocket(url);
    socket.addEventListener('open', sendQueued);
    socket.addEventListener('message', (ev) => messageRef.current(ev));
    const retry = () => {
      socketRef.current = null;
      if (activeRef.current) {
        queuedRef.current = lastRef.current;
        reconnectRef.current = setTimeout(connect, reconnectDelay);
      }
    };
    socket.addEventListener('close', retry);
    socket.addEventListener('error', retry);
    socketRef.current = socket;
  }, [url, sendQueued, messageRef, reconnectDelay]);

  const send = useCallback(
    (data: string) => {
      connect();
      queuedRef.current = data;
      lastRef.current = data;
      sendQueued();
    },
    [connect, sendQueued],
  );

  const close = useCallback(() => {
    activeRef.current = false;
    if (reconnectRef.current) clearTimeout(reconnectRef.current);
    socketRef.current?.close();
    socketRef.current = null;
    activeRef.current = true;
  }, []);

  useEffect(
    () => () => {
      activeRef.current = false;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      socketRef.current?.close();
    },
    [],
  );

  return { send, close } as const;
};
