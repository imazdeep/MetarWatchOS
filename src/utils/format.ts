import { MetarData } from '../types';
import { UnitsStyle } from '../context/SettingsContext';

export interface Readout {
  value: string;
  unit?: string;
  /** Short highlighted note shown next to the label (e.g. gusts). */
  note?: string;
}

export function formatAltimeter(altimeter: string | undefined, units: UnitsStyle): Readout & { label: string } {
  const label = units === 'imperial' ? 'ALT' : 'QNH';
  if (!altimeter) return { label, value: '—' };

  let hpa: number | null = null;
  let inhg: number | null = null;
  if (altimeter.startsWith('Q')) hpa = parseInt(altimeter.slice(1), 10);
  if (altimeter.startsWith('A')) inhg = parseInt(altimeter.slice(1), 10) / 100;

  if (units === 'imperial') {
    const v = inhg ?? (hpa !== null ? hpa * 0.02953 : null);
    return { label, value: v !== null && Number.isFinite(v) ? v.toFixed(2) : '—', unit: 'inHg' };
  }
  const v = hpa ?? (inhg !== null ? Math.round(inhg * 33.8639) : null);
  return { label, value: v !== null && Number.isFinite(v) ? String(v) : '—', unit: 'hPa' };
}

export function formatTemp(metar: MetarData, units: UnitsStyle): Readout {
  const conv = (s?: string) => {
    if (s === undefined || s === '') return null;
    const c = Number(s);
    if (!Number.isFinite(c)) return null;
    return units === 'imperial' ? Math.round((c * 9) / 5 + 32) : Math.round(c);
  };
  const t = conv(metar.temperature);
  const d = conv(metar.dewpoint);
  const unit = units === 'imperial' ? '°F' : '°C';
  if (t === null) return { value: '—' };
  return { value: d === null ? String(t) : `${t}/${d}`, unit };
}

export function formatWind(metar: MetarData): Readout {
  const w = metar.wind;
  if (!w) return { value: '—' };
  const speed = parseInt(w.speed, 10);
  const note = w.gusts ? `G${parseInt(w.gusts, 10)}` : undefined;
  if (speed === 0 && !w.gusts) return { value: 'CALM' };
  return { value: `${w.direction}/${String(speed).padStart(2, '0')}`, unit: w.unit, note };
}

export function formatVisibility(vis: string | undefined): Readout {
  if (!vis) return { value: '—' };
  if (vis === 'CAVOK') return { value: 'CAVOK' };
  if (/^\d{4}$/.test(vis)) {
    const m = parseInt(vis, 10);
    if (m >= 9999) return { value: '10+', unit: 'km' };
    if (m >= 5000) return { value: String(Math.round(m / 1000)), unit: 'km' };
    return { value: String(m), unit: 'm' };
  }
  const sm = /^(P)?(.+)SM$/.exec(vis);
  if (sm) {
    const v = sm[2].startsWith('M') ? `<${sm[2].slice(1)}` : sm[2];
    return { value: `${v}${sm[1] ? '+' : ''}`, unit: 'SM' };
  }
  const km = /^(\d+)KM$/.exec(vis);
  if (km) return { value: km[1], unit: 'km' };
  return { value: vis };
}

/** Value font size shrinks with string length so it never truncates. */
export function valueSize(value: string): string {
  const n = value.length;
  if (n <= 4) return 'calc(1.32rem * var(--fz))';
  if (n === 5) return 'calc(1.2rem * var(--fz))';
  if (n === 6) return 'calc(1.1rem * var(--fz))';
  return 'calc(0.98rem * var(--fz))';
}

/** METAR "061420Z" → Date (handles month roll-over). */
export function parseObsTime(time: string, now: Date = new Date()): Date | null {
  const m = /^(\d{2})(\d{2})(\d{2})Z$/.exec(time);
  if (!m) return null;
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), +m[1], +m[2], +m[3]));
  if (d.getTime() - now.getTime() > 12 * 3600e3) d.setUTCMonth(d.getUTCMonth() - 1);
  return d;
}

export function formatZulu(d: Date, seconds = false): string {
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  return seconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
}

export function formatAge(minutes: number): string {
  if (minutes < 1) return 'NOW';
  if (minutes < 60) return `${Math.floor(minutes)}M AGO`;
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  if (h >= 48) return `${Math.floor(h / 24)}D AGO`;
  return h >= 6 ? `${h}H AGO` : `${h}H ${m}M AGO`;
}

export function formatCloud(c: { type: string; altitude?: string }): string {
  if (!c.altitude) return c.type;
  const ft = parseInt(c.altitude, 10) * 100;
  return `${c.type} ${ft.toLocaleString('en-US')}`;
}
