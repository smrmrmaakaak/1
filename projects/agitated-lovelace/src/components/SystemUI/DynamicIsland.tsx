import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Disc } from 'lucide-react';
import { useOSStore } from '../../store/osStore';

export const DynamicIsland: React.FC = () => {
  const { islandState, openApp } = useOSStore();

  const isExpanded = islandState.active;

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={() => {
          if (islandState.isMedia) openApp('music');
        }}
        className={`relative flex items-center justify-center bg-black text-white cursor-pointer shadow-2xl border border-white/10 ${
          isExpanded
            ? 'h-10 px-4 rounded-full min-w-[200px] max-w-[320px] bg-slate-950/95 border-cyan-500/40 backdrop-blur-xl'
            : 'w-4 h-4 rounded-full hover:scale-110 transition-transform'
        }`}
      >
        {/* Physical Camera Lens Reflection when collapsed */}
        {!isExpanded && (
          <div className="w-2.5 h-2.5 rounded-full bg-[#0a0f1d] border border-[#1e293b] flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-cyan-950/80"></div>
          </div>
        )}

        {/* Expanded Island Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-between w-full space-x-3"
            >
              {/* Left Icon / Artwork */}
              <div className="flex items-center space-x-2">
                {islandState.isMedia ? (
                  <div className="relative w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-cyan-950/80 border border-cyan-500/50">
                    <Disc className="w-4 h-4 text-cyan-400 animate-spin" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                )}
                
                <div className="text-left leading-tight">
                  <div className="text-[11px] font-bold text-white truncate max-w-[130px]">
                    {islandState.title}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate max-w-[130px]">
                    {islandState.subtitle}
                  </div>
                </div>
              </div>

              {/* Right Audio Visualizer Wave / Icon */}
              {islandState.isMedia ? (
                <div className="flex items-center space-x-0.5">
                  <motion.span
                    animate={{ height: ['4px', '14px', '6px'] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="w-0.5 bg-cyan-400 rounded-full"
                  />
                  <motion.span
                    animate={{ height: ['10px', '4px', '16px'] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
                    className="w-0.5 bg-cyan-300 rounded-full"
                  />
                  <motion.span
                    animate={{ height: ['6px', '16px', '8px'] }}
                    transition={{ repeat: Infinity, duration: 0.7, delay: 0.2 }}
                    className="w-0.5 bg-pink-400 rounded-full"
                  />
                  <motion.span
                    animate={{ height: ['12px', '5px', '10px'] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                    className="w-0.5 bg-cyan-400 rounded-full"
                  />
                </div>
              ) : (
                <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-500/10">
                  INFO
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
