import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { parseMetar } from '../utils/parseMetar';
import { MetarData } from '../types';
import { useSettings } from '../context/SettingsContext';
import { formatAltimeter, formatTemp, formatVisibility, formatWind } from '../utils/format';

interface Props {
  icao: string;
  title: string;
  metarSource?: 'live' | 'plan';
  planMetarRaw?: string;
  /** Changing this value re-fetches live data. */
  reloadToken?: number;
  onOpen?: (icao: string) => void;
}

/** One airport of the flight plan as a compact, tappable summary. */
export function SimbriefMetarCard({ icao, title, metarSource = 'live', planMetarRaw, reloadToken = 0, onOpen }: Props) {
  const { units } = useSettings();
  const [metar, setMetar] = useState<MetarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      if (!icao) return;
      try {
        setLoading(true);
        setError(null);
        if (metarSource === 'plan') {
          if (!planMetarRaw) throw new Error('No plan METAR in this OFP');
          if (mounted) setMetar(parseMetar(planMetarRaw));
        } else {
          const metarRes = await fetch(`https://metar.vatsim.net/${icao}`);
          if (!metarRes.ok) throw new Error('Fetch failed');
          const metarText = await metarRes.text();
          if (metarText.includes('Not Found') || metarText.trim().length < 10) throw new Error('No METAR data');
          if (mounted) setMetar(parseMetar(metarText));
        }
      } catch (err: any) {
        if (mounted) {
          setMetar(null);
          setError(err.message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, [icao, metarSource, planMetarRaw, reloadToken]);

  const alt = formatAltimeter(metar?.altimeter, units);
  const wind = metar ? formatWind(metar) : null;
  const temp = metar ? formatTemp(metar, units) : null;
  const vis = formatVisibility(metar?.visibility);

  const cell = (label: string, value: string) => (
    <div className="flex min-w-0 flex-col items-start">
      <span className="lbl">{label}</span>
      <span className="num truncate text-small text-ink">{value}</span>
    </div>
  );

  return (
    <button
      type="button"
      onClick={() => onOpen?.(icao)}
      className="tap w-[10.8rem] rounded-[0.9rem] bg-[var(--surface)] px-[0.7rem] py-[0.55rem] text-left"
      aria-label={`${title} ${icao}. Open on instrument`}
    >
      <div className="flex items-center gap-[0.35rem]">
        <span className="lbl w-[2rem] shrink-0">{title}</span>
        <span className="text-body font-medium tracking-[0.08em] text-ink">{icao}</span>
        {metar?.flightCategory && <span className={`cat cat-${metar.flightCategory}`}>{metar.flightCategory}</span>}
        <ChevronRight className="ml-auto size-[0.8rem] text-ink-3" aria-hidden="true" />
      </div>

      {loading && !metar ? (
        <p className="shimmer mt-[0.35rem] text-small text-ink-2">Loading…</p>
      ) : error ? (
        <p className="mt-[0.35rem] text-small text-ink-2">{error}</p>
      ) : (
        <div className="mt-[0.38rem] grid grid-cols-2 gap-x-[0.6rem] gap-y-[0.3rem]">
          {cell('Wind', wind ? `${wind.value}${wind.note ?? ''}${wind.unit ? ` ${wind.unit}` : ''}` : '—')}
          {cell(alt.label, `${alt.value}${alt.unit ? ` ${alt.unit}` : ''}`)}
          {cell('Temp', temp ? `${temp.value}${temp.unit ?? ''}` : '—')}
          {cell('Vis', `${vis.value}${vis.unit ? ` ${vis.unit}` : ''}`)}
        </div>
      )}
    </button>
  );
}
