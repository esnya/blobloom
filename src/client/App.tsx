import React, { useEffect, useState } from 'react';
import { fetchCommits, fetchLineCounts } from './api';
import type { LineCount } from './types';
import { CommitLog } from './components/CommitLog';
import { DurationInput } from './components/DurationInput';
import { PlayButton } from './components/PlayButton';
import { SeekBar } from './components/SeekBar';
import { FileCircleSimulation } from './components/FileCircleSimulation';
import { useTimelinePlayback } from './hooks';
import type { Commit } from './types';

export function App(): React.JSX.Element {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [lineCounts, setLineCounts] = useState<LineCount[]>([]);
  const [ready, setReady] = useState(false);
  const [duration, setDuration] = useState(20);

  const playback = useTimelinePlayback({
    duration,
    start,
    end,
  });
  const { timestamp, setTimestamp, ...player } = playback;

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
  }, [setTimestamp]);

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




  return (
    <>
      {ready && (
        <div id="controls">
          <PlayButton playing={player.isPlaying()} onToggle={player.togglePlay} />
          <button onClick={player.stop}>Stop</button>
          <SeekBar
            value={timestamp}
            min={start}
            max={end}
            onInput={setTimestamp}
          />
          <DurationInput defaultValue={duration} onInput={setDuration} />s
        </div>
      )}
      <div id="timestamp">{new Date(timestamp).toLocaleString()}</div>
      {ready && (
        <>
          <FileCircleSimulation data={lineCounts} />
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
