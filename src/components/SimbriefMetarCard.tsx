import React, { useEffect, useState } from 'react';
import { parseMetar } from '../utils/parseMetar';
import { MetarData, AirportInfo } from '../types';
import { WeatherGrid } from './WeatherGrid';
import { FlightCategoryBadge } from './FlightCategoryBadge';
import { Loader2, AlertCircle } from 'lucide-react';

export function SimbriefMetarCard({ icao, title, metarSource = 'live', planMetarRaw }: { icao: string, title: string, metarSource?: 'live'|'plan', planMetarRaw?: string }) {
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
           } catch(e) {}
        }

        if (metarSource === 'plan') {
           if (!planMetarRaw) {
              if (mounted) setError('No Plan METAR available in Simbrief');
           } else {
              if (mounted) setMetar(parseMetar(planMetarRaw));
           }
        } else {
           const metarRes = await fetch(`https://metar.vatsim.net/${icao}`);
           if (!metarRes.ok) throw new Error('Fetch failed');
           const metarText = await metarRes.text();
           if (metarText.includes('Not Found') || metarText.trim().length < 10) {
              throw new Error('No METAR Data');
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
    return () => { mounted = false; };
  }, [icao, metarSource, planMetarRaw]);

  if (loading) {
    return (
       <div className="w-full py-6 flex flex-col items-center justify-center">
         <Loader2 size={20} className="animate-spin text-airbus-sky mb-2" />
         <div className="text-zinc-500 font-bold text-xs uppercase tracking-wider">Loading {title}...</div>
       </div>
    );
  }

  if (error) {
    return (
       <div className="w-full bg-zinc-950 border border-red-900/40 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
         <AlertCircle className="text-red-500 shrink-0" size={20} />
         <div>
            <div className="flex flex-col items-center gap-0.5">
              <h4 className="text-[10px] font-bold tracking-widest text-red-400 uppercase">{title}</h4>
              <h3 className="text-lg font-black font-mono text-white">{icao}</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">Error: {error}</p>
         </div>
       </div>
    );
  }

  if (!metar) return null;

  return (
    <div className="flex flex-col gap-4 w-full items-center">
      <div className="flex flex-col items-center gap-0.5">
        <h4 className="text-xs font-black tracking-widest text-zinc-500 uppercase">{title}</h4>
        <div className="flex items-center gap-2">
          <h3 className="text-3xl font-black font-mono text-white">
            {icao}
          </h3>
          {metar.flightCategory && <FlightCategoryBadge category={metar.flightCategory} />}
        </div>
        {airport?.name && (
          <p className="text-xs text-zinc-400 font-bold text-center max-w-[240px] mt-0.5 line-clamp-1">{airport.name}</p>
        )}
      </div>
      <WeatherGrid metar={metar} />
    </div>
  );
}
