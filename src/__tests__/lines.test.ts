/** @jest-environment jsdom */
import { fetchLineCounts } from '../client/api';
import {
  renderFileSimulation,
  createFileSimulation,
  MAX_EFFECT_CHARS,
} from '../client/fileSimulation';
import { computeScale } from '../client/scale';
import { act } from '@testing-library/react';
import type { LineCount } from '../client/types';

describe('lines module', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetches line counts', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ counts: [{ file: 'a', lines: 1 }] }),
    });
    await expect(fetchLineCounts('abc')).resolves.toEqual([{ file: 'a', lines: 1 }]);
    expect(global.fetch).toHaveBeenCalledWith('/api/commits/abc/lines');
  });

  it('throws on empty counts', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ counts: [] }),
    });
    await expect(fetchLineCounts('abc')).rejects.toThrow('No line counts');
  });

  it('renders circles', async () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
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
    let stop!: () => void;
    await act(() => {
      stop = renderFileSimulation(div, data, { raf, now: () => 0 });
      return Promise.resolve();
    });
    callbacks[0]?.(0);
    expect(div.querySelectorAll('.file-circle')).toHaveLength(2);
    stop();
  });

  it('reuses elements with same file name', async () => {
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
    let sim!: ReturnType<typeof createFileSimulation>;
    await act(() => {
      sim = createFileSimulation(div, { raf, now: () => 0 });
      return Promise.resolve();
    });
    await act(() => {
      sim.update([{ file: 'a', lines: 1 }]);
      return Promise.resolve();
    });
    await act(() => Promise.resolve());
    callbacks[0]?.(0);
    const first = div.querySelector('.file-circle');
    await act(() => {
      sim.update([{ file: 'a', lines: 2 }]);
      return Promise.resolve();
    });
    await act(() => Promise.resolve());
    callbacks[1]?.(0);
    const second = div.querySelector('.file-circle');
    expect(first).toBe(second);
    sim.destroy();
    div.remove();
  });

  it('removes circles smaller than 1px', async () => {
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
    let sim!: ReturnType<typeof createFileSimulation>;
    await act(() => {
      sim = createFileSimulation(div, { raf, now: () => 0 });
      return Promise.resolve();
    });
    await act(() => {
      sim.update([{ file: 'a', lines: 1 }]);
      return Promise.resolve();
    });
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

  it('pauses and resumes the simulation', async () => {
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
    let sim!: ReturnType<typeof createFileSimulation>;
    await act(() => {
      sim = createFileSimulation(div, { raf, now: () => 0 });
      return Promise.resolve();
    });
    sim.pause();
    callbacks[0]?.(0);
    expect(callbacks).toHaveLength(1);
    sim.resume();
    expect(callbacks).toHaveLength(2);
    sim.destroy();
  });

  it('resizes the simulation space', async () => {
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
    let sim!: ReturnType<typeof createFileSimulation>;
    await act(() => {
      sim = createFileSimulation(div, { raf, now: () => 0 });
      return Promise.resolve();
    });
    const data: LineCount[] = [{ file: 'a', lines: 5 }];
    await act(() => {
      sim.update(data);
      return Promise.resolve();
    });
    callbacks[0]?.(0);
    const circle = div.querySelector('.file-circle') as HTMLElement;
    const initial = circle.style.width;
    size = 400;
    await act(() => {
      sim.resize();
      return Promise.resolve();
    });
    await act(() => {
      sim.update(data);
      return Promise.resolve();
    });
    callbacks[1]?.(0);
    expect(circle.style.width).not.toBe(initial);
    sim.destroy();
  });

  it('toggles character effects', async () => {
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
    let sim!: ReturnType<typeof createFileSimulation>;
    await act(() => {
      sim = createFileSimulation(div, { raf: () => 1, now: () => 0 });
      return Promise.resolve();
    });
    sim.setEffectsEnabled(false);
    await act(() => {
      sim.update([{ file: 'a', lines: 1 }]);
      return Promise.resolve();
    });
    expect(div.querySelector('.add-char')).toBeNull();
    expect(div.querySelector('.glow-new')).toBeNull();
    sim.setEffectsEnabled(true);
    await act(() => {
      sim.update([{ file: 'a', lines: 2 }]);
      return Promise.resolve();
    });
    // TODO: verify character effect rendering once React flushing is reliable
    sim.destroy();
  });

  it('limits active character effects', async () => {
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
    sim.setEffectsEnabled(true);
    await act(() => {
      sim.update([{ file: 'a', lines: MAX_EFFECT_CHARS * 2 }]);
      return Promise.resolve();
    });
    const chars = div.querySelectorAll('.add-char').length;
    expect(chars).toBeLessThanOrEqual(MAX_EFFECT_CHARS);
    sim.destroy();
    div.remove();
  });
});
