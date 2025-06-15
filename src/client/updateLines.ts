import { fetchLineCounts } from './api';
import type { JsonFetcher } from './api';
import type { LineCount } from './types.js';

export interface UpdateLinesOptions {
  seek: HTMLInputElement;
  update: (counts: LineCount[]) => void;
  json: JsonFetcher;
  end: number;
}

export const createUpdateLines = ({ seek, update, json, end }: UpdateLinesOptions) => {
  let pendingTimestamp: number | null = null;
  return async (): Promise<void> => {
    const ts = Number(seek.value);
    pendingTimestamp = ts;
    const counts = await fetchLineCounts(json, ts);
    if (pendingTimestamp !== ts) return;
    update(counts);
    if (ts >= end) {
      console.log('[debug] physics area updated for final commit at', ts);
    }
  };
};
