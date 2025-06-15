import React, { useEffect, useState } from 'react';
import { usePlayer } from '../hooks';

export interface PlayButtonHandle {
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isPlaying: () => boolean;
}

export interface PlayButtonProps {
  seekEl: HTMLInputElement | null;
  durationEl: HTMLInputElement | null;
  start: number;
  end: number;
  onPlayStateChange: (playing: boolean) => void;
  onReady?: (handle: PlayButtonHandle) => void;
}

export function PlayButton({
  seekEl,
  durationEl,
  start,
  end,
  onPlayStateChange,
  onReady,
}: PlayButtonProps): React.JSX.Element {
  const [buttonEl, setButtonEl] = useState<HTMLButtonElement | null>(null);
  const { stop, pause, resume, isPlaying } = usePlayer(buttonEl, {
    seekEl,
    durationEl,
    start,
    end,
    onPlayStateChange,
  });

  useEffect(() => {
    onReady?.({ stop, pause, resume, isPlaying });
  }, [stop, pause, resume, isPlaying, onReady]);

  return <button ref={setButtonEl}>Play</button>;
}
