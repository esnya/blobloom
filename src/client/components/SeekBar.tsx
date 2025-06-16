import React from 'react';

export interface SeekBarProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function SeekBar({ value, min, max, onChange }: SeekBarProps): React.JSX.Element {
  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number((e.target as HTMLInputElement).value))}
    />
  );
}
