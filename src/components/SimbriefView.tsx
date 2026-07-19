import React, { useState } from 'react';
import { useSimbrief } from '../hooks/useSimbrief';
import { SimbriefMetarCard } from './SimbriefMetarCard';
import { Loader2, AlertCircle, RefreshCw, CloudSun, FileText } from 'lucide-react';
import { AlternateIcon } from './AlternateIcon';
import { motion, AnimatePresence } from 'motion/react';

export function SimbriefView() {
  const userid = '1149288';
  const { data, loading, error, refresh } = useSimbrief(userid);
  const [activeTab, setActiveTab] = useState<'live' | 'plan' | 'alternate'>('live');

  return (
    <div className="flex flex-col gap-3 w-full items-center text-center font-sans">
       
       {loading && !data && (
         <div className="py-10 flex flex-col items-center justify-center font-sans">
            <Loader2 size={24} className="animate-spin text-accent mb-2" />
            <div className="text-zinc-500 font-bold text-xs uppercase tracking-wider font-sans">Fetching Simbrief...</div>
         </div>
       )}

       {error && !data && (
         <div className="bg-red-950/40 border border-red-900 rounded-xl p-4 flex flex-col items-center gap-2 text-red-400 text-center max-w-[240px] font-sans">
            <AlertCircle size={20} className="shrink-0" />
            <div>
              <h3 className="font-bold text-xs uppercase font-sans">Retrieve Error</h3>
              <p className="text-xs text-zinc-400 mt-1 font-sans">{error}</p>
            </div>
         </div>
       )}

       {data && (
         <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="flex flex-col gap-3 w-full items-center font-sans"
         >
           {/* Navigation controls row at the very top of briefing */}
           <div className="flex flex-col items-center gap-1.5 w-full font-sans mb-1">
             <div className="text-[9px] font-black text-zinc-500 tracking-widest uppercase font-sans">
               {activeTab === 'live' && 'Simbrief: Live Weather'}
               {activeTab === 'plan' && 'Simbrief: Plan Weather'}
               {activeTab === 'alternate' && 'Simbrief: Alternate Station'}
             </div>

             <div className="flex items-center justify-center gap-2.5 w-full font-sans">
               {/* Live Mode Button */}
               <button 
                 onClick={() => setActiveTab('live')}
                 className={`w-11 h-11 rounded-full border flex items-center justify-center cursor-pointer transition-all font-sans ${activeTab === 'live' ? 'bg-accent border-accent text-black font-extrabold shadow-md' : 'bg-zinc-950 border-zinc-900 text-accent active:bg-zinc-900'}`}
                 style={{ minWidth: '44px', minHeight: '44px' }}
                 title="Live Weather"
               >
                 <CloudSun size={15} />
               </button>

               {/* Plan Mode Button */}
               <button 
                 onClick={() => setActiveTab('plan')}
                 className={`w-11 h-11 rounded-full border flex items-center justify-center cursor-pointer transition-all font-sans ${activeTab === 'plan' ? 'bg-accent border-accent text-black font-extrabold shadow-md' : 'bg-zinc-950 border-zinc-900 text-accent active:bg-zinc-900'}`}
                 style={{ minWidth: '44px', minHeight: '44px' }}
                 title="Flight Plan Weather"
               >
                 <FileText size={15} />
               </button>

               {/* Alternate Airport Button */}
               <button 
                 onClick={() => data.altn ? setActiveTab('alternate') : null}
                 disabled={!data.altn}
                 className={`w-11 h-11 rounded-full border flex items-center justify-center cursor-pointer transition-all font-sans ${!data.altn ? 'opacity-25 border-zinc-900 text-zinc-700 cursor-not-allowed' : activeTab === 'alternate' ? 'bg-accent border-accent text-black font-extrabold shadow-md' : 'bg-zinc-950 border-zinc-900 text-accent active:bg-zinc-900'}`}
                 style={{ minWidth: '44px', minHeight: '44px' }}
                 title="Alternate Airport"
               >
                 <AlternateIcon size={15} />
               </button>

               {/* Refresh Plan Button */}
               <button 
                 onClick={refresh}
                 disabled={loading}
                 className="w-11 h-11 rounded-full bg-zinc-950 border border-zinc-900 text-accent flex items-center justify-center cursor-pointer active:bg-zinc-900 transition disabled:opacity-40 font-sans"
                 style={{ minWidth: '44px', minHeight: '44px' }}
                 title="Refresh Simbrief Plan"
               >
                 {loading ? <Loader2 size={15} className="animate-spin text-accent" /> : <RefreshCw size={15} />}
               </button>
             </div>
           </div>

           {/* Dynamic view content depending on the active tab */}
           <div className="w-full flex flex-col gap-3 items-center font-sans">
             <AnimatePresence mode="wait">
               {activeTab === 'live' && (
                 <motion.div
                   key="live"
                   initial={{ opacity: 0, y: 4 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -4 }}
                   className="w-full flex flex-col gap-4 items-center"
                 >
                   <SimbriefMetarCard title="Departure" icao={data.origin} metarSource="live" />
                   <SimbriefMetarCard title="Arrival" icao={data.destination} metarSource="live" />
                 </motion.div>
               )}

               {activeTab === 'plan' && (
                 <motion.div
                   key="plan"
                   initial={{ opacity: 0, y: 4 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -4 }}
                   className="w-full flex flex-col gap-4 items-center"
                 >
                   <SimbriefMetarCard title="Departure" icao={data.origin} metarSource="plan" planMetarRaw={data.weather?.orig} />
                   <SimbriefMetarCard title="Arrival" icao={data.destination} metarSource="plan" planMetarRaw={data.weather?.dest} />
                 </motion.div>
               )}

               {activeTab === 'alternate' && data.altn && (
                 <motion.div
                   key="alternate"
                   initial={{ opacity: 0, y: 4 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -4 }}
                   className="w-full flex flex-col items-center"
                 >
                   <SimbriefMetarCard title="Alternate" icao={data.altn} metarSource="live" planMetarRaw={data.weather?.altn} />
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
         </motion.div>
       )}
    </div>
  );
}

