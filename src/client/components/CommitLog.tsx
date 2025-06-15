import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { JSX } from 'react';
import type { Commit } from '../types.js';

export interface CommitLogProps {
  commits: Commit[];
  seek: HTMLInputElement;
  visible?: number;
}

export const CommitLog = ({ commits, seek, visible = 15 }: CommitLogProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [timestamp, setTimestamp] = useState(() => Number(seek.value));

  useEffect(() => {
    const onInput = () => setTimestamp(Number(seek.value));
    seek.addEventListener('input', onInput);
    onInput();
    return () => seek.removeEventListener('input', onInput);
  }, [seek]);

  const index = useMemo(() => {
    let idx = commits.findIndex((c) => c.commit.committer.timestamp * 1000 <= timestamp);
    if (idx === -1) idx = commits.length - 1;
    return idx;
  }, [commits, timestamp]);

  const start = Math.max(0, index - visible);
  const end = Math.min(commits.length, index + visible + 1);
  const slice = commits.slice(start, end);

  const containerHeight = containerRef.current?.clientHeight ?? 1;
  const spanMs =
    slice.length > 1
      ? (slice[0].commit.committer.timestamp - slice[slice.length - 1].commit.committer.timestamp) * 1000
      : 1;
  const msPerPx = spanMs / Math.max(containerHeight, 1);

  useEffect(() => {
    const list = listRef.current;
    const container = containerRef.current;
    if (!list || !container) return;
    const current = list.querySelector<HTMLLIElement>('li.current');
    if (!current) return;
    let offset = container.clientHeight / 2 - (current.offsetTop + current.offsetHeight / 2);
    const prevCommit = index > 0 ? commits[index - 1] : null;
    const prevLi = current.previousElementSibling as HTMLLIElement | null;
    if (prevCommit && prevLi) {
      const diffMs =
        (prevCommit.commit.committer.timestamp - commits[index].commit.committer.timestamp) * 1000;
      const ratio =
        (timestamp - commits[index].commit.committer.timestamp * 1000) / diffMs;
      const prevCenter = prevLi.offsetTop + prevLi.offsetHeight / 2;
      const currCenter = current.offsetTop + current.offsetHeight / 2;
      offset -= (prevCenter - currCenter) * ratio;
    }
    list.style.transform = `translateY(${offset}px)`;
    if (index === 0) {
      console.log('[debug] commit log rendered final commit at', timestamp);
    }
  }, [slice, timestamp, index, commits]);

  return (
    <div id="commit-log" ref={containerRef}>
      <ul className="commit-list" ref={listRef}>
        {slice.map((c, i) => {
          const diff =
            i > 0
              ? (slice[i - 1].commit.committer.timestamp - c.commit.committer.timestamp) * 1000
              : 0;
          const marginTop = i > 0 ? `${diff / msPerPx}px` : undefined;
          const isCurrent = start + i === index;
          return (
            <li key={start + i} className={isCurrent ? 'current' : undefined} style={marginTop ? { marginTop } : undefined}>
              {c.commit.message.split('\n')[0]}
            </li>
          );
          })}
      </ul>
      <div className="commit-marker">•</div>
    </div>
  );
};
