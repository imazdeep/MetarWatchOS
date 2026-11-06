import React from 'react';
import { Check, Maximize, Palette, Ruler } from 'lucide-react';
import { Sheet } from './Sheet';
import { FitStyle, ThemeStyle, UnitsStyle, useSettings } from '../context/SettingsContext';

interface SegProps<T extends string> {
  label: string;
  Icon: typeof Ruler;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  hint?: string;
}

function Segmented<T extends string>({ label, Icon, value, options, onChange, hint }: SegProps<T>) {
  return (
    <section className="wear-item mt-[0.7rem] flex w-full flex-col items-center" aria-label={label}>
      <div className="label mb-[0.32rem] flex items-center gap-[0.22rem]">
        <Icon className="size-[0.74rem] text-accent" strokeWidth={2.5} aria-hidden="true" />
        <span>{label}</span>
      </div>
      <div className="seg glass w-[10.6rem]" role="group" aria-label={label}>
        {options.map(o => (
          <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
      {hint && <p className="mt-[0.28rem] text-micro font-bold tracking-[0.1em] text-ink-3">{hint}</p>}
    </section>
  );
}

export function SettingsSheet({ onClose }: { onClose: () => void }) {
  const { units, setUnits, theme, setTheme, fit, setFit } = useSettings();

  return (
    <Sheet
      title="Settings"
      action={
        <button type="button" className="btn-round btn-primary sheet-action" onClick={onClose} aria-label="Done">
          <Check className="size-[1.2rem]" strokeWidth={2.8} />
        </button>
      }
    >
      <Segmented<UnitsStyle>
        label="Units"
        Icon={Ruler}
        value={units}
        onChange={setUnits}
        options={[
          { value: 'metric', label: 'Metric' },
          { value: 'imperial', label: 'US' },
        ]}
        hint={units === 'metric' ? '°C · hPa' : '°F · inHg'}
      />
      <Segmented<ThemeStyle>
        label="Theme"
        Icon={Palette}
        value={theme}
        onChange={setTheme}
        options={[
          { value: 'glass', label: 'Glass' },
          { value: 'oled', label: 'OLED' },
        ]}
        hint={theme === 'glass' ? 'BLUE GLASS' : 'TRUE BLACK · SAVES BATTERY'}
      />
      <Segmented<FitStyle>
        label="Screen fit"
        Icon={Maximize}
        value={fit}
        onChange={setFit}
        options={[
          { value: 'auto', label: 'Auto' },
          { value: 'watch', label: 'Full' },
          { value: 'frame', label: 'Frame' },
        ]}
        hint={fit === 'auto' ? 'DETECTS YOUR WATCH' : fit === 'watch' ? 'FILL THE SCREEN' : 'WATCH PREVIEW'}
      />
    </Sheet>
  );
}
