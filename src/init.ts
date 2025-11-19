// src/init.ts
import {
  setDebug,
  mountBackButton,
  restoreInitData,
  init as initSDK,
  mountMiniApp,
  bindThemeParamsCssVars,
  mockTelegramEnv,
  type ThemeParams,
  themeParamsState,
  retrieveLaunchParams,
  emitEvent,
} from '@telegram-apps/sdk-react';

export type InitConfig = {
  nickname: string;
  debug: boolean;
  eruda: boolean;
  mockForMacOS: boolean;
};

// маленькие утилиты
const toBool = (v?: string | null) => v === '1' || v === 'true' || v === 'yes';

function resolveFromLaunch() {
  // безопасно читаем LP (вне TG не упадёт)
  let lp: ReturnType<typeof retrieveLaunchParams> | undefined;
  try { lp = retrieveLaunchParams(); } catch {}

  const tgUser: any =
    (lp as any)?.initData?.user ||
    (lp as any)?.initDataUnsafe?.user ||
    (lp as any)?.initDataRaw?.user;

  // ник: @username > First Last > start_param (nick:...) > ?nickname
  const qs = new URLSearchParams(location.search);
  const startParam: string | undefined =
    (lp as any)?.initData?.startParam ||
    (lp as any)?.initDataUnsafe?.start_param;

  let nickname =
    tgUser?.username?.trim?.() ||
    [tgUser?.first_name || tgUser?.firstName, tgUser?.last_name || tgUser?.lastName]
      .filter(Boolean)
      .join(' ') ||
    undefined;

  if (!nickname && startParam) {
    const m = /^nick:(.+)$/i.exec(startParam);
    if (m?.[1]) nickname = decodeURIComponent(m[1]);
  }
  if (!nickname) nickname = qs.get('nickname') || localStorage.getItem('nickname') || 'Player';

  // флаги: start_param вида "debug:1,eruda:1,mock:1", либо query (?debug=1&eruda=1&mock=1)
  const spFlags = Object.fromEntries(
    (startParam || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => s.split(':'))
      .filter(a => a.length === 2)
  );

  const lpDebug = toBool(spFlags['debug']) || toBool(qs.get('debug'));
  const lpEruda = toBool(spFlags['eruda']) || toBool(qs.get('eruda'));
  const lpMock  = toBool(spFlags['mock'])  || toBool(qs.get('mock'));

  try { localStorage.setItem('nickname', nickname); } catch {}

  return { nickname, lpDebug, lpEruda, lpMock };
}

/**
 * Инициализация SDK + сбор конфигурации приложения из launch-params и опций.
 * Приоритет: переданные опции override launch-flags.
 */
export async function init(options: Partial<InitConfig> = {}): Promise<InitConfig> {
  initSDK();

  const { nickname, lpDebug, lpEruda, lpMock } = resolveFromLaunch();

  // собираем итоговый конфиг
  const debug        = options.debug        ?? lpDebug ?? false;
  const eruda        = options.eruda        ?? lpEruda ?? false;
  const mockForMacOS = options.mockForMacOS ?? lpMock  ?? false;

  // включаем debug в SDK (раньше это не вызывалось)
  setDebug(debug);

  // Dev-панель (eruda) — можно привязать к HTTPS если хочешь
  if (eruda) {
    const { default: er } = await import('eruda');
    er.init();
    er.position({ x: window.innerWidth - 50, y: 0 });
  }

  if (mockForMacOS) {
    let firstThemeSent = false;
    mockTelegramEnv({
      onEvent(event, next) {
        if (event[0] === 'web_app_request_theme') {
          let tp: ThemeParams = {};
          if (firstThemeSent) tp = themeParamsState();
          else {
            firstThemeSent = true;
            tp ||= retrieveLaunchParams().tgWebAppThemeParams;
          }
          return emitEvent('theme_changed', { theme_params: tp });
        }
        if (event[0] === 'web_app_request_safe_area') {
          return emitEvent('safe_area_changed', { left: 0, top: 0, right: 0, bottom: 0 });
        }
        next();
      },
    });
  }

  try {
    mountBackButton.ifAvailable();
    restoreInitData();
    if (mountMiniApp.isAvailable()) {
      await mountMiniApp();
      bindThemeParamsCssVars();
    }
  } catch (e) {
    console.error('Error on init()', e);
  }

  const cfg: InitConfig = { nickname, debug, eruda, mockForMacOS };
  return cfg;
}
