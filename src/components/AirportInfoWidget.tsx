import React, { useState, useEffect } from 'react';
import { AirportInfo, MetarData } from '../types';
import { FlightCategoryBadge } from './FlightCategoryBadge';

interface Props {
  airport: AirportInfo | null;
  icao: string;
  metar: MetarData | null;
  lastUpdated: Date | null;
}

export function AirportInfoWidget({ airport, icao, metar, lastUpdated }: Props) {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds}Z`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col items-center text-center gap-1.5 py-1 font-sans">
      {/* Station Code + Flight Category Badge on one line */}
      <div className="flex items-center justify-center gap-3 w-full font-sans">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase font-sans">
          {icao.toUpperCase()}
        </h1>
        {metar?.flightCategory && (
          <FlightCategoryBadge category={metar.flightCategory} />
        )}
      </div>

      {/* Subtitle containing Airport Name and Live UTC Time */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 max-w-[280px] w-full font-sans">
        {airport && (
          <span className="truncate font-bold tracking-wide uppercase font-sans">{airport.name}</span>
        )}
        {airport && <span className="text-zinc-600 font-extrabold select-none">·</span>}
        <span className="text-accent font-mono font-black shrink-0 tracking-wider">
          {utcTime}
        </span>
      </div>
    </div>
  );
}
