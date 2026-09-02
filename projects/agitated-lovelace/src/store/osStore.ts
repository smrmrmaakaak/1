import { create } from 'zustand';

export interface DeviceTelemetry {
  status: 'connected' | 'disconnected' | 'simulated';
  model: string;
  product: string;
  soc: string;
  androidVersion: string;
  oneUiVersion: string;
  buildId: string;
  knoxBit: string;
  bootloader: string;
  battery: {
    level: number;
    status: string;
    temp: number;
  };
  storage: {
    total: string;
    used: string;
    percent: number;
  };
  ram: {
    total: string;
    used: string;
    percent: number;
  };
  display: {
    resolution: string;
    density: string;
    refreshRate: string;
  };
}

export interface CustomWidget {
  id: string;
  title: string;
  type: 'clock' | 'hud' | 'weather' | 'music' | 'code' | 'battery';
  codeContent?: string;
  size: '1x1' | '2x1' | '2x2' | '4x2';
  position: { x: number; y: number };
}

export interface ThemeConfig {
  name: string;
  presetId: 'cyberpunk' | 'liquid-glass' | 'monochrome' | 'solar-gold' | 'neo-brutal';
  accentColor: string;
  secondaryColor: string;
  bgGradient: string;
  wallpaperUrl: string;
  blurStrength: number;
  borderRadius: number;
  iconPack: 'neon-cyber' | 'glass-squircle' | 'minimal-mono' | 'cyber-hex';
  showDynamicIsland: boolean;
  statusBarStyle: 'clean' | 'detailed' | 'hud';
  dockBlur: boolean;
  fontFamily: string;
}

export interface OSState {
  screen: 'lock' | 'home' | 'appDrawer' | 'app' | 'quickPanel';
  previousScreen: 'lock' | 'home' | 'appDrawer' | 'app';
  currentApp: string | null;
  recentApps: string[];
  isLocked: boolean;
  
  // Dynamic Island
  islandState: {
    active: boolean;
    title: string;
    subtitle: string;
    icon: string;
    isMedia: boolean;
  };

  // Media Player State
  mediaState: {
    isPlaying: boolean;
    title: string;
    artist: string;
    cover: string;
    progress: number;
  };

  // Telemetry
  telemetry: DeviceTelemetry;
  installedPackages: string[];
  isAdbLoading: boolean;

  // Custom Themes
  theme: ThemeConfig;

  // Custom Widgets on Home
  widgets: CustomWidget[];
  customWidgetCode: string;

  // Terminal & Logcat
  terminalLogs: Array<{ id: string; command: string; output: string; time: string }>;

  // Actions
  setScreen: (screen: 'lock' | 'home' | 'appDrawer' | 'app' | 'quickPanel') => void;
  openApp: (appId: string) => void;
  closeApp: () => void;
  unlockPhone: () => void;
  lockPhone: () => void;
  toggleQuickPanel: () => void;
  updateTheme: (partial: Partial<ThemeConfig>) => void;
  applyThemePreset: (presetId: ThemeConfig['presetId']) => void;
  setCustomWidgetCode: (code: string) => void;
  toggleMediaPlayback: () => void;
  fetchTelemetry: () => Promise<void>;
  fetchPackages: () => Promise<void>;
  runAdbShell: (command: string) => Promise<string>;
  triggerDynamicIsland: (title: string, subtitle: string, icon?: string, duration?: number) => void;
}

const DEFAULT_TELEMETRY: DeviceTelemetry = {
  status: 'connected',
  model: 'SM-S928N',
  product: 'Galaxy S24 Ultra',
  soc: 'Snapdragon 8 Gen 3 for Galaxy',
  androidVersion: '16',
  oneUiVersion: '8.5 (One UI 8.5)',
  buildId: 'BP4A.251205.006.S928NKSS6DZG1',
  knoxBit: '0x0 (Safe & Pure)',
  bootloader: 'Locked (Secure)',
  battery: { level: 94, status: 'Charging', temp: 31.8 },
  storage: { total: '222G', used: '187G', percent: 85 },
  ram: { total: '10.8 GB', used: '8.0 GB', percent: 74 },
  display: { resolution: '1440 x 3120 (QHD+)', density: '600 DPI', refreshRate: '120 Hz Dynamic' },
};

