import { io, Socket } from "socket.io-client";

export type Transport = {
  on(event: string, cb: (...args: any[]) => void): void;
  off(event: string, cb: (...args: any[]) => void): void;
  emit(event: string, payload?: any): void;
  close(): void;
};

/** In-tab mock transport using EventTarget so you can test without a server */
class MockTransport implements Transport {
  private static bus = new EventTarget();
  on(ev: string, cb: any) { MockTransport.bus.addEventListener(ev, cb as any); }
  off(ev: string, cb: any) { MockTransport.bus.removeEventListener(ev, cb as any); }
  emit(ev: string, payload?: any) { MockTransport.bus.dispatchEvent(new CustomEvent(ev, { detail: payload })); }
  close() {}
}

/** Real Socket.io transport (switch on when backend is ready) */
class SocketTransport implements Transport {
  private socket: Socket;
  constructor(url = "/") { this.socket = io(url, { transports: ["websocket"] }); }
  on(ev: string, cb: any) { this.socket.on(ev, cb); }
  off(ev: string, cb: any) { this.socket.off(ev, cb); }
  emit(ev: string, payload?: any) { this.socket.emit(ev, payload); }
  close() { this.socket.close(); }
}

export function createTransport(useMock = true): Transport {
  return useMock ? new MockTransport() : new SocketTransport(import.meta.env.VITE_WS_URL);
}
