import type { Commit, LineCount } from '../types';
import type { LineCountsResponse } from '../../api/types';
import { WebSocketClient } from './WebSocketClient';
import { buildWsUrl, deriveWsOptions } from '../ws';

export interface TimelineDataOptions {
  baseUrl?: string | undefined;
  timestamp: number;
}

interface TimelineDataState {
  commits: Commit[];
  lineCounts: LineCount[];
  start: number;
  end: number;
  ready: boolean;
}

export class TimelineDataManager {
  state: TimelineDataState = { commits: [], lineCounts: [], start: 0, end: 0, ready: false };

  private renameMap: Record<string, string> = {};
  private token = 0;
  private processed = 0;
  private lastTimestamp: number | null = null;
  private waiting = false;
  private pending: { data: string; token: number } | null = null;
  private currentToken = 0;
  private socket: WebSocketClient | null = null;
  private baseUrl?: string | undefined;
  private timestamp: number;

  isWaiting() {
    return this.waiting;
  }

  hasPending() {
    return this.pending !== null;
  }

  constructor(opts: TimelineDataOptions, private onChange: (s: TimelineDataState) => void) {
    this.baseUrl = opts.baseUrl;
    this.timestamp = opts.timestamp;
    this.createSocket();
  }

  updateOptions(opts: TimelineDataOptions) {
    if (opts.baseUrl !== this.baseUrl) {
      this.baseUrl = opts.baseUrl;
      this.reset();
      this.createSocket();
    }
    this.timestamp = opts.timestamp;
  }

  private createSocket() {
    if (this.socket) this.socket.dispose();
    this.socket = new WebSocketClient({
      url: buildWsUrl('/ws/line-counts', deriveWsOptions(this.baseUrl ?? '')),
      onMessage: (ev) => this.handleMessage(ev),
      reconnectDelay: 1000,
    });
  }

  private handleMessage(ev: MessageEvent) {
    const payload = JSON.parse(ev.data as string) as { type?: string; token?: number; [key: string]: unknown };
    if (payload.type === 'range') {
      this.state.start = payload.start as number;
      this.state.end = payload.end as number;
      this.emit();
      return;
    }
    if (payload.type === 'done') {
      if (payload.token === this.currentToken) {
        this.waiting = false;
        if (this.pending) {
          const next = this.pending;
          this.pending = null;
          this.state.ready = false;
          this.send(next);
        } else {
          this.state.ready = true;
        }
        this.emit();
      }
      return;
    }
    if (payload.type === 'data') {
      if (Array.isArray(payload.commits)) {
        const map = new Map(this.state.commits.map((c) => [c.id, c] as const));
        for (const c of payload.commits as Commit[]) map.set(c.id, c);
        this.state.commits = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
      }
      if (payload.token !== undefined && payload.token > this.processed && Array.isArray(payload.counts) && payload.counts.length > 0) {
        this.processed = payload.token;
        if (payload.renames) {
          for (const [to, from] of Object.entries(payload.renames as Record<string, string>)) {
            this.renameMap[to] = this.renameMap[from] ?? from;
          }
        }
        const mapped = (payload.counts as LineCountsResponse['counts']).map((c) => ({
          ...c,
          file: this.renameMap[c.file] ?? c.file,
        }));
        this.state.lineCounts = mapped;
      }
      this.emit();
    }
  }

  private emit() {
    this.onChange({ ...this.state });
  }

  private send(payload: { data: string; token: number }) {
    if (!this.socket) return;
    this.waiting = true;
    this.currentToken = payload.token;
    this.socket.send(payload.data);
  }

  update(timestamp: number) {
    if (this.lastTimestamp === timestamp) return;
    this.token += 1;
    this.lastTimestamp = timestamp;
    const payload = { data: JSON.stringify({ timestamp, token: this.token }), token: this.token };
    if (this.waiting) {
      this.pending = payload;
    } else {
      this.state.ready = false;
      this.send(payload);
    }
  }

  reset() {
    this.renameMap = {};
    this.state = { commits: [], lineCounts: [], start: 0, end: 0, ready: false };
    this.waiting = false;
    this.pending = null;
    this.token += 1;
    this.processed = this.token;
    this.lastTimestamp = null;
    this.socket?.close();
  }

  dispose() {
    this.socket?.dispose();
    this.token += 1;
    this.processed = this.token;
    this.lastTimestamp = null;
    this.state.ready = false;
    this.waiting = false;
    this.pending = null;
  }
}
