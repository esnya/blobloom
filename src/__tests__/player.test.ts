/** @jest-environment jsdom */
import { createPlayer } from '../client/player';

describe('createPlayer', () => {
  it('toggles playback and calls raf', () => {
    document.body.innerHTML = '<button id="play"></button>';
    const playButton = document.getElementById('play') as HTMLButtonElement;
    let seek = 0;
    const raf = jest.fn();
    const now = jest.fn(() => 0);

    createPlayer({
      getSeek: () => seek,
      setSeek: (v) => {
        seek = v;
      },
      duration: 20,
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
    document.body.innerHTML = '<button id="play"></button>';
    const playButton = document.getElementById('play') as HTMLButtonElement;
    let seek = 0;
    const callbacks: FrameRequestCallback[] = [];
    const raf = (cb: FrameRequestCallback) => {
      callbacks.push(cb);
      return 1;
    };

    const player = createPlayer({
      getSeek: () => seek,
      setSeek: (v) => {
        seek = v;
      },
      duration: 1,
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

    expect(seek).toBe(5);
    expect(playButton.textContent).toBe('Play');
  });

  it('calls setSeek during playback', () => {
    document.body.innerHTML = '<button id="play"></button>';
    const playButton = document.getElementById('play') as HTMLButtonElement;
    let seek = 0;
    const callbacks: FrameRequestCallback[] = [];
    const raf = (cb: FrameRequestCallback) => {
      callbacks.push(cb);
      return 1;
    };
    const setSeek = jest.fn((v: number) => {
      seek = v;
    });

    const player = createPlayer({
      getSeek: () => seek,
      setSeek,
      duration: 1,
      playButton,
      start: 0,
      end: 2,
      raf,
      now: () => 0,
    });

    player.togglePlay();
    callbacks[0]?.(0);
    callbacks[1]?.(1000);

    expect(setSeek).toHaveBeenCalled();
  });

  it('pauses and resumes playback', () => {
    document.body.innerHTML = '<button id="play"></button>';
    const playButton = document.getElementById('play') as HTMLButtonElement;
    let seek = 0;
    const raf = jest.fn();

    const player = createPlayer({
      getSeek: () => seek,
      setSeek: (v) => {
        seek = v;
      },
      duration: 1,
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

  it('stops and resets', () => {
    document.body.innerHTML = '<button id="play"></button>';
    const playButton = document.getElementById('play') as HTMLButtonElement;
    let seek = 1;

    const player = createPlayer({
      getSeek: () => seek,
      setSeek: (v) => {
        seek = v;
      },
      duration: 1,
      playButton,
      start: 0,
      end: 2,
      raf: jest.fn(),
      now: () => 0,
    });

    player.stop();
    expect(seek).toBe(0);
    expect(playButton.textContent).toBe('Play');
  });

  it('resets when playing from end', () => {
    document.body.innerHTML = '<button id="play"></button>';
    const playButton = document.getElementById('play') as HTMLButtonElement;
    let seek = 2;
    const raf = jest.fn();

    createPlayer({
      getSeek: () => seek,
      setSeek: (v) => {
        seek = v;
      },
      duration: 1,
      playButton,
      start: 0,
      end: 2,
      raf,
      now: () => 0,
    });

    playButton.click();
    expect(seek).toBe(0);
    expect(playButton.textContent).toBe('Pause');
  });

  it('notifies play state changes', () => {
    document.body.innerHTML = '<button id="play"></button>';
    const playButton = document.getElementById('play') as HTMLButtonElement;
    let seek = 0;
    const callbacks: FrameRequestCallback[] = [];
    const raf = (cb: FrameRequestCallback) => {
      callbacks.push(cb);
      return 1;
    };
    const stateListener = jest.fn();

    const player = createPlayer({
      getSeek: () => seek,
      setSeek: (v) => {
        seek = v;
      },
      duration: 1,
      playButton,
      start: 0,
      end: 2,
      raf,
      now: () => 0,
      onPlayStateChange: stateListener,
    });

    player.resume();
    expect(stateListener).toHaveBeenCalledWith(true);
    callbacks[0]?.(0);
    callbacks[1]?.(2000);
    expect(stateListener).toHaveBeenLastCalledWith(false);
  });
});
