import { useEffect, useMemo, useState } from "react";
import { createTransport, Transport } from "./transport";
import { withinRadius } from "./geo";

export type GameType = "tictactoe";
export type LobbyStatus = "open" | "in_progress" | "closed";

export type Player = { id: string; name?: string; lat?: number; lng?: number };
export type Lobby = {
  id: string;
  game: GameType;
  host: Player;
  radiusM: number;
  lat: number;
  lng: number;
  status: LobbyStatus;
  players: Player[];
  createdAt: number;
};

export type TTTState = {
  lobbyId: string;
  board: (null | "X" | "O")[];
  turn: "X" | "O";
  winner: "X" | "O" | "draw" | null;
};

/** --- module-singletons so all components share the same “session” --- */
const transport: Transport = createTransport(true); // set false when you connect real socket
let LOBBIES: Lobby[] = [];
const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

/** tiny in-memory mock bus wiring so emit("lobby:list") returns current */
(function wireMockLists() {
  // only once
  if ((window as any).__LOBBY_BUS_WIRED__) return;
  (window as any).__LOBBY_BUS_WIRED__ = true;

  transport.on("lobby:update", (e: any) => {
    const l: Lobby = (e?.detail ?? e);
    const i = LOBBIES.findIndex(x => x.id === l.id);
    if (i === -1) LOBBIES.push(l); else LOBBIES[i] = l;
    transport.emit("lobby:list", LOBBIES.slice());
  });

  transport.on("lobby:close", (e: any) => {
    const id: string = (e?.detail ?? e);
    LOBBIES = LOBBIES.filter(l => l.id !== id);
    transport.emit("lobby:list", LOBBIES.slice());
  });

  // first list emit (empty)
  transport.emit("lobby:list", LOBBIES.slice());
})();

/** React hook API used by your UI */
export function useGames(userName = "Player") {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [game, setGame] = useState<TTTState | null>(null);
  const me = useMemo<Player>(() => ({ id: uid(), name: userName }), [userName]);

  useEffect(() => {

    const onLobbyList = (e: any) => {
        const payload = (e?.detail ?? e);
        // ✅ normalize to array
        setLobbies(Array.isArray(payload) ? payload : []);
      };
    
      const onLobbyUpdate = (e: any) => {
        const l = (e?.detail ?? e);
        setLobbies(prev => {
          const base = Array.isArray(prev) ? prev : [];
          const i = base.findIndex(x => x.id === l.id);
          if (i === -1) return [...base, l];
          const copy = base.slice(); copy[i] = l; return copy;
        });
      };
    
      const onLobbyClose = (e: any) => {
        const id = (e?.detail ?? e) as string;
        setLobbies(prev => (Array.isArray(prev) ? prev.filter(l => l.id !== id) : []));
      };
    
      transport.on("lobby:list", onLobbyList);
      transport.on("lobby:update", onLobbyUpdate);
      transport.on("lobby:close", onLobbyClose);
    
      // 🔹 don’t emit a null payload; just ask the mock to broadcast current list itself
      transport.emit("lobby:list");
    
      return () => {
        transport.off("lobby:list", onLobbyList);
        transport.off("lobby:update", onLobbyUpdate);
        transport.off("lobby:close", onLobbyClose);
      };
    }, []);

  const createLobby = (opts: { game: GameType; lat: number; lng: number; radiusM: number }) => {
    const lobby: Lobby = {
      id: uid(),
      game: opts.game,
      host: me,
      lat: opts.lat,
      lng: opts.lng,
      radiusM: opts.radiusM,
      status: "open",
      players: [me],
      createdAt: Date.now(),
    };
    transport.emit("lobby:update", lobby);
  };

  const listLobbies = () => transport.emit("lobby:list", null);

  const joinLobby = (lobby: Lobby, mePos?: { lat: number; lng: number }) => {
    if (mePos && !withinRadius([mePos.lat, mePos.lng], [lobby.lat, lobby.lng], lobby.radiusM)) {
      throw new Error("You are outside the lobby radius");
    }
    const updated: Lobby = {
      ...lobby,
      status: "in_progress",
      players: lobby.players.some(p => p.id === me.id) ? lobby.players : [...lobby.players, { ...me, ...mePos }],
    };
    transport.emit("lobby:update", updated);

    // initialize/restart tic-tac-toe state
    const state: TTTState = { lobbyId: lobby.id, board: Array(9).fill(null), turn: "X", winner: null };
    transport.emit("game:state", state);
  };

  const move = (idx: number) => {
    setGame(prev => {
      if (!prev || prev.winner || prev.board[idx]) return prev || null;
      const next: TTTState = structuredClone(prev);
      next.board[idx] = next.turn;
      const W = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
      ];
      for (const [a,b,c] of W) {
        const v = next.board[a];
        if (v && v === next.board[b] && v === next.board[c]) next.winner = v;
      }
      if (!next.winner && next.board.every(Boolean)) next.winner = "draw";
      if (!next.winner) next.turn = next.turn === "X" ? "O" : "X";
      transport.emit("game:state", next);
      return next;
    });
  };

  const closeLobby = (id: string) => transport.emit("lobby:close", id);

  return { me, lobbies, game, createLobby, joinLobby, move, closeLobby, listLobbies };
}