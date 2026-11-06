import React from 'react';
import { Sheet } from './Sheet';
import { FitStyle, ThemeStyle, UnitsStyle, useSettings } from '../context/SettingsContext';

interface SegProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  hint?: string;
}

function Segmented<T extends string>({ label, value, options, onChange, hint }: SegProps<T>) {
  return (
    <section className="mt-[0.75rem] flex w-full flex-col items-center" aria-label={label}>
      <span className="text-small font-medium text-ink">{label}</span>
      <div className="seg mt-[0.3rem] w-[10.4rem]" role="group" aria-label={label}>
        {options.map(o => (
          <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
      {hint && <p className="mt-[0.25rem] text-lbl tracking-[0.04em] text-ink-3">{hint}</p>}
    </section>
  );
}

export function SettingsSheet({ onClose }: { onClose: () => void }) {
  const { units, setUnits, theme, setTheme, fit, setFit } = useSettings();

  return (
    <Sheet title="Settings" onClose={onClose} kind="done">
      <Segmented<UnitsStyle>
        label="Units"
        value={units}
        onChange={setUnits}
        options={[
          { value: 'metric', label: 'Metric' },
          { value: 'imperial', label: 'US' },
        ]}
        hint={units === 'metric' ? '°C · hPa' : '°F · inHg'}
      />
      <Segmented<ThemeStyle>
        label="Background"
        value={theme}
        onChange={setTheme}
        options={[
          { value: 'glass', label: 'Blue' },
          { value: 'oled', label: 'Black' },
        ]}
        hint={theme === 'oled' ? 'True black saves battery' : undefined}
      />
      <Segmented<FitStyle>
        label="Screen fit"
        value={fit}
        onChange={setFit}
        options={[
          { value: 'auto', label: 'Auto' },
          { value: 'watch', label: 'Full' },
          { value: 'frame', label: 'Frame' },
        ]}
        hint={fit === 'auto' ? 'Detects your watch' : fit === 'watch' ? 'Always fill the screen' : 'Watch preview'}
      />
    </Sheet>
  );
}
