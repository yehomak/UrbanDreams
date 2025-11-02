// src/hooks/useTgLocation.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { locationManager } from '@telegram-apps/sdk';

type Pos = { lat: number; lng: number; accuracy?: number };
type Opts = {
  /** enable mock mode */
  debug?: boolean;
  /** mock center (default: Warsaw Center) */
  mockCenter?: { lat: number; lng: number };
  /** jitter radius meters for mock drift */
  mockJitterM?: number;
  /** refresh interval for mock drift */
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
  const mountedRef = useRef(false);
  const mockTimer = useRef<number | null>(null);

  const mountLM = useCallback(async () => {
    if (!locationManager.isSupported()) return false;
    if (locationManager.isMounted()) return true;
    if (!locationManager.mount.isAvailable()) return false;
    try {
      await locationManager.mount();
      return locationManager.isMounted();
    } catch (e: any) {
      setError(e?.message || 'Location manager mount failed');
      return false;
    }
  }, []);

  const requestOnce = useCallback(async () => {
    if (debug) {
      // mock drift: random small move around mockCenter
      const jitter = (meters: number) => {
        const r = meters / 111_111; // deg ~ meters at equator
        const angle = Math.random() * Math.PI * 2;
        return {
          lat: mockCenter.lat + Math.sin(angle) * r,
          lng: mockCenter.lng + Math.cos(angle) * r,
        };
      };
      const tick = () => setPos({ ...jitter(mockJitterM), accuracy: 5 });
      tick();
      mockTimer.current = window.setInterval(tick, mockIntervalMs) as any;
      setError(null);
      return;
    }

    const mounted = await mountLM();
    if (mounted && locationManager.requestLocation.isAvailable()) {
      try {
        const l = await locationManager.requestLocation();
        setPos({ lat: l.latitude, lng: l.longitude, accuracy: l.horizontal_accuracy });
        setError(null);
        return;
      } catch (e: any) {
        setError(e?.message || 'Telegram location denied');
      }
    }

    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported');
      return;
    }
    watchId.current = navigator.geolocation.watchPosition(
      p => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy });
        setError(null);
      },
      err => setError(err.message || 'Geolocation error'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }, [debug, mockCenter, mockIntervalMs, mockJitterM, mountLM]);

  useEffect(() => {
    if (!enabled || mountedRef.current) return;
    mountedRef.current = true;
    requestOnce();
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      if (mockTimer.current !== null) window.clearInterval(mockTimer.current);
    };
  }, [enabled, requestOnce]);

  const openSystemSettings = useCallback(() => {
    if (locationManager.openSettings.isAvailable()) locationManager.openSettings();
  }, []);

  return { pos, error, openSystemSettings };
}
