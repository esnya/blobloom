import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createPlayer } from '../player.js';

export interface PlayButtonHandle {
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isPlaying: () => boolean;
}

export interface PlayButtonProps {
  seekRef: React.RefObject<HTMLInputElement | null>;
  durationRef: React.RefObject<HTMLInputElement | null>;
  start: number;
  end: number;
  onPlayStateChange: (playing: boolean) => void;
}

export const PlayButton = forwardRef<PlayButtonHandle, PlayButtonProps>(
  ({ seekRef, durationRef, start, end, onPlayStateChange }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const playerRef = useRef<ReturnType<typeof createPlayer> | null>(null);

    useEffect(() => {
      if (!seekRef.current || !durationRef.current || !buttonRef.current) return;
      const player = createPlayer({
        seek: seekRef.current,
        duration: durationRef.current,
        playButton: buttonRef.current,
        start,
        end,
        onPlayStateChange,
      });
      playerRef.current = player;
      return () => player.pause();
    }, [seekRef, durationRef, start, end, onPlayStateChange]);

    useImperativeHandle(ref, () => ({
      stop: () => playerRef.current?.stop(),
      pause: () => playerRef.current?.pause(),
      resume: () => playerRef.current?.resume(),
      isPlaying: () => playerRef.current?.isPlaying() ?? false,
    }));

    return <button ref={buttonRef}>Play</button>;
  },
);
