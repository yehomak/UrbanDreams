import { useCallback, useEffect, useRef, useState } from 'react';
import { locationManager } from '@telegram-apps/sdk';

type Pos = { lat: number; lng: number; accuracy?: number };
type Opts = {
  debug?: boolean;
  mockCenter?: { lat: number; lng: number };
  mockJitterM?: number;
  mockIntervalMs?: number;
};

export function useTgLocation(enabled: boolean, opts: Opts = {}) {
  const {
    debug = false,
    mockCenter = { lat: 52.22977, lng: 21.01178 },
    mockJitterM = 8,
    mockIntervalMs = 2000,
  } = opts;

  const [pos, setPos] = useState<Pos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);
  const mockTimer = useRef<number | null>(null);

  const startMock = () => {
    const jitter = (m: number) => {
      const r = m / 111_111;
      const a = Math.random() * Math.PI * 2;
      return { lat: mockCenter.lat + Math.sin(a) * r, lng: mockCenter.lng + Math.cos(a) * r };
    };
    const tick = () => setPos({ ...jitter(mockJitterM), accuracy: 5 });
    tick();
    mockTimer.current = window.setInterval(tick, mockIntervalMs) as any;
    setError(null);
  };

  const startReal = async () => {
    try {
      if (locationManager.isSupported() && !locationManager.isMounted() && locationManager.mount.isAvailable()) {
        await locationManager.mount();
      }
      if (locationManager.requestLocation.isAvailable()) {
        const l = await locationManager.requestLocation();
        setPos({ lat: l.latitude, lng: l.longitude, accuracy: l.horizontal_accuracy });
        setError(null);
        return;
      }
    } catch (e: any) {
      setError(e?.message || 'Telegram location denied');
    }

    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported');
      return;
    }
    watchId.current = navigator.geolocation.watchPosition(
      p => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }); setError(null); },
      err => setError(err.message || 'Geolocation error'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (!enabled) return;
    if (debug) startMock(); else void startReal();
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      if (mockTimer.current !== null) window.clearInterval(mockTimer.current);
    };
  }, [enabled, debug, mockCenter.lat, mockCenter.lng, mockIntervalMs, mockJitterM]);

  const openSystemSettings = useCallback(() => {
    if (locationManager.openSettings.isAvailable()) locationManager.openSettings();
  }, []);

  return { pos, error, openSystemSettings };
}
