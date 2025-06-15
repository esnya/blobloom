import React from 'react';

export interface PlayButtonProps {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export const PlayButton = ({ buttonRef }: PlayButtonProps): React.JSX.Element => (
  <button ref={buttonRef}>Play</button>
);
