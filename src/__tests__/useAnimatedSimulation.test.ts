/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useAnimatedSimulation } from '../client/hooks';
import { createFileSimulation } from '../client/lines';
import type { LineCount } from '../client/types';

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

describe('useAnimatedSimulation', () => {
  it('updates on data change and forwards controls', () => {
    const container = document.createElement('div');
    const ref = { current: container } as React.RefObject<HTMLDivElement>;
    const { result, rerender, unmount } = renderHook(
      ({ d }: { d: LineCount[] }) => useAnimatedSimulation(ref, d),
      { initialProps: { d: [] as LineCount[] } },
    );
    expect(createFileSimulation).toHaveBeenCalledWith(container, {});

    act(() => {
      rerender({ d: [{ file: 'a', lines: 1 }] });
    });
    expect(mockSim.update).toHaveBeenCalledWith([{ file: 'a', lines: 1 }]);

    act(() => {
      result.current.pause();
      result.current.resume();
      result.current.setEffectsEnabled(true);
    });
    expect(mockSim.pause).toHaveBeenCalled();
    expect(mockSim.resume).toHaveBeenCalled();
    expect(mockSim.setEffectsEnabled).toHaveBeenCalledWith(true);

    unmount();
    expect(mockSim.destroy).toHaveBeenCalled();
  });
});
