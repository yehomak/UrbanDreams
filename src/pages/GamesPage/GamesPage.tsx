import React, { useMemo, useState } from 'react';
import { useAppConfig } from '@/appConfig';
import { useTgLocation } from '@/hooks/useTgLocation';
import { useGames } from '@/games/store';
import { withinRadius } from '@/games/geo';
import "/src/css/games.css";

const MOCK_CENTER = { lat: 52.226424, lng: 20.998807 };

export function GamesPage() {
  const { nickname, debug: globalDebug } = useAppConfig();
  const [consent, setConsent] = useState(false);
  const [uiDebug, setUiDebug] = useState(globalDebug);
  const [radius, setRadius] = useState(20);

  const { pos, error, openSystemSettings } = useTgLocation(consent || uiDebug, {
    debug: uiDebug,
    mockCenter: MOCK_CENTER,
    mockJitterM: 10,
    mockIntervalMs: 1500,
  });

  // debug -> позиция всегда есть
  const effPos = uiDebug ? (pos ?? MOCK_CENTER) : pos;

  const { lobbies, createLobby, joinLobby } = useGames(nickname);

  const nearby = useMemo(() => {
    const list = Array.isArray(lobbies) ? lobbies : [];
    if (!effPos) return list;
    // шире радиус для тестов
    return list.filter(l => withinRadius([l.lat, l.lng], [effPos.lat, effPos.lng], 50_000));
  }, [lobbies, effPos]);

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
          <span>Debug mode</span>
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
          disabled={!effPos}
          onClick={() => effPos && createLobby({
            game: 'tictactoe',
            lat: effPos.lat,
            lng: effPos.lng,
            radiusM: radius
          })}
        >
          Create session here
        </button>

        <button className="tg-btn" onClick={openSystemSettings}>Location settings</button>

        {uiDebug && !pos && (
          <button
            className="tg-btn tg-btn--ghost"
            onClick={() => createLobby({ game: 'tictactoe', lat: MOCK_CENTER.lat, lng: MOCK_CENTER.lng, radiusM: radius })}
          >
            Quick mock @ center
          </button>
        )}
      </div>

      {error && <div className="tg-note tg-note--error">{error}</div>}
      {!pos && (consent || uiDebug) && <div className="tg-note">{uiDebug ? 'Debug position active.' : 'Waiting for location…'}</div>}

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
              disabled={!effPos}
              onClick={() => joinLobby(l, effPos ?? undefined)}
            >
              Join
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
