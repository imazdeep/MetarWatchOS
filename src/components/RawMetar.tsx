import React from 'react';
import { Cloud, Terminal } from 'lucide-react';
import { MetarData } from '../types';
import { formatCloud } from '../utils/format';

/** Cloud layers as chips (height in feet). */
export function CloudLayers({ metar }: { metar: MetarData | null }) {
  if (!metar) return null;
  const layers = metar.clouds ?? [];

  return (
    <section className="glass wear-item w-[11rem] rounded-[0.95rem] px-[0.55rem] py-[0.5rem]" aria-label="Cloud layers">
      <div className="label mb-[0.38rem] flex items-center justify-center gap-[0.22rem]">
        <Cloud className="size-[0.74rem] text-accent" strokeWidth={2.5} aria-hidden="true" />
        <span>Clouds</span>
        {layers.some(l => l.altitude) && <span className="text-ink-3">· FT</span>}
      </div>
      <div className="flex flex-wrap justify-center gap-[0.25rem]">
        {layers.length === 0 ? (
          <span className="text-body font-bold text-ink-2">No cloud reported</span>
        ) : (
          layers.map((c, i) => (
            <span
              key={`${c.type}${c.altitude ?? ''}${i}`}
              className={`chip glass h-[1.45rem] text-label ${c.type === 'BKN' || c.type === 'OVC' ? 'text-warn' : 'text-ink-1'}`}
            >
              {formatCloud(c)}
            </span>
          ))
        )}
      </div>
    </section>
  );
}

/** Full raw report, always readable without extra taps. */
export function RawMetar({ metar }: { metar: MetarData | null }) {
  if (!metar) return null;

  return (
    <section className="glass wear-item w-[11rem] rounded-[0.95rem] px-[0.6rem] py-[0.55rem]" aria-label="Raw METAR">
      <div className="label mb-[0.32rem] flex items-center justify-center gap-[0.22rem]">
        <Terminal className="size-[0.74rem] text-accent" strokeWidth={2.5} aria-hidden="true" />
        <span>Raw METAR</span>
      </div>
      <p className="break-words text-body font-semibold uppercase tracking-[0.04em] text-ink-1 [line-height:1.38]">{metar.raw}</p>
    </section>
  );
}
