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

  const weather: string[] = [];

  for (let i = 2; i < parts.length; i++) {
    const p = parts[i];

    // Trend / remarks describe the future or extra info, not current conditions.
    if (/^(RMK|TEMPO|BECMG|NOSIG)$/.test(p)) break;

    // Variable wind direction: 200V280
    if (data.wind && /^\d{3}V\d{3}$/.test(p)) {
      data.wind.varFrom = parseInt(p.slice(0, 3), 10);
      data.wind.varTo = parseInt(p.slice(4), 10);
      continue;
    }

    // Present weather: -RA, +TSRA, VCSH, BR, FZFG ...
    if (/^(\+|-|VC)?(MI|PR|BC|DR|BL|SH|TS|FZ)?(DZ|RA|SN|SG|IC|PL|GR|GS|UP|BR|FG|FU|VA|DU|SA|HZ|PY|PO|SQ|FC|SS|DS){0,3}$/.test(p) && /[A-Z]{2}/.test(p) && !/^(VC|MI|PR|BC|DR|BL|FZ)$/.test(p)) {
      weather.push(p);
      continue;
    }
    
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

    // Visibility: 9999, 10SM, P6SM, 1/2SM, M1/4SM, "1 1/2SM", 5KM
    if (!data.visibility && /^\d$/.test(p) && /^\d\/\d{1,2}SM$/.test(parts[i + 1] || '')) {
      data.visibility = `${p} ${parts[i + 1]}`;
      i++;
      continue;
    }
    if (!data.visibility && (/^\d{4}$/.test(p) || /^P?\d{1,2}(SM|KM)$/.test(p) || /^M?\d\/\d{1,2}SM$/.test(p))) {
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
        data.visibility = 'CAVOK';
      }
      continue;
    }
  }

  if (clouds.length > 0) {
    data.clouds = clouds;
  }
  if (weather.length > 0) {
    data.weather = weather;
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
    else if (data.visibility.endsWith('SM')) visMiles = statuteMiles(data.visibility);
    else if (data.visibility.endsWith('KM')) visMiles = parseInt(data.visibility, 10) / 1.609;
    else visMiles = parseInt(data.visibility, 10) / 1600; // rough meters to miles
    if (!Number.isFinite(visMiles)) visMiles = Infinity;
  }

  if (lowestCeiling < 500 || visMiles < 1) return 'LIFR';
  if (lowestCeiling < 1000 || visMiles < 3) return 'IFR';
  if (lowestCeiling <= 3000 || visMiles <= 5) return 'MVFR';
  
  return 'VFR';
}

/** "10SM" → 10, "P6SM" → 7, "1/2SM" → 0.5, "M1/4SM" → 0.2, "1 1/2SM" → 1.5 */
function statuteMiles(vis: string): number {
  const s = vis.replace('SM', '').trim();
  if (s.startsWith('P')) return parseFloat(s.slice(1)) + 1;
  if (s.startsWith('M')) return parseFrac(s.slice(1)) * 0.8;
  return s.split(' ').reduce((sum, part) => sum + parseFrac(part), 0);
}

function parseFrac(s: string): number {
  const [n, d] = s.split('/');
  return d ? parseInt(n, 10) / parseInt(d, 10) : parseFloat(n);
}
