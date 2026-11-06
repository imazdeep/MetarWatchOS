import { useState, useCallback, useEffect } from 'react';
import { AppState, AirportInfo, MetarData } from '../types';
import { parseMetar } from '../utils/parseMetar';

export function useMetar() {
  const [state, setState] = useState<AppState>({
    icao: 'EGLL',
    airport: null,
    metar: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchData = useCallback(async (icaoCode: string) => {
    if (!icaoCode || icaoCode.length < 3) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    const code = icaoCode.toUpperCase();
    
    try {
      // Fetch both APIs in parallel
      const [metarRes, atisRes] = await Promise.allSettled([
        fetch(`https://metar.vatsim.net/${code}`),
        fetch(`https://atisgenerator.com/api/v1/airports/${code}`)
      ]);

      if (metarRes.status === 'rejected') throw new Error('Failed to fetch METAR from VATSIM');
      
      const metarText = await metarRes.value.text();
      
      if (!metarText || metarText.includes('Not Found') || metarText.trim().length < 10) {
         throw new Error(`No METAR data found for ${code}`);
      }

      const parsedMetar = parseMetar(metarText);
      let airportInfo: AirportInfo = { icao: code, name: 'Unknown Airport' };

      if (atisRes.status === 'fulfilled' && atisRes.value.ok) {
        try {
           const atisJson = await atisRes.value.json();
           if (atisJson?.data?.airport) {
             airportInfo = {
               icao: atisJson.data.airport.icao || code,
               name: atisJson.data.airport.name || 'Unknown Airport',
               runways: atisJson.data.airport.runways ? atisJson.data.airport.runways.split(',').map((r:string)=>r.trim()) : undefined
             };
           }
        } catch(e) {
           console.warn("Could not parse ATIS response", e);
        }
      }

      setState(prev => ({
        ...prev,
        icao: code,
        airport: airportInfo,
        metar: parsedMetar,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      }));

    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'An error occurred fetching data',
        failedIcao: code,
      }));
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData('EGLL');
  }, [fetchData]);

  // Handle refresh interval (every 3 minutes)
  useEffect(() => {
    if (!state.icao || state.error) return;
    
    const interval = setInterval(() => {
      fetchData(state.icao);
    }, 3 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [state.icao, state.error, fetchData]);

  const search = (icao: string) => {
    fetchData(icao);
  };

  const refresh = () => {
    if (state.icao) fetchData(state.icao);
  };

  return { state, search, refresh };
}
