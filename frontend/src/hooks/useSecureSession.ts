'use client';

// src/hooks/useSecureSession.ts
// In-memory session state hook for the Secure Section password gate

import { useState, useCallback } from 'react';
import { verifySecurePassword } from '@/lib/api';
import type { ApiError } from '@/types/index';

export interface UseSecureSessionReturn {
  isAuthenticated: boolean;
  isVerifying: boolean;
  error: string | null;
  verifyPassword: (password: string) => Promise<boolean>;
  logout: () => void;
}

export function useSecureSession(): UseSecureSessionReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyPassword = useCallback(async (password: string): Promise<boolean> => {
    setIsVerifying(true);
    setError(null);

    try {
      await verifySecurePassword(password);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 401) {
        setError('Incorrect password. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setError(null);
  }, []);

  return { isAuthenticated, isVerifying, error, verifyPassword, logout };
}
