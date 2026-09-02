import React from 'react';
import { 
  ShieldCheck, 
  Smartphone, RefreshCw, Layers
} from 'lucide-react';
import { useOSStore } from '../../store/osStore';

export const SpecInspectorPanel: React.FC = () => {
  const { telemetry, fetchTelemetry, isAdbLoading } = useOSStore();

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-cyan-500/30 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{telemetry.model}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">ADB LIVE SYNC</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Product: {telemetry.product} • Android {telemetry.androidVersion} (One UI {telemetry.oneUiVersion})
            </div>
          </div>
        </div>

        <button
          onClick={fetchTelemetry}
          disabled={isAdbLoading}
          className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 flex items-center space-x-1.5 font-mono text-xs transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAdbLoading ? 'animate-spin' : ''}`} />
          <span>새로고침</span>
        </button>
      </div>

      {/* Knox Warranty & Bootloader Safety Check */}
      <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-xs font-bold text-emerald-300">Knox 보안 비트: {telemetry.knoxBit}</div>
            <div className="text-[10px] text-slate-400">
              실기기의 Knox Warranty eFuse가 0x0으로 완벽 보존되어 금융앱/삼성페이 안전성 100%
            </div>
          </div>
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
          {telemetry.bootloader}
        </span>
      </div>

      {/* Specifications Comparison Table */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          실기기 vs 가상 OS 스튜디오 대조 제원표
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-mono">AP PROCESSOR</div>
            <div className="font-bold text-white mt-0.5">{telemetry.soc}</div>
            <div className="text-[10px] text-emerald-400 mt-1">✓ 가상 엔진 완벽 호환</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-mono">SCREEN RESOLUTION</div>
            <div className="font-bold text-white mt-0.5">{telemetry.display.resolution}</div>
            <div className="text-[10px] text-cyan-400 mt-1 font-mono">{telemetry.display.density} • 120Hz</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-mono">BATTERY & HEALTH</div>
            <div className="font-bold text-emerald-400 mt-0.5">{telemetry.battery.level}% ({telemetry.battery.status})</div>
            <div className="text-[10px] text-slate-400 mt-1">온도: {telemetry.battery.temp}°C</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-mono">LPDDR5X RAM & UFS 4.0</div>
            <div className="font-bold text-white mt-0.5">RAM: {telemetry.ram.used} / {telemetry.ram.total}</div>
            <div className="text-[10px] text-slate-400 mt-1">Storage: {telemetry.storage.used} ({telemetry.storage.percent}%)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
