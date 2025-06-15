import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { usePlayer } from '../hooks/index.js';

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
    const { stop, pause, resume, isPlaying } = usePlayer(buttonRef, {
      seekRef: seekRef as React.RefObject<HTMLInputElement>,
      durationRef: durationRef as React.RefObject<HTMLInputElement>,
      start,
      end,
      onPlayStateChange,
    });

    useImperativeHandle(ref, () => ({ stop, pause, resume, isPlaying }));

    return <button ref={buttonRef}>Play</button>;
  },
);