const THEME_PRESETS: Record<ThemeConfig['presetId'], ThemeConfig> = {
  'cyberpunk': {
    name: 'Cyberpunk Neon Matrix',
    presetId: 'cyberpunk',
    accentColor: '#00f3ff',
    secondaryColor: '#ff0055',
    bgGradient: 'from-[#050814] via-[#090f24] to-[#120424]',
    wallpaperUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    blurStrength: 16,
    borderRadius: 16,
    iconPack: 'neon-cyber',
    showDynamicIsland: true,
    statusBarStyle: 'hud',
    dockBlur: true,
    fontFamily: 'Outfit',
  },
  'liquid-glass': {
    name: 'Liquid Glassmorphism',
    presetId: 'liquid-glass',
    accentColor: '#38bdf8',
    secondaryColor: '#818cf8',
    bgGradient: 'from-[#0f172a] via-[#1e293b] to-[#0f172a]',
    wallpaperUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    blurStrength: 24,
    borderRadius: 24,
    iconPack: 'glass-squircle',
    showDynamicIsland: true,
    statusBarStyle: 'clean',
    dockBlur: true,
    fontFamily: 'Inter',
  },
  'monochrome': {
    name: 'Stealth Monochrome',
    presetId: 'monochrome',
    accentColor: '#ffffff',
    secondaryColor: '#94a3b8',
    bgGradient: 'from-[#000000] via-[#0a0a0a] to-[#141414]',
    wallpaperUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop',
    blurStrength: 8,
    borderRadius: 8,
    iconPack: 'minimal-mono',
    showDynamicIsland: true,
    statusBarStyle: 'clean',
    dockBlur: false,
    fontFamily: 'Fira Code',
  },
  'solar-gold': {
    name: 'Titanium Solar Gold',
    presetId: 'solar-gold',
    accentColor: '#f59e0b',
    secondaryColor: '#ec4899',
    bgGradient: 'from-[#1c1917] via-[#292524] to-[#0c0a09]',
    wallpaperUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop',
    blurStrength: 18,
    borderRadius: 20,
    iconPack: 'glass-squircle',
    showDynamicIsland: true,
    statusBarStyle: 'detailed',
    dockBlur: true,
    fontFamily: 'Outfit',
  },
  'neo-brutal': {
    name: 'Neo-Brutalism Void',
    presetId: 'neo-brutal',
    accentColor: '#10b981',
    secondaryColor: '#f43f5e',
    bgGradient: 'from-[#050505] to-[#121212]',
    wallpaperUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop',
    blurStrength: 0,
    borderRadius: 4,
    iconPack: 'cyber-hex',
    showDynamicIsland: true,
    statusBarStyle: 'hud',
    dockBlur: false,
    fontFamily: 'Fira Code',
  }
};

const DEFAULT_WIDGET_CODE = `
// 🎨 S24 Ultra Live HUD Widget
<div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-xl text-cyan-400 font-mono shadow-glow-cyan">
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
</div>
`.trim();

