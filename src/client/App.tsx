import React, { Suspense, useEffect, useState } from 'react';
import { CommitLog } from './components/CommitLog';
import { SeekBar } from './components/SeekBar';
import { FileCircleSimulation } from './components/FileCircleSimulation';
import { useTimelineData } from './hooks/useTimelineData';
import { usePlayer } from './hooks/usePlayer';

const PLAY_DURATION = 30;

function AppContent(): React.JSX.Element {
  const [timestamp, setTimestamp] = useState(0);
  const { commits, lineCounts, start, end } = useTimelineData({ timestamp });

  const { resume } = usePlayer({
    getSeek: () => timestamp,
    setSeek: setTimestamp,
    duration: PLAY_DURATION,
    start,
    end,
  });

  useEffect(() => {
    setTimestamp(start);
    if (start && end) {
      resume();
    }
  }, [start, end, resume]);

  return (
    <>
      <div id="controls">
        <SeekBar
          value={timestamp}
          min={start}
          max={end}
          onChange={setTimestamp}
        />
      </div>
      <div id="timestamp">{new Date(timestamp).toLocaleString()}</div>
      <FileCircleSimulation data={lineCounts} />
      <CommitLog
        commits={commits}
        timestamp={timestamp}
        onTimestampChange={setTimestamp}
      />
    </>
  );
}

export function App(): React.JSX.Element {
  return (
    <Suspense fallback={<div>Loading commits...</div>}>
      <AppContent />
    </Suspense>
  );
}
