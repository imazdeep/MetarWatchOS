import React from 'react';
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudMoon, CloudRain, CloudSnow, CloudSun, Cloudy, Moon, Sun } from 'lucide-react';
import { MetarData } from '../types';

/** Picks a weather glyph from present weather + cloud cover (day/night aware). */
export function WxIcon({ metar, night, className = '' }: { metar: MetarData | null; night: boolean; className?: string }) {
  const wx = (metar?.weather ?? []).join(' ');
  const cover = (metar?.clouds ?? []).map(c => c.type);
  let Icon = night ? Moon : Sun;

  if (/TS/.test(wx)) Icon = CloudLightning;
  else if (/SN|SG|PL|IC|GR|GS/.test(wx)) Icon = CloudSnow;
  else if (/DZ/.test(wx)) Icon = CloudDrizzle;
  else if (/RA|SH|UP/.test(wx)) Icon = CloudRain;
  else if (/FG|BR|HZ|FU|DU|SA|VA/.test(wx)) Icon = CloudFog;
  else if (cover.includes('OVC')) Icon = Cloudy;
  else if (cover.includes('BKN')) Icon = Cloud;
  else if (cover.includes('SCT') || cover.includes('FEW')) Icon = night ? CloudMoon : CloudSun;

  return <Icon className={className} strokeWidth={1.6} aria-hidden="true" />;
}

const WX_WORDS: Record<string, string> = {
  TS: 'thunderstorm', SH: 'showers', FZ: 'freezing', BL: 'blowing', DR: 'drifting', MI: 'shallow', BC: 'patches', PR: 'partial',
  DZ: 'drizzle', RA: 'rain', SN: 'snow', SG: 'snow grains', IC: 'ice crystals', PL: 'ice pellets', GR: 'hail', GS: 'small hail',
  UP: 'precipitation', BR: 'mist', FG: 'fog', FU: 'smoke', VA: 'ash', DU: 'dust', SA: 'sand', HZ: 'haze', PO: 'dust whirls',
  SQ: 'squalls', FC: 'funnel cloud', SS: 'sandstorm', DS: 'duststorm',
};

/** "-SHRA" → "Light showers rain" style plain-English summary. */
export function describeWeather(groups: string[] | undefined): string | null {
  if (!groups?.length) return null;
  return groups
    .map(g => {
      const m = /^(\+|-|VC)?(.*)$/.exec(g)!;
      const words = (m[2].match(/.{2}/g) ?? []).map(c => WX_WORDS[c] ?? c).join(' ');
      const pre = m[1] === '-' ? 'light ' : m[1] === '+' ? 'heavy ' : m[1] === 'VC' ? 'nearby ' : '';
      return pre + words;
    })
    .join(', ')
    .replace(/^./, c => c.toUpperCase());
}
