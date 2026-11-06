import React, { useMemo } from 'react';
import { AirportInfo, MetarData } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useNow } from '../hooks/useNow';
import { formatAltimeter, formatVisibility, formatZulu, parseObsTime } from '../utils/format';
import { AirportData, ActiveRunway, DrawnRunway, layoutRunways, pickActive, sunElevation, windInfo, WindInfo } from '../utils/runways';
import { WxIcon } from './WxIcon';

/* SVG works in a 150×150 box: 10 units = 1rem of the 15rem face. */
const C = 75;
const BOX = { x: 56.5, y: 30, w: 37, h: 84 };

const polar = (r: number, bearing: number): [number, number] => {
  const t = (bearing * Math.PI) / 180;
  return [C + r * Math.sin(t), C - r * Math.cos(t)];
};
const fmt = (n: number) => n.toFixed(2);

function Ring({ up, wind }: { up: number; wind: WindInfo | null }) {
  const ticks = [];
  for (let d = 0; d < 360; d += 10) {
    // Leave the bottom-centre clear for the swipe handle.
    if (Math.abs((((d - up + 180) % 360) + 360) % 360 - 360) < 6 || Math.abs((((d - up + 180) % 360) + 360) % 360) < 6) continue;
    const major = d % 30 === 0;
    const [x1, y1] = polar(major ? 69.2 : 71, d - up);
    const [x2, y2] = polar(73.6, d - up);
    ticks.push(<line key={d} x1={fmt(x1)} y1={fmt(y1)} x2={fmt(x2)} y2={fmt(y2)} stroke="var(--tick)" strokeWidth={major ? 0.75 : 0.45} />);
  }

  const labels = [];
  for (let d = 0; d < 360; d += 30) {
    const [x, y] = polar(63, d - up);
    const card = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' }[d as 0 | 90 | 180 | 270];
    labels.push(
      <text
        key={d}
        x={fmt(x)}
        y={fmt(y)}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={card ? 5.6 : 4.5}
        fontWeight={card ? 600 : 400}
        fill={card === 'N' ? 'var(--amber)' : card ? 'var(--ink)' : 'var(--ink-2)'}
      >
        {card ?? String(d).padStart(3, '0')}
      </text>,
    );
  }

  let bug = null;
  let arc = null;
  if (wind && wind.dir !== null && !wind.calm) {
    const b = wind.dir - up;
    const [tx, ty] = polar(66.6, b);
    const [lx, ly] = polar(73.6, b - 2.9);
    const [rx, ry] = polar(73.6, b + 2.9);
    bug = <polygon points={`${fmt(tx)},${fmt(ty)} ${fmt(lx)},${fmt(ly)} ${fmt(rx)},${fmt(ry)}`} fill="var(--amber)" />;
  }
  if (wind && wind.varFrom !== null && wind.varTo !== null) {
    const span = (wind.varTo - wind.varFrom + 360) % 360;
    const [x1, y1] = polar(71.4, wind.varFrom - up);
    const [x2, y2] = polar(71.4, wind.varTo - up);
    arc = (
      <path
        d={`M ${fmt(x1)} ${fmt(y1)} A 71.4 71.4 0 ${span > 180 ? 1 : 0} 1 ${fmt(x2)} ${fmt(y2)}`}
        fill="none"
        stroke="var(--amber)"
        strokeOpacity={0.55}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
    );
  }

  return (
    <g>
      {ticks}
      {arc}
      {labels}
      {bug}
    </g>
  );
}

