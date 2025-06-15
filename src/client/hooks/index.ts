import { useCallback, useEffect, useRef } from 'react';
import { createFileSimulation } from '../lines';
import { createPlayer } from '../player';
import type { LineCount } from '../types';
import type { PlayerOptions } from '../player';

export const useFileSimulation = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  opts: {
    raf?: (cb: FrameRequestCallback) => number;
    now?: () => number;
    linear?: boolean;
  } = {},
) => {
  const simRef = useRef<ReturnType<typeof createFileSimulation> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const sim = createFileSimulation(containerRef.current, opts);
    simRef.current = sim;
    window.addEventListener('resize', sim.resize);
    return () => {
      window.removeEventListener('resize', sim.resize);
      sim.destroy();
    };
  }, [containerRef, opts]);

  const update = useCallback((data: LineCount[]) => {
    simRef.current?.update(data);
  }, []);
  const pause = useCallback(() => simRef.current?.pause(), []);
  const resume = useCallback(() => simRef.current?.resume(), []);
  const setEffectsEnabled = useCallback(
    (state: boolean) => simRef.current?.setEffectsEnabled(state),
    [],
  );

  return { update, pause, resume, setEffectsEnabled };
};

export const useAnimatedSimulation = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  data: LineCount[],
  opts: {
    raf?: (cb: FrameRequestCallback) => number;
    now?: () => number;
    linear?: boolean;
  } = {},
) => {
  const { update, pause, resume, setEffectsEnabled } = useFileSimulation(
    containerRef,
    opts,
  );

  useEffect(() => {
    if (data.length) update(data);
  }, [data, update]);

  return { pause, resume, setEffectsEnabled };
};

export const usePlayer = (
  buttonRef: React.RefObject<HTMLButtonElement | null>,
  options: Omit<PlayerOptions, 'playButton' | 'seek' | 'duration'> & {
    seekRef: React.RefObject<HTMLInputElement | null>;
    durationRef: React.RefObject<HTMLInputElement | null>;
  },
) => {
  const { seekRef, durationRef, ...opts } = options;
  const playerRef = useRef<ReturnType<typeof createPlayer> | null>(null);

  useEffect(() => {
    if (!buttonRef.current || !seekRef.current || !durationRef.current) return;
    const player = createPlayer({
      seek: seekRef.current,
      duration: durationRef.current,
      playButton: buttonRef.current,
      ...opts,
    });
    playerRef.current = player;
    return () => player.pause();
  }, [buttonRef, seekRef, durationRef, opts]);

  const stop = useCallback(() => playerRef.current?.stop(), []);
  const pause = useCallback(() => playerRef.current?.pause(), []);
  const resume = useCallback(() => playerRef.current?.resume(), []);
  const isPlaying = useCallback(
    () => playerRef.current?.isPlaying() ?? false,
    [],
  );

  return { stop, pause, resume, isPlaying };
};

export { useCssAnimation, makeUseCssAnimation } from './useCssAnimation';
