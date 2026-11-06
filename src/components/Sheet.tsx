import React from 'react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { Screen } from './watch/Screen';

interface Props {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  /** "done" shows a check (settings), "close" an × (search, brief). */
  kind?: 'close' | 'done';
}

/** Full-face layer (Search, Settings, Brief). Back key also closes it. */
export function Sheet({ title, children, onClose, kind = 'close' }: Props) {
  return (
    <motion.div
      className="sheet"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <Screen label={title}>
        <h2 className="lbl">{title}</h2>
        {children}
      </Screen>
      <button
        type="button"
        onClick={onClose}
        className={`icon-btn tap sheet-close ${kind === 'done' ? 'solid' : ''}`}
        aria-label={kind === 'done' ? 'Done' : 'Close'}
      >
        {kind === 'done' ? <Check className="size-[1rem]" strokeWidth={2.4} /> : <X className="size-[1rem]" strokeWidth={2.2} />}
      </button>
    </motion.div>
  );
}
