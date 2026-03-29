'use client';

// src/components/ui/Toast.tsx
// Individual toast notification card with slide-in animation

import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ToastItem, ToastType } from '@/hooks/useToast';

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const toastConfig: Record<
  ToastType,
  { icon: React.ReactNode; bgClass: string; textClass: string }
> = {
  success: {
    icon: <CheckCircle size={18} aria-hidden="true" />,
    bgClass: 'bg-success',
    textClass: 'text-white',
  },
  error: {
    icon: <XCircle size={18} aria-hidden="true" />,
    bgClass: 'bg-error',
    textClass: 'text-white',
  },
  info: {
    icon: <Info size={18} aria-hidden="true" />,
    bgClass: 'bg-purple-deep',
    textClass: 'text-white',
  },
};

export default function Toast({ toast, onDismiss }: ToastProps) {
  const config = toastConfig[toast.type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-sm shadow-modal min-w-[280px] max-w-sm',
        config.bgClass,
        config.textClass,
        toast.visible ? 'animate-slideInRight' : 'animate-slideOutRight',
      )}
    >
      <span className="shrink-0 mt-0.5">{config.icon}</span>
      <p className="flex-1 text-caption font-sans leading-snug">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 mt-0.5 opacity-80 hover:opacity-100 transition-opacity"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
