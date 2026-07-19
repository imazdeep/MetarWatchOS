import React, { useState } from 'react';
import { useMetar } from './hooks/useMetar';
import { SearchHeader } from './components/SearchHeader';
import { AirportInfoWidget } from './components/AirportInfoWidget';
import { WeatherGrid } from './components/WeatherGrid';
import { SimbriefView } from './components/SimbriefView';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { state, search, refresh } = useMetar();
  const [mode, setMode] = useState<'search' | 'simbrief'>('search');

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-0 overflow-hidden font-sans select-none text-white">
      {/* 
        High-fidelity Wear OS Smartwatch Container
        - On desktop / large screens, simulates the physical circular watch bezel (480x480px).
        - On actual watches or in small viewports, expands seamlessly to fill 100% of the screen.
      */}
      <div className="relative w-full max-w-[480px] h-screen sm:h-[480px] sm:max-h-[480px] sm:rounded-full sm:border-[10px] sm:border-zinc-800 sm:shadow-2xl overflow-hidden bg-black flex flex-col">
        
        {/* Scrollable watch container with radial padding (prevents content clipping on watch curve) */}
        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col items-center py-8 px-7 text-center select-none scroll-smooth">
          
          {/* Vertically centered inner container for perfect alignment */}
          <div className="my-auto w-full flex flex-col items-center gap-3">
            {/* Main Display Area - First screen content */}
            <div className="w-full flex flex-col items-center">
              <AnimatePresence mode="wait">
                {mode === 'simbrief' ? (
                  <motion.div
                    key="simbrief"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex flex-col items-center"
                  >
                    <SimbriefView />
                  </motion.div>
                ) : state.error ? (
                  <motion.div 
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-red-950/40 border border-red-900 rounded-xl p-4 flex flex-col items-center gap-2 text-red-400 text-center max-w-[230px] mt-2 font-sans"
                  >
                    <AlertTriangle className="shrink-0 text-red-400" size={18} />
                    <div>
                      <h3 className="font-bold text-xs uppercase font-sans">Retrieval Error</h3>
                      <p className="text-xs text-zinc-400 mt-1 font-sans">{state.error}</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key={state.icao}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-3 w-full items-center font-sans"
                  >
                    {/* Airport & Station Information - Extremely compact dual-line header */}
                    <div className="w-full">
                      <AirportInfoWidget 
                        airport={state.airport} 
                        icao={state.icao} 
                        metar={state.metar} 
                        lastUpdated={state.lastUpdated}
                      />
                    </div>
                    
                    {/* Weather metrics (Altimeter, Temp, Wind, Vis in a spacious horizontal 2x2 grid) */}
                    <div className="w-full">
                      <WeatherGrid metar={state.metar} />
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Integrated search and round action buttons directly under the metrics */}
            <SearchHeader 
              icao={state.icao} 
              isLoading={state.isLoading} 
              onSearch={search} 
              onRefresh={refresh}
              mode={mode}
              onModeChange={setMode}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
