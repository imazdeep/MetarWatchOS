import React, { useState } from 'react';
import { AlertCircle, Loader2, Plane, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSimbrief } from '../hooks/useSimbrief';
import { SimbriefMetarCard } from './SimbriefMetarCard';
import { SimbriefIcon } from './SimbriefIcon';
import { AlternateIcon } from './AlternateIcon';

type Tab = 'live' | 'plan' | 'alternate';

export function SimbriefView() {
  const userid = '1149288';
  const { data, loading, error, refresh } = useSimbrief(userid);
  const [activeTab, setActiveTab] = useState<Tab>('live');
  const [reloadToken, setReloadToken] = useState(0);

  const reload = () => {
    refresh();
    setReloadToken(t => t + 1);
  };

  const tabs: { value: Tab; label: string; disabled?: boolean }[] = [
    { value: 'live', label: 'Live' },
    { value: 'plan', label: 'Plan' },
    { value: 'alternate', label: 'Altn', disabled: !data?.altn },
  ];

  return (
    <div className="flex w-full flex-col items-center">
      <div className="label flex items-center gap-[0.22rem] text-ink-2">
        <SimbriefIcon className="size-[0.8rem] text-accent" />
        <span>Flight brief</span>
      </div>

      {loading && !data && (
        <div className="mt-[2.4rem] flex flex-col items-center gap-[0.5rem]">
          <Loader2 className="size-[1.6rem] animate-spin text-accent" aria-hidden="true" />
          <p className="label text-ink-2">Fetching SimBrief…</p>
        </div>
      )}

      {error && !data && (
        <div className="glass mt-[1.4rem] flex w-[10.8rem] flex-col items-center gap-[0.35rem] rounded-[1.1rem] px-[0.7rem] py-[0.75rem]">
          <AlertCircle className="size-[1.3rem] text-danger" aria-hidden="true" />
          <h3 className="label text-danger">Couldn't load plan</h3>
          <p className="text-body font-semibold text-ink-1">{error}</p>
          <button type="button" onClick={reload} className="pill-btn btn-primary mt-[0.2rem] h-[2rem] px-[0.9rem] text-label">
            <RefreshCw className="size-[0.8rem]" strokeWidth={2.6} aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {data && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full flex-col items-center">
          {/* Route summary */}
          <div className="mt-[0.3rem] flex items-center gap-[0.4rem] text-[calc(1.25rem*var(--fz))] font-extrabold leading-none tracking-[0.04em] text-ink-1">
            <span>{data.origin}</span>
            <Plane className="size-[0.95rem] text-accent" strokeWidth={2.4} aria-label="to" />
            <span>{data.destination}</span>
          </div>

          <div className="mt-[0.35rem] flex items-center gap-[0.3rem]">
            {data.altn && (
              <span className="chip glass">
                <AlternateIcon className="size-[0.62rem] text-accent" />
                <span className="text-ink-1">ALTN {data.altn}</span>
              </span>
            )}
            <button type="button" onClick={reload} disabled={loading} className="chip chip-btn glass" aria-label="Reload flight plan">
              <RefreshCw className={`size-[0.7rem] text-accent ${loading ? 'animate-spin' : ''}`} strokeWidth={2.6} aria-hidden="true" />
              <span>{loading ? 'LOADING' : 'RELOAD'}</span>
            </button>
          </div>

          {/* Labelled tabs */}
          <div className="seg glass mt-[0.5rem] w-[10.8rem]" role="tablist" aria-label="Brief weather source">
            {tabs.map(t => (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={activeTab === t.value}
                disabled={t.disabled}
                onClick={() => setActiveTab(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="mt-[0.3rem] text-micro font-bold uppercase tracking-[0.1em] text-ink-3">
            {activeTab === 'live' && 'Current METAR'}
            {activeTab === 'plan' && 'Weather at OFP release'}
            {activeTab === 'alternate' && 'Alternate · current METAR'}
          </p>

          <div className="mt-[0.7rem] flex w-full flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="flex w-full flex-col items-center gap-[1rem]"
              >
                {activeTab === 'live' && (
                  <>
                    <SimbriefMetarCard title="Departure" icao={data.origin} metarSource="live" reloadToken={reloadToken} />
                    <SimbriefMetarCard title="Arrival" icao={data.destination} metarSource="live" reloadToken={reloadToken} />
                  </>
                )}
                {activeTab === 'plan' && (
                  <>
                    <SimbriefMetarCard title="Departure" icao={data.origin} metarSource="plan" planMetarRaw={data.weather?.orig} />
                    <SimbriefMetarCard title="Arrival" icao={data.destination} metarSource="plan" planMetarRaw={data.weather?.dest} />
                  </>
                )}
                {activeTab === 'alternate' && data.altn && (
                  <SimbriefMetarCard title="Alternate" icao={data.altn} metarSource="live" planMetarRaw={data.weather?.altn} reloadToken={reloadToken} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
