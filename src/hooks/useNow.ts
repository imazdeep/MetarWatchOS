import { useEffect, useState } from 'react';

/** Current time, re-rendered every `intervalMs` (aligned to the wall clock). */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer: number;
    const tick = () => {
      setNow(new Date());
      timer = window.setTimeout(tick, intervalMs - (Date.now() % intervalMs));
    };
    timer = window.setTimeout(tick, intervalMs - (Date.now() % intervalMs));
    return () => window.clearTimeout(timer);
  }, [intervalMs]);

  return now;
}
