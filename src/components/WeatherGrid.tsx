import React from 'react';
import { Eye, Gauge, Thermometer, Wind } from 'lucide-react';
import { MetarData } from '../types';
import { useSettings } from '../context/SettingsContext';
import { formatAltimeter, formatTemp, formatVisibility, formatWind, Readout, valueSize } from '../utils/format';

interface Item extends Readout {
  key: string;
  label: string;
  Icon: typeof Gauge;
}

/** 2×2 glass readout tiles, sized to fit the widest chord of the round face. */
export function WeatherGrid({ metar }: { metar: MetarData | null }) {
  const { units } = useSettings();
  if (!metar) return null;

  const alt = formatAltimeter(metar.altimeter, units);
  const items: Item[] = [
    { key: 'alt', Icon: Gauge, ...alt },
    { key: 'temp', Icon: Thermometer, label: 'TEMP/DEW', ...formatTemp(metar, units) },
    { key: 'wind', Icon: Wind, label: 'WIND', ...formatWind(metar) },
    { key: 'vis', Icon: Eye, label: 'VIS', ...formatVisibility(metar.visibility) },
  ];

  return (
    <div className="grid w-[11rem] grid-cols-2 gap-[0.3rem]">
      {items.map(({ key, Icon, label, value, unit, note }) => (
        <div key={key} className="tile glass wear-item h-[2.6rem]">
          <div className="label flex items-center gap-[0.2rem]">
            <Icon className="size-[0.74rem] shrink-0 text-accent" strokeWidth={2.5} aria-hidden="true" />
            <span>{label}</span>
            {note && <span className="text-warn">{note}</span>}
          </div>
          <div className="flex max-w-full items-baseline justify-center gap-[0.14rem]">
            <span className="value" style={{ fontSize: valueSize(value) }}>
              {value}
            </span>
            {unit && <span className="text-micro font-bold text-accent">{unit}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Loading placeholder matching the grid footprint. */
export function WeatherGridSkeleton() {
  return (
    <div className="grid w-[11rem] grid-cols-2 gap-[0.3rem]" aria-hidden="true">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="tile skeleton h-[2.6rem] rounded-[0.95rem] border border-[var(--glass-line)]" />
      ))}
    </div>
  );
}
