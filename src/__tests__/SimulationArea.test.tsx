/** @jest-environment jsdom */
import React from 'react';
import { render, act } from '@testing-library/react';
import { SimulationArea } from '../client/components/SimulationArea';
import { useFileSimulation } from '../client/hooks/useFileSimulation';
import type { LineCount } from '../client/types';

jest.mock('../client/hooks/useFileSimulation');

const update = jest.fn();
const pause = jest.fn();
const resume = jest.fn();
const setEffectsEnabled = jest.fn();

(useFileSimulation as jest.Mock).mockReturnValue({
  update,
  pause,
  resume,
  setEffectsEnabled,
});

const data: LineCount[] = [{ file: 'a', lines: 1 }];

describe('SimulationArea', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFileSimulation as jest.Mock).mockReturnValue({
      update,
      pause,
      resume,
      setEffectsEnabled,
    });
  });

  it('forwards handle via onReady', () => {
    const onReady = jest.fn();
    render(<SimulationArea data={[]} onReady={onReady} />);
    expect(onReady).toHaveBeenCalledWith({ pause, resume, setEffectsEnabled });
  });

  it('updates simulation on data change', () => {
    const { rerender } = render(<SimulationArea data={[]} />);
    act(() => {
      rerender(<SimulationArea data={data} />);
    });
    expect(update).toHaveBeenCalledWith(data);
  });
});
