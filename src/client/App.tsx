import React, { useEffect, useRef, useState } from 'react';
import { fetchCommits, fetchLineCounts } from './api';
import type { LineCount } from './types';
import { CommitLog } from './components/CommitLog';
import { DurationInput } from './components/DurationInput';
import { PlayButton } from './components/PlayButton';
import { SeekBar } from './components/SeekBar';
import { SimulationArea } from './components/SimulationArea';
import type { SimulationAreaHandle } from './components/SimulationArea';
import type { Commit } from './types';
import { usePlayer } from './hooks';

export function App(): React.JSX.Element {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [timestamp, setTimestamp] = useState(0);
  const [lineCounts, setLineCounts] = useState<LineCount[]>([]);
  const [ready, setReady] = useState(false);

  const seekRef = useRef<HTMLInputElement | null>(null);
  const [seek, setSeek] = useState<HTMLInputElement | null>(null);
  const [duration, setDuration] = useState(20);
  const { togglePlay, stop, pause, resume, isPlaying, playing } = usePlayer({
    getSeek: () => timestamp,
    setSeek: setTimestamp,
    duration,
    start,
    end,
    onPlayStateChange: (p) => simRef.current?.setEffectsEnabled(p),
  });
  const simRef = useRef<SimulationAreaHandle>(null);
  const wasPlaying = useRef(false);

  const json = (input: string) => fetch(input).then((r) => r.json());

  useEffect(() => {
    void (async () => {
      const commitData = await fetchCommits(json);
      setCommits(commitData);
      const s = commitData[commitData.length - 1]!.commit.committer.timestamp * 1000;
      const e = commitData[0]!.commit.committer.timestamp * 1000;
      setStart(s);
      setEnd(e);
      setTimestamp(s);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    void (async () => {
      const counts = await fetchLineCounts(json, timestamp);
      setLineCounts(counts);
      if (timestamp >= end) {
        console.log('[debug] physics area updated for final commit at', timestamp);
      }
    })();
  }, [ready, timestamp, end]);

  useEffect(() => {
    if (!ready) return;
    const onVisibility = () => {
      if (document.hidden) {
        wasPlaying.current = isPlaying();
        pause();
        simRef.current?.pause();
      } else {
        simRef.current?.resume();
        if (wasPlaying.current) resume();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const el = document.querySelector<HTMLInputElement>('input[type="range"]');
    seekRef.current = el;
    setSeek(el);
  }, [ready]);

  return (
    <>
      {ready && (
        <div id="controls">
          <PlayButton playing={playing} onToggle={togglePlay} />
          <button onClick={stop}>Stop</button>
          <SeekBar value={timestamp} onInput={setTimestamp} />
          <DurationInput onInput={setDuration} defaultValue={duration} />s
        </div>
      )}
      <div id="timestamp">{new Date(timestamp).toLocaleString()}</div>
      {ready && (
        <>
          <SimulationArea ref={simRef} data={lineCounts} />
          {seek && <CommitLog commits={commits} seek={seek} />}
        </>
      )}
    </>
  );
}
