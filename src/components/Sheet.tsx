import React from 'react';
import { motion } from 'motion/react';
import { Screen } from './watch/Screen';

interface Props {
  title: string;
  children: React.ReactNode;
  /** Button placed in the dock-centre position (Close / Done). */
  action: React.ReactNode;
}

/** Full-face frosted-glass layer used for Search and Settings. */
export function Sheet({ title, children, action }: Props) {
  return (
    <motion.div
      className="sheet"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      initial={{ opacity: 0, scale: 1.06 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <Screen label={title}>
        <h2 className="label mt-[0.1rem] text-ink-2">{title}</h2>
        <div className="mx-auto mt-[0.22rem] h-[0.16rem] w-[1.3rem] rounded-full bg-[var(--accent)]" aria-hidden="true" />
        {children}
      </Screen>
      {action}
    </motion.div>
  );
}
