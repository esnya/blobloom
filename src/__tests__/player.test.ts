/** @jest-environment jsdom */
import { createPlayer } from '../client/player';

describe('createPlayer', () => {
  it('toggles playback and calls raf', () => {
    document.body.innerHTML = '<input id="seek" />';
    const seek = document.getElementById('seek') as HTMLInputElement;
    seek.value = '0';

    const raf = jest.fn();
    const now = jest.fn(() => 0);

    const player = createPlayer({
      getSeek: () => Number(seek.value),
      setSeek: (v) => {
        seek.value = String(v);
        seek.dispatchEvent(new Event('input'));
      },
      duration: 20,
      start: 0,
      end: 10,
      raf,
      now,
    });

    player.togglePlay();
    expect(player.isPlaying()).toBe(true);
    expect(raf).toHaveBeenCalled();

    player.togglePlay();
    expect(player.isPlaying()).toBe(false);
  });
  it('advances to end and stops', () => {
    document.body.innerHTML = '<input id="seek" />';
    const seek = document.getElementById('seek') as HTMLInputElement;
    seek.value = '0';
  
  const callbacks: FrameRequestCallback[] = [];
  const raf = (cb: FrameRequestCallback) => {
    callbacks.push(cb);
    return 1;
  };

  const player = createPlayer({
    getSeek: () => Number(seek.value),
    setSeek: (v) => {
      seek.value = String(v);
      seek.dispatchEvent(new Event('input'));
    },
    duration: 1,
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
  expect(player.isPlaying()).toBe(false);
  });

  it('dispatches input events during playback', () => {
    document.body.innerHTML = '<input id="seek" />';
    const seek = document.getElementById('seek') as HTMLInputElement;
    seek.value = '0';

    const callbacks: FrameRequestCallback[] = [];
    const raf = (cb: FrameRequestCallback) => {
      callbacks.push(cb);
      return 1;
    };

    const listener = jest.fn();
    seek.addEventListener('input', listener);

      const player = createPlayer({
        getSeek: () => Number(seek.value),
        setSeek: (v) => {
          seek.value = String(v);
          seek.dispatchEvent(new Event('input'));
        },
        duration: 1,
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
    document.body.innerHTML = '<input id="seek" />';
    const seek = document.getElementById('seek') as HTMLInputElement;
    seek.value = '0';

    const raf = jest.fn();

    const player = createPlayer({
      getSeek: () => Number(seek.value),
      setSeek: (v) => {
        seek.value = String(v);
        seek.dispatchEvent(new Event('input'));
      },
      duration: 1,
      start: 0,
      end: 2,
      raf,
      now: () => 0,
    });

    player.resume();
    expect(player.isPlaying()).toBe(true);
    player.pause();
    expect(player.isPlaying()).toBe(false);
  });

  it('stops and resets', () => {
    document.body.innerHTML = '<input id="seek" />';
    const seek = document.getElementById('seek') as HTMLInputElement;
    seek.value = '1';

    const player = createPlayer({
      getSeek: () => Number(seek.value),
      setSeek: (v) => {
        seek.value = String(v);
        seek.dispatchEvent(new Event('input'));
      },
      duration: 1,
      start: 0,
      end: 2,
      raf: jest.fn(),
      now: () => 0,
    });

    player.stop();
    expect(seek.value).toBe('0');
    expect(player.isPlaying()).toBe(false);
  });

  it('resets when playing from end', () => {
    document.body.innerHTML = '<input id="seek" />';
    const seek = document.getElementById('seek') as HTMLInputElement;
    seek.value = '2';

    const raf = jest.fn();
    const player = createPlayer({
      getSeek: () => Number(seek.value),
      setSeek: (v) => {
        seek.value = String(v);
        seek.dispatchEvent(new Event('input'));
      },
      duration: 1,
      start: 0,
      end: 2,
      raf,
      now: () => 0,
    });

    player.togglePlay();
    expect(seek.value).toBe('0');
    expect(player.isPlaying()).toBe(true);
  });

  it('notifies play state changes', () => {
    document.body.innerHTML = '<input id="seek" />';
    const seek = document.getElementById('seek') as HTMLInputElement;
    seek.value = '0';

    const callbacks: FrameRequestCallback[] = [];
    const raf = (cb: FrameRequestCallback) => {
      callbacks.push(cb);
      return 1;
    };

    const stateListener = jest.fn();

    const player = createPlayer({
      getSeek: () => Number(seek.value),
      setSeek: (v) => {
        seek.value = String(v);
        seek.dispatchEvent(new Event('input'));
      },
      duration: 1,
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
