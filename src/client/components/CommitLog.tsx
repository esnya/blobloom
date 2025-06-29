import React, { useEffect, useMemo, useState } from 'react';
import { useSize } from '../hooks/useSize';
import type { Commit } from '../types';

export interface CommitLogProps {
  commits: Commit[];
  timestamp: number;
  onTimestampChange?: (n: number) => void;
  visible?: number;
}

export const CommitLog = ({ commits, timestamp, onTimestampChange, visible = 15 }: CommitLogProps): React.JSX.Element => {
  const [offset, setOffset] = useState(0);
  const { ref: containerRef, size } = useSize<HTMLDivElement>();

  useEffect(() => {
    onTimestampChange?.(timestamp);
  }, [timestamp, onTimestampChange]);


  const index = useMemo(() => {
    let idx = commits.findIndex((c) => c.timestamp * 1000 <= timestamp);
    if (idx === -1) idx = commits.length - 1;
    return idx;
  }, [commits, timestamp]);

  const start = Math.max(0, index - visible);
  const end = Math.min(commits.length, index + visible + 1);
  const slice = useMemo(
    () => commits.slice(start, end),
    [commits, start, end]
  );

  const spanMs =
    slice.length > 1
      ? (slice[0]!.timestamp - slice[slice.length - 1]!.timestamp) * 1000
      : 1;
  const msPerPx = spanMs / Math.max(size.height, 1);

  useEffect(() => {
    const container = containerRef.current;
    const list = container?.querySelector<HTMLUListElement>('ul.commit-list');
    if (!list || !container) return;
    const current = list.querySelector<HTMLLIElement>('li.current');
    if (!current) return;
    let nextOffset =
      container.clientHeight / 2 - (current.offsetTop + current.offsetHeight / 2);
    const prevCommit = index > 0 ? commits[index - 1] : null;
    const prevLi = current.previousElementSibling as HTMLLIElement | null;
    if (prevCommit && prevLi) {
      const diffMs = (prevCommit.timestamp - commits[index]!.timestamp) * 1000;
      const ratio = (timestamp - commits[index]!.timestamp * 1000) / diffMs;
      const prevCenter = prevLi.offsetTop + prevLi.offsetHeight / 2;
      const currCenter = current.offsetTop + current.offsetHeight / 2;
      nextOffset -= (prevCenter - currCenter) * ratio;
    }
    setOffset(nextOffset);
    if (index === 0) container.dispatchEvent(new Event('end'));
  }, [timestamp, index, commits, containerRef, size.height]);

  return (
    // eslint-disable-next-line no-restricted-syntax
    <div id="commit-log" ref={containerRef}>
      <ul className="commit-list" style={{ transform: `translateY(${offset}px)` }}>
        {slice.map((c, i) => {
          const diff = i > 0 ? (slice[i - 1]!.timestamp - c.timestamp) * 1000 : 0;
          const marginTop = i > 0 ? `${diff / msPerPx}px` : undefined;
          const isCurrent = start + i === index;
          return (
            <li key={start + i} className={isCurrent ? 'current' : undefined} style={marginTop ? { marginTop } : undefined}>
              {c.message.split('\n')[0]}
            </li>
          );
        })}
      </ul>
      <div className="commit-marker">•</div>
    </div>
  );
};
