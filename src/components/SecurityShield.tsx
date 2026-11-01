import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function SecurityShield({ children }: { children?: React.ReactNode }) {
  const { user } = useAuth();
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isShieldActive, setIsShieldActive] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Intercept PrintScreen
      if (e.key === 'PrintScreen' || e.keyCode === 44 || e.code === 'PrintScreen') {
        e.preventDefault();
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText('');
          }
        } catch {}
        triggerWarning('Screenshot blocked! Screen capture is strictly disabled app-wide.');
        return false;
      }

      // 2. Intercept Ctrl+P / Cmd+P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        triggerWarning('Printing is disabled for copyright protected content.');
        return false;
      }

      // 3. Intercept Ctrl+S / Cmd+S (Save webpage)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        triggerWarning('Saving content locally is prohibited.');
        return false;
      }

      // 4. Intercept DevTools / Screen inspect shortcuts (F12, Ctrl+Shift+I/C/J)
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'C', 'c', 'J', 'j'].includes(e.key))
      ) {
        e.preventDefault();
        triggerWarning('Developer inspection and recording tools are disabled.');
        return false;
      }

      // 5. Intercept Mac screen capture shortcuts (Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5)
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        triggerWarning('Screen recording shortcuts are disabled.');
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      // Prevent right-click context menu for image copying or inspection
      e.preventDefault();
    };

    const handleVisibilityChange = () => {
      // If student tabs away or initiates external screen capture, shield content
      if (document.visibilityState === 'hidden') {
        setIsShieldActive(true);
      } else {
        setIsShieldActive(false);
      }
    };

    const handleWindowBlur = () => {
      setIsShieldActive(true);
    };

    const handleWindowFocus = () => {
      setIsShieldActive(false);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const triggerWarning = (msg: string) => {
    setWarningMessage(msg);
    setIsShieldActive(true);
    setTimeout(() => {
      setWarningMessage(null);
      setIsShieldActive(false);
    }, 3200);
  };

  const watermarkText = `${user?.email || 'Student'} • ${user?.batch || 'Batch 1 (Dec)'} • DRM PROTECTED`;

  return (
    <>
      {/* Obfuscation shield during tab switch / recording attempt */}
      {isShieldActive && (
        <div className="absolute inset-0 z-[9999] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in pointer-events-auto">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl mb-4 border border-rose-500/40">
            <i className="fas fa-shield-alt" />
          </div>
          <h3 className="text-white text-base font-bold mb-1">DRM Recording Protection Active</h3>
          <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
            Content is shielded to protect competitive exam integrity. Switch back to the application to continue.
          </p>
          <button
            onClick={() => setIsShieldActive(false)}
            className="mt-4 px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition"
          >
            Resume Learning
          </button>
        </div>
      )}

      {/* Security alert notification banner */}
      {warningMessage && (
        <div className="absolute top-3 left-4 right-4 z-[99999] bg-rose-600 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2.5 animate-slide-down">
          <i className="fas fa-exclamation-triangle text-amber-300 text-sm" />
          <span className="flex-1">{warningMessage}</span>
          <button onClick={() => setWarningMessage(null)} className="text-white/80 hover:text-white">
            <i className="fas fa-times" />
          </button>
        </div>
      )}

      {/* Subtle dynamic DRM security watermark layer */}
      <div
        className="pointer-events-none select-none absolute inset-0 z-[50] overflow-hidden opacity-[0.045] flex flex-col justify-between p-6 rotate-[-12deg]"
        aria-hidden="true"
      >
        <div className="flex justify-between text-[11px] font-bold text-slate-900 tracking-widest whitespace-nowrap">
          <span>{watermarkText}</span>
          <span>CONFIDENTIAL</span>
        </div>
        <div className="flex justify-around text-[11px] font-bold text-slate-900 tracking-widest whitespace-nowrap">
          <span>{watermarkText}</span>
          <span>DO NOT CAPTURE</span>
        </div>
        <div className="flex justify-between text-[11px] font-bold text-slate-900 tracking-widest whitespace-nowrap">
          <span>{watermarkText}</span>
          <span>ACADEMY SECURE DRM</span>
        </div>
      </div>

      {children}
    </>
  );
}

