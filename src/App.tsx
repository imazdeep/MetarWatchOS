import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMetar } from './hooks/useMetar';
import { useRoute } from './hooks/useRoute';
import { useRecents } from './hooks/useRecents';
import { WatchFace } from './components/watch/WatchFace';
import { Screen } from './components/watch/Screen';
import { CurvedClock } from './components/watch/CurvedClock';
import { Dock } from './components/watch/Dock';
import { StationHeader } from './components/StationHeader';
import { WeatherGrid, WeatherGridSkeleton } from './components/WeatherGrid';
import { CloudLayers, RawMetar } from './components/RawMetar';
import { SimbriefView } from './components/SimbriefView';
import { SearchSheet } from './components/SearchSheet';
import { SettingsSheet } from './components/SettingsSheet';

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.16 },
};

export default function App() {
  const { state, search, refresh } = useMetar();
  const { route, openOverlay, closeOverlay, toggleBrief, goHome } = useRoute();
  const { recents, add: addRecent } = useRecents();

  useEffect(() => {
    if (state.metar && !state.error) addRecent(state.icao);
  }, [state.icao, state.metar, state.error, addRecent]);

  const runSearch = (icao: string) => {
    goHome();
    search(icao);
  };

  return (
    <WatchFace>
      <AnimatePresence mode="wait" initial={false}>
        {route.view === 'brief' ? (
          <motion.div key="brief" className="absolute inset-0" {...fade}>
            <Screen label="Flight brief">
              <SimbriefView />
            </Screen>
          </motion.div>
        ) : (
          <motion.div key="weather" className="absolute inset-0" {...fade}>
            <Screen label="Airport weather">
              {state.error ? (
                <div className="my-auto flex w-full flex-col items-center gap-[0.5rem] pb-[0.4rem]">
                  <div className="glass flex w-[9.6rem] flex-col items-center gap-[0.32rem] rounded-[1.1rem] px-[0.6rem] py-[0.7rem]">
                    <AlertTriangle className="size-[1.25rem] text-danger" aria-hidden="true" />
                    <h2 className="label text-danger">No data{state.failedIcao ? ` · ${state.failedIcao}` : ''}</h2>
                    <p className="text-body font-semibold text-ink-1">{state.error}</p>
                  </div>
                  <div className="flex gap-[0.35rem]">
                    <button
                      type="button"
                      onClick={() => search(state.failedIcao || state.icao)}
                      disabled={state.isLoading}
                      className="pill-btn glass h-[2rem] px-[0.7rem] text-label text-ink-1"
                    >
                      <RefreshCw className={`size-[0.78rem] text-accent ${state.isLoading ? 'animate-spin' : ''}`} strokeWidth={2.6} aria-hidden="true" />
                      Retry
                    </button>
                    <button type="button" onClick={() => openOverlay('search')} className="pill-btn btn-primary h-[2rem] px-[0.7rem] text-label">
                      <Search className="size-[0.78rem]" strokeWidth={2.6} aria-hidden="true" />
                      Search
                    </button>
                  </div>
                </div>
              ) : (
                <motion.div key={state.icao} className="flex w-full flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <StationHeader icao={state.icao} airport={state.airport} metar={state.metar} isLoading={state.isLoading} onRefresh={refresh} />
                  <div className="mt-[0.32rem]">{state.metar ? <WeatherGrid metar={state.metar} /> : <WeatherGridSkeleton />}</div>
                  {state.metar && (
                    <div className="mt-[0.45rem] flex flex-col items-center gap-[0.45rem]">
                      <CloudLayers metar={state.metar} />
                      <RawMetar metar={state.metar} />
                      <p className="mt-[0.2rem] text-micro font-bold uppercase tracking-[0.12em] text-ink-3">Auto-refresh every 3 min</p>
                    </div>
                  )}
                </motion.div>
              )}
            </Screen>
          </motion.div>
        )}
      </AnimatePresence>

      <Dock view={route.view} onSearch={() => openOverlay('search')} onToggleBrief={toggleBrief} onSettings={() => openOverlay('settings')} />

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

      <CurvedClock />
    </WatchFace>
  );
}
