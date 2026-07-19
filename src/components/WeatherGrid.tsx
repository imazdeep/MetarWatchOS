import React from 'react';
import { Wind, Eye, Thermometer, Gauge } from 'lucide-react';
import { MetarData } from '../types';
import { useSettings } from '../context/SettingsContext';

export function WeatherGrid({ metar }: { metar: MetarData | null }) {
  const { units } = useSettings();
  if (!metar) return null;

  let tempVal = metar.temperature ? Number(metar.temperature) : null;
  let tempDisplay = 'N/A';
  let tempUnit = '°C';
  
  if (tempVal !== null) {
     if (units === 'imperial') {
        tempDisplay = Math.round((tempVal * 9/5) + 32).toString();
        tempUnit = '°F';
     } else {
        tempDisplay = tempVal.toString();
        tempUnit = '°C';
     }
  }

  let altVal = metar.altimeter;
  let altDisplay = 'N/A';
  let altUnit = 'hPa';
  
  if (altVal) {
     if (altVal.startsWith('Q')) {
          const hpa = parseInt(altVal.substring(1), 10);
          if (units === 'imperial') {
             altDisplay = (hpa * 0.02953).toFixed(2);
             altUnit = 'inHg';
          } else {
             altDisplay = hpa.toString();
             altUnit = 'hPa';
          }
     } else if (altVal.startsWith('A')) {
          const inhg = parseInt(altVal.substring(1), 10) / 100;
          if (units === 'imperial') {
             altDisplay = inhg.toFixed(2);
             altUnit = 'inHg';
          } else {
             altDisplay = Math.round(inhg * 33.8639).toString();
             altUnit = 'hPa';
          }
     }
  }

  const items = [
    {
      title: "ALT",
      icon: <Gauge size={11} className="text-accent" />,
      value: altDisplay,
      unit: altUnit,
    },
    {
      title: "TEMP",
      icon: <Thermometer size={11} className="text-accent" />,
      value: tempDisplay,
      unit: tempUnit,
    },
    {
      title: "WIND",
      icon: <Wind size={11} className="text-accent" />,
      value: metar.wind ? `${metar.wind.direction}/${metar.wind.speed}` : 'N/A',
      unit: metar.wind?.unit || 'KT',
    },
    {
      title: "VIS",
      icon: <Eye size={11} className="text-accent" />,
      value: metar.visibility ? metar.visibility : 'N/A',
      unit: '',
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5 w-full max-w-[340px] px-3 mx-auto font-sans">
      {items.map((item, i) => (
        <div 
          key={i} 
          className="bg-zinc-950/40 border border-zinc-900/85 rounded-2xl p-3 flex flex-col items-center justify-center text-center font-sans hover:border-accent/40 transition-colors"
          style={{ minHeight: '66px' }}
        >
          <div className="flex items-center gap-1 text-zinc-500 font-bold text-[10px] tracking-widest uppercase mb-1 font-sans">
            {item.icon}
            <span>{item.title}</span>
          </div>
          <div className="flex items-baseline justify-center gap-1 min-w-0 w-full font-sans">
            <span className="text-xl font-black text-white tracking-tight truncate max-w-full font-sans">
              {item.value}
            </span>
            {item.unit && (
              <span className="text-[10px] font-bold text-accent shrink-0 select-none font-sans">
                {item.unit}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
