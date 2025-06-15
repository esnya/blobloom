import React from 'react';

export interface DurationInputProps {
  defaultValue?: number;
  onInput?: (value: number) => void;
}

export interface DurationInputCallbacks {
  onReady?: (el: HTMLInputElement | null) => void;
}

export function DurationInput({
  defaultValue = 20,
  onInput,
  onReady,
}: DurationInputProps & DurationInputCallbacks): React.JSX.Element {
  return (
    <input
      type="number"
      ref={onReady ?? undefined}
      defaultValue={defaultValue}
      min={1}
      onInput={
        onInput ? (e) => onInput(Number((e.target as HTMLInputElement).value)) : undefined
      }
    />
  );
}
