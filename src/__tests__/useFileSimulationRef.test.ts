/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useFileSimulationRef } from '../client/hooks';
import { createFileSimulation } from '../client/fileSimulation';

jest.mock('../client/fileSimulation');

const mockSim = {
  update: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  resize: jest.fn(),
  destroy: jest.fn(),
  setEffectsEnabled: jest.fn(),
};

describe('useFileSimulationRef', () => {
  beforeEach(() => {
    (createFileSimulation as jest.Mock).mockReturnValue({ ...mockSim });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes simulation when ref assigned and forwards controls', () => {
    const { result } = renderHook(() => useFileSimulationRef());
    const el = document.createElement('div');

    act(() => {
      result.current.ref(el);
    });

    expect(createFileSimulation).toHaveBeenCalledWith(el, {});

    act(() => {
      result.current.update([]);
      result.current.pause();
      result.current.resume();
      result.current.setEffectsEnabled(true);
    });

    expect(mockSim.update).toHaveBeenCalledWith([]);
    expect(mockSim.pause).toHaveBeenCalled();
    expect(mockSim.resume).toHaveBeenCalled();
    expect(mockSim.setEffectsEnabled).toHaveBeenCalledWith(true);
  });

  it('cleans up on unmount', () => {
    const { result, unmount } = renderHook(() => useFileSimulationRef());
    const el = document.createElement('div');
    act(() => result.current.ref(el));

    unmount();

    expect(mockSim.destroy).toHaveBeenCalled();
  });
});
