'use client';

import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { RotateCcw, CheckCircle2, X } from 'lucide-react';

interface ToastOptions {
  id?: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
  durationMs?: number;
  onUndo?: () => void | Promise<void>;
  undoLabel?: string;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastUndoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const [progress, setProgress] = useState<number>(100);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setToast(null);
    setProgress(100);
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    const duration = options.durationMs || 5000;
    setToast(options);
    setProgress(100);

    const intervalStep = 50;
    const totalSteps = duration / intervalStep;
    let currentStep = 0;

    progressIntervalRef.current = setInterval(() => {
      currentStep++;
      const remainingPct = Math.max(0, 100 - (currentStep / totalSteps) * 100);
      setProgress(remainingPct);
    }, intervalStep);

    timerRef.current = setTimeout(() => {
      hideToast();
    }, duration);
  }, [hideToast]);

  const handleUndo = async () => {
    if (toast?.onUndo) {
      await toast.onUndo();
    }
    hideToast();
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-20 left-4 right-4 z-50 flex justify-center md:bottom-8 md:left-auto md:right-8 md:max-w-md pointer-events-none">
          <div className="w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden pointer-events-auto transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-100 truncate">
                  {toast.message}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {toast.onUndo && (
                  <button
                    onClick={handleUndo}
                    className="min-h-[48px] min-w-[72px] px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>{toast.undoLabel || 'Undo'}</span>
                  </button>
                )}
                <button
                  onClick={hideToast}
                  className="min-h-[48px] min-w-[48px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl active:scale-95"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Countdown progress bar */}
            {toast.onUndo && (
              <div className="h-1 w-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export function useToastUndo() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastUndo must be used within a ToastUndoProvider');
  }
  return context;
}
