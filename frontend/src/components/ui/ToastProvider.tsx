'use client';

// src/components/ui/ToastProvider.tsx
// Client wrapper that owns toast state and renders ToastContainer globally.
// Mount once in root layout — children gain access to toasts via this provider.

import { useToast } from '@/hooks/useToast';
import ToastContainer from './ToastContainer';

interface ToastProviderProps {
  children: React.ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const { toasts, dismiss } = useToast();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
