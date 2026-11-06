import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { useMetar } from './hooks/useMetar';
import { useRoute } from './hooks/useRoute';
import { useRecents } from './hooks/useRecents';
import { useAirport } from './hooks/useAirport';
import { WatchFace } from './components/watch/WatchFace';
import { Instrument } from './components/Instrument';
import { DetailsPage, MenuPage } from './components/Pages';
import { SimbriefView } from './components/SimbriefView';
import { SearchSheet } from './components/SearchSheet';
import { SettingsSheet } from './components/SettingsSheet';

const PAGES = 3;

export default function App() {
  const { state, search, refresh } = useMetar();
  const { route, openOverlay, closeOverlay, toggleBrief, goHome } = useRoute();
  const { recents, add: addRecent } = useRecents();
  const airportData = useAirport(state.icao);

  const pagerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    if (state.metar && !state.error) addRecent(state.icao);
  }, [state.icao, state.metar, state.error, addRecent]);

  const goPage = useCallback((i: number, smooth = true) => {
    const el = pagerRef.current;
    const target = el?.children[i] as HTMLElement | undefined;
    if (el && target) el.scrollTo({ top: target.offsetTop, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // Track the current page for the indicator dots.
  useEffect(() => {
    const el = pagerRef.current;
    if (!el) return;
    let idle = 0;
    const onScroll = () => {
      const pages = Array.from(el.children) as HTMLElement[];
      let best = 0;
      pages.forEach((p, i) => {
        if (Math.abs(p.offsetTop - el.scrollTop) < Math.abs(pages[best].offsetTop - el.scrollTop)) best = i;
      });
      setPage(best);
      setScrolling(true);
      window.clearTimeout(idle);
      idle = window.setTimeout(() => setScrolling(false), 900);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    el.focus({ preventScroll: true }); // rotating bezel scrolls the pager
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.clearTimeout(idle);
    };
  }, []);

  // New station → back to the instrument.
  useEffect(() => goPage(0, false), [state.icao, goPage]);

  const runSearch = (icao: string) => {
    goHome();
    goPage(0, false);
    search(icao);
  };

  const doRefresh = () => {
    refresh();
    goPage(0);
  };

  return (
    <WatchFace>
      <div ref={pagerRef} className="pager" tabIndex={-1} aria-label="Airport weather">
        <section className="page" aria-label="Instrument">
          <Instrument
            icao={state.error && state.failedIcao ? state.failedIcao : state.icao}
            airport={state.airport}
            data={state.error ? null : airportData}
            metar={state.error ? null : state.metar}
            isLoading={state.isLoading}
            error={state.error}
            failedIcao={state.failedIcao}
            onSearch={() => openOverlay('search')}
            onRetry={() => search(state.failedIcao || state.icao)}
            onMore={() => goPage(1)}
          />
        </section>
        <section className="page h-auto min-h-full" aria-label="Details">
          <DetailsPage icao={state.icao} airport={state.airport} data={airportData} metar={state.error ? null : state.metar} />
        </section>
        <section className="page" aria-label="Menu">
          <MenuPage
            isLoading={state.isLoading}
            onSearch={() => openOverlay('search')}
            onBrief={toggleBrief}
            onRefresh={doRefresh}
            onSettings={() => openOverlay('settings')}
          />
        </section>
      </div>

      <div className="page-dots" style={{ opacity: page === 0 && !scrolling ? 0 : 1 }} aria-hidden="true">
        {Array.from({ length: PAGES }, (_, i) => (
          <i key={i} data-on={page === i} />
        ))}
      </div>

      <AnimatePresence>
        {route.view === 'brief' && (
          <React.Fragment key="brief">
            <SimbriefView onClose={toggleBrief} onOpen={runSearch} />
          </React.Fragment>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {route.overlay === 'search' && (
          <React.Fragment key="search">
            <SearchSheet current={state.icao} recents={recents} onSearch={runSearch} onClose={closeOverlay} />
          </React.Fragment>
        )}
        {route.overlay === 'settings' && (
          <React.Fragment key="settings">
            <SettingsSheet onClose={closeOverlay} />
          </React.Fragment>
        )}
      </AnimatePresence>
    </WatchFace>
  );
}
