import React, { useEffect } from 'react';
import { 
  Cpu, HardDrive, BatteryCharging, 
  Smartphone, RefreshCw, Layers, CheckCircle2, Terminal
} from 'lucide-react';
import { useOSStore } from '../store/osStore';

export const DeviceInspectorApp: React.FC = () => {
  const { telemetry, fetchTelemetry, isAdbLoading, openApp } = useOSStore();

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white p-4 overflow-y-auto select-none font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="text-[10px] font-mono text-cyan-400">HARDWARE SPECS // ADB BRIDGE</div>
          <div className="text-base font-bold text-white">Galaxy S24 Ultra Inspector</div>
        </div>
        <button
          onClick={fetchTelemetry}
          disabled={isAdbLoading}
          className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 active:scale-95 transition-all"
          title="새로고침"
        >
          <RefreshCw className={`w-4 h-4 ${isAdbLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Model & Knox Status Hero */}
      <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 shadow-glow-cyan">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white">{telemetry.model} ({telemetry.product})</div>
              <div className="text-[11px] text-cyan-400 font-mono">Android {telemetry.androidVersion} • One UI {telemetry.oneUiVersion}</div>
            </div>
          </div>
        </div>

        {/* Knox Safety Badge */}
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-semibold">Knox Warranty Bit: {telemetry.knoxBit}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
            {telemetry.bootloader}
          </span>
        </div>
      </div>

      {/* Hardware Telemetry Grid */}
      <div className="grid grid-cols-2 gap-2.5 mt-3">
        {/* SoC Processor */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="text-[10px] font-mono">AP CHIPSET</span>
            <Cpu className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-xs font-bold text-white leading-snug">{telemetry.soc}</div>
          <div className="text-[10px] text-slate-400 mt-1">4nm Octa-core NPU</div>
        </div>

        {/* Display Resolution & DPI */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="text-[10px] font-mono">DISPLAY PANEL</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xs font-bold text-white leading-snug">{telemetry.display.resolution}</div>
          <div className="text-[10px] text-cyan-400 mt-1 font-mono">{telemetry.display.density} • 120Hz</div>
        </div>

        {/* Battery & Health */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="text-[10px] font-mono">BATTERY</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-emerald-400">{telemetry.battery.level}% ({telemetry.battery.status})</div>
          <div className="text-[10px] text-slate-400 mt-1">Temp: {telemetry.battery.temp}°C • 5000mAh</div>
        </div>

        {/* Storage */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="text-[10px] font-mono">STORAGE (UFS 4.0)</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xs font-bold text-white">{telemetry.storage.used} / {telemetry.storage.total} ({telemetry.storage.percent}%)</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: `${telemetry.storage.percent}%` }} />
          </div>
        </div>
      </div>

      {/* RAM Status */}
      <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-[10px] font-mono text-slate-400">LPDDR5X RAM USAGE</span>
          <span className="text-xs font-bold text-cyan-300">{telemetry.ram.used} / {telemetry.ram.total} ({telemetry.ram.percent}%)</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full" style={{ width: `${telemetry.ram.percent}%` }} />
        </div>
      </div>

      {/* Action to Terminal */}
      <button
        onClick={() => openApp('terminal')}
        className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs flex items-center justify-center space-x-2 border border-slate-700 transition-colors"
      >
        <Terminal className="w-4 h-4" />
        <span>ADB 셸 터미널에서 세부 명령 실행하기</span>
      </button>
    </div>
  );
};
