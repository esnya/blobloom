/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useAnimatedSimulation } from '../client/hooks';
import { createFileSimulation } from '../client/fileSimulation';
import type { LineCount } from '../client/types';

jest.mock('../client/fileSimulation');

const mockSim = {
  update: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  resize: jest.fn(),
  destroy: jest.fn(),
  setEffectsEnabled: jest.fn(),
};

describe('useAnimatedSimulation', () => {
  beforeEach(() => {
    (createFileSimulation as jest.Mock).mockReturnValue({ ...mockSim });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('updates simulation when data changes and forwards controls', () => {
    const container = document.createElement('div');
    let lines: LineCount[] = [];

    const { result, rerender } = renderHook(
      ({ data }) => useAnimatedSimulation(container, data),
      { initialProps: { data: lines } },
    );

    expect(createFileSimulation).toHaveBeenCalledWith(container, {});
    expect(mockSim.update).not.toHaveBeenCalled();

    lines = [{ file: 'f', lines: 1 }];
    rerender({ data: lines });

    expect(mockSim.update).toHaveBeenCalledWith(lines);

    act(() => {
      result.current.pause();
      result.current.resume();
      result.current.setEffectsEnabled(false);
    });

    expect(mockSim.pause).toHaveBeenCalled();
    expect(mockSim.resume).toHaveBeenCalled();
    expect(mockSim.setEffectsEnabled).toHaveBeenCalledWith(false);
  });

  it('destroys simulation on unmount', () => {
    const container = document.createElement('div');
    const { unmount } = renderHook(() =>
      useAnimatedSimulation(container, [{ file: 'a', lines: 1 }]),
    );

    unmount();
    expect(mockSim.destroy).toHaveBeenCalled();
  });
});