function Runways({ drawn }: { drawn: DrawnRunway[] }) {
  // Inactive runways first so the active pair sits on top.
  const sorted = [...drawn].sort((a, b) => Number(a.active) - Number(b.active));
  return (
    <g>
      {sorted.map(d => {
        const L = d.length;
        const W = d.width;
        const fs = Math.min(4.2, W * 0.5);
        return (
          <g key={`${d.a}${d.b}`} transform={`translate(${fmt(d.cx)} ${fmt(d.cy)}) rotate(${fmt(d.angle)})`}>
            <rect
              x={-W / 2}
              y={-L / 2}
              width={W}
              height={L}
              rx={0.9}
              fill={d.active ? 'var(--rwy-fill)' : 'var(--rwy-dim)'}
              stroke={d.active ? 'var(--rwy-line)' : 'none'}
              strokeWidth={0.45}
            />
            {d.active && L > 26 && W >= 6 && (
              <>
                <line x1={0} y1={fmt(-L / 2 + 8.5)} x2={0} y2={fmt(L / 2 - 8.5)} stroke="rgba(255,255,255,0.5)" strokeWidth={0.55} strokeDasharray="2.8 2.8" />
                {/* Threshold numbers read from the approach: `a` at its end, `b` turned 180° at the far end. */}
                <text x={0} y={fmt(L / 2 - 3.6)} textAnchor="middle" dominantBaseline="central" fontSize={fs} fontWeight={600} fill="var(--ink)">
                  {d.a}
                </text>
                <text
                  x={0}
                  y={fmt(-L / 2 + 3.6)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={fs}
                  fontWeight={600}
                  fill="var(--ink)"
                  transform={`rotate(180 0 ${fmt(-L / 2 + 3.6)})`}
                >
                  {d.b}
                </text>
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}

function CentreBadge({ wind, active, hasRunways }: { wind: WindInfo | null; active: ActiveRunway | null; hasRunways: boolean }) {
  if (!wind) return null;
  const pill = (lines: string[]) => {
    const w = Math.max(...lines.map(l => l.length)) * 2.35 + 5;
    const h = lines.length * 4.6 + 3;
    return (
      <g>
        <rect x={C - w / 2} y={C - h / 2} width={w} height={h} rx={1.6} fill="var(--badge)" stroke="rgba(180,220,255,0.35)" strokeWidth={0.4} />
        {lines.map((l, i) => (
          <text
            key={l}
            x={C}
            y={C - h / 2 + 1.5 + 2.3 + i * 4.6}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={3.6}
            fontWeight={600}
            letterSpacing={0.3}
            fill="var(--badge-ink)"
          >
            {l}
          </text>
        ))}
      </g>
    );
  };

  if (wind.calm) return pill(['CALM']);
  if (wind.vrb) {
    return (
      <g>
        <circle cx={C} cy={C} r={11.5} fill="none" stroke="rgba(180,220,255,0.55)" strokeWidth={0.45} strokeDasharray="0.9 1.5" />
        {pill(['VRB'])}
      </g>
    );
  }
  if (!hasRunways) {
    // No runway data: wind arrow through the centre, pointing downwind,
    // kept inside the centre column so it never crosses the readouts.
    const half = Math.min(26, 13 / Math.max(Math.abs(Math.sin((wind.dir! * Math.PI) / 180)), 0.01));
    const [x1, y1] = polar(half, wind.dir!);
    const [x2, y2] = polar(-half, wind.dir!);
    const [hx1, hy1] = polar(-(half - 5.5), wind.dir! - 12);
    const [hx2, hy2] = polar(-(half - 5.5), wind.dir! + 12);
    return (
      <g stroke="var(--amber)" strokeWidth={1.3} strokeLinecap="round" fill="none">
        <line x1={fmt(x1)} y1={fmt(y1)} x2={fmt(x2)} y2={fmt(y2)} />
        <polyline points={`${fmt(hx1)},${fmt(hy1)} ${fmt(x2)},${fmt(y2)} ${fmt(hx2)},${fmt(hy2)}`} />
      </g>
    );
  }
  if (active && active.headwind !== null && active.crosswind !== null) {
    const hw = active.headwind >= 0 ? `HW ${active.headwind}` : `TW ${-active.headwind}`;
    const xw = active.crosswind === 0 ? 'XW 0' : `XW ${Math.abs(active.crosswind)}${active.crosswind > 0 ? 'R' : 'L'}`;
    return pill([hw, xw]);
  }
  return null;
}

interface Props {
  icao: string;
  airport: AirportInfo | null;
  data: AirportData | null;
  metar: MetarData | null;
  isLoading: boolean;
  error: string | null;
  failedIcao?: string;
  onSearch: () => void;
  onRetry: () => void;
  onMore: () => void;
}

export function Instrument({ icao, data, metar, isLoading, error, failedIcao, onSearch, onRetry, onMore }: Props) {
  const { units } = useSettings();
  const now = useNow(15_000);

  const wind = windInfo(metar);
  const runways = data?.runways ?? [];
  const active = useMemo(() => pickActive(runways, wind), [runways, wind?.dir, wind?.speed, wind?.vrb]);
  const up = active?.heading ?? 0;
  const drawn = useMemo(() => layoutRunways(runways, up, BOX), [runways, up]);

  const alt = formatAltimeter(metar?.altimeter, units);
  const vis = formatVisibility(metar?.visibility);
  const temp = metar?.temperature !== undefined ? Number(metar.temperature) : null;
  const conv = (c: number) => (units === 'imperial' ? Math.round((c * 9) / 5 + 32) : Math.round(c));
  const tempTxt = temp === null ? '—' : units === 'metric' && temp >= 0 && temp < 10 ? `0${temp}` : String(conv(temp));
  const night = data ? sunElevation(data.lat, data.lon, now) < -0.83 : false;

  const obs = metar ? parseObsTime(metar.time, now) : null;
  const age = obs ? Math.max(0, Math.floor((now.getTime() - obs.getTime()) / 60000)) : null;
  const ageTxt = age === null ? '' : age < 60 ? `${age}M` : `${Math.floor(age / 60)}H${String(age % 60).padStart(2, '0')}`;

  const pending = isLoading && !metar;
  const dash = <span className="shimmer">—</span>;

  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 150 150" className="absolute inset-0 h-full w-full" aria-hidden="true" fontFamily="inherit">
        <Ring up={up} wind={error ? null : wind} />
        {!error && <Runways drawn={drawn} />}
        {!error && <CentreBadge wind={wind} active={active} hasRunways={drawn.length > 0} />}
      </svg>

      {/* Station */}
      <button type="button" onClick={onSearch} className="tap absolute left-1/2 top-[1.8rem] -translate-x-1/2 text-body font-medium tracking-[0.14em] text-ink" aria-label={`Station ${icao}. Change airport`}>
        {icao.toUpperCase()}
      </button>

      {error ? (
        <div className="absolute inset-x-[2.2rem] top-[4.6rem] flex flex-col items-center gap-[0.4rem] text-center">
          <span className="lbl">No data</span>
          <p className="text-small text-ink-2">{error}</p>
          <div className="mt-[0.35rem] flex gap-[0.35rem]">
            <button type="button" onClick={onRetry} className="pill tap">
              Retry
            </button>
            <button type="button" onClick={onSearch} className="pill solid tap">
              Search
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Left: pressure + wind */}
          <div className="absolute left-[2.15rem] top-[4.95rem] flex w-[3.6rem] flex-col items-center text-center">
            <span className="lbl">{alt.label}</span>
            <span className="num mt-[0.12rem] text-val">{pending ? dash : alt.value}</span>
            <span className="lbl mt-[0.55rem]">Wind</span>
            {pending || !wind ? (
              <span className="num mt-[0.12rem] text-val">{dash}</span>
            ) : wind.calm ? (
              <span className="num mt-[0.12rem] text-val">CALM</span>
            ) : (
              <>
                <span className="num mt-[0.12rem] text-val">{wind.vrb ? 'VRB' : `${String(wind.dir).padStart(3, '0')}°`}</span>
                <span className="num text-val">
                  {String(wind.speed).padStart(2, '0')}
                  {wind.gust && <span className="ml-[0.12rem] text-small text-amber">G{wind.gust}</span>}
                  {wind.unit !== 'KT' && <span className="ml-[0.1rem] text-lbl text-ink-2">{wind.unit}</span>}
                </span>
              </>
            )}
          </div>

          {/* Right: sky, temperature, visibility, category */}
          <div className="absolute left-[9.25rem] top-[5.05rem] flex w-[3.6rem] flex-col items-center text-center">
            <WxIcon metar={metar} night={night} className={`size-[1.2rem] text-ink ${pending ? 'shimmer' : ''}`} />
            <span className="num mt-[0.2rem] text-big">
              {pending ? dash : tempTxt}
              {!pending && temp !== null && <span>°</span>}
            </span>
            <span className="mt-[0.4rem] flex items-baseline gap-[0.18rem] whitespace-nowrap">
              <span className="lbl">Vis</span>
              <span className="text-small font-medium">{pending ? '—' : `${vis.value}${vis.unit ? vis.unit.toUpperCase() : ''}`}</span>
            </span>
            {metar?.flightCategory && <span className={`cat cat-${metar.flightCategory} mt-[0.38rem]`}>{metar.flightCategory}</span>}
          </div>

          {/* Bottom status: current Zulu time + observation age */}
          <div className="absolute inset-x-0 top-[11.75rem] text-center text-lbl font-medium tracking-[0.08em] text-ink-2">
            {formatZulu(now)}Z{ageTxt && <span className={age! > 60 ? 'text-amber' : ''}> · OBS {ageTxt}</span>}
            {isLoading && metar && <span className="shimmer"> · ↻</span>}
          </div>
        </>
      )}

      <button type="button" className="handle tap nudge" onClick={onMore} aria-label="More details and menu">
        <span />
      </button>
    </div>
  );
}
