import React, { useEffect, useRef } from 'react';

// Arc hugging the right edge of the face, from -36° to +36° around 3 o'clock.
const R = 46.6;
const A = (36 * Math.PI) / 180;
const X = (50 + R * Math.cos(A)).toFixed(2);
const Y1 = (50 - R * Math.sin(A)).toFixed(2);
const Y2 = (50 + R * Math.sin(A)).toFixed(2);
const ARC = `M ${X} ${Y1} A ${R} ${R} 0 0 1 ${X} ${Y2}`;

/** Curved Wear OS-style scroll position indicator on the right bezel edge. */
function ScrollIndicator({ target }: { target: React.RefObject<HTMLDivElement | null> }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const thumbRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = target.current;
    const svg = svgRef.current;
    const thumb = thumbRef.current;
    if (!el || !svg || !thumb) return;

    let raf = 0;
    let idle = 0;

    const update = () => {
      raf = 0;
      const max = el.scrollHeight - el.clientHeight;
      const scrollable = max > 2;
      svg.dataset.visible = String(scrollable);
      if (!scrollable) return;
      const len = Math.max(20, (el.clientHeight / el.scrollHeight) * 100);
      const pos = (100 - len) * Math.min(1, Math.max(0, el.scrollTop / max));
      thumb.style.strokeDasharray = `${len} 200`;
      thumb.style.strokeDashoffset = String(-pos);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
      svg.dataset.active = 'true';
      window.clearTimeout(idle);
      idle = window.setTimeout(() => (svg.dataset.active = 'false'), 1200);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    update();

    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(idle);
    };
  }, [target]);

  return (
    <svg ref={svgRef} className="scroll-ind" viewBox="0 0 100 100" aria-hidden="true" data-visible="false">
      <path d={ARC} pathLength={100} className="scroll-ind-track" />
      <path d={ARC} pathLength={100} className="scroll-ind-thumb" ref={thumbRef} />
    </svg>
  );
}

interface ScreenProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
  /** Focus the scroller on mount so the rotating bezel scrolls it. */
  autoFocus?: boolean;
}

/** A scrollable round screen with edge scrims and a curved scroll indicator. */
export function Screen({ children, className = '', label, autoFocus = true }: ScreenProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoFocus) return;
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
    ref.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  return (
    <>
      <div ref={ref} className="screen" tabIndex={-1} aria-label={label} role="region">
        <div className={`screen-inner ${className}`}>{children}</div>
      </div>
      <div className="scrim-top" aria-hidden="true" />
      <div className="scrim-bottom" aria-hidden="true" />
      <ScrollIndicator target={ref} />
    </>
  );
}
