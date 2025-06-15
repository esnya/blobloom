import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { fetchCommits } from './api.js';
import { CommitLog } from './components/CommitLog.js';
import { DurationInput } from './components/DurationInput.js';
import { PlayButton } from './components/PlayButton.js';
import type { PlayButtonHandle } from './components/PlayButton.js';
import { SeekBar } from './components/SeekBar.js';
import { SimulationArea } from './components/SimulationArea.js';
import type { SimulationAreaHandle } from './components/SimulationArea.js';
import type { Commit } from './types.js';

export function App(): React.JSX.Element {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [timestamp, setTimestamp] = useState(0);
  const [ready, setReady] = useState(false);

  const seekRef = useRef<HTMLInputElement>(null);
  const durationRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef<PlayButtonHandle>(null);
  const simRef = useRef<SimulationAreaHandle>(null);
  const wasPlaying = useRef(false);

  const json = (input: string) => fetch(input).then((r) => r.json());

  useEffect(() => {
    (async () => {
      const commitData = await fetchCommits(json);
      setCommits(commitData);
      const s = commitData[commitData.length - 1].commit.committer.timestamp * 1000;
      const e = commitData[0].commit.committer.timestamp * 1000;
      setStart(s);
      setEnd(e);
      setTimestamp(s);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const onVisibility = () => {
      if (document.hidden) {
        wasPlaying.current = playerRef.current?.isPlaying() ?? false;
        playerRef.current?.pause();
        simRef.current?.pause();
      } else {
        simRef.current?.resume();
        if (wasPlaying.current) playerRef.current?.resume();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [ready]);

  return (
    <>
      {ready && (
        <div id="controls">
          <PlayButton
            ref={playerRef}
            seekRef={seekRef}
            durationRef={durationRef}
            start={start}
            end={end}
            onPlayStateChange={(p) => simRef.current?.setEffectsEnabled(p)}
          />
          <button onClick={() => playerRef.current?.stop()}>Stop</button>
          <SeekBar ref={seekRef} onInput={setTimestamp} />
          <DurationInput ref={durationRef} />s
        </div>
      )}
      <div id="timestamp">{new Date(timestamp).toLocaleString()}</div>
      {ready && (
        <>
          <SimulationArea ref={simRef} json={json} timestamp={timestamp} end={end} />
          {seekRef.current && <CommitLog commits={commits} seek={seekRef.current} />}
        </>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
