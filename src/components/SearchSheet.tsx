import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, History, X } from 'lucide-react';
import { Sheet } from './Sheet';

interface Props {
  current: string;
  recents: string[];
  onSearch: (icao: string) => void;
  onClose: () => void;
}

export function SearchSheet({ current, recents, onSearch, onClose }: Props) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const valid = input.length >= 3;

  useEffect(() => {
    // Opens the watch keyboard / voice input straight away where allowed.
    const t = window.setTimeout(() => inputRef.current?.focus(), 220);
    return () => window.clearTimeout(t);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (valid) onSearch(input);
  };

  return (
    <Sheet
      title="Search airport"
      action={
        <button type="button" className="btn-round glass glass-blur sheet-action" onClick={onClose} aria-label="Close search">
          <X className="size-[1.15rem]" strokeWidth={2.5} />
        </button>
      }
    >
      <form onSubmit={submit} className="relative mt-[0.55rem] w-[10.8rem]">
        <input
          ref={inputRef}
          className="icao-input glass"
          type="text"
          inputMode="text"
          enterKeyHint="search"
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={4}
          placeholder="ICAO CODE"
          aria-label="ICAO airport code"
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
        />
        <button
          type="submit"
          disabled={!valid}
          className="btn-round btn-primary absolute right-[0.25rem] top-[0.25rem] size-[2rem]"
          aria-label="Show weather"
        >
          <ArrowRight className="size-[1.05rem]" strokeWidth={2.6} />
        </button>
      </form>
      <p className="mt-[0.38rem] text-micro font-bold uppercase tracking-[0.1em] text-ink-3">3–4 letters · e.g. KJFK</p>

      {recents.length > 0 && (
        <>
          <div className="label mt-[0.75rem] flex items-center gap-[0.22rem]">
            <History className="size-[0.74rem] text-accent" strokeWidth={2.5} aria-hidden="true" />
            <span>Recent</span>
          </div>
          <div className="mt-[0.38rem] flex w-[10.8rem] flex-wrap justify-center gap-[0.3rem]">
            {recents.map(code => (
              <button
                key={code}
                type="button"
                onClick={() => onSearch(code)}
                className={`pill-btn wear-item h-[2.1rem] w-[3.4rem] text-lead tracking-[0.06em] ${code === current ? 'btn-primary' : 'glass text-ink-1'}`}
                aria-current={code === current ? 'true' : undefined}
              >
                {code}
              </button>
            ))}
          </div>
        </>
      )}
    </Sheet>
  );
}
