export interface PlayerOptions {
  seek: HTMLInputElement;
  duration: HTMLInputElement;
  playButton: HTMLButtonElement;
  start: number;
  end: number;
  raf?: (cb: FrameRequestCallback) => number;
  now?: () => number;
  onPlayStateChange?: (playing: boolean) => void;
}

export const createPlayer = ({
  seek,
  duration,
  playButton,
  start,
  end,
  raf = requestAnimationFrame,
  now = performance.now.bind(performance),
  onPlayStateChange,
}: PlayerOptions) => {
  let playing = false;
  let lastTime = 0;

  const tick = (time: number): void => {
    if (!playing) {
      lastTime = time;
      raf(tick);
      return;
    }
    const total = parseFloat(duration.value) * 1000;
    const factor = (end - start) / total;
    const dt = (time - lastTime) * factor;
    lastTime = time;
    const next = Math.min(Number(seek.value) + dt, end);
    seek.value = String(next);
    seek.dispatchEvent(new Event('input'));
    if (next < end) {
      raf(tick);
    } else {
      setPlaying(false);
    }
  };

  const setPlaying = (state: boolean) => {
    playing = state;
    playButton.textContent = playing ? 'Pause' : 'Play';
    if (playing) {
      lastTime = now();
      raf(tick);
    }
    onPlayStateChange?.(playing);
  };

  const togglePlay = (): void => {
    if (!playing && Number(seek.value) >= end) {
      seek.value = String(start);
      seek.dispatchEvent(new Event('input'));
    }
    setPlaying(!playing);
  };

  const pause = (): void => setPlaying(false);
  const stop = (): void => {
    setPlaying(false);
    seek.value = String(start);
    seek.dispatchEvent(new Event('input'));
  };
  const resume = (): void => setPlaying(true);
  const isPlaying = (): boolean => playing;

  playButton.addEventListener('click', togglePlay);

  seek.min = String(start);
  seek.max = String(end);
  seek.value = String(start);
  seek.dispatchEvent(new Event('input'));

  return { togglePlay, pause, resume, stop, isPlaying };
};
