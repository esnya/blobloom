/** @jest-environment jsdom */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { SeekBar } from '../../client/components/SeekBar';

describe('SeekBar', () => {
  it('does not call onChange when value prop updates', () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <SeekBar value={0} min={0} max={10} onChange={onChange} />,
    );
    rerender(<SeekBar value={5} min={0} max={10} onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange on user input', () => {
    const onChange = jest.fn();
    const { container } = render(
      <SeekBar value={0} min={0} max={10} onChange={onChange} />,
    );
    const input = container.querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '5' } });
    expect(onChange).toHaveBeenCalledWith(5);
  });
});
