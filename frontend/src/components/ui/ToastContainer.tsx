'use client';

// src/components/ui/ToastContainer.tsx
// Fixed bottom-right container that renders all active toast notifications

import { createPortal } from 'react-dom';
import Toast from './Toast';
import type { ToastItem } from '@/hooks/useToast';

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body,
  );
}
