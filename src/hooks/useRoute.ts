import { useCallback, useEffect, useRef, useState } from 'react';

export type View = 'weather' | 'brief';
export type Overlay = 'search' | 'settings' | null;
export interface Route {
  view: View;
  overlay: Overlay;
}

const BASE: Route = { view: 'weather', overlay: null };

const depth = (r: Route) => (r.view === 'brief' ? 1 : 0) + (r.overlay ? 1 : 0);

function isRoute(v: unknown): v is Route {
  const r = v as Route | undefined;
  return !!r && (r.view === 'weather' || r.view === 'brief') && (r.overlay === null || r.overlay === 'search' || r.overlay === 'settings');
}

/**
 * Tiny history-backed router.
 *
 * Every layer (Brief view, Search, Settings) is a history entry, so the
 * Galaxy Watch hardware Back key and the swipe-right gesture close the top
 * layer instead of leaving the site. Closing from the UI also goes through
 * history.back(), which keeps the two in sync.
 */
export function useRoute() {
  const [route, setRoute] = useState<Route>(() => {
    const s = (window.history.state as { wx?: unknown } | null)?.wx;
    return isRoute(s) ? s : BASE;
  });
  const routeRef = useRef(route);
  routeRef.current = route;

  useEffect(() => {
    if (!isRoute((window.history.state as { wx?: unknown } | null)?.wx)) {
      window.history.replaceState({ ...(window.history.state || {}), wx: BASE }, '');
    }
    const onPop = (e: PopStateEvent) => {
      const s = (e.state as { wx?: unknown } | null)?.wx;
      setRoute(isRoute(s) ? s : BASE);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const push = useCallback((next: Route) => {
    window.history.pushState({ wx: next }, '');
    setRoute(next);
  }, []);

  /** Go back n entries; falls back to a direct state change if the browser ignores it. */
  const back = useCallback((n: number, target: Route) => {
    if (n <= 0) {
      setRoute(target);
      return;
    }
    const before = routeRef.current;
    window.history.go(-n);
    window.setTimeout(() => {
      if (routeRef.current === before) setRoute(target);
    }, 450);
  }, []);

  const openOverlay = useCallback(
    (overlay: Exclude<Overlay, null>) => {
      const r = routeRef.current;
      if (r.overlay === overlay) return;
      if (r.overlay) {
        const next = { ...r, overlay };
        window.history.replaceState({ wx: next }, '');
        setRoute(next);
      } else {
        push({ ...r, overlay });
      }
    },
    [push],
  );

  const closeOverlay = useCallback(() => {
    const r = routeRef.current;
    if (r.overlay) back(1, { ...r, overlay: null });
  }, [back]);

  const toggleBrief = useCallback(() => {
    const r = routeRef.current;
    if (r.view === 'brief') back(depth(r), BASE);
    else push({ view: 'brief', overlay: null });
  }, [back, push]);

  const goHome = useCallback(() => {
    const r = routeRef.current;
    back(depth(r), BASE);
  }, [back]);

  return { route, openOverlay, closeOverlay, toggleBrief, goHome };
}
