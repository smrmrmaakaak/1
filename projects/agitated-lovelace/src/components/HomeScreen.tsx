import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, Cpu, Terminal, Music, Settings, 
  Smartphone, ShieldCheck, Zap, Sparkles, ChevronUp,
  MessageSquare, Phone, Camera, Folder
} from 'lucide-react';
import { useOSStore } from '../store/osStore';

export const HomeScreen: React.FC = () => {
  const { 
    telemetry, theme, openApp, setScreen
  } = useOSStore();

  const [time, setTime] = useState({ timeStr: '14:08', dateStr: '8월 26일 수요일' });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime({
        timeStr: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        dateStr: now.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const coreApps = [
    { id: 'studio', name: 'UI 스튜디오', icon: Palette, color: 'from-cyan-500 to-blue-600', badge: 'NEW' },
    { id: 'inspector', name: 'S24U 진단', icon: Smartphone, color: 'from-emerald-500 to-teal-600', badge: 'LIVE' },
    { id: 'terminal', name: 'ADB 셸', icon: Terminal, color: 'from-slate-700 to-slate-900', badge: 'ADB' },
    { id: 'music', name: '노바 뮤직', icon: Music, color: 'from-pink-500 to-purple-600', badge: '' },
    { id: 'settings', name: '설정', icon: Settings, color: 'from-indigo-500 to-blue-700', badge: '' },
    { id: 'kakaopay', name: '카카오페이', icon: Zap, color: 'from-amber-400 to-yellow-500', badge: 'REAL' },
    { id: 'customCode', name: '커스텀 앱', icon: Sparkles, color: 'from-fuchsia-500 to-pink-600', badge: 'CODE' },
    { id: 'allApps', name: '앱 서랍', icon: Folder, color: 'from-slate-600 to-slate-800', badge: '' },
  ];

  return (
    <div className="relative z-30 w-full h-full flex flex-col justify-between p-4 select-none overflow-hidden font-sans">
      {/* Top Section: Cyber Clock & Weather Widget */}
      <div className="pt-2 space-y-3">
        {/* Main Clock Widget */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          onClick={() => openApp('inspector')}
          className="p-4 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-lg cursor-pointer flex items-center justify-between"
        >
          <div>
            <div className="text-4xl font-extrabold tracking-tight text-white font-display">
              {time.timeStr}
            </div>
            <div className="text-xs text-slate-300 font-medium mt-0.5 flex items-center gap-1.5">
              <span>{time.dateStr}</span>
              <span>•</span>
              <span className="text-cyan-400 font-bold">26°C 서울</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-mono text-emerald-400 flex items-center justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Knox 0x0 Safe
            </div>
            <div className="text-xs font-bold text-slate-200 mt-1 font-mono">
              BAT: {telemetry.battery.level}% ({telemetry.battery.temp}°C)
            </div>
          </div>
        </motion.div>

        {/* Live Hardware Telemetry HUD Card */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* AP Specs */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-cyan-500/20 backdrop-blur-md">
            <div className="text-[10px] text-cyan-400 font-mono flex items-center justify-between">
              <span>SNAPDRAGON 8G3</span>
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xs font-bold text-white mt-1">4.0GHz NPU Boost</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-cyan-400 h-full rounded-full animate-pulse" style={{ width: '45%' }} />
            </div>
          </div>

          {/* RAM & Storage */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-pink-500/20 backdrop-blur-md">
            <div className="text-[10px] text-pink-400 font-mono flex items-center justify-between">
              <span>RAM {telemetry.ram.percent}%</span>
              <span className="text-[9px] text-slate-400">12GB LPDDR5X</span>
            </div>
            <div className="text-xs font-bold text-white mt-1">{telemetry.ram.used} / {telemetry.ram.total}</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full" style={{ width: `${telemetry.ram.percent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Center Section: App Grid (4 Columns) */}
      <div className="grid grid-cols-4 gap-y-4 gap-x-2 my-auto px-1">
        {coreApps.map((app) => {
          const IconComp = app.icon;
          return (
            <motion.button
              key={app.id}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                if (app.id === 'allApps') {
                  setScreen('appDrawer');
                } else {
                  openApp(app.id);
                }
              }}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${app.color} p-0.5 shadow-md flex items-center justify-center border border-white/20 transition-all group-hover:shadow-glow-cyan`}
                style={{ borderRadius: `${theme.borderRadius}px` }}
              >
                <div className="w-full h-full rounded-[inherit] bg-black/20 flex items-center justify-center backdrop-blur-sm">
                  <IconComp className="w-7 h-7 text-white" />
                </div>
                {app.badge && (
                  <span className="absolute -top-1.5 -right-1.5 text-[8px] font-bold font-mono px-1 py-0.2 rounded-full bg-cyan-400 text-slate-950 shadow">
                    {app.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium text-slate-200 mt-1.5 tracking-tight truncate max-w-[65px] text-center drop-shadow">
                {app.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Bottom Section: Dock & App Drawer Swipe Cue */}
      <div className="space-y-2 pb-1">
        {/* Swipe Up for App Drawer Cue */}
        <button
          onClick={() => setScreen('appDrawer')}
          className="w-full flex flex-col items-center text-slate-400 hover:text-cyan-400 transition-colors py-1 cursor-pointer"
        >
          <ChevronUp className="w-4 h-4 animate-bounce" />
          <span className="text-[9px] font-mono tracking-wider">SWIPE UP FOR ALL APPS</span>
        </button>

        {/* Floating Glass Dock */}
        <div 
          className="p-2 rounded-3xl bg-slate-900/70 backdrop-blur-2xl border border-white/15 shadow-2xl flex items-center justify-around"
          style={{ borderRadius: `${theme.borderRadius + 8}px` }}
        >
          <button 
            onClick={() => openApp('terminal')}
            className="w-12 h-12 rounded-2xl bg-emerald-600/90 text-white flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-all"
            title="통화 / 다이얼러"
          >
            <Phone className="w-6 h-6" />
          </button>
          <button 
            onClick={() => openApp('terminal')}
            className="w-12 h-12 rounded-2xl bg-blue-600/90 text-white flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-all"
            title="메시지"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
          <button 
            onClick={() => openApp('studio')}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shadow-glow-cyan hover:scale-105 active:scale-95 transition-all"
            title="UI 스튜디오"
          >
            <Palette className="w-6 h-6" />
          </button>
          <button 
            onClick={() => openApp('inspector')}
            className="w-12 h-12 rounded-2xl bg-purple-600/90 text-white flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-all"
            title="S24U 카메라"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
