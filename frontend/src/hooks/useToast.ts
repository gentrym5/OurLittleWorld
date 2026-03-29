'use client';

// src/hooks/useToast.ts
// Toast notification state management hook

import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  visible: boolean;
}

export interface UseToastReturn {
  toasts: ToastItem[];
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  dismiss: (id: string) => void;
}

let toastCounter = 0;

function generateId(): string {
  toastCounter += 1;
  return `toast-${Date.now()}-${toastCounter}`;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = generateId();
    const toast: ToastItem = { id, message, type, visible: true };

    setToasts((prev) => [...prev, toast]);

    // Auto-dismiss success and info after 3000ms; errors persist
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, visible: false } : t)),
        );
        // Remove from DOM after fade-out animation (300ms)
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
      }, 3000);
    }
  }, []);

  const showSuccess = useCallback(
    (message: string) => addToast(message, 'success'),
    [addToast],
  );

  const showError = useCallback(
    (message: string) => addToast(message, 'error'),
    [addToast],
  );

  const showInfo = useCallback(
    (message: string) => addToast(message, 'info'),
    [addToast],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: false } : t)),
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  return { toasts, showSuccess, showError, showInfo, dismiss };
}
