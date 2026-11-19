import { useEffect, useState } from 'react';

const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Warsaw', hour: '2-digit', minute: '2-digit' });
const hourFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Warsaw', hour: 'numeric', hourCycle: 'h23' });

function phase(hour: number): string {
  if (hour >= 22 || hour < 5) return 'asleep';
  if (hour < 8) return 'waking';
  if (hour < 18) return 'awake';
  return 'dusk';
}

/** Local time in the city, and whether it's dreaming yet. Ticks once a minute. */
export function WarsawClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Align ticks to the minute boundary
    let interval = 0;
    const timeout = window.setTimeout(() => {
      setNow(new Date());
      interval = window.setInterval(() => setNow(new Date()), 60_000);
    }, 60_000 - (Date.now() % 60_000));
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  const state = phase(Number(hourFmt.format(now)));
  return (
    <p className="clock" title={`Local time in Warsaw: the city is ${state}`}>
      <span className="clock__dot" data-state={state} aria-hidden="true" />
      <span className="visually-hidden">Warsaw time</span>
      <span>WAW</span>
      <time dateTime={now.toISOString()}>{fmt.format(now)}</time>
      <span className="clock__state">{state}</span>
    </p>
  );
}
