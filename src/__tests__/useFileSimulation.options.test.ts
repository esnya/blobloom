/** @jest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { useFileSimulation } from '../client/hooks';
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

beforeEach(() => {
  (createFileSimulation as jest.Mock).mockReturnValue({ ...mockSim });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useFileSimulation options', () => {
  it('ignores null container', () => {
    renderHook(() => useFileSimulation(null));
    expect(createFileSimulation).not.toHaveBeenCalled();
  });

  it('passes options and handles resize', () => {
    const container = document.createElement('div');
    const options = { raf: jest.fn(), now: jest.fn(), linear: true };
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useFileSimulation(container, options));

    expect(createFileSimulation).toHaveBeenCalledWith(container, options);
    expect(addSpy).toHaveBeenCalledWith('resize', mockSim.resize);

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', mockSim.resize);
  });
});
