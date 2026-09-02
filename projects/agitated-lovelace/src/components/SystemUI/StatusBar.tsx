import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, BatteryCharging, ShieldCheck, Bluetooth } from 'lucide-react';
import { useOSStore } from '../../store/osStore';

export const StatusBar: React.FC = () => {
  const { telemetry, theme, toggleQuickPanel } = useOSStore();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      onClick={toggleQuickPanel}
      className="relative z-40 w-full h-11 px-6 flex items-center justify-between text-xs font-semibold select-none cursor-pointer group transition-all duration-200 hover:bg-white/5"
      style={{ color: '#f1f5f9' }}
    >
      {/* Left: Current Time & S24U Badge */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-bold tracking-tight text-white">{time}</span>
        {theme.statusBarStyle === 'hud' && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono border border-cyan-500/30">
            S24U-QHD
          </span>
        )}
      </div>

      {/* Center Punch-hole Area (Visual Gap for camera/Dynamic Island) */}
      <div className="w-24 h-full flex items-center justify-center pointer-events-none">
        {/* Empty space reservation for punch-hole */}
      </div>

      {/* Right: Telemetry Indicators */}
      <div className="flex items-center space-x-2 text-slate-200">
        <span title="Knox Bit 0x0 Pure/Safe" className="flex items-center text-emerald-400 text-[10px] font-mono gap-0.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">0x0</span>
        </span>
        <Bluetooth className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-[10px] font-bold text-slate-300">5G</span>
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        
        {/* Battery Indicator with real % */}
        <div className="flex items-center space-x-1 pl-1">
          <span className="text-[11px] font-bold text-white">{telemetry.battery.level}%</span>
          {telemetry.battery.status === 'Charging' ? (
            <BatteryCharging className="w-4 h-4 text-emerald-400 animate-pulse" />
          ) : (
            <Battery className="w-4 h-4 text-slate-200" />
          )}
        </div>
      </div>
    </div>
  );
};
