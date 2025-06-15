import React, { useState } from 'react';
import { CommitLog } from './components/CommitLog';
import { DurationInput } from './components/DurationInput';
import { PlayButton } from './components/PlayButton';
import { SeekBar } from './components/SeekBar';
import { SimulationArea } from './components/SimulationArea';
import type { SimulationAreaHandle } from './components/SimulationArea';
import { useTimelinePlayback } from './hooks';

export function App(): React.JSX.Element {
  const [duration, setDuration] = useState(20);

  const [sim, setSim] = useState<SimulationAreaHandle | null>(null);

  const playback = useTimelinePlayback({
    duration,
    onPlayStateChange: (p) => sim?.setEffectsEnabled(p),
    onVisibilityChange: (h) => (h ? sim?.pause() : sim?.resume()),
    json: (input: string) => fetch(input).then((r) => r.json()),
  });
  const {
    timestamp,
    setTimestamp,
    start,
    end,
    ready,
    commits,
    lineCounts,
    ...player
  } = playback;




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
