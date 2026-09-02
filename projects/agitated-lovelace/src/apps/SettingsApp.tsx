import React from 'react';
import { 
  ShieldCheck, Smartphone, Wifi, 
  Layers, Sparkles, Info 
} from 'lucide-react';
import { useOSStore } from '../store/osStore';

export const SettingsApp: React.FC = () => {
  const { telemetry, theme } = useOSStore();

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white p-4 overflow-y-auto select-none font-sans">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800">
        <div className="text-xl font-bold text-white">설정 (Settings)</div>
        <div className="text-xs text-slate-400">NovaCore Virtual OS • One UI 8.5 Enhanced</div>
      </div>

      {/* Device Profile Card */}
      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 flex items-center space-x-3">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
          <Smartphone className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">{telemetry.model}</div>
          <div className="text-xs text-emerald-400 font-medium">Knox 보안 상태: {telemetry.knoxBit}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Snapdragon 8 Gen 3 for Galaxy</div>
        </div>
      </div>

      {/* Settings Menu List */}
      <div className="mt-4 space-y-2">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">연결 (Connections)</div>
              <div className="text-[10px] text-slate-400">Wi-Fi 7, Bluetooth 5.4, 5G NR</div>
            </div>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">ON</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">디스플레이 (Display)</div>
              <div className="text-[10px] text-slate-400">QHD+ (1440x3120) • 120Hz 적응형 주사율</div>
            </div>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">120Hz</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">배경화면 및 스타일</div>
              <div className="text-[10px] text-slate-400">{theme.name} 적용 중</div>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">보안 및 개인정보 보호</div>
              <div className="text-[10px] text-slate-400">초음파 지문 센서, Knox Vault</div>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">SECURE</span>
        </div>
      </div>

      {/* About Phone */}
      <div className="mt-5 p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
        <div className="flex items-center space-x-2 text-slate-400 mb-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white">휴대전화 정보 (About S24U)</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
          <div>모델: {telemetry.model}</div>
          <div>빌드: {telemetry.buildId.slice(0, 15)}...</div>
          <div>Android: {telemetry.androidVersion}</div>
          <div>RAM: {telemetry.ram.total}</div>
        </div>
      </div>
    </div>
  );
};
