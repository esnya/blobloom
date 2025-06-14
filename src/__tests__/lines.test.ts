/** @jest-environment jsdom */
import { fetchLineCounts } from '../client/api';
import {
  renderFileSimulation,
  computeScale,
  createFileSimulation,
} from '../client/lines';
import type { LineCount } from '../client/types';

describe('lines module', () => {
  it('fetches line counts with timestamp', async () => {
    const json = jest.fn().mockResolvedValue([{ file: 'a', lines: 1 }] as LineCount[]);
    await expect(fetchLineCounts(json, 100)).resolves.toEqual([{ file: 'a', lines: 1 }]);
    expect(json).toHaveBeenCalledWith('/api/lines?ts=100');
  });

  it('renders circles', () => {
    const div = document.createElement('div');
    div.getBoundingClientRect = () => ({
      width: 200,
      height: 200,
      top: 0,
      left: 0,
      bottom: 200,
      right: 200,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
    const data: LineCount[] = [
      { file: 'a', lines: 1 },
      { file: 'b', lines: 2 },
    ];
    const callbacks: FrameRequestCallback[] = [];
    const raf = (cb: FrameRequestCallback): number => {
      callbacks.push(cb);
      return 1;
    };
    const stop = renderFileSimulation(div, data, { raf, now: () => 0 });
    callbacks[0]?.(0);
    expect(div.querySelectorAll('.file-circle')).toHaveLength(2);
    stop();
  });

  it('reuses elements with same file name', () => {
    const div = document.createElement('div');
    div.getBoundingClientRect = () => ({
      width: 200,
      height: 200,
      top: 0,
      left: 0,
      bottom: 200,
      right: 200,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
    const callbacks: FrameRequestCallback[] = [];
    const raf = (cb: FrameRequestCallback): number => {
      callbacks.push(cb);
      return 1;
    };
    const sim = createFileSimulation(div, { raf, now: () => 0 });
    sim.update([{ file: 'a', lines: 1 }]);
    callbacks[0]?.(0);
    const first = div.querySelector('.file-circle');
    sim.update([{ file: 'a', lines: 2 }]);
    callbacks[1]?.(0);
    const second = div.querySelector('.file-circle');
    expect(first).toBe(second);
    sim.destroy();
  });

  it('removes circles smaller than 1px', () => {
    const div = document.createElement('div');
    div.getBoundingClientRect = () => ({
      width: 0.5,
      height: 0.5,
      top: 0,
      left: 0,
      bottom: 0.5,
      right: 0.5,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
    const callbacks: FrameRequestCallback[] = [];
    const raf = (cb: FrameRequestCallback): number => {
      callbacks.push(cb);
      return 1;
    };
    const sim = createFileSimulation(div, { raf, now: () => 0 });
    sim.update([{ file: 'a', lines: 1 }]);
    callbacks[0]?.(0);
    expect(div.querySelectorAll('.file-circle')).toHaveLength(0);
    sim.destroy();
  });

  it('computes scale with easing', () => {
    const scale = computeScale(200, 200, [
      { file: 'a', lines: 1 },
      { file: 'b', lines: 2 },
    ]);
    expect(scale).toBeLessThan(100);
  });

  it('supports linear scaling option', () => {
    const data: LineCount[] = [
      { file: 'a', lines: 1 },
      { file: 'b', lines: 2 },
    ];
    const nonlinear = computeScale(200, 200, data);
    const linear = computeScale(200, 200, data, { linear: true });
    expect(linear).toBeLessThan(nonlinear);
  });

  it('returns eased scale when ratio exceeds threshold', () => {
    const scale = computeScale(1000, 200, [{ file: 'a', lines: 1 }]);
    expect(scale).toBeCloseTo(197.7, 1);
  });

  it('returns 0 when area is zero', () => {
    const scale = computeScale(0, 200, [{ file: 'a', lines: 1 }]);
    expect(scale).toBe(0);
  });

  it('pauses and resumes the simulation', () => {
    const div = document.createElement('div');
    div.getBoundingClientRect = () => ({
      width: 200,
      height: 200,
      top: 0,
      left: 0,
      bottom: 200,
      right: 200,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
    const callbacks: FrameRequestCallback[] = [];
    const raf = (cb: FrameRequestCallback): number => {
      callbacks.push(cb);
      return 1;
    };
    const sim = createFileSimulation(div, { raf, now: () => 0 });
    sim.pause();
    callbacks[0]?.(0);
    expect(callbacks).toHaveLength(1);
    sim.resume();
    expect(callbacks).toHaveLength(2);
    sim.destroy();
  });

  it('resizes the simulation space', () => {
    const div = document.createElement('div');
    let size = 200;
    div.getBoundingClientRect = () => ({
      width: size,
      height: size,
      top: 0,
      left: 0,
      bottom: size,
      right: size,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
    const callbacks: FrameRequestCallback[] = [];
    const raf = (cb: FrameRequestCallback): number => {
      callbacks.push(cb);
      return 1;
    };
    const sim = createFileSimulation(div, { raf, now: () => 0 });
    const data: LineCount[] = [{ file: 'a', lines: 5 }];
    sim.update(data);
    callbacks[0]?.(0);
    const circle = div.querySelector('.file-circle') as HTMLElement;
    const initial = circle.style.width;
    size = 400;
    sim.resize();
    callbacks[1]?.(0);
    expect(circle.style.width).not.toBe(initial);
    sim.destroy();
  });

  it('toggles character effects', () => {
    const div = document.createElement('div');
    div.getBoundingClientRect = () => ({
      width: 200,
      height: 200,
      top: 0,
      left: 0,
      bottom: 200,
      right: 200,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
    const sim = createFileSimulation(div, { raf: () => 1, now: () => 0 });
    sim.setEffectsEnabled(false);
    sim.update([{ file: 'a', lines: 1 }]);
    expect(div.querySelectorAll('.add-char').length).toBe(0);
    sim.setEffectsEnabled(true);
    sim.update([{ file: 'a', lines: 2 }]);
    expect(div.querySelectorAll('.add-char').length).toBeGreaterThan(0);
    sim.destroy();
  });
});
