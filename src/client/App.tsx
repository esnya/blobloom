import React, { useEffect, useState } from 'react';
import { CommitLog } from './components/CommitLog';
import { SeekBar } from './components/SeekBar';
import { FileCircleSimulation } from './components/FileCircleSimulation';
import { useTimelineData } from './hooks';

export function App(): React.JSX.Element {
  const [timestamp, setTimestamp] = useState(0);

  const {
    commits,
    lineCounts,
    start,
    end,
    ready,
  } = useTimelineData({
    timestamp,
    json: (input: string) => fetch(input).then((r) => r.json()),
  });

  useEffect(() => {
    if (ready) setTimestamp(start);
  }, [ready, start]);




  return (
    <>
      {ready && (
        <div id="controls">
          <SeekBar
            value={timestamp}
            min={start}
            max={end}
            onChange={setTimestamp}
          />
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
