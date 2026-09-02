import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusBar } from './SystemUI/StatusBar';
import { DynamicIsland } from './SystemUI/DynamicIsland';
import { QuickPanel } from './SystemUI/QuickPanel';
import { NavigationBar } from './SystemUI/NavigationBar';
import { LockScreen } from './LockScreen';
import { HomeScreen } from './HomeScreen';
import { AppDrawer } from './AppDrawer';
import { DeviceInspectorApp } from '../apps/DeviceInspectorApp';
import { TerminalApp } from '../apps/TerminalApp';
import { OSStudioApp } from '../apps/OSStudioApp';
import { MusicPlayerApp } from '../apps/MusicPlayerApp';
import { SettingsApp } from '../apps/SettingsApp';
import { useOSStore } from '../store/osStore';

export const DeviceFrame: React.FC = () => {
  const { 
    screen, isLocked, currentApp, theme, lockPhone, unlockPhone 
  } = useOSStore();

  const renderAppContent = () => {
    switch (currentApp) {
      case 'inspector':
        return <DeviceInspectorApp />;
      case 'terminal':
        return <TerminalApp />;
      case 'studio':
        return <OSStudioApp />;
      case 'music':
        return <MusicPlayerApp />;
      case 'settings':
        return <SettingsApp />;
      default:
        return <DeviceInspectorApp />;
    }
  };

  return (
    <div className="relative flex items-center justify-center p-4">
      {/* Outer Hardware Titanium S24 Ultra Bezel Frame */}
      <div className="relative w-[380px] h-[780px] rounded-[48px] p-3.5 bg-gradient-to-tr from-[#3a3d45] via-[#1a1c22] to-[#4e535e] shadow-s24-phone border border-slate-700/60 select-none">
        {/* Antenna Lines on Frame */}
        <div className="absolute top-20 -left-[1px] w-1 h-3 bg-slate-600/60 rounded-r" />
        <div className="absolute bottom-20 -left-[1px] w-1 h-3 bg-slate-600/60 rounded-r" />
        <div className="absolute top-20 -right-[1px] w-1 h-3 bg-slate-600/60 rounded-l" />
        <div className="absolute bottom-20 -right-[1px] w-1 h-3 bg-slate-600/60 rounded-l" />

        {/* Right Side Physical Buttons */}
        {/* Volume Up */}
        <div className="absolute top-28 -right-2 w-1.5 h-12 bg-slate-600 rounded-r-md shadow-inner cursor-pointer hover:bg-slate-500" title="Volume Up" />
        {/* Volume Down */}
        <div className="absolute top-44 -right-2 w-1.5 h-12 bg-slate-600 rounded-r-md shadow-inner cursor-pointer hover:bg-slate-500" title="Volume Down" />
        {/* Power Key */}
        <button
          onClick={() => (isLocked ? unlockPhone() : lockPhone())}
          className="absolute top-60 -right-2 w-1.5 h-16 bg-cyan-600/80 rounded-r-md shadow-inner cursor-pointer hover:bg-cyan-500 active:w-1 transition-all"
          title="전원 버튼 (클릭하여 잠금/켜기)"
        />

        {/* Inner OLED Display Panel (1440x3120 Aspect Ratio Scaled) */}
        <div className="relative w-full h-full rounded-[38px] overflow-hidden bg-black flex flex-col justify-between border border-black shadow-inner">
          {/* Dynamic Wallpaper Background */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
            style={{
              backgroundImage: `url(${theme.wallpaperUrl})`,
              filter: `brightness(${isLocked ? 0.7 : 0.85}) contrast(1.1) blur(${isLocked ? 2 : 0}px)`
            }}
          />
          {/* Theme Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-b ${theme.bgGradient} opacity-75 pointer-events-none`} />

          {/* System Top Status Bar */}
          <StatusBar />

          {/* Top Dynamic Island / Punch-hole Camera */}
          <DynamicIsland />

          {/* Screen Content Layers */}
          <div className="relative z-20 flex-1 w-full overflow-hidden">
            <AnimatePresence mode="wait">
              {isLocked ? (
                <LockScreen key="lock" />
              ) : screen === 'app' && currentApp ? (
                <motion.div
                  key="app"
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.92, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                  className="w-full h-full"
                >
                  {renderAppContent()}
                </motion.div>
              ) : screen === 'appDrawer' ? (
                <AppDrawer key="drawer" />
              ) : (
                <HomeScreen key="home" />
              )}
            </AnimatePresence>

            {/* Quick Panel Overlay */}
            <AnimatePresence>
              {screen === 'quickPanel' && <QuickPanel key="quickPanel" />}
            </AnimatePresence>
          </div>

          {/* Bottom Gesture Navigation Bar */}
          <NavigationBar />
        </div>
      </div>
    </div>
  );
};
