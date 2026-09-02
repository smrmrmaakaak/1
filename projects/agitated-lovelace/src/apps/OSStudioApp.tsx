import React from 'react';
import type { ThemeConfig } from '../store/osStore';
import { useOSStore } from '../store/osStore';

export const OSStudioApp: React.FC = () => {
  const { theme, updateTheme, applyThemePreset, triggerDynamicIsland } = useOSStore();

  const presets: Array<{ id: ThemeConfig['presetId']; name: string; desc: string; color: string }> = [
    { id: 'cyberpunk', name: 'Cyberpunk Neon Matrix', desc: '네온 시안 & 핑크 HUD 인터페이스', color: 'bg-cyan-500' },
    { id: 'liquid-glass', name: 'Liquid Glassmorphism', desc: '초고투명 블러 & 라운드 글래스', color: 'bg-sky-400' },
    { id: 'monochrome', name: 'Stealth Monochrome', desc: 'OLED 블랙 & 미니멀 타이포그래피', color: 'bg-white' },
    { id: 'solar-gold', name: 'Titanium Solar Gold', desc: '럭셔리 골드 & 티타늄 앰비언트', color: 'bg-amber-500' },
    { id: 'neo-brutal', name: 'Neo-Brutalism Void', desc: '에메랄드 볼드 라인 & 하드 엣지', color: 'bg-emerald-500' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white p-4 overflow-y-auto select-none font-sans">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800">
        <div className="text-[10px] font-mono text-cyan-400">UI / THEME ENGINE // LIVE TUNER</div>
        <div className="text-base font-bold text-white">NovaCore OS Theme Studio</div>
      </div>

      {/* Preset Cards */}
      <div className="mt-3">
        <div className="text-xs font-bold text-slate-400 mb-2">프리셋 테마 선택</div>
        <div className="space-y-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                applyThemePreset(p.id);
                triggerDynamicIsland('Theme Applied', p.name);
              }}
              className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                theme.presetId === p.id
                  ? 'bg-slate-900 border-cyan-400 shadow-glow-cyan'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${p.color}`} />
                <div>
                  <div className="text-xs font-bold text-white">{p.name}</div>
                  <div className="text-[10px] text-slate-400">{p.desc}</div>
                </div>
              </div>
              {theme.presetId === p.id && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  ACTIVE
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Fine Tuning */}
      <div className="mt-5 space-y-4">
        <div className="text-xs font-bold text-slate-400">세부 비주얼 조정</div>

        {/* Accent Color */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-medium">포인트 컬러 (Accent Color)</span>
            <span className="font-mono text-xs text-cyan-400">{theme.accentColor}</span>
          </div>
          <div className="flex items-center space-x-2">
            {['#00f3ff', '#ff0055', '#38bdf8', '#a855f7', '#10b981', '#f59e0b', '#ffffff'].map((c) => (
              <button
                key={c}
                onClick={() => updateTheme({ accentColor: c })}
                style={{ backgroundColor: c }}
                className={`w-6 h-6 rounded-full border transition-transform ${
                  theme.accentColor === c ? 'scale-125 border-white shadow-md' : 'border-transparent hover:scale-110'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Border Radius */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-medium">아이콘/카드 모서리 라운딩</span>
            <span className="font-mono text-xs text-cyan-400">{theme.borderRadius}px</span>
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

        {/* Blur Strength */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-medium">글래스모피즘 블러 강도</span>
            <span className="font-mono text-xs text-cyan-400">{theme.blurStrength}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="32"
            value={theme.blurStrength}
            onChange={(e) => updateTheme({ blurStrength: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
