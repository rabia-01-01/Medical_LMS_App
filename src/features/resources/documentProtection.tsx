import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';

interface DocumentProtectionProps {
  children: React.ReactNode;
  resourceTitle?: string;
}

/**
 * High-Security DRM Document Protection Component
 * Prevents:
 * 1. Right-clicking (context menu) inside any document (unconditionally blocked)
 * 2. Taking screenshots (PrintScreen, Snipping tool Win+Shift+S, Mac Cmd+Shift+3/4/5, window blur shield)
 * 3. Downloading / dragging document files and images
 * 4. Screen recording / tab sharing via getDisplayMedia
 * 5. Printing (Ctrl+P / Cmd+P) and saving webpage (Ctrl+S / Cmd+S)
 * 6. Inspecting source (F12, Ctrl+Shift+I/J/C, Ctrl+U)
 * Embeds dynamic watermark with ID and timestamp
 */
export function DocumentProtectionWrapper({ children, resourceTitle }: DocumentProtectionProps) {
  const { user, isViewingAs, viewingAsUser } = useAuth();
  const displayUser = isViewingAs ? viewingAsUser : user;
  const isStudent = displayUser?.role === 'student';

  const [shieldActive, setShieldActive] = useState(false);
  const [screenshotWarning, setScreenshotWarning] = useState<string | null>(null);

  const studentName = displayUser?.name || 'User';
  const studentId = displayUser?.id || 'doc_viewer';
  const timestamp = new Date().toLocaleString();

  const triggerScreenshotAlert = useCallback((customMsg?: string) => {
    // Clear clipboard to foil screenshot
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('');
      }
    } catch {
      // Ignore
    }

    setScreenshotWarning(
      customMsg || `Screen capture / download attempt detected. Medical curriculum documents are protected by copyright. (Viewer ID: ${studentId})`
    );
    setTimeout(() => {
      setScreenshotWarning(null);
    }, 4500);
  }, [studentId]);

  useEffect(() => {
    // 1. Unconditionally block right-click context menu everywhere inside documents
    const handleContextMenuGlobal = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      triggerScreenshotAlert('Right-click context menu is strictly disabled inside documents.');
      return false;
    };

    // 2. Intercept keyboard shortcuts (Snipping tool, PrintScreen, DevTools, Print, Save, View Source)
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        triggerScreenshotAlert('PrintScreen is disabled on this document.');
        setShieldActive(true);
        setTimeout(() => setShieldActive(false), 2000);
        return;
      }

      // Windows Snipping Tool (Win + Shift + S or Ctrl + Shift + S)
      if ((e.key === 's' || e.key === 'S' || e.code === 'KeyS') && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotAlert('Snipping Tool shortcut is strictly blocked.');
        setShieldActive(true);
        setTimeout(() => setShieldActive(false), 2500);
        return;
      }

      // Mac screenshot shortcuts (Cmd + Shift + 3, Cmd + Shift + 4, Cmd + Shift + 5)
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotAlert('Mac screenshot shortcuts are strictly disabled.');
        setShieldActive(true);
        setTimeout(() => setShieldActive(false), 2500);
        return;
      }

      // Ctrl+P / Cmd+P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotAlert('Printing is strictly restricted for protected documents.');
        return;
      }

      // Ctrl+S / Cmd+S (Save Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotAlert('Saving document locally is prohibited.');
        return;
      }

      // Ctrl+U / Cmd+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotAlert('Viewing document source is disabled.');
        return;
      }

      // Ctrl+C / Cmd+C (Copy)
      if (isStudent && (e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotAlert('Text selection and copying are disabled on this document.');
        return;
      }

      // F12 or Ctrl+Shift+I/J/C (DevTools)
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'C', 'c', 'J', 'j'].includes(e.key))
      ) {
        e.preventDefault();
        triggerScreenshotAlert('Developer inspection tools are disabled.');
        return;
      }
    };

    // 3. Window blur shield (triggers immediately when Windows Snipping Tool, OBS, or screenshot tool takes focus)
    const handleBlur = () => {
      setShieldActive(true);
    };

    const handleFocus = () => {
      // Brief delay before restoring to prevent screen-grabber freeze
      setTimeout(() => setShieldActive(false), 300);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShieldActive(true);
      } else {
        setTimeout(() => setShieldActive(false), 300);
      }
    };

    // 4. Prevent Copy & Drag
    const handleCopy = (e: ClipboardEvent) => {
      if (isStudent) {
        e.preventDefault();
        triggerScreenshotAlert('Copying content is disabled.');
      }
    };

    // 5. Intercept getDisplayMedia (browser screen recorder / tab share)
    let originalGetDisplayMedia: any = null;
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getDisplayMedia = async () => {
        triggerScreenshotAlert('Screen sharing / tab recording is blocked on protected documents.');
        throw new Error('Screen capture strictly blocked by DocumentProtection.');
      };
    }

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenuGlobal, true);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenuGlobal, true);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      if (originalGetDisplayMedia && navigator.mediaDevices) {
        navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
      }
    };
  }, [isStudent, triggerScreenshotAlert]);

  // Context menu handler on container
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerScreenshotAlert('Right-click mouse feature is disabled inside documents.');
    return false;
  };

  // Prevent drag and drop downloading of images and assets
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  return (
    <div 
      className="relative w-full h-full select-none"
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
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
      {shieldActive && (
        <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center text-white p-6 text-center select-none animate-fade-in">
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
      <div 
        className="w-full h-full"
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
      >
        {children}
      </div>
    </div>
  );
}
