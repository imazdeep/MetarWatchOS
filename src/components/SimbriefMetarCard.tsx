import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { parseMetar } from '../utils/parseMetar';
import { MetarData, AirportInfo } from '../types';
import { WeatherGrid } from './WeatherGrid';
import { FlightCategoryBadge } from './FlightCategoryBadge';

interface Props {
  icao: string;
  title: string;
  metarSource?: 'live' | 'plan';
  planMetarRaw?: string;
  /** Changing this value re-fetches live data. */
  reloadToken?: number;
}

export function SimbriefMetarCard({ icao, title, metarSource = 'live', planMetarRaw, reloadToken = 0 }: Props) {
  const [metar, setMetar] = useState<MetarData | null>(null);
  const [airport, setAirport] = useState<AirportInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      if (!icao) return;
      try {
        setLoading(true);
        setError(null);

        // Fetch airport info regardless of metar source
        const atisRes = await fetch(`https://atisgenerator.com/api/v1/airports/${icao}`).catch(() => null);

        if (mounted && atisRes && atisRes.ok) {
          try {
            const atisJson = await atisRes.json();
            if (atisJson?.data?.airport) {
              setAirport({
                icao: atisJson.data.airport.icao || icao,
                name: atisJson.data.airport.name || 'Unknown Airport',
              });
            }
          } catch (e) {}
        }

        if (metarSource === 'plan') {
          if (!planMetarRaw) {
            if (mounted) setError('No plan METAR in this OFP');
          } else {
            if (mounted) setMetar(parseMetar(planMetarRaw));
          }
        } else {
          const metarRes = await fetch(`https://metar.vatsim.net/${icao}`);
          if (!metarRes.ok) throw new Error('Fetch failed');
          const metarText = await metarRes.text();
          if (metarText.includes('Not Found') || metarText.trim().length < 10) {
            throw new Error('No METAR data');
          }
          if (mounted) {
            setMetar(parseMetar(metarText));
          }
        }
      } catch (err: any) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, [icao, metarSource, planMetarRaw, reloadToken]);

  const name = airport?.name && airport.name !== 'Unknown Airport' ? airport.name : null;

  return (
    <section className="flex w-full flex-col items-center gap-[0.4rem]" aria-label={`${title} ${icao}`}>
      <div className="wear-item flex flex-col items-center">
        <span className="label text-accent">{title}</span>
        <div className="mt-[0.14rem] flex items-center gap-[0.4rem]">
          <h3 className="text-[calc(1.5rem*var(--fz))] font-extrabold leading-none tracking-[0.03em] text-ink-1">{icao}</h3>
          {metar?.flightCategory && !error && <FlightCategoryBadge category={metar.flightCategory} />}
        </div>
        {name && <p className="mt-[0.14rem] max-w-[10.5rem] truncate text-label font-bold uppercase tracking-[0.07em] text-ink-2">{name}</p>}
      </div>

      {loading && !metar ? (
        <div className="flex h-[3.2rem] items-center gap-[0.35rem] text-label font-bold uppercase tracking-[0.1em] text-ink-2">
          <Loader2 className="size-[1rem] animate-spin text-accent" aria-hidden="true" />
          Loading
        </div>
      ) : error ? (
        <div className="glass wear-item flex w-[11rem] items-center justify-center gap-[0.35rem] rounded-[0.95rem] px-[0.6rem] py-[0.55rem] text-body font-bold text-ink-1">
          <AlertCircle className="size-[0.95rem] shrink-0 text-danger" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : (
        <WeatherGrid metar={metar} />
      )}
    </section>
  );
}
