import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wifi, Bluetooth, Sun, Volume2, Cpu, Zap, 
  ShieldCheck, ChevronUp, Music, Play, Pause, 
  Sparkles
} from 'lucide-react';
import { useOSStore } from '../../store/osStore';

export const QuickPanel: React.FC = () => {
  const { 
    telemetry, theme, applyThemePreset, toggleQuickPanel, 
    mediaState, toggleMediaPlayback, openApp, triggerDynamicIsland 
  } = useOSStore();

  const [brightness, setBrightness] = useState(85);
  const [volume, setVolume] = useState(70);
  const [wifiActive, setWifiActive] = useState(true);
  const [btActive, setBtActive] = useState(true);
  const [perfMode, setPerfMode] = useState(true);
  const [torch, setTorch] = useState(false);

  return (
    <motion.div
      initial={{ y: '-100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '-100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="absolute inset-0 z-50 flex flex-col p-5 bg-slate-950/90 backdrop-blur-2xl text-white select-none overflow-y-auto"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pt-4 pb-2 border-b border-white/10">
        <div>
          <div className="text-xs font-mono text-cyan-400">CONTROL CENTER // S24U</div>
          <div className="text-lg font-bold">One UI 8.5 Virtual Hub</div>
        </div>
        <button 
          onClick={toggleQuickPanel}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-slate-300"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>

      {/* Media Player Tile */}
      <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-800/90 border border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white truncate max-w-[150px]">{mediaState.title}</div>
            <div className="text-[10px] text-slate-400">{mediaState.artist}</div>
          </div>
        </div>
        <button
          onClick={toggleMediaPlayback}
          className="w-9 h-9 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold shadow-glow-cyan hover:scale-105 active:scale-95 transition-all"
        >
          {mediaState.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
        </button>
      </div>

      {/* Primary 4-Grid Quick Toggles */}
      <div className="grid grid-cols-4 gap-2.5 mt-4">
        {/* Wi-Fi */}
        <button
          onClick={() => {
            setWifiActive(!wifiActive);
            triggerDynamicIsland('Wi-Fi 7', wifiActive ? 'Disconnected' : 'Connected to 6GHz Wi-Fi');
          }}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
            wifiActive 
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-glow-cyan' 
              : 'bg-white/5 border-white/10 text-slate-400'
          }`}
        >
          <Wifi className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-semibold">Wi-Fi 7</span>
        </button>

        {/* Bluetooth */}
        <button
          onClick={() => setBtActive(!btActive)}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
            btActive 
              ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300' 
              : 'bg-white/5 border-white/10 text-slate-400'
          }`}
        >
          <Bluetooth className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-semibold">Bluetooth</span>
        </button>

        {/* Snapdragon Performance Mode */}
        <button
          onClick={() => {
            setPerfMode(!perfMode);
            triggerDynamicIsland('Snapdragon 8G3', perfMode ? 'Standard Mode' : 'Overclock 3.4GHz Active');
          }}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
            perfMode 
              ? 'bg-pink-500/20 border-pink-400 text-pink-300 shadow-glow-pink' 
              : 'bg-white/5 border-white/10 text-slate-400'
          }`}
        >
          <Cpu className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-semibold">Snapdragon</span>
        </button>

        {/* Torch */}
        <button
          onClick={() => setTorch(!torch)}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
            torch 
              ? 'bg-amber-500/20 border-amber-400 text-amber-300' 
              : 'bg-white/5 border-white/10 text-slate-400'
          }`}
        >
          <Zap className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-semibold">Torch</span>
        </button>
      </div>

      {/* Sliders (Brightness & Volume) */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {/* Brightness */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="font-mono">{brightness}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Volume */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span className="font-mono">{volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>

      {/* Fast OS Theme Preset Switcher */}
      <div className="mt-4">
        <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          QUICK OS THEME SWITCH
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => applyThemePreset('cyberpunk')}
            className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold border transition-all ${
              theme.presetId === 'cyberpunk'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            ⚡ Cyberpunk
          </button>
          <button
            onClick={() => applyThemePreset('liquid-glass')}
            className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold border transition-all ${
              theme.presetId === 'liquid-glass'
                ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            🌊 Liquid Glass
          </button>
          <button
            onClick={() => applyThemePreset('monochrome')}
            className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold border transition-all ${
              theme.presetId === 'monochrome'
                ? 'bg-white/20 border-white text-white'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            🕶️ Monochrome
          </button>
        </div>
      </div>

      {/* Real Hardware Diagnostics Badge */}
      <div className="mt-4 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="font-bold text-emerald-300">Knox Safe Status: 0x0</div>
            <div className="text-[10px] text-slate-400">SM-S928N // Battery {telemetry.battery.level}% ({telemetry.battery.temp}°C)</div>
          </div>
        </div>
        <button
          onClick={() => {
            toggleQuickPanel();
            openApp('inspector');
          }}
          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-[10px] hover:bg-emerald-500/30"
        >
          INSPECT
        </button>
      </div>

      {/* Bottom Dismiss Drag Pill */}
      <div 
        onClick={toggleQuickPanel}
        className="mt-auto pt-4 flex flex-col items-center cursor-pointer hover:opacity-80"
      >
        <div className="w-12 h-1 bg-slate-600 rounded-full mb-1"></div>
        <span className="text-[10px] text-slate-500 font-mono">SWIPE UP TO CLOSE</span>
      </div>
    </motion.div>
  );
};
