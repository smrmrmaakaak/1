import React from 'react';
import { Sparkles, Sliders, Image } from 'lucide-react';
import type { ThemeConfig } from '../../store/osStore';
import { useOSStore } from '../../store/osStore';

export const LiveThemeEditorPanel: React.FC = () => {
  const { theme, updateTheme, applyThemePreset, triggerDynamicIsland } = useOSStore();

  const presets: Array<{ id: ThemeConfig['presetId']; name: string; desc: string; icon: string }> = [
    { id: 'cyberpunk', name: 'Cyberpunk Neon Matrix', desc: '네온 시안 & 핑크 HUD 홀로그램 UI', icon: '⚡' },
    { id: 'liquid-glass', name: 'Liquid Glassmorphism', desc: '초고투명 블러 & 에어로 글래스 UI', icon: '🌊' },
    { id: 'monochrome', name: 'Stealth Monochrome', desc: 'OLED 트루 블랙 & 미니멀 타이포그래피', icon: '🕶️' },
    { id: 'solar-gold', name: 'Titanium Solar Gold', desc: '티타늄 앰버 & 럭셔리 골드 텍스처', icon: '✨' },
    { id: 'neo-brutal', name: 'Neo-Brutalism Void', desc: '에메랄드 하드 엣지 & 사이버 터미널 UI', icon: '📟' },
  ];

  const sampleWallpapers = [
    { name: 'Cyber Neon City', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Liquid Glass Sphere', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Monochrome Dark', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Solar Titanium', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Dark Void Geometry', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop' },
  ];

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Preset Selector */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          OS 프리셋 테마 라이브러리
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                applyThemePreset(p.id);
                triggerDynamicIsland('Theme Preset Loaded', p.name);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                theme.presetId === p.id
                  ? 'bg-cyan-500/10 border-cyan-400 shadow-glow-cyan text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{p.icon}</span>
                <span>{p.name}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Live Customizer */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
          <Sliders className="w-4 h-4 text-pink-400" />
          비주얼 파라미터 실시간 조정 (Live Tuning)
        </div>

        {/* Accent Color Picker */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 font-semibold">포인트 컬러 (Accent Color)</span>
            <span className="font-mono text-cyan-400">{theme.accentColor}</span>
          </div>
          <div className="flex items-center gap-2">
            {['#00f3ff', '#ff0055', '#38bdf8', '#a855f7', '#10b981', '#f59e0b', '#ffffff', '#e11d48'].map((color) => (
              <button
                key={color}
                onClick={() => updateTheme({ accentColor: color })}
                style={{ backgroundColor: color }}
                className={`w-7 h-7 rounded-full border transition-all ${
                  theme.accentColor === color ? 'scale-125 border-white shadow-lg' : 'border-transparent hover:scale-110'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Border Radius Slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-300 font-semibold">모서리 굴곡 (Border Radius)</span>
            <span className="font-mono text-cyan-400">{theme.borderRadius}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="32"
            value={theme.borderRadius}
            onChange={(e) => updateTheme({ borderRadius: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Glassmorphism Blur Strength */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-300 font-semibold">글래스모피즘 블러 강도 (Blur Filter)</span>
            <span className="font-mono text-cyan-400">{theme.blurStrength}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            value={theme.blurStrength}
            onChange={(e) => updateTheme({ blurStrength: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>

      {/* Wallpaper Gallery */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-1.5">
          <Image className="w-4 h-4 text-emerald-400" />
          배경화면 갤러리 (Wallpapers)
        </div>
        <div className="grid grid-cols-5 gap-2">
          {sampleWallpapers.map((wp) => (
            <button
              key={wp.name}
              onClick={() => {
                updateTheme({ wallpaperUrl: wp.url });
                triggerDynamicIsland('Wallpaper Changed', wp.name);
              }}
              className={`h-16 rounded-xl overflow-hidden border-2 transition-all relative group ${
                theme.wallpaperUrl === wp.url ? 'border-cyan-400 scale-105 shadow-glow-cyan' : 'border-transparent hover:border-slate-600'
              }`}
            >
              <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
