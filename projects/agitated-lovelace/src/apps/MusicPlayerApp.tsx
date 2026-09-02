import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Disc } from 'lucide-react';
import { useOSStore } from '../store/osStore';

export const MusicPlayerApp: React.FC = () => {
  const { mediaState, toggleMediaPlayback } = useOSStore();

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between border-b border-white/10 pb-3">
        <div className="text-[10px] font-mono text-cyan-400">AUDIO CORE // 32-BIT HI-RES</div>
        <div className="text-xs font-bold text-slate-300">Nova Player</div>
        <Disc className={`w-4 h-4 text-cyan-400 ${mediaState.isPlaying ? 'animate-spin' : ''}`} />
      </div>

      {/* Album Vinyl / Artwork */}
      <div className="relative my-auto flex flex-col items-center">
        <motion.div
          animate={mediaState.isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
          className="relative w-48 h-48 rounded-full border-4 border-cyan-500/40 shadow-glow-cyan overflow-hidden flex items-center justify-center bg-slate-950 p-2"
        >
          <img
            src={mediaState.cover}
            alt="Album Cover"
            className="w-full h-full object-cover rounded-full opacity-80"
          />
          <div className="absolute w-12 h-12 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
          </div>
        </motion.div>

        {/* Track Info */}
        <div className="text-center mt-6">
          <div className="text-base font-extrabold text-white">{mediaState.title}</div>
          <div className="text-xs text-cyan-400 mt-1">{mediaState.artist}</div>
        </div>

        {/* Audio Spectrum Visualizer */}
        <div className="flex items-center space-x-1 mt-4 h-8">
          {[40, 70, 90, 60, 30, 80, 100, 50, 85, 45, 95, 35].map((h, i) => (
            <motion.div
              key={i}
              animate={mediaState.isPlaying ? { height: [`${h * 0.2}px`, `${h * 0.3}px`, `${h * 0.15}px`] } : { height: '4px' }}
              transition={{ repeat: Infinity, duration: 0.5 + (i % 3) * 0.2, ease: 'easeInOut' }}
              className="w-1 bg-gradient-to-t from-cyan-500 to-pink-500 rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="w-full space-y-4">
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${mediaState.progress}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>01:14</span>
            <span>03:45</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center space-x-6">
          <button className="text-slate-400 hover:text-white transition-colors">
            <SkipBack className="w-6 h-6" />
          </button>
          <button
            onClick={toggleMediaPlayback}
            className="w-14 h-14 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-glow-cyan hover:scale-105 active:scale-95 transition-all"
          >
            {mediaState.isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-slate-950 ml-1" />}
          </button>
          <button className="text-slate-400 hover:text-white transition-colors">
            <SkipForward className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
