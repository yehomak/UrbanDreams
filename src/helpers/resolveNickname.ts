// src/telegram/resolveNickname.ts
export function resolveNickname(options?: { fallback?: string }): string {
    const fallback = options?.fallback ?? "Player";
  
    // 1) Telegram WebApp launch params (official)
    const initUnsafe: any = (window as any)?.Telegram?.WebApp?.initDataUnsafe;
    const tgUser: any = initUnsafe?.user;
  
    // Prefer Telegram @username
    if (tgUser?.username && String(tgUser.username).trim()) {
      return tgUser.username;
    }
  
    // Or combine first/last name if present
    const first = tgUser?.first_name?.trim?.();
    const last = tgUser?.last_name?.trim?.();
    if (first || last) return [first, last].filter(Boolean).join(" ");
  
    // 2) Start parameter may carry nickname (deep links) e.g. "nick:denys"
    const startParam: string | undefined = initUnsafe?.start_param;
    if (startParam) {
      const m = /^nick:(.+)$/i.exec(startParam);
      if (m?.[1]) return decodeURIComponent(m[1]);
    }
  
    // 3) URL fallbacks (useful in dev): ?nickname=denys or ?tgWebAppStartParam=nick:denys
    const sp = new URLSearchParams(location.search);
    const qNick = sp.get("nickname");
    if (qNick) return qNick;
  
    const tgStart = sp.get("tgWebAppStartParam");
    const m2 = tgStart ? /^nick:(.+)$/i.exec(tgStart) : null;
    if (m2?.[1]) return decodeURIComponent(m2[1]);
  
    // 4) Local dev override (optional)
    const stored = localStorage.getItem("nickname");
    if (stored) return stored;
  
    return fallback;
  }
  