import { useState, useCallback, useEffect } from 'react';

export function useSimbrief(userid: string) {
  const [data, setData] = useState<{ origin: string; destination: string; altn?: string; weather?: { orig?: string; dest?: string; altn?: string } } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSimbrief = useCallback(async () => {
    if (!userid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://www.simbrief.com/api/xml.fetcher.php?userid=${userid}&json=1`);
      
      if (res.ok) {
        try {
          const json = await res.clone().json();
          if (json && json.origin && json.destination) {
            const origin = json.origin.icao_code;
            const destination = json.destination.icao_code;
            const altn = json.alternate?.icao_code;
            const weather = {
               orig: json.weather?.orig_metar || undefined,
               dest: json.weather?.dest_metar || undefined,
               altn: json.weather?.altn_metar || undefined,
            };
            setData({ origin, destination, altn: altn || undefined, weather });
            setLoading(false);
            return;
          }
        } catch (e) {
          // Fallback to XML
        }
      }

      // If JSON fails, or it was XML
      const text = await res.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      
      if (xml.querySelector('fetch_status')?.textContent === 'Error') {
         throw new Error(xml.querySelector('fetch_error')?.textContent || 'Error fetching plan');
      }

      const origin = xml.querySelector('origin > icao_code')?.textContent || '';
      const destination = xml.querySelector('destination > icao_code')?.textContent || '';
      const altn = xml.querySelector('alternate > icao_code')?.textContent || '';
      const origWeather = xml.querySelector('weather > orig_metar')?.textContent || undefined;
      const destWeather = xml.querySelector('weather > dest_metar')?.textContent || undefined;
      const altnWeather = xml.querySelector('weather > altn_metar')?.textContent || undefined;

      if (!origin || !destination) {
        throw new Error('Could not find origin or destination in the flight plan.');
      }

      setData({ origin, destination, altn: altn || undefined, weather: { orig: origWeather, dest: destWeather, altn: altnWeather } });
    } catch (err: any) {
      setError(err.message || 'Simbrief fetch error');
    } finally {
      setLoading(false);
    }
  }, [userid]);

  useEffect(() => {
    fetchSimbrief();
  }, [fetchSimbrief]);

  return { data, loading, error, refresh: fetchSimbrief };
}

