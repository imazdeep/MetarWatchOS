import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
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
    <Sheet title="Search airport" onClose={onClose}>
      <form onSubmit={submit} className="relative mt-[0.6rem] w-[10.6rem]">
        <input
          ref={inputRef}
          className="field"
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
          className="icon-btn solid tap absolute right-[0.25rem] top-[0.25rem] size-[1.8rem] disabled:opacity-40"
          aria-label="Show weather"
        >
          <ArrowRight className="size-[0.95rem]" strokeWidth={2.4} />
        </button>
      </form>
      <p className="mt-[0.35rem] text-lbl tracking-[0.06em] text-ink-3">e.g. EGLL · KJFK · LFPG</p>

      {recents.length > 0 && (
        <>
          <span className="lbl mt-[0.8rem]">Recent</span>
          <div className="mt-[0.4rem] flex w-[10.6rem] flex-wrap justify-center gap-[0.3rem]">
            {recents.map(code => (
              <button
                key={code}
                type="button"
                onClick={() => onSearch(code)}
                className={`pill tap w-[3.3rem] px-0 text-body tracking-[0.08em] ${code === current ? 'solid' : ''}`}
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
