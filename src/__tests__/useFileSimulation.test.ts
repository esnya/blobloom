/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useFileSimulation } from '../client/hooks';
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

describe('useFileSimulation', () => {
  beforeEach(() => {
    (createFileSimulation as jest.Mock).mockReturnValue({ ...mockSim });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes simulation and forwards controls', () => {
    const container = document.createElement('div');
    const ref = { current: container } as React.RefObject<HTMLDivElement>;

    const { result } = renderHook(() => useFileSimulation(ref));

    expect(createFileSimulation).toHaveBeenCalledWith(container, {});

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
    const container = document.createElement('div');
    const ref = { current: container } as React.RefObject<HTMLDivElement>;

    const { unmount } = renderHook(() => useFileSimulation(ref));
    unmount();

    expect(mockSim.destroy).toHaveBeenCalled();
  });
});
