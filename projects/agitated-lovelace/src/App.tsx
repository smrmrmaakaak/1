import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Palette, Code2, Package, 
  RefreshCw, Unlock, Lock, Sliders
} from 'lucide-react';
import { DeviceFrame } from './components/DeviceFrame';
import { LiveThemeEditorPanel } from './components/Studio/LiveThemeEditorPanel';
import { LiveWidgetCodeEditorPanel } from './components/Studio/LiveWidgetCodeEditorPanel';
import { SpecInspectorPanel } from './components/Studio/SpecInspectorPanel';
import { SafeDeployPipelinePanel } from './components/Studio/SafeDeployPipelinePanel';
import { useOSStore } from './store/osStore';

export const App: React.FC = () => {
  const { 
    telemetry, fetchTelemetry, fetchPackages, isAdbLoading, 
    isLocked, unlockPhone, lockPhone, toggleQuickPanel, triggerDynamicIsland 
  } = useOSStore();

  const [activeTab, setActiveTab] = useState<'theme' | 'code' | 'specs' | 'deploy'>('theme');

  useEffect(() => {
    fetchTelemetry();
    fetchPackages();
  }, [fetchTelemetry, fetchPackages]);

  const tabs = [
    { id: 'theme', label: '🎨 비주얼 테마/UI 에디터', icon: Palette },
    { id: 'code', label: '💻 실시간 위젯 코드', icon: Code2 },
    { id: 'specs', label: '⚡ 실기기 ADB 텔레메트리', icon: Smartphone },
    { id: 'deploy', label: '📦 안전 배포 (Knox 0x0)', icon: Package },
  ];

  return (
    <div className="min-h-screen w-full bg-[#08090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Main Navigation Bar */}
      <header className="h-16 px-6 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-glow-cyan">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>S24U Virtual OS Studio</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                v1.0 LIVE
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Samsung Galaxy S24 Ultra (SM-S928N) Environment Mirror
            </div>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-mono">ADB: {telemetry.model}</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-mono font-bold">Knox 0x0</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-mono">{telemetry.battery.level}% ({telemetry.battery.status})</span>
          </div>

          <button
            onClick={() => {
              fetchTelemetry();
              fetchPackages();
              triggerDynamicIsland('Telemetry Synced', 'Live S24 Ultra data refreshed');
            }}
            disabled={isAdbLoading}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 flex items-center space-x-1.5 font-mono text-xs transition-all active:scale-95"
            title="실제 폰 데이터 동기화"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAdbLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">실기기 동기화</span>
          </button>
        </div>
      </header>

      {/* Main Studio Workspace (Split View) */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane: Interactive S24 Ultra Virtual Device Canvas */}
        <div className="lg:w-[480px] xl:w-[520px] shrink-0 border-r border-slate-800/80 bg-[#05060a] flex flex-col items-center justify-center p-4 relative overflow-y-auto">
          {/* Quick Simulation Action Toolbar */}
          <div className="mb-2 flex items-center space-x-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-2xl shadow-md">
            <button
              onClick={() => (isLocked ? unlockPhone() : lockPhone())}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 transition-colors"
            >
              {isLocked ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isLocked ? '화면 켜기' : '화면 잠금'}</span>
            </button>
            <button
              onClick={toggleQuickPanel}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>퀵패널 토글</span>
            </button>
          </div>

          {/* S24 Ultra Device Frame */}
          <DeviceFrame />

          <div className="text-[11px] text-slate-500 font-mono mt-1 text-center">
            💡 마우스 클릭으로 실제 폰처럼 앱 실행, 지문 인식, 퀵패널 스와이프가 가능합니다.
          </div>
        </div>

        {/* Right Pane: Workbench Studio Tabs & Controls */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* Studio Tab Headers */}
          <div className="flex items-center px-4 pt-3 border-b border-slate-800 bg-slate-900/40 gap-2 shrink-0 overflow-x-auto">
            {tabs.map((tab) => {
              const IconC = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 px-3.5 text-xs font-bold flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-cyan-400 text-cyan-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <IconC className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel Content */}
          <div className="flex-1 p-5 overflow-y-auto">
            {activeTab === 'theme' && <LiveThemeEditorPanel />}
            {activeTab === 'code' && <LiveWidgetCodeEditorPanel />}
            {activeTab === 'specs' && <SpecInspectorPanel />}
            {activeTab === 'deploy' && <SafeDeployPipelinePanel />}
          </div>
        </div>
      </main>
    </div>
  );
};
export default App;
