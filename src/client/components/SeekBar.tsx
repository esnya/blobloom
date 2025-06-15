import React from 'react';

export interface SeekBarProps {
  value: number;
  min: number;
  max: number;
  onInput: (value: number) => void;
}

export function SeekBar({ value, min, max, onInput }: SeekBarProps): React.JSX.Element {
  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      onInput={(e) => onInput(Number((e.target as HTMLInputElement).value))}
    />
  );
}
