import React from 'react';

export function SimbriefIcon({ className, size = 24 }: { className?: string, size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
    >
      <path d="M8 13H14 M8 17H16 M13 3H5V21H19V9 M13 3H14L19 8V9 M13 3V7C13 8 14 9 15 9H19" />
    </svg>
  );
}
