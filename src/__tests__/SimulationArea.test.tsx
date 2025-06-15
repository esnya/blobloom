/** @jest-environment jsdom */
import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { SimulationArea, type SimulationAreaHandle } from '../client/components/SimulationArea';
import { createFileSimulation } from '../client/lines';

jest.mock('../client/lines');

const mockSim = {
  update: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  resize: jest.fn(),
  destroy: jest.fn(),
  setEffectsEnabled: jest.fn(),
};

beforeEach(() => {
  (createFileSimulation as jest.Mock).mockReturnValue({ ...mockSim });
  jest.clearAllMocks();
});

describe('SimulationArea', () => {
  it('initializes simulation and forwards controls', async () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const ref = React.createRef<SimulationAreaHandle>();
    const data = [{ file: 'a', lines: 1 }];
    const { container, rerender, unmount } = render(
      <SimulationArea data={[]} ref={ref} />,
    );
    await waitFor(() => expect(createFileSimulation).toHaveBeenCalled());
    const simEl = container.querySelector('#sim') as HTMLDivElement;
    expect(createFileSimulation).toHaveBeenCalledWith(simEl);
    expect(addSpy).toHaveBeenCalledWith('resize', mockSim.resize);

    act(() => {
      rerender(<SimulationArea data={data} ref={ref} />);
    });
    expect(mockSim.update).toHaveBeenCalledWith(data);

    act(() => {
      ref.current?.pause();
      ref.current?.resume();
      ref.current?.setEffectsEnabled(false);
    });
    expect(mockSim.pause).toHaveBeenCalled();
    expect(mockSim.resume).toHaveBeenCalled();
    expect(mockSim.setEffectsEnabled).toHaveBeenCalledWith(false);

    unmount();
    expect(mockSim.destroy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith('resize', mockSim.resize);
  });
});
