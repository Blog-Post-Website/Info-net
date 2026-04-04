"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastVariant = "success" | "error" | "info";

type ToastInput = {
  title?: string;
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastItem = Required<Pick<ToastInput, "message">> & {
  id: string;
  title?: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function uniqueId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());

  const removeToast = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = uniqueId();
      const variant: ToastVariant = input.variant ?? "info";
      const durationMs = input.durationMs ?? 3500;

      setToasts((current) => [{ id, title: input.title, message: input.message, variant }, ...current].slice(0, 3));

      const timer = window.setTimeout(() => removeToast(id), durationMs);
      timers.current.set(id, timer);
    },
    [removeToast]
  );

  const value = useMemo<ToastContextValue>(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 w-[min(420px,calc(100vw-2rem))] space-y-3">
        {toasts.map((item) => {
          const accentClass =
            item.variant === "success"
              ? "bg-emerald-500"
              : item.variant === "error"
                ? "bg-red-500"
                : "bg-blue-500";

          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.14)] dark:border-gray-800 dark:bg-gray-950"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3 p-4">
                <div className={`mt-1 h-2.5 w-2.5 flex-none rounded-full ${accentClass}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  {item.title ? (
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                  ) : null}
                  <p className="text-sm text-slate-700 dark:text-slate-200">{item.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(item.id)}
                  className="-m-1 rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  aria-label="Dismiss notification"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
