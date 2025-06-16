import React, { useEffect, useState, useCallback } from 'react';
import { CommitLog } from './components/CommitLog';
import { SeekBar } from './components/SeekBar';
import { FileCircleSimulation } from './components/FileCircleSimulation';
import { useTimelineData } from './hooks';

export function App(): React.JSX.Element {
  const [timestamp, setTimestamp] = useState(0);

  const json = useCallback(
    (input: string) => fetch(input).then((r) => r.json()),
    [],
  );

  const { commits, lineCounts, start, end, ready } = useTimelineData({
    timestamp,
    json,
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
