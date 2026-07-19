import { MetarData } from '../types';

export function parseMetar(rawMetar: string): MetarData {
  const parts = rawMetar.split(' ').filter(p => p.trim() !== '');
  
  if (parts.length < 2) {
    return { raw: rawMetar, station: parts[0] || 'UNKNOWN', time: '' };
  }

  const station = parts[0];
  const time = parts[1].endsWith('Z') ? parts[1] : '';
  
  const data: MetarData = {
    raw: rawMetar,
    station,
    time
  };

  const clouds = [];

  for (let i = 2; i < parts.length; i++) {
    const p = parts[i];
    
    // Wind: 06005KT or VRB05KT or 27010G20KT
    if (!data.wind && /^(VRB|\d{3})\d{2,3}(G\d{2,3})?(KT|MPS|KMH)$/.test(p)) {
      const match = p.match(/^(VRB|\d{3})(\d{2,3})(G\d{2,3})?(KT|MPS|KMH)$/);
      if (match) {
        data.wind = {
          direction: match[1],
          speed: match[2],
          gusts: match[3] ? match[3].replace('G', '') : undefined,
          unit: match[4]
        };
      }
      continue;
    }

    // Visibility: 9999 or 10SM
    if (!data.visibility && (/^\d{4}$/.test(p) || /^\d{1,2}(SM|KM)$/.test(p))) {
      data.visibility = p;
      continue;
    }

    // Temp/Dew: 14/11 or M05/M08
    if (!data.temperature && /^(M?\d{2})\/(M?\d{2})?$/.test(p)) {
      const match = p.match(/^(M?\d{2})\/(M?\d{2})?$/);
      if (match) {
        data.temperature = match[1].replace('M', '-');
        data.dewpoint = match[2] ? match[2].replace('M', '-') : undefined;
      }
      continue;
    }

    // Altimeter: Q1017 or A2992
    if (!data.altimeter && /^[QA]\d{4}$/.test(p)) {
      data.altimeter = p;
      continue;
    }

    // Clouds: FEW030, SCT040, BKN050, OVC080, NCD, CAVOK, SKC, CLR
    if (/^(FEW|SCT|BKN|OVC)(\d{3})(CB|TCU)?$/.test(p)) {
      const match = p.match(/^(FEW|SCT|BKN|OVC)(\d{3})/);
      if (match) {
        clouds.push({ type: match[1], altitude: match[2] });
      }
      continue;
    }
    
    if (/^(NCD|CAVOK|SKC|CLR)$/.test(p)) {
      clouds.push({ type: p });
      if (p === 'CAVOK' && !data.visibility) {
        data.visibility = '>10km / CAVOK';
      }
      continue;
    }
  }

  if (clouds.length > 0) {
    data.clouds = clouds;
  }

  // Basic Flight Category determination
  data.flightCategory = determineFlightCategory(data);

  return data;
}

function determineFlightCategory(data: MetarData): 'VFR' | 'MVFR' | 'IFR' | 'LIFR' | 'UNKNOWN' {
  let isVFR = true;
  let isMVFR = false;
  let isIFR = false;
  let isLIFR = false;
  
  // Need logic for visibility and ceiling to properly determine
  // This is a rough estimation
  let lowestCeiling = Infinity;
  
  if (data.clouds) {
    for (const c of data.clouds) {
      if (c.type === 'BKN' || c.type === 'OVC') {
        const alt = parseInt(c.altitude || '999', 10) * 100;
        if (alt < lowestCeiling) lowestCeiling = alt;
      }
    }
  }
  
  let visMiles = Infinity;
  if (data.visibility) {
    if (data.visibility === '9999' || data.visibility === 'CAVOK') visMiles = 10;
    else if (data.visibility.endsWith('SM')) visMiles = parseInt(data.visibility.replace('SM', ''), 10);
    else visMiles = parseInt(data.visibility, 10) / 1600; // rough meters to miles
  }

  if (lowestCeiling < 500 || visMiles < 1) return 'LIFR';
  if (lowestCeiling < 1000 || visMiles < 3) return 'IFR';
  if (lowestCeiling <= 3000 || visMiles <= 5) return 'MVFR';
  
  return 'VFR';
}
