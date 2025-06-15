import React from 'react';

export interface PlayButtonProps {
  playing: boolean;
  onToggle: () => void;
}

export function PlayButton({ playing, onToggle }: PlayButtonProps): React.JSX.Element {
  return <button onClick={onToggle}>{playing ? 'Pause' : 'Play'}</button>;
}
