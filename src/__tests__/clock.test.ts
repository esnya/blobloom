/** @jest-environment jsdom */
import { createMasterClock } from '../client/clock';

jest.useFakeTimers();

describe('createMasterClock', () => {
  it('invokes callbacks with shared time', () => {
    const times: number[] = [];
    const clock = createMasterClock();
    clock.request((t) => times.push(t));
    clock.request((t) => times.push(t));
    // Advance one frame
    jest.advanceTimersByTime(16);
    jest.runOnlyPendingTimers();
    expect(times[0]).toBe(times[1]);
    clock.stop();
  });
});
