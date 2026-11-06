import { useCallback, useState } from 'react';

const KEY = 'wx-recents';

function load(max: number): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string').slice(0, max) : [];
  } catch {
    return [];
  }
}

/** Recently viewed stations — one tap instead of typing on a watch keyboard. */
export function useRecents(max = 6) {
  const [recents, setRecents] = useState<string[]>(() => load(max));

  const add = useCallback(
    (icao: string) => {
      setRecents(prev => {
        if (prev[0] === icao) return prev;
        const next = [icao, ...prev.filter(x => x !== icao)].slice(0, max);
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [max],
  );

  return { recents, add };
}
