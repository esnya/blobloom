import React from 'react';

export interface SeekBarProps {
  value: number;
  onInput: (value: number) => void;
}

export function SeekBar({ value, onInput }: SeekBarProps): React.JSX.Element {
  return (
    <input
      type="range"
      value={value}
      onInput={(e) => onInput(Number((e.target as HTMLInputElement).value))}
    />
  );
}
