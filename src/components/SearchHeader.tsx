import React, { useState } from 'react';
import { Search, Loader2, RefreshCw, Settings } from 'lucide-react';
import { SimbriefIcon } from './SimbriefIcon';
import { SettingsModal } from './SettingsModal';

interface Props {
  icao: string;
  isLoading: boolean;
  onSearch: (icao: string) => void;
  onRefresh: () => void;
  mode: 'search' | 'simbrief';
  onModeChange: (mode: 'search' | 'simbrief') => void;
}

export function SearchHeader({ icao, isLoading, onSearch, onRefresh, mode, onModeChange }: Props) {
  const [input, setInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim().length >= 3) {
      onSearch(input.trim().toUpperCase());
      onModeChange('search');
      setInput('');
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 text-center select-none font-sans mt-0.5">
      
      {/* Compact Search Input Form (44px Height target) */}
      <form onSubmit={handleSubmit} className="w-full relative max-w-[240px] font-sans">
        <input
          type="text"
          className="block w-full h-11 rounded-full border border-zinc-900 px-4 pr-11 text-center text-sm font-extrabold text-white bg-zinc-950 placeholder:text-zinc-600 focus:outline-none focus:border-accent font-sans uppercase tracking-widest"
          style={{ minHeight: '44px' }}
          placeholder="SEARCH AIRPORT"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={4}
        />
        <button 
          type="submit" 
          className="absolute right-1 top-1 w-9 h-9 rounded-full bg-accent text-black flex items-center justify-center cursor-pointer active:bg-accent/80 font-sans"
          style={{ minHeight: '36px', minWidth: '36px' }}
        >
          <Search size={15} />
        </button>
      </form>

      {/* Round Separate Buttons in One Row: ( refresh ) (brief) (Setting) */}
      <div className="flex items-center justify-center gap-3.5 w-full font-sans mt-0.5">
        {/* Refresh Weather Button */}
        <button 
          onClick={onRefresh}
          disabled={isLoading}
          className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-900 text-accent flex items-center justify-center cursor-pointer active:bg-zinc-900 transition disabled:opacity-40 font-sans"
          style={{ minWidth: '48px', minHeight: '48px' }}
          title="Refresh Weather"
        >
          {isLoading ? <Loader2 size={19} className="animate-spin text-accent" /> : <RefreshCw size={19} />}
        </button>

        {/* Toggle Simbrief Button */}
        <button 
          onClick={() => onModeChange(mode === 'simbrief' ? 'search' : 'simbrief')}
          className={`w-12 h-12 rounded-full border flex items-center justify-center cursor-pointer transition font-sans ${mode === 'simbrief' ? 'bg-accent border-accent text-black font-extrabold' : 'bg-zinc-950 border-zinc-900 text-accent active:bg-zinc-900'}`}
          style={{ minWidth: '48px', minHeight: '48px' }}
          title="Flight Briefing"
        >
          <SimbriefIcon size={19} />
        </button>

        {/* Settings Button */}
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-900 text-accent flex items-center justify-center cursor-pointer active:bg-zinc-900 transition font-sans"
          style={{ minWidth: '48px', minHeight: '48px' }}
          title="Settings"
        >
          <Settings size={19} />
        </button>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
