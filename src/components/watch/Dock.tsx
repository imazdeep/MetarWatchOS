import React from 'react';
import { CloudSun, Plane, Search, Settings } from 'lucide-react';
import { View } from '../../hooks/useRoute';

interface Props {
  view: View;
  onSearch: () => void;
  onToggleBrief: () => void;
  onSettings: () => void;
}

/**
 * Three buttons laid out along the bottom curve of the round screen.
 * Always visible, so every feature is one tap away from any scroll position.
 */
export function Dock({ view, onSearch, onToggleBrief, onSettings }: Props) {
  const inBrief = view === 'brief';

  return (
    <nav className="dock" aria-label="Main">
      <button type="button" className="btn-round glass glass-blur dock-side dock-left" onClick={onSearch} aria-label="Search airport" title="Search airport">
        <Search className="size-[1.02rem]" strokeWidth={2.4} />
      </button>

      <button
        type="button"
        className="btn-round btn-primary dock-center"
        onClick={onToggleBrief}
        aria-label={inBrief ? 'Back to airport weather' : 'Open flight brief'}
        title={inBrief ? 'Airport weather' : 'Flight brief'}
      >
        {inBrief ? <CloudSun className="size-[1.2rem]" strokeWidth={2.3} /> : <Plane className="size-[1.15rem]" strokeWidth={2.3} />}
      </button>

      <button type="button" className="btn-round glass glass-blur dock-side dock-right" onClick={onSettings} aria-label="Settings" title="Settings">
        <Settings className="size-[1.02rem]" strokeWidth={2.4} />
      </button>
    </nav>
  );
}
