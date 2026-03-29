'use client';

// src/hooks/useAdminSession.ts
// In-memory session state hook for the Admin password gate

import { useState, useCallback } from 'react';
import { verifyAdminPassword } from '@/lib/api';
import type { ApiError } from '@/types/index';

export interface UseAdminSessionReturn {
  isAuthenticated: boolean;
  isVerifying: boolean;
  error: string | null;
  verifyPassword: (password: string) => Promise<boolean>;
  logout: () => void;
}

export function useAdminSession(): UseAdminSessionReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyPassword = useCallback(async (password: string): Promise<boolean> => {
    setIsVerifying(true);
    setError(null);

    try {
      await verifyAdminPassword(password);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 401) {
        setError('Incorrect admin password. Please try again.');
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
