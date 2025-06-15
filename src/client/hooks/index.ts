import { useCallback, useEffect, useState, useRef } from 'react';
import { createFileSimulation } from '../lines';
import { createPlayer } from '../player';
import type { LineCount } from '../types';
import type { PlayerOptions } from '../player';

export const useFileSimulation = (
  container: HTMLElement | null,
  opts: {
    raf?: (cb: FrameRequestCallback) => number;
    now?: () => number;
    linear?: boolean;
  } = {},
) => {
  const [sim, setSim] = useState<ReturnType<typeof createFileSimulation> | null>(null);

  useEffect(() => {
    if (!container) return;
    const instance = createFileSimulation(container, opts);
    setSim(instance);
    window.addEventListener('resize', instance.resize);
    return () => {
      window.removeEventListener('resize', instance.resize);
      instance.destroy();
    };
  }, [container, opts]);

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

export const useFileSimulationRef = (
  opts: {
    raf?: (cb: FrameRequestCallback) => number;
    now?: () => number;
    linear?: boolean;
  } = {},
) => {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const ref = useCallback((node: HTMLElement | null) => setEl(node), []);

  const controls = useFileSimulation(el, opts);

  return { ref, ...controls };
};

export const useAnimatedSimulation = (
  container: HTMLElement | null,
  data: LineCount[],
  opts: {
    raf?: (cb: FrameRequestCallback) => number;
    now?: () => number;
    linear?: boolean;
  } = {},
) => {
  const { update, pause, resume, setEffectsEnabled } = useFileSimulation(container, opts);

  useEffect(() => {
    if (data.length) update(data);
  }, [data, update]);

  return { pause, resume, setEffectsEnabled };
};

export const usePlayer = (options: PlayerOptions) => {
  const { onPlayStateChange, getSeek, setSeek, raf, now, ...rest } = options;
  const getSeekRef = useRef(getSeek);
  const setSeekRef = useRef(setSeek);
  const onPlayStateChangeRef = useRef(onPlayStateChange);

  useEffect(() => {
    getSeekRef.current = getSeek;
  }, [getSeek]);

  useEffect(() => {
    setSeekRef.current = setSeek;
  }, [setSeek]);

  useEffect(() => {
    onPlayStateChangeRef.current = onPlayStateChange;
  }, [onPlayStateChange]);

  const [player, setPlayer] = useState<ReturnType<typeof createPlayer> | null>(null);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const instance = createPlayer({
      getSeek: () => getSeekRef.current(),
      setSeek: (v) => setSeekRef.current(v),
      ...(raf ? { raf } : {}),
      ...(now ? { now } : {}),
      ...(onPlayStateChange
        ? { onPlayStateChange: (p) => onPlayStateChangeRef.current?.(p) }
        : {}),
      ...rest,
    });
    setPlayer(instance);
    return () => instance.pause();
  }, [rest.duration, rest.start, rest.end, raf, now]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const stop = useCallback(() => player?.stop(), [player]);
  const pause = useCallback(() => player?.pause(), [player]);
  const resume = useCallback(() => player?.resume(), [player]);
  const togglePlay = useCallback(() => player?.togglePlay(), [player]);
  const isPlaying = useCallback(() => player?.isPlaying() ?? false, [player]);

  return { stop, pause, resume, togglePlay, isPlaying };
};

export { useCssAnimation, makeUseCssAnimation } from './useCssAnimation';