export const useOSStore = create<OSState>((set, get) => ({
  screen: 'home',
  previousScreen: 'home',
  currentApp: null,
  recentApps: ['inspector', 'studio', 'terminal'],
  isLocked: false,
  
  islandState: {
    active: false,
    title: '',
    subtitle: '',
    icon: '',
    isMedia: false
  },

  mediaState: {
    isPlaying: false,
    title: 'Cyberpunk Synth Resonance',
    artist: 'Antigravity Core Audio',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop',
    progress: 35
  },

  telemetry: DEFAULT_TELEMETRY,
  installedPackages: [
    'kr.or.hrdkorea.qnet.mqnet',
    'com.kakaopay.app',
    'com.hardwork.aifacerater',
    'com.bible.korean',
    'com.samsung.android.calendar',
    'com.gs25.expiry'
  ],
  isAdbLoading: false,

  theme: THEME_PRESETS['cyberpunk'],
  customWidgetCode: DEFAULT_WIDGET_CODE,

  widgets: [
    { id: 'w1', title: 'Cyber Clock', type: 'clock', size: '4x2', position: { x: 0, y: 0 } },
    { id: 'w2', title: 'S24U Telemetry HUD', type: 'hud', size: '4x2', position: { x: 0, y: 1 } },
  ],

  terminalLogs: [
    { id: '1', command: 'adb shell getprop ro.product.model', output: 'SM-S928N (Galaxy S24 Ultra)', time: '14:06:22' },
    { id: '2', command: 'adb shell getprop ro.boot.warranty_bit', output: '0 (Knox 0x0 Pure/Safe)', time: '14:06:23' },
    { id: '3', command: 'adb shell wm size', output: 'Physical size: 1440x3120', time: '14:06:24' }
  ],

  setScreen: (screen) => set((state) => ({ previousScreen: state.screen === 'quickPanel' ? state.previousScreen : state.screen, screen })),

  openApp: (appId) => set((state) => {
    const updatedRecents = [appId, ...state.recentApps.filter(id => id !== appId)].slice(0, 8);
    return {
      currentApp: appId,
      screen: 'app',
      recentApps: updatedRecents
    };
  }),

  closeApp: () => set(() => ({
    currentApp: null,
    screen: 'home'
  })),

  unlockPhone: () => set({ isLocked: false, screen: 'home' }),
  lockPhone: () => set({ isLocked: true, screen: 'lock', currentApp: null }),

  toggleQuickPanel: () => set((state) => {
    if (state.screen === 'quickPanel') {
      return { screen: state.previousScreen || 'home' };
    } else {
      return { previousScreen: state.screen, screen: 'quickPanel' };
    }
  }),

  updateTheme: (partial) => set((state) => ({
    theme: { ...state.theme, ...partial }
  })),

  applyThemePreset: (presetId) => set({
    theme: THEME_PRESETS[presetId]
  }),

  setCustomWidgetCode: (code) => set({ customWidgetCode: code }),

  toggleMediaPlayback: () => set((state) => {
    const nextPlaying = !state.mediaState.isPlaying;
    return {
      mediaState: { ...state.mediaState, isPlaying: nextPlaying },
      islandState: nextPlaying ? {
        active: true,
        title: state.mediaState.title,
        subtitle: state.mediaState.artist,
        icon: 'music',
        isMedia: true
      } : { ...state.islandState, active: false }
    };
  }),

  triggerDynamicIsland: (title, subtitle, icon = 'bell', duration = 3500) => {
    set({
      islandState: {
        active: true,
        title,
        subtitle,
        icon,
        isMedia: false
      }
    });
    if (duration > 0) {
      setTimeout(() => {
        const current = get().islandState;
        if (!current.isMedia) {
          set({ islandState: { ...current, active: false } });
        }
      }, duration);
    }
  },

  fetchTelemetry: async () => {
    set({ isAdbLoading: true });
    try {
      const res = await fetch('http://127.0.0.1:8765/api/device/specs');
      if (res.ok) {
        const data = await res.json();
        set({ telemetry: data, isAdbLoading: false });
      } else {
        set({ isAdbLoading: false });
      }
    } catch {
      console.warn('ADB bridge unavailable, using cached telemetry');
      set({ isAdbLoading: false });
    }
  },

  fetchPackages: async () => {
    try {
      const res = await fetch('http://127.0.0.1:8765/api/device/packages');
      if (res.ok) {
        const data = await res.json();
        if (data.packages && data.packages.length > 0) {
          set({ installedPackages: data.packages });
        }
      }
    } catch {
      console.warn('ADB package query failed');
    }
  },

  runAdbShell: async (command: string) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    try {
      const res = await fetch('http://127.0.0.1:8765/api/device/shell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      const data = await res.json();
      const out = data.output || data.error || 'Done.';
      set((state) => ({
        terminalLogs: [
          ...state.terminalLogs,
          { id: Date.now().toString(), command: `adb shell ${command}`, output: out, time: timeStr }
        ]
      }));
      return out;
    } catch (e: any) {
      const errorMsg = `Error: ${e.message}`;
      set((state) => ({
        terminalLogs: [
          ...state.terminalLogs,
          { id: Date.now().toString(), command: `adb shell ${command}`, output: errorMsg, time: timeStr }
        ]
      }));
      return errorMsg;
    }
  }
}));
