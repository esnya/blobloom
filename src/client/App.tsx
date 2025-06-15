import React, { useState } from 'react';
import { CommitLog } from './components/CommitLog';
import { DurationInput } from './components/DurationInput';
import { PlayButton } from './components/PlayButton';
import { SeekBar } from './components/SeekBar';
import { FileCircleSimulation } from './components/FileCircleSimulation';
import { useTimelinePlayback } from './hooks';

export function App(): React.JSX.Element {
  const [duration, setDuration] = useState(20);

  const playback = useTimelinePlayback({
    duration,
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
