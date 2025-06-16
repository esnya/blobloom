/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useFileSimulation } from '../client/hooks/useFileSimulation';
import { createFileSimulation } from '../client/fileSimulation';

jest.mock('../client/fileSimulation');

const mockSim = {
  update: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  resize: jest.fn(),
  destroy: jest.fn(),
};

describe('useFileSimulation', () => {
  beforeEach(() => {
    (createFileSimulation as jest.Mock).mockReturnValue({ ...mockSim });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes simulation and forwards controls', () => {
    const container = document.createElement('div');

    const { result } = renderHook(() => useFileSimulation(container));

    expect(createFileSimulation).toHaveBeenCalledWith(container, {});

    act(() => {
      result.current.update([]);
      result.current.pause();
      result.current.resume();
    });

    expect(mockSim.update).toHaveBeenCalledWith([]);
    expect(mockSim.pause).toHaveBeenCalled();
    expect(mockSim.resume).toHaveBeenCalled();
  });

  it('cleans up on unmount', () => {
    const container = document.createElement('div');

    const { unmount } = renderHook(() => useFileSimulation(container));
    unmount();

    expect(mockSim.destroy).toHaveBeenCalled();
  });
});
