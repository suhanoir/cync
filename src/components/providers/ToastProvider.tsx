'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
  success: () => {},
  error: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message: string) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message: string) => addToast(message, 'error'), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error }}>
      {children}
      <div
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg border shadow-lg text-sm transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
              t.type === 'success'
                ? 'bg-[#121c16] text-[#6ee7b7] border-[#10b981]/30 dark:bg-[#102016]'
                : t.type === 'error'
                ? 'bg-[#261314] text-[#fca5a5] border-[#ef4444]/30'
                : 'bg-card text-foreground border-border'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-cync-green shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-cync-gray-light shrink-0" />}
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-muted-foreground hover:text-foreground p-1 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
