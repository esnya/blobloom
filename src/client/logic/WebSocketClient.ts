interface WebSocketClientOptions {
  url: string;
  onMessage: (ev: MessageEvent) => void;
  reconnectDelay: number;
}

export class WebSocketClient {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private active = true;
  private queued: string | null = null;
  private last: string | null = null;

  constructor(private opts: WebSocketClientOptions) {}

  private sendQueued() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN && this.queued) {
      this.socket.send(this.queued);
      this.queued = null;
    }
  }

  private connect = () => {
    if (this.socket || !this.active) return;
    const socket = new WebSocket(this.opts.url);
    socket.addEventListener('open', this.sendQueued.bind(this));
    socket.addEventListener('message', this.opts.onMessage);
    const retry = () => {
      this.socket = null;
      if (this.active) {
        this.queued = this.last;
        this.reconnectTimer = setTimeout(this.connect, this.opts.reconnectDelay);
      }
    };
    socket.addEventListener('close', retry);
    socket.addEventListener('error', retry);
    this.socket = socket;
  };

  send(data: string) {
    this.active = true;
    this.connect();
    this.queued = data;
    this.last = data;
    this.sendQueued();
  }

  close() {
    this.active = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
  }

  dispose() {
    this.active = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.socket?.close();
  }
}
