import React, { Suspense, useEffect, useState } from 'react';
import { CommitLog } from './components/CommitLog';
import { SeekBar } from './components/SeekBar';
import { PlayPauseButton } from './components/PlayPauseButton';
import { FileCircleSimulation } from './components/FileCircleSimulation';
import { useTimelineData } from './hooks/useTimelineData';
import { usePlayer } from './hooks/usePlayer';

const DEFAULT_DURATION = 30;

interface AppContentProps {
  playerFactory?: typeof import('./hooks/usePlayer').createPlayer;
}

function AppContent({ playerFactory }: AppContentProps): React.JSX.Element {
  const [timestamp, setTimestamp] = useState(0);
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const { commits, lineCounts, start, end } = useTimelineData({ timestamp });
  const [playing, setPlaying] = useState(false);

  const { togglePlay } = usePlayer({
    getSeek: () => timestamp,
    setSeek: setTimestamp,
    duration,
    start,
    end,
    onPlayStateChange: setPlaying,
    ...(playerFactory ? { playerFactory } : {}),
  });

  useEffect(() => {
    setTimestamp(start);
  }, [start, end]);

  return (
    <>
      <div id="controls">
        <PlayPauseButton playing={playing} onToggle={togglePlay} />
        <SeekBar value={timestamp} min={start} max={end} onChange={setTimestamp} />
        <label>
          Duration
          <input
            id="duration"
            type="number"
            min="1"
            value={duration}
            onChange={e => setDuration(Number((e.target as HTMLInputElement).value))}
          />
        </label>
      </div>
      <div id="timestamp">{new Date(timestamp).toLocaleString()}</div>
      <FileCircleSimulation data={lineCounts} />
      <CommitLog commits={commits} timestamp={timestamp} onTimestampChange={setTimestamp} />
    </>
  );
}

export interface AppProps {
  playerFactory?: typeof import('./hooks/usePlayer').createPlayer;
}

export function App({ playerFactory }: AppProps = {}): React.JSX.Element {
  return (
    <Suspense fallback={<div>Loading commits...</div>}>
      <AppContent {...(playerFactory ? { playerFactory } : {})} />
    </Suspense>
  );
}
