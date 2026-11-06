import { useEffect, useState } from 'react';
import { AirportData, loadAirport } from '../utils/runways';

/** Runway geometry + name for a station from the bundled database. */
export function useAirport(icao: string) {
  const [data, setData] = useState<AirportData | null>(null);

  useEffect(() => {
    let live = true;
    setData(null);
    loadAirport(icao.toUpperCase()).then(d => {
      if (live) setData(d);
    });
    return () => {
      live = false;
    };
  }, [icao]);

  return data;
}
