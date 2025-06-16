/** @jest-environment jsdom */
import React from 'react';
import { render, act } from '@testing-library/react';
import { SimulationArea } from '../client/components/SimulationArea';
import { useFileSimulation } from '../client/hooks/useFileSimulation';
import type { LineCount } from '../client/types';

jest.mock('../client/hooks/useFileSimulation');

const update = jest.fn();
(useFileSimulation as jest.Mock).mockReturnValue({
  update,
});

const data: LineCount[] = [{ file: 'a', lines: 1 }];

describe('SimulationArea', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFileSimulation as jest.Mock).mockReturnValue({
      update,
    });
  });

  it('updates simulation on data change', () => {
    const { rerender } = render(<SimulationArea data={[]} />);
    act(() => {
      rerender(<SimulationArea data={data} />);
    });
    expect(update).toHaveBeenCalledWith(data);
  });
});
