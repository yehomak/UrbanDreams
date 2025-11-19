// Умный транспорт: mock для локалки по умолчанию,
// Socket.IO — когда в .env указано VITE_GAMES_TRANSPORT=socket

import { io, Socket } from "socket.io-client";

export type Transport = {
  on(event: string, cb: (...a: any[]) => void): void;
  off(event: string, cb: (...a: any[]) => void): void;
  emit(event: string, payload?: any): void;
  close(): void;
  isConnected(): boolean;
  waitUntilConnected(timeoutMs?: number): Promise<void>;
};

type SocketOptions = {
  url?: string;
  namespace?: string;
  path?: string;
  auth?: Record<string, any>;
};

class MockTransport implements Transport {
  private static bus = new EventTarget();
  on(ev: string, cb: any)  { MockTransport.bus.addEventListener(ev, cb as any); }
  off(ev: string, cb: any) { MockTransport.bus.removeEventListener(ev, cb as any); }
  emit(ev: string, payload?: any) { MockTransport.bus.dispatchEvent(new CustomEvent(ev, { detail: payload })); }
  close() {}
  isConnected() { return true; }
  async waitUntilConnected() { return; }
}

class SocketTransport implements Transport {
  private socket: Socket;
  private ready: Promise<void>;
  constructor(opts: SocketOptions = {}) {
    const base = opts.url ?? import.meta.env.VITE_WS_URL ?? location.origin;
    const ns   = opts.namespace ?? import.meta.env.VITE_WS_NAMESPACE ?? "";
    const url  = base + ns;
    this.socket = io(url, {
      path: opts.path ?? import.meta.env.VITE_WS_PATH,
      transports: ["websocket"],
      withCredentials: true,
      auth: opts.auth,
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 400,
      reconnectionDelayMax: 5000,
      timeout: 9000,
      forceNew: true,
    });

    this.ready = new Promise<void>((resolve, reject) => {
      const ok = () => { cleanup(); resolve(); };
      const bad = (e: any) => { cleanup(); reject(e); };
      const cleanup = () => {
        this.socket.off("connect", ok);
        this.socket.off("connect_error", bad);
      };
      this.socket.on("connect", ok);
      this.socket.on("connect_error", bad);
    });

    // лёгкие логи
    this.socket.on("connect",    () => console.log("[WS] connected", this.socket.id));
    this.socket.on("disconnect", (r) => console.log("[WS] disconnected:", r));
    this.socket.on("reconnect_attempt", (n) => console.log("[WS] retry", n));
    this.socket.on("connect_error", (e) => console.warn("[WS] connect_error:", e?.message ?? e));
  }
  isConnected() { return this.socket.connected; }
  async waitUntilConnected(timeoutMs = 10000) {
    if (this.socket.connected) return;
    await Promise.race([
      this.ready,
      new Promise((_, rej) => setTimeout(() => rej(new Error("WS connect timeout")), timeoutMs))
    ]);
  }
  on(ev: string, cb: any)  { this.socket.on(ev, cb); }
  off(ev: string, cb: any) { this.socket.off(ev, cb); }
  emit(ev: string, payload?: any) { this.socket.emit(ev, payload); }
  close() { this.socket.close(); }
}

export function createTransport(overrides?: Partial<SocketOptions>): Transport {
  const mode = (import.meta.env.VITE_GAMES_TRANSPORT ?? "mock").toLowerCase();
  if (mode === "socket") {
    return new SocketTransport({
      url: import.meta.env.VITE_WS_URL,
      namespace: import.meta.env.VITE_WS_NAMESPACE,
      path: import.meta.env.VITE_WS_PATH,
      auth: undefined,
      ...overrides,
    });
  }
  return new MockTransport();
}
