import React, { useEffect, useState } from 'react';
import { fetchCommits, fetchLineCounts } from './api';
import type { LineCount } from './types';
import { CommitLog } from './components/CommitLog';
import { DurationInput } from './components/DurationInput';
import { PlayButton } from './components/PlayButton';
import { SeekBar } from './components/SeekBar';
import { SimulationArea } from './components/SimulationArea';
import type { SimulationAreaHandle } from './components/SimulationArea';
import { usePlayer, usePageVisibility } from './hooks';
import type { Commit } from './types';

export function App(): React.JSX.Element {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [timestamp, setTimestamp] = useState(0);
  const [lineCounts, setLineCounts] = useState<LineCount[]>([]);
  const [ready, setReady] = useState(false);
  const [duration, setDuration] = useState(20);

  const [sim, setSim] = useState<SimulationAreaHandle | null>(null);

  const hidden = usePageVisibility();
  const [wasPlaying, setWasPlaying] = useState(false);

  const player = usePlayer({
    getSeek: () => timestamp,
    setSeek: setTimestamp,
    duration,
    start,
    end,
    onPlayStateChange: (p) => sim?.setEffectsEnabled(p),
  });

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
    if (hidden) {
      setWasPlaying(player.isPlaying());
      player.pause();
      sim?.pause();
    } else {
      sim?.resume();
      if (wasPlaying) player.resume();
    }
  }, [hidden, ready, player, sim, wasPlaying]);


  return (
    <>
      {ready && (
        <div id="controls">
          <PlayButton playing={player.isPlaying()} onToggle={player.togglePlay} />
          <button onClick={player.stop}>Stop</button>
          <SeekBar value={timestamp} onInput={setTimestamp} />
          <DurationInput defaultValue={duration} onInput={setDuration} />s
        </div>
      )}
      <div id="timestamp">{new Date(timestamp).toLocaleString()}</div>
      {ready && (
        <>
          <SimulationArea onReady={setSim} data={lineCounts} />
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
