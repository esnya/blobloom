import { createPlayer } from '../client/player';

describe('createPlayer', () => {
  it('toggles playback and calls raf', () => {
    let seek = 0;
    const getSeek = () => seek;
    const setSeek = (v: number) => {
      seek = v;
    };

    const raf = jest.fn();
    const now = jest.fn(() => 0);

    const player = createPlayer({
      getSeek,
      setSeek,
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
    let seek = 0;
    const getSeek = () => seek;
    const setSeek = (v: number) => {
      seek = v;
    };

    const callbacks: FrameRequestCallback[] = [];
    const raf = (cb: FrameRequestCallback) => {
      callbacks.push(cb);
      return 1;
    };

    const player = createPlayer({
      getSeek,
      setSeek,
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

    expect(seek).toBe(5);
    expect(player.isPlaying()).toBe(false);
  });

  it('calls setter during playback', () => {
    let seek = 0;
    const getSeek = () => seek;
    const setSeek = jest.fn((v: number) => {
      seek = v;
    });

    const callbacks: FrameRequestCallback[] = [];
    const raf = (cb: FrameRequestCallback) => {
      callbacks.push(cb);
      return 1;
    };

    const player = createPlayer({
      getSeek,
      setSeek,
      duration: 1,
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
    const raf = jest.fn();
    let seek = 0;
    const getSeek = () => seek;
    const setSeek = (v: number) => {
      seek = v;
    };

    const player = createPlayer({
      getSeek,
      setSeek,
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
    let seek = 1;
    const getSeek = () => seek;
    const setSeek = (v: number) => {
      seek = v;
    };

    const player = createPlayer({
      getSeek,
      setSeek,
      duration: 1,
      start: 0,
      end: 2,
      raf: jest.fn(),
      now: () => 0,
    });

    player.stop();
    expect(seek).toBe(0);
    expect(player.isPlaying()).toBe(false);
  });

  it('resets when playing from end', () => {
    let seek = 2;
    const getSeek = () => seek;
    const setSeek = (v: number) => {
      seek = v;
    };

    const raf = jest.fn();
    const player = createPlayer({
      getSeek,
      setSeek,
      duration: 1,
      start: 0,
      end: 2,
      raf,
      now: () => 0,
    });

    player.togglePlay();
    expect(seek).toBe(0);
    expect(player.isPlaying()).toBe(true);
  });

  it('notifies play state changes', () => {
    let seek = 0;
    const getSeek = () => seek;
    const setSeek = (v: number) => {
      seek = v;
    };

    const callbacks: FrameRequestCallback[] = [];
    const raf = (cb: FrameRequestCallback) => {
      callbacks.push(cb);
      return 1;
    };

    const stateListener = jest.fn();

    const player = createPlayer({
      getSeek,
      setSeek,
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

  it('stops scheduling frames when paused', () => {
    let seek = 0;
    const getSeek = () => seek;
    const setSeek = (v: number) => {
      seek = v;
    };

    let cb: any = null;
    const raf = jest.fn((fn: FrameRequestCallback) => {
      cb = fn;
      return 1;
    });

    const player = createPlayer({
      getSeek,
      setSeek,
      duration: 1,
      start: 0,
      end: 2,
      raf,
      now: () => 0,
    });

    player.resume();
    expect(raf).toHaveBeenCalledTimes(1);
    if (cb) cb(0 as unknown as DOMHighResTimeStamp);
    expect(raf).toHaveBeenCalledTimes(2);

    player.pause();
    if (cb) cb(16 as unknown as DOMHighResTimeStamp);

    expect(raf).toHaveBeenCalledTimes(2);
  });
});
