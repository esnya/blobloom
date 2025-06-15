import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { fetchCommits, fetchLineCounts } from './api.js';
import { createPlayer } from './player.js';
import { createFileSimulation } from './lines.js';
import { CommitLog } from './components/CommitLog.js';
import type { Commit } from './types.js';

function App(): React.JSX.Element {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [seekEl, setSeekEl] = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    const json = (input: string) => fetch(input).then((r) => r.json());
    (async () => {
      const commitData = await fetchCommits(json);
      setCommits(commitData);

      const start =
        commitData[commitData.length - 1].commit.committer.timestamp * 1000;
      const end = commitData[0].commit.committer.timestamp * 1000;

      const duration = document.getElementById('duration') as HTMLInputElement;
      const playButton = document.getElementById('play') as HTMLButtonElement;
      const stopButton = document.getElementById('stop') as HTMLButtonElement;
      const sim = document.getElementById('sim') as HTMLDivElement;
      const seekInput = document.getElementById('seek') as HTMLInputElement;
      setSeekEl(seekInput);
      const timestampEl = document.getElementById('timestamp') as HTMLDivElement;
      const simInstance = createFileSimulation(sim);
      const { update, resize } = simInstance;

      const updateTimestamp = () => {
        const date = new Date(Number(seekInput.value));
        timestampEl.textContent = date.toLocaleString();
      };

      const updateLines = async (): Promise<void> => {
        const ts = Number(seekInput.value);
        const counts = await fetchLineCounts(json, ts);
        update(counts);
        if (ts >= end) {
          console.log('[debug] physics area updated for final commit at', ts);
        }
      };

      seekInput.addEventListener('input', () => {
        updateLines();
        updateTimestamp();
      });

      const player = createPlayer({
        seek: seekInput,
        duration,
        playButton,
        start,
        end,
        onPlayStateChange: (p) => simInstance.setEffectsEnabled(p),
      });
      stopButton.addEventListener('click', player.stop);
      updateLines();
      updateTimestamp();
      window.addEventListener('resize', resize);

      let wasPlaying = false;
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          wasPlaying = player.isPlaying();
          player.pause();
          simInstance.pause();
        } else {
          simInstance.resume();
          if (wasPlaying) player.resume();
        }
      });
    })();
  }, []);

  return <>{commits.length > 0 && seekEl && <CommitLog commits={commits} seek={seekEl} />}</>;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />,
);
