import type { Commit } from './types';
import { fetchCommits } from './api';
import { createResource } from './resource';

const cache = new Map<string, () => Commit[]>();

const key = (baseUrl?: string) => baseUrl ?? '';

export const readCommits = (baseUrl?: string): Commit[] => {
  const k = key(baseUrl);
  let resource = cache.get(k);
  if (!resource) {
    resource = createResource(() => fetchCommits(baseUrl));
    cache.set(k, resource);
  }
  return resource();
};
