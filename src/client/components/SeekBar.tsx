import React from 'react';

export interface SeekBarProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function SeekBar({ value, min, max, onChange: _onChange }: SeekBarProps): React.JSX.Element {
  // TODO: re-enable onChange once playback is stable
  void _onChange;
  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      onChange={() => {}}
    />
  );
}
