import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useSimbrief } from '../hooks/useSimbrief';
import { SimbriefMetarCard } from './SimbriefMetarCard';
import { Sheet } from './Sheet';

type Source = 'live' | 'plan';

interface Props {
  onClose: () => void;
  onOpen: (icao: string) => void;
}

export function SimbriefView({ onClose, onOpen }: Props) {
  const userid = '1149288';
  const { data, loading, error, refresh } = useSimbrief(userid);
  const [source, setSource] = useState<Source>('live');
  const [reloadToken, setReloadToken] = useState(0);

  const reload = () => {
    refresh();
    setReloadToken(t => t + 1);
  };

  return (
    <Sheet title="Flight brief" onClose={onClose}>
      {loading && !data && <p className="shimmer mt-[2.5rem] text-small text-ink-2">Loading SimBrief plan…</p>}

      {error && !data && (
        <div className="mt-[1.6rem] flex w-[10rem] flex-col items-center gap-[0.4rem]">
          <p className="text-small text-ink">{error}</p>
          <button type="button" onClick={reload} className="pill solid tap">
            Try again
          </button>
        </div>
      )}

      {data && (
        <>
          <p className="mt-[0.3rem] flex items-center gap-[0.35rem] text-val font-medium tracking-[0.06em]">
            <span>{data.origin}</span>
            <span className="text-small text-ink-3" aria-label="to">
              →
            </span>
            <span>{data.destination}</span>
          </p>

          <div className="mt-[0.45rem] flex w-[10.4rem] items-center gap-[0.3rem]">
            <div className="seg flex-1" role="tablist" aria-label="Weather source">
              {(['live', 'plan'] as Source[]).map(s => (
                <button key={s} type="button" role="tab" aria-selected={source === s} onClick={() => setSource(s)}>
                  {s === 'live' ? 'Live' : 'Plan'}
                </button>
              ))}
            </div>
            <button type="button" onClick={reload} disabled={loading} className="icon-btn tap size-[1.98rem] shrink-0" aria-label="Reload flight plan">
              <RefreshCw className={`size-[0.85rem] ${loading ? 'animate-spin' : ''}`} strokeWidth={2.2} />
            </button>
          </div>
          <p className="mt-[0.25rem] text-lbl tracking-[0.04em] text-ink-3">
            {source === 'live' ? 'Current METAR · tap to open' : 'Weather at OFP release'}
          </p>

          <div className="mt-[0.5rem] flex flex-col items-center gap-[0.35rem]">
            <SimbriefMetarCard title="Dep" icao={data.origin} metarSource={source} planMetarRaw={data.weather?.orig} reloadToken={reloadToken} onOpen={onOpen} />
            <SimbriefMetarCard title="Arr" icao={data.destination} metarSource={source} planMetarRaw={data.weather?.dest} reloadToken={reloadToken} onOpen={onOpen} />
            {data.altn && (
              <SimbriefMetarCard title="Altn" icao={data.altn} metarSource={source} planMetarRaw={data.weather?.altn} reloadToken={reloadToken} onOpen={onOpen} />
            )}
          </div>
        </>
      )}
    </Sheet>
  );
}
