import React from 'react';

export function FlightCategoryBadge({ category }: { category?: string }) {
  if (!category) return null;

  const styleMap: Record<string, string> = {
    VFR: "bg-emerald-950/60 text-emerald-400 border-emerald-500/70",
    MVFR: "bg-sky-950/60 text-sky-400 border-sky-400/70",
    IFR: "bg-red-950/60 text-red-400 border-red-500/70",
    LIFR: "bg-purple-950/60 text-purple-400 border-purple-400/70",
    UNKNOWN: "bg-zinc-900/60 text-zinc-400 border-zinc-700/70"
  };

  const badgeStyle = styleMap[category] || styleMap.UNKNOWN;

  return (
    <div className={`px-2.5 py-0.5 rounded-md border text-[10px] font-black tracking-widest uppercase ${badgeStyle} inline-flex items-center justify-center`} style={{ height: '22px' }}>
      {category}
    </div>
  );
}
