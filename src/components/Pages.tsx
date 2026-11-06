import React from 'react';
import { Plane, RefreshCw, Search, Settings } from 'lucide-react';
import { AirportInfo, MetarData } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useNow } from '../hooks/useNow';
import { formatCloud, formatZulu, parseObsTime } from '../utils/format';
import { AirportData, pickActive, windInfo } from '../utils/runways';
import { describeWeather } from './WxIcon';

interface DetailsProps {
  icao: string;
  airport: AirportInfo | null;
  data: AirportData | null;
  metar: MetarData | null;
}

/** Page 2: everything that does not fit on the instrument, as a quiet list. */
export function DetailsPage({ icao, airport, data, metar }: DetailsProps) {
  const { units } = useSettings();
  const now = useNow(30_000);
  const name = data?.name ?? (airport?.name && airport.name !== 'Unknown Airport' ? airport.name : null);
  const wind = windInfo(metar);
  const active = data ? pickActive(data.runways, wind) : null;
  const obs = metar ? parseObsTime(metar.time, now) : null;
  const age = obs ? Math.max(0, Math.round((now.getTime() - obs.getTime()) / 60000)) : null;

  const clouds = metar?.clouds?.length ? metar.clouds.map(formatCloud).join(' · ') : null;
  const ceiling = metar?.clouds?.filter(c => (c.type === 'BKN' || c.type === 'OVC') && c.altitude).map(c => parseInt(c.altitude!, 10) * 100)[0];
  const t = metar?.temperature !== undefined ? Number(metar.temperature) : null;
  const d = metar?.dewpoint !== undefined ? Number(metar.dewpoint) : null;
  const elev = data?.elevFt ?? null;

  const rows: [string, string][] = [];
  if (obs) rows.push(['Observed', `${formatZulu(obs)}Z · ${age! < 60 ? `${age} min` : `${Math.floor(age! / 60)} h ${age! % 60} min`} ago`]);
  if (wind) {
    const w = wind.calm
      ? 'Calm'
      : `${wind.vrb ? 'Variable' : `${String(wind.dir).padStart(3, '0')}°`} ${wind.speed}${wind.gust ? `G${wind.gust}` : ''} ${wind.unit}`;
    rows.push(['Wind', wind.varFrom !== null ? `${w} · ${wind.varFrom}–${wind.varTo}°` : w]);
  }
  if (active) {
    const parts = [active.ident];
    if (active.headwind !== null && active.crosswind !== null && !wind?.calm) {
      parts.push(active.headwind >= 0 ? `Head ${active.headwind}` : `Tail ${-active.headwind}`);
      parts.push(`Cross ${Math.abs(active.crosswind)}${active.crosswind ? (active.crosswind > 0 ? ' R' : ' L') : ''}`);
    }
    rows.push(['Runway', parts.join(' · ')]);
  }
  const wx = describeWeather(metar?.weather);
  if (wx) rows.push(['Weather', wx]);
  if (clouds) rows.push(['Cloud', clouds]);
  if (ceiling) rows.push(['Ceiling', `${ceiling.toLocaleString('en-US')} ft`]);
  if (t !== null && d !== null) {
    const toU = (c: number) => (units === 'imperial' ? Math.round((c * 9) / 5 + 32) : c);
    rows.push(['Dew point', `${toU(d)}° · spread ${Math.abs(toU(t) - toU(d))}°`]);
  }

  return (
    <div className="page-flow justify-start pt-[1.7rem] pb-[2.6rem]">
      <span className="lbl">{icao}</span>
      {name && <h2 className="mt-[0.2rem] max-w-[10.5rem] text-body font-medium text-ink">{name}</h2>}
      {elev !== null && <p className="mt-[0.1rem] text-lbl tracking-[0.08em] text-ink-2">ELEV {elev.toLocaleString('en-US')} FT</p>}

      {metar ? (
        <>
          <p className="mt-[0.55rem] w-[11rem] rounded-[0.7rem] bg-[var(--surface)] px-[0.6rem] py-[0.45rem] text-small leading-[1.45] tracking-[0.02em] text-ink">
            {metar.raw}
          </p>
          <dl className="mt-[0.4rem] w-[10.6rem]">
            {rows.map(([k, v]) => (
              <div key={k} className="kv">
                <dt className="lbl shrink-0">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <p className="mt-[1rem] text-small text-ink-2">No report loaded</p>
      )}
    </div>
  );
}

interface MenuProps {
  isLoading: boolean;
  onSearch: () => void;
  onBrief: () => void;
  onRefresh: () => void;
  onSettings: () => void;
}

/** Page 3: every action, as large labelled rows. */
export function MenuPage({ isLoading, onSearch, onBrief, onRefresh, onSettings }: MenuProps) {
  const icon = 'size-[0.95rem] shrink-0';
  return (
    <div className="page-flow">
      <span className="lbl">Menu</span>
      <div className="mt-[0.55rem] flex w-[9.8rem] flex-col gap-[0.32rem]">
        <button type="button" className="row-btn tap" onClick={onSearch}>
          <Search className={icon} strokeWidth={2} />
          Search airport
        </button>
        <button type="button" className="row-btn tap" onClick={onBrief}>
          <Plane className={icon} strokeWidth={2} />
          Flight brief
        </button>
        <button type="button" className="row-btn tap" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`${icon} ${isLoading ? 'animate-spin' : ''}`} strokeWidth={2} />
          {isLoading ? 'Updating…' : 'Refresh'}
        </button>
        <button type="button" className="row-btn tap" onClick={onSettings}>
          <Settings className={icon} strokeWidth={2} />
          Settings
        </button>
      </div>
      <p className="mt-[0.6rem] text-lbl tracking-[0.06em] text-ink-3">VATSIM METAR · OurAirports</p>
    </div>
  );
}
