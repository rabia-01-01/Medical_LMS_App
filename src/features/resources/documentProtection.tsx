import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';

interface DocumentProtectionProps {
  children: React.ReactNode;
  resourceTitle?: string;
}

/**
 * High-Security DRM Document Protection Component
 * Prevents students from:
 * 1. Downloading documents
 * 2. Taking screenshots (PrintScreen, Snipping tool, window blur shield)
 * 3. Right-clicking (context menu)
 * 4. Printing (Ctrl+P / Cmd+P)
 * 5. Saving (Ctrl+S / Cmd+S)
 * 6. Copying text (Ctrl+C / copy event)
 * Embeds dynamic student watermark with ID and timestamp across viewport
 */
export function DocumentProtectionWrapper({ children, resourceTitle }: DocumentProtectionProps) {
  const { user, isViewingAs, viewingAsUser } = useAuth();
  const displayUser = isViewingAs ? viewingAsUser : user;
  const isStudent = displayUser?.role === 'student';

  const [shieldActive, setShieldActive] = useState(false);
  const [screenshotWarning, setScreenshotWarning] = useState<string | null>(null);

  const studentName = displayUser?.name || 'Student';
  const studentId = displayUser?.id || 'std_anonymous';
  const timestamp = new Date().toLocaleString();

  const triggerScreenshotAlert = useCallback(() => {
    // Clear clipboard to foil screenshot
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('Screenshots and content copying are prohibited.');
      }
    } catch {
      // Ignore
    }

    setScreenshotWarning(`Screenshot or screen capture detected. Medical curriculum documents are protected by copyright. (Student ID: ${studentId})`);
    setTimeout(() => {
      setScreenshotWarning(null);
    }, 4500);
  }, [studentId]);

  useEffect(() => {
    if (!isStudent) return;

    // 1. Intercept keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        triggerScreenshotAlert();
        setShieldActive(true);
        setTimeout(() => setShieldActive(false), 2000);
        return;
      }

      // Ctrl+P / Cmd+P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotAlert();
        return;
      }

      // Ctrl+S / Cmd+S (Save Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotAlert();
        return;
      }

      // Ctrl+C / Cmd+C (Copy)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotAlert();
        return;
      }

      // F12 or Ctrl+Shift+I (DevTools)
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c'))) {
        e.preventDefault();
        return;
      }
    };

    // 2. Window blur shield (triggers when Windows Snipping Tool / external screenshot software opens)
    const handleBlur = () => {
      setShieldActive(true);
    };

    const handleFocus = () => {
      setShieldActive(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShieldActive(true);
      } else {
        setShieldActive(false);
      }
    };

    // 3. Prevent Copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerScreenshotAlert();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
    };
  }, [isStudent, triggerScreenshotAlert]);

  // Context menu handler
  const handleContextMenu = (e: React.MouseEvent) => {
    if (isStudent) {
      e.preventDefault();
      triggerScreenshotAlert();
    }
  };

  return (
    <div 
      className={`relative w-full h-full ${isStudent ? 'select-none' : ''}`}
      onContextMenu={handleContextMenu}
      style={isStudent ? { userSelect: 'none', WebkitUserSelect: 'none' } : undefined}
    >
      {/* Dynamic diagonal repeating security watermark grid for students */}
      {isStudent && (
        <div className="absolute inset-0 pointer-events-none select-none z-30 overflow-hidden flex flex-wrap items-center justify-around opacity-15">
          {Array.from({ length: 16 }).map((_, i) => (
            <div 
              key={i} 
              className="transform -rotate-25 text-slate-900 font-extrabold text-[11px] tracking-wider m-6 whitespace-nowrap text-center"
            >
              <p>SULTANAT E ITALIA MEDICA</p>
              <p className="text-[10px] text-teal-800">{studentName} • {studentId}</p>
              <p className="text-[9px] text-slate-500">{timestamp}</p>
            </div>
          ))}
        </div>
      )}

      {/* Screen blur shield overlay when window loses focus (anti-snipping tool) */}
      {isStudent && shieldActive && (
        <div className="absolute inset-0 z-40 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 text-center select-none animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center mb-3 border border-teal-500/40">
            <i className="fas fa-shield-alt text-3xl text-teal-400" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Document Protection Active</h3>
          <p className="text-xs text-slate-300 max-w-xs mb-3">
            Content is shielded while window focus is shifted or screenshot capture utilities are active.
          </p>
          <div className="bg-white/10 px-3 py-1.5 rounded-lg text-[11px] text-teal-200">
            Click here to return focus and resume reading
          </div>
        </div>
      )}

      {/* Screenshot Alert Toast */}
      {screenshotWarning && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-red-600 text-white p-3 rounded-xl shadow-2xl flex items-center gap-3 border border-red-400 animate-slide-down">
          <i className="fas fa-exclamation-triangle text-lg flex-shrink-0" />
          <div className="flex-1 text-xs">
            <p className="font-bold">Content Protection Warning</p>
            <p className="text-[11px] text-red-100 mt-0.5">{screenshotWarning}</p>
          </div>
          <button onClick={() => setScreenshotWarning(null)} className="text-white/80 hover:text-white">
            <i className="fas fa-times" />
          </button>
        </div>
      )}

      {/* Actual viewer content */}
      {children}
    </div>
  );
}
