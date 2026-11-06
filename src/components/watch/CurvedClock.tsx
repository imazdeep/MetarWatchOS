import React from 'react';
import { useNow } from '../../hooks/useNow';
import { formatZulu } from '../../utils/format';

/** Live UTC (Zulu) time set along the top curve of the screen, Wear OS style. */
export function CurvedClock() {
  const now = useNow(1000);
  const t = formatZulu(now, true);

  return (
    <svg className="curved-clock" viewBox="0 0 100 100" role="timer" aria-label={`${t} UTC`}>
      <defs>
        <path id="wx-clock-arc" d="M 7.5 50 A 42.5 42.5 0 0 1 92.5 50" />
      </defs>
      <text textAnchor="middle" fontSize="4.7" fontWeight="700" letterSpacing="0.35">
        <textPath href="#wx-clock-arc" startOffset="50%">
          <tspan fill="var(--ink-1)">{t}</tspan>
          <tspan fill="var(--accent)" dx="0.5">
            Z
          </tspan>
        </textPath>
      </text>
    </svg>
  );
}
