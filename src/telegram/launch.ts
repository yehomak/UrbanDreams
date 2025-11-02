// src/telegram/launch.ts
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

const toBool = (v?: string | null) =>
  v === '1' || v === 'true' || v === 'yes';

export function getAppLaunch() {
  // 1) Telegram launch params (safe outside TG too)
  let lp: ReturnType<typeof retrieveLaunchParams> | undefined;
  try { lp = retrieveLaunchParams(); } catch { /* not in TG — fine */ }

  const tgUser = lp?.initDataRaw?.user ?? lp?.initData?.user; // compat across SDK shapes

  // Nickname priority: @username → first/last → start_param → query → localStorage → fallback
  let nickname =
    tgUser?.username?.trim?.() ||
    [tgUser?.firstName, tgUser?.lastName].filter(Boolean).join(' ') ||
    undefined;

  const startParam: string | undefined =
    (lp as any)?.initData?.startParam || (lp as any)?.initDataUnsafe?.start_param;

  const qs = new URLSearchParams(location.search);

  if (!nickname && startParam) {
    const m = /^nick:(.+)$/i.exec(startParam);
    if (m?.[1]) nickname = decodeURIComponent(m[1]);
  }
  if (!nickname) nickname = qs.get('nickname') || localStorage.getItem('nickname') || 'Player';

  // Flags: prefer start_param like "debug:1", with query fallbacks (?debug=1&eruda=1&mock=1)
  const spFlags = Object.fromEntries(
    (startParam || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => s.split(':'))
      .filter(a => a.length === 2)
  );

  const debug        = toBool(spFlags['debug']) || toBool(qs.get('debug'));
  const eruda        = toBool(spFlags['eruda']) || toBool(qs.get('eruda'));
  const mockForMacOS = toBool(spFlags['mock'])  || toBool(qs.get('mock')) || false;

  try { localStorage.setItem('nickname', nickname); } catch {}

  return { nickname, debug, eruda, mockForMacOS };
}
