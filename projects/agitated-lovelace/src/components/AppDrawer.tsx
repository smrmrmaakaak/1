import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Palette, Smartphone, Terminal, Music, 
  Settings, Sparkles, ChevronDown, Package, ExternalLink
} from 'lucide-react';
import { useOSStore } from '../store/osStore';

export const AppDrawer: React.FC = () => {
  const { 
    installedPackages, openApp, setScreen, 
    triggerDynamicIsland 
  } = useOSStore();

  const [search, setSearch] = useState('');

  const virtualApps = [
    { id: 'studio', name: 'UI & Theme Studio', category: 'System', icon: Palette, color: 'bg-cyan-500' },
    { id: 'inspector', name: 'S24U Hardware Inspector', category: 'Diagnostics', icon: Smartphone, color: 'bg-emerald-500' },
    { id: 'terminal', name: 'ADB Interactive Shell', category: 'Developer', icon: Terminal, color: 'bg-slate-700' },
    { id: 'music', name: 'Nova Hi-Res Music Player', category: 'Media', icon: Music, color: 'bg-pink-500' },
    { id: 'settings', name: 'One UI 8.5 Settings', category: 'System', icon: Settings, color: 'bg-blue-600' },
  ];

  const filteredVirtual = virtualApps.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
  const filteredReal = installedPackages.filter(pkg => pkg.toLowerCase().includes(search.toLowerCase()));

  const handleLaunchRealApp = async (pkg: string) => {
    triggerDynamicIsland('App Launching', `Launching ${pkg} on S24U`);
    try {
      await fetch('http://127.0.0.1:8765/api/device/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: pkg })
      });
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="absolute inset-0 z-40 flex flex-col p-4 bg-slate-950/95 backdrop-blur-2xl text-white select-none overflow-y-auto"
    >
      {/* Header & Back Button */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <div className="text-[10px] font-mono text-cyan-400">APPLICATIONS DRAWER</div>
          <div className="text-base font-bold text-white">모든 앱 (All Apps)</div>
        </div>
        <button
          onClick={() => setScreen('home')}
          className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="mt-3 relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="앱 이름 또는 패키지 검색..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
        />
      </div>

      {/* Virtual OS Core Apps Section */}
      <div className="mt-4">
        <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          가상 OS 내장 앱 (NovaCore Virtual)
        </div>
        <div className="grid grid-cols-4 gap-3">
          {filteredVirtual.map((app) => {
            const IconC = app.icon;
            return (
              <button
                key={app.id}
                onClick={() => openApp(app.id)}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className={`w-13 h-13 rounded-2xl ${app.color} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform p-3`}>
                  <IconC className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] text-slate-200 mt-1.5 text-center truncate max-w-[65px]">
                  {app.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real Phone Installed Packages Section */}
      <div className="mt-6">
        <div className="text-[11px] font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-emerald-400" />
          실제 갤럭시 S24 Ultra 설치 앱 ({filteredReal.length}개)
        </div>
        <div className="space-y-1.5">
          {filteredReal.map((pkg) => (
            <div
              key={pkg}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-mono text-xs">
                  {pkg.split('.').pop()?.slice(0, 2).toUpperCase() || 'AP'}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white truncate max-w-[170px]">
                    {pkg.split('.').pop()}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono truncate max-w-[170px]">
                    {pkg}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleLaunchRealApp(pkg)}
                className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-mono flex items-center gap-1"
                title="실제 폰에서 앱 실행"
              >
                <span>RUN</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
