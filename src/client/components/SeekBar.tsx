import React from 'react';

export interface SeekBarProps {
  onInput: (value: number) => void;
}

export const SeekBar = React.forwardRef<HTMLInputElement, SeekBarProps>(
  ({ onInput }, ref) => (
    <input
      type="range"
      ref={ref}
      onInput={(e) => onInput(Number((e.target as HTMLInputElement).value))}
    />
  ),
);
