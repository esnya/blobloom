import { useCallback, useEffect, useState } from 'react';
import { createFileSimulation } from '../fileSimulation';
import { createPlayer } from '../player';
import type { LineCount } from '../types';
import type { PlayerOptions } from '../player';

const DEFAULT_SIM_OPTS = {} as const;

export const useFileSimulation = (
  container: HTMLElement | null,
  opts?: {
    raf?: (cb: FrameRequestCallback) => number;
    now?: () => number;
    linear?: boolean;
  },
) => {
  const options = opts ?? DEFAULT_SIM_OPTS;
  const [sim, setSim] = useState<ReturnType<typeof createFileSimulation> | null>(null);

  useEffect(() => {
    if (!container) return;
    const instance = createFileSimulation(container, options);
    setSim(instance);
    window.addEventListener('resize', instance.resize);
    return () => {
      window.removeEventListener('resize', instance.resize);
      instance.destroy();
    };
  }, [container, options]);

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
  opts?: {
    raf?: (cb: FrameRequestCallback) => number;
    now?: () => number;
    linear?: boolean;
  },
) => {
  const options = opts ?? DEFAULT_SIM_OPTS;
  const [el, setEl] = useState<HTMLElement | null>(null);
  const ref = useCallback((node: HTMLElement | null) => setEl(node), []);

  const controls = useFileSimulation(el, options);

  return { ref, ...controls };
};

export const useAnimatedSimulation = (
  container: HTMLElement | null,
  data: LineCount[],
  opts?: {
    raf?: (cb: FrameRequestCallback) => number;
    now?: () => number;
    linear?: boolean;
  },
) => {
  const options = opts ?? DEFAULT_SIM_OPTS;
  const { update, pause, resume, setEffectsEnabled } = useFileSimulation(container, options);

  useEffect(() => {
    if (data.length) update(data);
  }, [data, update]);

  return { pause, resume, setEffectsEnabled };
};

export const usePlayer = (options: PlayerOptions) => {
  const { onPlayStateChange, getSeek, setSeek, raf, now, ...rest } = options;
  const [refs] = useState(() => ({
    getSeek,
    setSeek,
    onPlayStateChange,
  }));

  useEffect(() => {
    refs.getSeek = getSeek;
  }, [getSeek, refs]);

  useEffect(() => {
    refs.setSeek = setSeek;
  }, [setSeek, refs]);

  useEffect(() => {
    refs.onPlayStateChange = onPlayStateChange;
  }, [onPlayStateChange, refs]);

  const [player, setPlayer] = useState<ReturnType<typeof createPlayer> | null>(null);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const instance = createPlayer({
      getSeek: () => refs.getSeek(),
      setSeek: (v) => refs.setSeek(v),
      ...(raf ? { raf } : {}),
      ...(now ? { now } : {}),
      ...(onPlayStateChange
        ? { onPlayStateChange: (p) => refs.onPlayStateChange?.(p) }
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
export { useGlowAnimation } from './useGlowAnimation';
export { useGlowControl } from './useGlowControl';
export { useCharEffects } from './useCharEffects';
export { useTypewriter } from './useTypewriter';
export { usePageVisibility } from './usePageVisibility';
export { PhysicsProvider, useEngine } from './useEngine';
export { useBody } from './useBody';
export { useTimelineData } from './useTimelineData';
export { useFileCircleHandles } from './useFileCircleHandles';
