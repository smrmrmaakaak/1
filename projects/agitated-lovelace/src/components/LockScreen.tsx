import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Camera, Zap, ShieldCheck, Lock } from 'lucide-react';
import { useOSStore } from '../store/osStore';

export const LockScreen: React.FC = () => {
  const { telemetry, unlockPhone, openApp } = useOSStore();
  const [time, setTime] = useState({ hours: '14', minutes: '08', dateStr: '8월 26일 수요일' });
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime({
        hours: now.toLocaleTimeString('ko-KR', { hour: '2-digit', hour12: false }),
        minutes: now.toLocaleTimeString('ko-KR', { minute: '2-digit' }),
        dateStr: now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFingerprint = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      unlockPhone();
    }, 450);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="relative z-30 w-full h-full flex flex-col justify-between p-6 select-none"
    >
      {/* Top Lock Indicator & Clock */}
      <div className="flex flex-col items-center pt-8">
        <div className="flex items-center space-x-1.5 text-xs text-white/70 mb-3 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10">
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-[11px] tracking-wider">SECURE S24U</span>
        </div>

        {/* Big Bold Clock */}
        <div className="flex flex-col items-center">
          <div className="text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 font-display drop-shadow-2xl">
            {time.hours}:{time.minutes}
          </div>
          <div className="text-sm font-medium text-slate-300 mt-1 flex items-center gap-2">
            <span>{time.dateStr}</span>
            <span>•</span>
            <span className="text-cyan-300">26°C 맑음</span>
          </div>
        </div>

        {/* Charging Status Badge */}
        <div className="mt-5 px-3.5 py-1.5 rounded-full bg-slate-950/70 border border-emerald-500/30 backdrop-blur-md flex items-center space-x-2 text-xs text-emerald-300">
          <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>초고속 충전 2.0 ({telemetry.battery.level}%)</span>
        </div>
      </div>

      {/* Center Notification Card Mockup */}
      <div className="w-full max-w-[300px] mx-auto p-3.5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 text-xs shadow-lg">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
          <span className="flex items-center gap-1 font-bold text-cyan-400">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            Antigravity OS Core
          </span>
          <span>방금 전</span>
        </div>
        <div className="font-bold text-white text-xs">Snapdragon 8 Gen 3 활성화됨</div>
        <div className="text-[11px] text-slate-300 mt-0.5">S24 Ultra 가상 OS 스튜디오가 대기 중입니다.</div>
      </div>

      {/* Bottom Ultrasonic Fingerprint Area & Quick Actions */}
      <div className="flex flex-col items-center pb-2">
        {/* Fingerprint Scanner Button */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Pulse Waves */}
          {isScanning && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 1 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="absolute w-14 h-14 rounded-full border-2 border-cyan-400"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 1 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className="absolute w-14 h-14 rounded-full border-2 border-pink-400"
              />
            </>
          )}

          <button
            onClick={handleFingerprint}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
              isScanning
                ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan scale-110'
                : 'bg-black/50 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 hover:scale-105 active:scale-95'
            }`}
          >
            <Fingerprint className={`w-9 h-9 ${isScanning ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <span className="text-[10px] font-mono text-slate-400 tracking-wider">클릭하여 지문 잠금 해제</span>

        {/* Bottom Corner Shortcuts */}
        <div className="w-full flex items-center justify-between px-4 mt-4">
          <button
            onClick={() => {
              unlockPhone();
              openApp('terminal');
            }}
            className="w-10 h-10 rounded-full bg-slate-900/80 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-slate-800"
            title="터미널 열기"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            onClick={() => {
              unlockPhone();
              openApp('inspector');
            }}
            className="w-10 h-10 rounded-full bg-slate-900/80 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-slate-800"
            title="카메라 / 인스펙터"
          >
            <Camera className="w-4 h-4 text-pink-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
