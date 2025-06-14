export interface PlayerOptions {
  seek: HTMLInputElement;
  speed: HTMLSelectElement;
  playButton: HTMLButtonElement;
  start: number;
  end: number;
  raf?: (cb: FrameRequestCallback) => number;
  now?: () => number;
}

export const createPlayer = ({
  seek,
  speed,
  playButton,
  start,
  end,
  raf = requestAnimationFrame,
  now = performance.now,
}: PlayerOptions) => {
  let playing = false;
  let lastTime = 0;

  const tick = (time: number): void => {
    if (!playing) {
      lastTime = time;
      raf(tick);
      return;
    }
    const dt = (time - lastTime) * parseFloat(speed.value);
    lastTime = time;
    const next = Math.min(Number(seek.value) + dt, end);
    seek.value = String(next);
    seek.dispatchEvent(new Event('input'));
    if (next < end) {
      raf(tick);
    } else {
      playing = false;
      playButton.textContent = 'Play';
    }
  };

  const togglePlay = () => {
    playing = !playing;
    playButton.textContent = playing ? 'Pause' : 'Play';
    if (playing) {
      lastTime = now();
      raf(tick);
    }
  };

  playButton.addEventListener('click', togglePlay);

  seek.min = String(start);
  seek.max = String(end);
  seek.value = String(start);
  seek.dispatchEvent(new Event('input'));

  return { togglePlay };
};
