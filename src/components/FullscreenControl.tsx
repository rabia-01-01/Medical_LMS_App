import React, { useState, useEffect } from 'react';

export type DisplayMode = 'mobile' | 'wide' | 'fullscreen';

interface FullscreenControlProps {
  mode: DisplayMode;
  onModeChange: (mode: DisplayMode) => void;
}

export function FullscreenControl({ mode, onModeChange }: FullscreenControlProps) {
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsNativeFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleBrowserFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.warn('Native fullscreen toggle error:', e);
    }
  };

  return (
    <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5 select-none print:hidden">
      {/* Menu dropdown */}
      {showMenu && (
        <div className="absolute right-0 top-10 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl p-2 w-48 text-white text-xs animate-slide-down">
          <p className="text-[10px] uppercase font-bold text-teal-400 px-2 py-1 tracking-wider">
            Screen & Display Facility
          </p>
          <button
            onClick={() => { onModeChange('mobile'); setShowMenu(false); }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
              mode === 'mobile' ? 'bg-teal-600 text-white font-semibold' : 'hover:bg-white/10 text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <i className="fas fa-mobile-alt text-xs" />
              <span>Mobile Phone (430px)</span>
            </span>
            {mode === 'mobile' && <i className="fas fa-check text-[10px]" />}
          </button>

          <button
            onClick={() => { onModeChange('wide'); setShowMenu(false); }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
              mode === 'wide' ? 'bg-teal-600 text-white font-semibold' : 'hover:bg-white/10 text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <i className="fas fa-laptop text-xs" />
              <span>Expanded Wide</span>
            </span>
            {mode === 'wide' && <i className="fas fa-check text-[10px]" />}
          </button>

          <button
            onClick={() => { onModeChange('fullscreen'); setShowMenu(false); }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
              mode === 'fullscreen' ? 'bg-teal-600 text-white font-semibold' : 'hover:bg-white/10 text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <i className="fas fa-desktop text-xs" />
              <span>100% Full Width</span>
            </span>
            {mode === 'fullscreen' && <i className="fas fa-check text-[10px]" />}
          </button>

          <div className="h-px bg-slate-700/60 my-1" />

          <button
            onClick={() => { toggleBrowserFullscreen(); setShowMenu(false); }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-teal-300 transition"
          >
            <span className="flex items-center gap-2">
              <i className={`fas ${isNativeFullscreen ? 'fa-compress' : 'fa-expand'} text-xs`} />
              <span>{isNativeFullscreen ? 'Exit F11 Fullscreen' : 'Native Fullscreen (F11)'}</span>
            </span>
          </button>
        </div>
      )}

      {/* Main floating control pill */}
      <div className="flex items-center bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-full shadow-lg p-0.5 text-white">
        {/* Quick layout toggle */}
        <button
          onClick={() => {
            const nextMode: DisplayMode = mode === 'mobile' ? 'wide' : mode === 'wide' ? 'fullscreen' : 'mobile';
            onModeChange(nextMode);
          }}
          className="px-2 py-1 rounded-full hover:bg-white/15 text-[11px] font-medium flex items-center gap-1.5 transition text-slate-200 hover:text-white"
          title={`Current layout: ${mode.toUpperCase()} (Click to toggle)`}
        >
          <i className={`fas ${mode === 'mobile' ? 'fa-mobile-alt' : mode === 'wide' ? 'fa-laptop' : 'fa-desktop'} text-teal-400`} />
          <span className="hidden sm:inline capitalize">{mode}</span>
        </button>

        {/* Quick Native Browser Fullscreen Button */}
        <button
          onClick={toggleBrowserFullscreen}
          className="w-7 h-7 rounded-full hover:bg-teal-500/20 text-teal-300 hover:text-teal-200 flex items-center justify-center transition"
          title={isNativeFullscreen ? 'Exit Full Screen' : 'Enter Native Full Screen'}
        >
          <i className={`fas ${isNativeFullscreen ? 'fa-compress' : 'fa-expand'} text-xs`} />
        </button>

        {/* Menu expander button */}
        <button
          onClick={() => setShowMenu(prev => !prev)}
          className={`w-6 h-7 rounded-r-full hover:bg-white/15 flex items-center justify-center transition text-slate-400 hover:text-white ${
            showMenu ? 'text-teal-400' : ''
          }`}
          title="Display and Fullscreen options"
        >
          <i className="fas fa-ellipsis-v text-[10px]" />
        </button>
      </div>
    </div>
  );
}
