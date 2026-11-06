import React, { createContext, useContext, useEffect, useState } from 'react';

export type UnitsStyle = 'metric' | 'imperial';
export type ThemeStyle = 'glass' | 'oled';
export type FitStyle = 'auto' | 'watch' | 'frame';

interface SettingsContextType {
  units: UnitsStyle;
  setUnits: (u: UnitsStyle) => void;
  theme: ThemeStyle;
  setTheme: (t: ThemeStyle) => void;
  fit: FitStyle;
  setFit: (f: FitStyle) => void;
}

declare global {
  interface Window {
    /** Recomputes the watch-face size (defined in index.html). */
    __wxFit?: () => void;
  }
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function read<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const v = localStorage.getItem(key) as T | null;
    return v && allowed.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode) — setting lasts for this visit */
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [units, setUnits] = useState<UnitsStyle>(() => read('units', ['metric', 'imperial'] as const, 'metric'));
  const [theme, setTheme] = useState<ThemeStyle>(() => read('wx-theme', ['glass', 'oled'] as const, 'glass'));
  const [fit, setFit] = useState<FitStyle>(() => read('wx-fit', ['auto', 'watch', 'frame'] as const, 'auto'));

  useEffect(() => write('units', units), [units]);

  useEffect(() => {
    write('wx-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    write('wx-fit', fit);
    window.__wxFit?.();
  }, [fit]);

  return (
    <SettingsContext.Provider value={{ units, setUnits, theme, setTheme, fit, setFit }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
