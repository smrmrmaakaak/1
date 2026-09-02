import React, { useState } from 'react';
import { Code2, Play, Check, Copy } from 'lucide-react';
import { useOSStore } from '../../store/osStore';

export const LiveWidgetCodeEditorPanel: React.FC = () => {
  const { customWidgetCode, setCustomWidgetCode, triggerDynamicIsland } = useOSStore();
  const [code, setCode] = useState(customWidgetCode);
  const [copied, setCopied] = useState(false);

  const handleApply = () => {
    setCustomWidgetCode(code);
    triggerDynamicIsland('Widget Code Compiled', 'Virtual OS Home Updated');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = [
    {
      label: 'Cyberpunk HUD',
      snippet: `<div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-xl text-cyan-400 font-mono shadow-glow-cyan">
  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2">
    <span className="text-xs font-bold tracking-widest text-cyan-300">NOVANET S24U // CORE</span>
    <span className="animate-pulse text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">LIVE</span>
  </div>
  <div className="grid grid-cols-2 gap-2 text-xs">
    <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
      <div className="text-[10px] text-slate-400">AP ENGINE</div>
      <div className="text-sm font-bold text-white">SNAPDRAGON 8G3</div>
    </div>
    <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
      <div className="text-[10px] text-slate-400">FPS / DENSITY</div>
      <div className="text-sm font-bold text-emerald-400">120Hz @ 600DPI</div>
    </div>
  </div>
</div>`
    },
    {
      label: 'Neon Clock & Stocks',
      snippet: `<div className="p-4 rounded-3xl bg-gradient-to-tr from-pink-950/40 via-purple-950/30 to-slate-950/80 border border-pink-500/30 backdrop-blur-xl text-white shadow-glow-pink">
  <div className="text-xs font-bold text-pink-400 tracking-wider">BITCOIN // S24U TICKER</div>
  <div className="text-2xl font-extrabold text-white mt-1">$98,420 <span className="text-xs text-emerald-400 font-mono">+5.2%</span></div>
  <div className="text-[10px] text-slate-400 mt-2 flex justify-between">
    <span>ETH $3,450</span>
    <span>SOL $210</span>
  </div>
</div>`
    },
    {
      label: 'Minimalist Quote & Battery',
      snippet: `<div className="p-4 rounded-2xl bg-black/90 border border-white/20 text-white font-sans">
  <div className="text-xs italic text-slate-400">"Technology is best when it brings people together."</div>
  <div className="mt-3 flex items-center justify-between text-xs font-mono border-t border-slate-800 pt-2 text-slate-300">
    <span>S24 ULTRA PURIFIED</span>
    <span className="text-emerald-400 font-bold">100% READY</span>
  </div>
</div>`
    }
  ];

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Top Header & Preset Snippets */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-cyan-400" />
            라이브 위젯 코드 에디터 (React/HTML/Tailwind)
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 font-mono text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '복사됨' : '코드 복사'}</span>
            </button>
            <button
              onClick={handleApply}
              className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 flex items-center gap-1 shadow-glow-cyan transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>가상 폰에 즉시 반영</span>
            </button>
          </div>
        </div>

        {/* Snippet Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[10px]">샘플 위젯:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setCode(p.snippet)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 hover:border-cyan-500/50 text-[11px] font-mono transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Code Editor Textarea */}
      <div className="relative rounded-2xl bg-[#05070d] border border-cyan-500/20 p-4 font-mono shadow-inner">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={14}
          className="w-full bg-transparent text-cyan-300 text-xs font-mono focus:outline-none resize-none leading-relaxed selection:bg-cyan-500 selection:text-black"
          placeholder="여기에 위젯 HTML / Tailwind CSS 코드를 입력하세요..."
          spellCheck={false}
        />
      </div>
    </div>
  );
};
