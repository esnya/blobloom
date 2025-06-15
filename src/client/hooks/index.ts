import { useCallback, useEffect, useState } from 'react';
import { createFileSimulation } from '../lines';
import { createPlayer } from '../player';
import type { LineCount } from '../types';
import type { PlayerOptions } from '../player';

export const useFileSimulation = (
  containerEl: HTMLDivElement | null,
  opts: {
    raf?: (cb: FrameRequestCallback) => number;
    now?: () => number;
    linear?: boolean;
  } = {},
) => {
  const [sim, setSim] = useState<ReturnType<typeof createFileSimulation> | null>(null);

  useEffect(() => {
    if (!containerEl) return;
    const s = createFileSimulation(containerEl, opts);
    setSim(s);
    window.addEventListener('resize', s.resize);
    return () => {
      window.removeEventListener('resize', s.resize);
      s.destroy();
    };
  }, [containerEl, opts]);

  const update = useCallback((data: LineCount[]) => {
    sim?.update(data);
  }, [sim]);
  const pause = useCallback(() => sim?.pause(), [sim]);
  const resume = useCallback(() => sim?.resume(), [sim]);
  const setEffectsEnabled = useCallback(
    (state: boolean) => sim?.setEffectsEnabled(state),
    [sim],
  );

  return { update, pause, resume, setEffectsEnabled };
};

export const useAnimatedSimulation = (
  containerEl: HTMLDivElement | null,
  data: LineCount[],
  opts: {
    raf?: (cb: FrameRequestCallback) => number;
    now?: () => number;
    linear?: boolean;
  } = {},
) => {
  const { update, pause, resume, setEffectsEnabled } = useFileSimulation(
    containerEl,
    opts,
  );

  useEffect(() => {
    if (data.length) update(data);
  }, [data, update]);

  return { pause, resume, setEffectsEnabled };
};

export const usePlayer = (
  buttonEl: HTMLButtonElement | null,
  options: Omit<PlayerOptions, 'playButton' | 'seek' | 'duration'> & {
    seekEl: HTMLInputElement | null;
    durationEl: HTMLInputElement | null;
  },
) => {
  const { seekEl, durationEl, ...opts } = options;
  const [player, setPlayer] = useState<ReturnType<typeof createPlayer> | null>(null);

  useEffect(() => {
    if (!buttonEl || !seekEl || !durationEl) return;
    const p = createPlayer({
      seek: seekEl,
      duration: durationEl,
      playButton: buttonEl,
      ...opts,
    });
    setPlayer(p);
    return () => p.pause();
  }, [buttonEl, seekEl, durationEl, opts]);

  const stop = useCallback(() => player?.stop(), [player]);
  const pause = useCallback(() => player?.pause(), [player]);
  const resume = useCallback(() => player?.resume(), [player]);
  const isPlaying = useCallback(() => player?.isPlaying() ?? false, [player]);

  return { stop, pause, resume, isPlaying };
};

export { useCssAnimation, makeUseCssAnimation } from './useCssAnimation';
