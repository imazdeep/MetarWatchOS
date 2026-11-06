import React from 'react';

/**
 * Round face. On a watch it fills the screen; on phone/desktop it is shown
 * inside a bezel as an exact proportional preview (see index.html).
 */
export function WatchFace({ children }: { children: React.ReactNode }) {
  return (
    <div className="stage">
      <div className="bezel">
        <div className="face">{children}</div>
      </div>
      <p className="frame-caption" aria-hidden="true">
        Watch preview · opens full-screen on your watch
      </p>
    </div>
  );
}
