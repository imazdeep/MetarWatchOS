import React from 'react';

const LABELS: Record<string, string> = {
  VFR: 'Visual flight rules',
  MVFR: 'Marginal VFR',
  IFR: 'Instrument flight rules',
  LIFR: 'Low IFR',
};

export function FlightCategoryBadge({ category, className = '' }: { category?: string; className?: string }) {
  if (!category) return null;
  const key = category in LABELS ? category : 'UNKNOWN';

  return (
    <span className={`cat-pill cat-${key} ${className}`} title={LABELS[key]} aria-label={LABELS[key] || 'Unknown category'}>
      {key === 'UNKNOWN' ? '—' : key}
    </span>
  );
}
