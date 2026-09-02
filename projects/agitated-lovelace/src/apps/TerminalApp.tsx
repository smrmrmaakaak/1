import React, { useState } from 'react';
import { Terminal as TermIcon, Play } from 'lucide-react';
import { useOSStore } from '../store/osStore';

export const TerminalApp: React.FC = () => {
  const { terminalLogs, runAdbShell } = useOSStore();
  const [cmdInput, setCmdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRun = async (cmdToRun?: string) => {
    const target = cmdToRun || cmdInput;
    if (!target.trim()) return;
    setIsLoading(true);
    await runAdbShell(target);
    setCmdInput('');
    setIsLoading(false);
  };

  const quickCommands = [
    { label: 'Model Spec', cmd: 'getprop ro.product.model' },
    { label: 'Knox Bit', cmd: 'getprop ro.boot.warranty_bit' },
    { label: 'Battery Dump', cmd: 'dumpsys battery' },
    { label: 'Disk Space', cmd: 'df -h /data' },
    { label: 'Screen Resolution', cmd: 'wm size' },
    { label: 'Installed Apps', cmd: 'pm list packages -3' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#05070d] text-emerald-400 p-4 font-mono select-text">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20 text-xs">
        <div className="flex items-center space-x-2">
          <TermIcon className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white">S24U_ADB_SHELL // root@e3q</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
          ONLINE
        </span>
      </div>

      {/* Quick Command Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none">
        {quickCommands.map((qc) => (
          <button
            key={qc.label}
            onClick={() => handleRun(qc.cmd)}
            className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded bg-slate-900 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition-all"
          >
            {qc.label}
          </button>
        ))}
      </div>

      {/* Terminal Output Log Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs select-text">
        <div className="text-slate-500 text-[11px]">
          [Antigravity Virtual OS ADB Session v1.0]<br />
          Connected to Galaxy S24 Ultra (SM-S928N). Type any shell command below.
        </div>

        {terminalLogs.map((log) => (
          <div key={log.id} className="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-xs">
            <div className="flex items-center justify-between text-cyan-400 text-[11px] mb-1 font-bold">
              <span>$ {log.command}</span>
              <span className="text-slate-500 text-[10px]">{log.time}</span>
            </div>
            <pre className="text-slate-300 whitespace-pre-wrap font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto">
              {log.output}
            </pre>
          </div>
        ))}
      </div>

      {/* Command Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRun();
        }}
        className="mt-2 flex items-center space-x-2 pt-2 border-t border-emerald-500/20"
      >
        <span className="text-cyan-400 font-bold text-sm">$</span>
        <input
          type="text"
          value={cmdInput}
          onChange={(e) => setCmdInput(e.target.value)}
          placeholder="e.g. getprop ro.build.version.release"
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
        />
        <button
          type="submit"
          disabled={isLoading || !cmdInput.trim()}
          className="p-2 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-40 transition-colors"
        >
          <Play className="w-4 h-4 fill-slate-950" />
        </button>
      </form>
    </div>
  );
};
