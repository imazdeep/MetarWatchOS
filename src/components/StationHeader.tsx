import React from 'react';
import { RefreshCw } from 'lucide-react';
import { AirportInfo, MetarData } from '../types';
import { FlightCategoryBadge } from './FlightCategoryBadge';
import { useNow } from '../hooks/useNow';
import { formatAge, formatZulu, parseObsTime } from '../utils/format';

interface Props {
  icao: string;
  airport: AirportInfo | null;
  metar: MetarData | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function StationHeader({ icao, airport, metar, isLoading, onRefresh }: Props) {
  const now = useNow(30_000);
  const obs = metar ? parseObsTime(metar.time, now) : null;
  const ageMin = obs ? (now.getTime() - obs.getTime()) / 60_000 : null;
  const stale = ageMin !== null && ageMin > 60;
  const name = airport?.name && airport.name !== 'Unknown Airport' ? airport.name : null;

  return (
    <header className="flex w-full flex-col items-center">
      <div className="flex items-center gap-[0.45rem]">
        <h1 className="text-title font-extrabold tracking-[0.03em] text-ink-1">{icao.toUpperCase()}</h1>
        {metar?.flightCategory && <FlightCategoryBadge category={metar.flightCategory} />}
      </div>

      <p className="mt-[0.16rem] max-w-[10.5rem] truncate text-label font-bold uppercase tracking-[0.07em] text-ink-2">
        {name ?? (isLoading ? 'Loading station…' : 'Airport')}
      </p>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="chip chip-btn glass mt-[0.3rem]"
        aria-label="Refresh weather"
        title="Refresh weather"
      >
        <RefreshCw className={`size-[0.7rem] text-accent ${isLoading ? 'animate-spin' : ''}`} strokeWidth={2.6} aria-hidden="true" />
        {isLoading ? (
          <span>UPDATING</span>
        ) : obs ? (
          <>
            <span className="text-ink-1">{formatZulu(obs)}Z</span>
            <span className="text-ink-3" aria-hidden="true">·</span>
            <span className={stale ? 'text-warn' : ''}>{formatAge(ageMin ?? 0)}</span>
          </>
        ) : (
          <span>REFRESH</span>
        )}
      </button>
    </header>
  );
}
