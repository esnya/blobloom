import React from 'react';

export interface DurationInputProps {
  defaultValue?: number;
  onInput?: (value: number) => void;
}

export const DurationInput = React.forwardRef<HTMLInputElement, DurationInputProps>(
  ({ defaultValue = 20, onInput }, ref) => (
    <input
      type="number"
      ref={ref}
      defaultValue={defaultValue}
      min={1}
      onInput={
        onInput ? (e) => onInput(Number((e.target as HTMLInputElement).value)) : undefined
      }
    />
  ),
);
