import React from 'react';

export interface SeekBarProps {
  value: number;
  onInput: (value: number) => void;
  onReady?: (el: HTMLInputElement | null) => void;
}

export function SeekBar({ value, onInput, onReady }: SeekBarProps): React.JSX.Element {
  return (
    <input
      type="range"
      value={value}
      ref={onReady ?? undefined}
      onInput={(e) => onInput(Number((e.target as HTMLInputElement).value))}
    />
  );
}
