import React from 'react';
import { Moon, Sun, Scale, Check } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: Props) {
  const { isDark, toggleTheme, units, setUnits } = useSettings();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 bg-black z-50 overflow-y-auto scrollbar-none flex flex-col items-center justify-start pt-16 pb-20 px-8 text-center font-sans"
        >
          {/* Settings Title */}
          <div className="flex flex-col items-center gap-1 mb-6">
            <h2 className="text-sm font-black text-zinc-400 tracking-wider uppercase font-sans">SETTINGS</h2>
            <div className="w-8 h-1 bg-accent rounded-full mt-1"></div>
          </div>
          
          <div className="w-full flex flex-col gap-6 max-w-[240px] font-sans">
            {/* Theme Toggle Button */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 text-zinc-500 font-bold text-[10px] tracking-wider uppercase font-sans">
                {isDark ? <Moon size={10} className="text-accent" /> : <Sun size={10} className="text-accent" />}
                <span>APPEARANCE</span>
              </div>
              <button 
                onClick={toggleTheme}
                className="w-full h-12 rounded-full bg-zinc-950 border border-zinc-900 font-black text-xs text-white tracking-wider flex items-center justify-center gap-2 cursor-pointer active:bg-zinc-900 transition font-sans"
                style={{ minHeight: '48px' }}
              >
                <span>{isDark ? 'TRUE BLACK (ON)' : 'LIGHT THEME'}</span>
              </button>
            </div>

            {/* Units Toggle Section */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 text-zinc-500 font-bold text-[10px] tracking-wider uppercase font-sans">
                <Scale size={10} className="text-accent" />
                <span>MEASUREMENT UNITS</span>
              </div>
              
              <div className="flex flex-col gap-1.5 w-full font-sans">
                <button 
                  onClick={() => setUnits('metric')}
                  className={`w-full h-12 rounded-full font-black text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer border transition-all font-sans ${units === 'metric' ? 'bg-accent border-accent text-black font-extrabold' : 'bg-zinc-950 border-zinc-900 text-zinc-400'}`}
                  style={{ minHeight: '48px' }}
                >
                  {units === 'metric' && <Check size={12} className="text-black" />}
                  <span>METRIC (C, hPa)</span>
                </button>
                <button 
                  onClick={() => setUnits('imperial')}
                  className={`w-full h-12 rounded-full font-black text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer border transition-all font-sans ${units === 'imperial' ? 'bg-accent border-accent text-black font-extrabold' : 'bg-zinc-950 border-zinc-900 text-zinc-400'}`}
                  style={{ minHeight: '48px' }}
                >
                  {units === 'imperial' && <Check size={12} className="text-black" />}
                  <span>USA (F, inHg)</span>
                </button>
              </div>
            </div>
            
            {/* Done Button at the bottom of settings */}
            <div className="pt-4 border-t border-zinc-900 mt-2 font-sans">
              <button 
                onClick={onClose}
                className="w-full h-12 rounded-full bg-accent text-black font-black text-xs tracking-widest uppercase cursor-pointer flex items-center justify-center active:bg-sky-400 transition font-sans"
                style={{ minHeight: '48px' }}
              >
                <span>DONE</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
