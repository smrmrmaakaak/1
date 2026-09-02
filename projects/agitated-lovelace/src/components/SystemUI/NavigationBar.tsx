import React from 'react';
import { useOSStore } from '../../store/osStore';

export const NavigationBar: React.FC = () => {
  const { screen, setScreen, closeApp } = useOSStore();

  const handleHome = () => {
    closeApp();
    setScreen('home');
  };

  const handleBack = () => {
    if (screen === 'app') {
      closeApp();
    } else if (screen === 'appDrawer') {
      setScreen('home');
    }
  };

  return (
    <div className="relative z-40 w-full h-7 flex items-center justify-center select-none pointer-events-auto">
      {/* Interactive Gesture Pill */}
      <button
        onClick={handleHome}
        onContextMenu={(e) => {
          e.preventDefault();
          handleBack();
        }}
        title="Click for Home, Right click for Back, Swipe up"
        className="w-32 h-1.5 bg-white/40 hover:bg-white/70 active:bg-cyan-400 active:w-36 rounded-full transition-all duration-150 shadow-sm"
      />
    </div>
  );
};
