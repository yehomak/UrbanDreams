// src/games/GamesTab.tsx
import React, { useMemo, useState } from 'react';
import { useAppConfig } from '@/appConfig';
import { useTgLocation } from '@/hooks/useTgLocation';
import { useGames } from '@/games/store';
import { withinRadius } from '@/games/geo';

export function GamesPage() {
  const { nickname, debug: globalDebug } = useAppConfig();
  const [consent, setConsent] = useState(false);
  const [uiDebug, setUiDebug] = useState(globalDebug); // allow toggling in UI
  const [radius, setRadius] = useState(20);

  // Telegram or mock location
  const { pos, error, openSystemSettings } = useTgLocation(consent || uiDebug, {
    debug: uiDebug,
    mockCenter: { lat: 52.226424, lng: 20.998807 },
    mockJitterM: 10,
    mockIntervalMs: 1500,
  });

  // Give store the nickname – it will tag lobbies with the user name
  const { lobbies, createLobby, joinLobby } = useGames(nickname);

  const nearby = useMemo(() => {
    const list = Array.isArray(lobbies) ? lobbies : [];
    if (!pos) return list;
    // widen radius during testing if needed
    return list.filter(l => withinRadius([l.lat, l.lng], [pos.lat, pos.lng], 50_000));
  }, [lobbies, pos]);

  return (
    <section className="tg-panel">
      <header className="tg-panel__head">
        <h2 className="tg-title">Games</h2>
        <div className="tg-badge">{nearby.length} nearby</div>
      </header>

      <div className="tg-row">
        <label className="tg-switch">
          <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
          <span>Share precise location</span>
        </label>
        <label className="tg-switch tg-switch--ghost">
          <input type="checkbox" checked={uiDebug} onChange={e => setUiDebug(e.target.checked)} />
          <span>Debug location</span>
        </label>
      </div>

      <div className="tg-row">
        <div className="tg-field">
          <label>Game</label>
          <select className="tg-select" defaultValue="tictactoe" disabled>
            <option value="tictactoe">Tic-Tac-Toe</option>
          </select>
        </div>

        <div className="tg-field">
          <label>Radius</label>
          <input
            className="tg-input"
            type="number"
            min={10}
            max={200}
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value || '20', 10))}
          />
          <span className="tg-suffix">m</span>
        </div>
      </div>

      <div className="tg-row">
        <button
          className="tg-btn tg-btn--primary"
          disabled={!pos}
          onClick={() => pos && createLobby({ game: 'tictactoe', lat: pos.lat, lng: pos.lng, radiusM: radius })}
        >
          Create session here
        </button>
        <button className="tg-btn" onClick={openSystemSettings}>Location settings</button>
      </div>

      {error && <div className="tg-note tg-note--error">{error}</div>}
      {!pos && (consent || uiDebug) && <div className="tg-note">Waiting for location…</div>}

      <div className="tg-list">
        {nearby.length === 0 && <div className="tg-empty">No lobbies nearby yet.</div>}
        {nearby.map((l) => (
          <div className="tg-card tg-anim-pop" key={l.id}>
            <div className="tg-card__row">
              <div className="tg-card__title">🎮 {l.game}</div>
              <div className={`tg-chip ${l.status !== 'open' ? 'tg-chip--warn' : ''}`}>{l.status}</div>
            </div>
            <div className="tg-card__meta">Host: {l.host.name ?? l.host.id.slice(0, 6)}</div>
            <div className="tg-card__meta">Radius: {l.radiusM}m</div>
            <button
              className="tg-btn tg-btn--ghost"
              disabled={!pos}
              onClick={() => joinLobby(l, pos ?? undefined)}
            >
              Join
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
