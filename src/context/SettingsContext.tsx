import React, { createContext, useContext, useEffect, useState } from 'react';

export type UnitsStyle = 'metric' | 'imperial';

interface SettingsContextType {
  units: UnitsStyle;
  setUnits: (u: UnitsStyle) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [units, setUnits] = useState<UnitsStyle>(() => {
    return (localStorage.getItem('units') as UnitsStyle) || 'metric';
  });

  const [isDark, setIsDark] = useState(() => {
    if (localStorage.getItem('theme') === 'dark') return true;
    if (localStorage.getItem('theme') === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('units', units);
  }, [units]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <SettingsContext.Provider value={{ units, setUnits, isDark, toggleTheme }}>
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
