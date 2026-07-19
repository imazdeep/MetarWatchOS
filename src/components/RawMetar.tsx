import React, { useState } from 'react';
import { Terminal, ChevronDown } from 'lucide-react';
import { MetarData } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export function RawMetar({ metar }: { metar: MetarData | null }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!metar) return null;

  return (
    <div className="w-full bg-zinc-950 rounded-xl border border-zinc-900 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 px-4 flex items-center justify-between gap-2 active:bg-zinc-900 transition-colors cursor-pointer"
        style={{ minHeight: '48px' }}
      >
        <div className="flex items-center gap-2 text-accent font-black text-[11px] tracking-wider uppercase">
          <Terminal size={12} />
          <span>Raw Report</span>
        </div>
        <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1">
              <div className="font-mono text-[11px] text-accent leading-relaxed tracking-wide p-2.5 bg-black rounded-lg border border-zinc-900 break-words whitespace-pre-wrap uppercase text-center font-bold">
                {metar.raw}
              </div>
              <div className="mt-2 text-center text-[9px] text-zinc-500 font-mono font-bold uppercase">
                Issued: {metar.time}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
