import React, { useEffect, useState } from 'react';
import { fetchCommits, fetchLineCounts } from './api';
import type { LineCount } from './types';
import { CommitLog } from './components/CommitLog';
import { DurationInput } from './components/DurationInput';
import { PlayButton } from './components/PlayButton';
import type { PlayButtonHandle } from './components/PlayButton';
import { SeekBar } from './components/SeekBar';
import { SimulationArea } from './components/SimulationArea';
import type { SimulationAreaHandle } from './components/SimulationArea';
import type { Commit } from './types';

export function App(): React.JSX.Element {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [timestamp, setTimestamp] = useState(0);
  const [lineCounts, setLineCounts] = useState<LineCount[]>([]);
  const [ready, setReady] = useState(false);

  const [seekEl, setSeekEl] = useState<HTMLInputElement | null>(null);
  const [durationEl, setDurationEl] = useState<HTMLInputElement | null>(null);
  const [player, setPlayer] = useState<PlayButtonHandle | null>(null);
  const [sim, setSim] = useState<SimulationAreaHandle | null>(null);
  const [wasPlaying, setWasPlaying] = useState(false);

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
        setWasPlaying(player?.isPlaying() ?? false);
        player?.pause();
        sim?.pause();
      } else {
        sim?.resume();
        if (wasPlaying) player?.resume();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [ready, player, sim, wasPlaying]);

  return (
    <>
      {ready && (
        <div id="controls">
          <PlayButton
            seekEl={seekEl}
            durationEl={durationEl}
            start={start}
            end={end}
            onPlayStateChange={(p) => sim?.setEffectsEnabled(p)}
            onReady={setPlayer}
          />
          <button onClick={() => player?.stop()}>Stop</button>
          <SeekBar value={timestamp} onInput={setTimestamp} onReady={setSeekEl} />
          <DurationInput onReady={setDurationEl} />s
        </div>
      )}
      <div id="timestamp">{new Date(timestamp).toLocaleString()}</div>
      {ready && (
        <>
          <SimulationArea data={lineCounts} onReady={setSim} />
          <CommitLog
            commits={commits}
            timestamp={timestamp}
            onTimestampChange={setTimestamp}
          />
        </>
      )}
    </>
  );
}
