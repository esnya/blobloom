import React from 'react';

export interface SeekBarProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function SeekBar({ value, min, max, onChange, disabled }: SeekBarProps): React.JSX.Element {
  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number((e.target as HTMLInputElement).value))}
      disabled={disabled}
    />
  );
}
