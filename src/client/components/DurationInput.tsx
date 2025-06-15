import React from 'react';

export interface DurationInputProps {
  defaultValue?: number;
  onInput?: (value: number) => void;
}

export function DurationInput({ defaultValue = 20, onInput }: DurationInputProps): React.JSX.Element {
  return (
    <input
      type="number"
      defaultValue={defaultValue}
      min={1}
      onInput={
        onInput ? (e) => onInput(Number((e.target as HTMLInputElement).value)) : undefined
      }
    />
  );
}
