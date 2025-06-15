export interface PlayerOptions {
  getSeek: () => number;
  setSeek: (value: number) => void;
  duration: number;
  start: number;
  end: number;
  raf?: (cb: FrameRequestCallback) => number;
  now?: () => number;
  onPlayStateChange?: (playing: boolean) => void;
}

export const createPlayer = ({
  getSeek,
  setSeek,
  duration,
  start,
  end,
  raf = requestAnimationFrame,
  now = performance.now.bind(performance),
  onPlayStateChange,
}: PlayerOptions) => {
  let playing = false;
  let lastTime = 0;
  const forward = end >= start;
  const rangeStart = forward ? start : end;
  const rangeEnd = forward ? end : start;
  const direction = forward ? 1 : -1;

  const tick = (time: number): void => {
    if (!playing) {
      return;
    }
    const total = duration * 1000;
    const factor = (rangeEnd - rangeStart) / total;
    const dt = (time - lastTime) * factor * direction;
    lastTime = time;
    const next = Math.max(
      rangeStart,
      Math.min(rangeEnd, getSeek() + dt),
    );
    setSeek(next);
    if (
      (forward && next < rangeEnd) ||
      (!forward && next > rangeStart)
    ) {
      raf(tick);
    } else {
      setPlaying(false);
    }
  };

  const setPlaying = (state: boolean): void => {
    playing = state;
    if (playing) {
      lastTime = now();
      raf(tick);
    } else if (getSeek() >= end) {
      console.log('[debug] seekbar final update processed at', getSeek());
    }
    onPlayStateChange?.(playing);
  };

  const togglePlay = (): void => {
    if (!playing && getSeek() >= end) {
      setSeek(start);
    }
    setPlaying(!playing);
  };

  const pause = (): void => setPlaying(false);
  const stop = (): void => {
    setPlaying(false);
    setSeek(start);
  };
  const resume = (): void => setPlaying(true);
  const isPlaying = (): boolean => playing;

  setSeek(start);

  return { togglePlay, pause, resume, stop, isPlaying };
};
