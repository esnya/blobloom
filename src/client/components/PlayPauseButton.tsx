import React from 'react';

export interface PlayPauseButtonProps {
  playing: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function PlayPauseButton({ playing, onToggle, disabled }: PlayPauseButtonProps): React.JSX.Element {
  return (
    <button type="button" onClick={onToggle} disabled={disabled}>
      {playing ? 'Pause' : 'Play'}
    </button>
  );
}
