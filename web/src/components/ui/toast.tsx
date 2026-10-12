"use client";

import * as React from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

type ToastRecord = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Milliseconds before auto-dismiss. Defaults to 4000. */
  duration?: number;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

const VARIANT_META: Record<
  ToastVariant,
  { icon: React.ComponentType<{ className?: string }>; iconClass: string }
> = {
  success: { icon: CheckCircle2, iconClass: "text-emerald-600 dark:text-emerald-400" },
  error: { icon: CircleAlert, iconClass: "text-destructive" },
  info: { icon: Info, iconClass: "text-muted-foreground" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    ({ title, description, variant = "success", duration = 4000 }: ToastInput) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => {
          const meta = VARIANT_META[t.variant];
          const Icon = meta.icon;
          return (
            <div
              key={t.id}
              role="status"
              className="animate-in fade-in-0 slide-in-from-bottom-2 zoom-in-95 pointer-events-auto flex items-start gap-2.5 rounded-lg border border-border bg-popover p-3 text-sm shadow-lg ring-1 ring-foreground/5"
            >
              <Icon className={cn("mt-0.5 size-4 shrink-0", meta.iconClass)} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-medium text-foreground">{t.title}</span>
                {t.description && (
                  <span className="text-xs text-muted-foreground">{t.description}</span>
                )}
              </div>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismiss(t.id)}
                className="shrink-0 cursor-pointer text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
