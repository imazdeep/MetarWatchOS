import React from 'react';

export function AlternateIcon({ className, size = 24 }: { className?: string, size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      width={size}
      height={size}
      className={className}
    >
      {/* Top-right arrow */}
      <path
        d="M312 0V40H443L299 185L327 213L471 68V200H512V0H312Z"
        fill="currentColor"
      />

      {/* Bottom-right arrow */}
      <path
        d="M0 236V276H247L443 472H312V512H512V312H472V443L264 236H0Z"
        fill="currentColor"
      />
    </svg>
  );
}
