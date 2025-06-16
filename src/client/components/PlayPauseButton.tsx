import React from 'react';

export interface PlayPauseButtonProps {
  playing: boolean;
  onToggle: () => void;
}

export function PlayPauseButton({ playing, onToggle }: PlayPauseButtonProps): React.JSX.Element {
  return (
    <button type="button" onClick={onToggle}>
      {playing ? 'Pause' : 'Play'}
    </button>
  );
}
