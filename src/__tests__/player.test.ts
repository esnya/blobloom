/** @jest-environment jsdom */
import { createPlayer } from '../client/player';

describe('createPlayer', () => {
  it('toggles playback and calls raf', () => {
    document.body.innerHTML = `
      <button id="play"></button>
      <input id="seek" />
      <input id="duration" />
    `;
    const playButton = document.getElementById('play') as HTMLButtonElement;
    const seek = document.getElementById('seek') as HTMLInputElement;
    const duration = document.getElementById('duration') as HTMLInputElement;
    duration.value = '20';

    const raf = jest.fn();
    const now = jest.fn(() => 0);

    createPlayer({
      seek,
      duration,
      playButton,
      start: 0,
      end: 10,
      raf,
      now,
    });

    playButton.click();
    expect(playButton.textContent).toBe('Pause');
    expect(raf).toHaveBeenCalled();

    playButton.click();
    expect(playButton.textContent).toBe('Play');
  });
  it('advances to end and stops', () => {
    document.body.innerHTML = `
    <button id="play"></button>
    <input id="seek" />
    <input id="duration" />
  `;
  const playButton = document.getElementById('play') as HTMLButtonElement;
  const seek = document.getElementById('seek') as HTMLInputElement;
  const duration = document.getElementById('duration') as HTMLInputElement;
  duration.value = '1';

  const callbacks: FrameRequestCallback[] = [];
  const raf = (cb: FrameRequestCallback) => {
    callbacks.push(cb);
    return 1;
  };

  const player = createPlayer({
    seek,
    duration,
    playButton,
    start: 0,
    end: 5,
    raf,
    now: () => 0,
  });

  player.togglePlay();
  callbacks[0]?.(0);
  callbacks[1]?.(500);
  callbacks[2]?.(1000);

  expect(seek.value).toBe('5');
  expect(playButton.textContent).toBe('Play');
  });

  it('dispatches input events during playback', () => {
    document.body.innerHTML = `
      <button id="play"></button>
      <input id="seek" />
      <input id="duration" />
    `;
    const playButton = document.getElementById('play') as HTMLButtonElement;
    const seek = document.getElementById('seek') as HTMLInputElement;
    const duration = document.getElementById('duration') as HTMLInputElement;
    duration.value = '1';

    const callbacks: FrameRequestCallback[] = [];
    const raf = (cb: FrameRequestCallback) => {
      callbacks.push(cb);
      return 1;
    };

    const listener = jest.fn();
    seek.addEventListener('input', listener);

    const player = createPlayer({
      seek,
      duration,
      playButton,
      start: 0,
      end: 2,
      raf,
      now: () => 0,
    });

    player.togglePlay();
    callbacks[0]?.(0);
    callbacks[1]?.(1000);

    expect(listener).toHaveBeenCalled();
  });

  it('pauses and resumes playback', () => {
    document.body.innerHTML = `
      <button id="play"></button>
      <input id="seek" />
      <input id="duration" />
    `;
    const playButton = document.getElementById('play') as HTMLButtonElement;
    const seek = document.getElementById('seek') as HTMLInputElement;
    const duration = document.getElementById('duration') as HTMLInputElement;
    duration.value = '1';

    const raf = jest.fn();

    const player = createPlayer({
      seek,
      duration,
      playButton,
      start: 0,
      end: 2,
      raf,
      now: () => 0,
    });

    player.resume();
    expect(playButton.textContent).toBe('Pause');
    player.pause();
    expect(playButton.textContent).toBe('Play');
  });
});
