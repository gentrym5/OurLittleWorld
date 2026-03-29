'use client';

// src/components/ui/PasswordGate.tsx
// Reusable password entry component used by Secure Section and Admin pages

import { useState, FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input from './Input';
import Button from './Button';
import { cn } from '@/lib/cn';

export interface PasswordGateProps {
  title?: string;
  description?: string;
  onSubmit: (password: string) => Promise<boolean>;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export default function PasswordGate({
  title = 'Enter Password',
  description,
  onSubmit,
  isLoading = false,
  error,
  className,
}: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!password.trim()) return;
    await onSubmit(password);
  }

  return (
    <div
      className={cn(
        'w-full max-w-sm mx-auto bg-site-white-pure rounded-md shadow-modal p-8 space-y-5',
        className,
      )}
    >
      <div className="text-center space-y-1">
        <h1 className="font-serif text-h2 text-text-primary">{title}</h1>
        {description && (
          <p className="text-caption text-text-muted font-sans">{description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Password field with show/hide toggle */}
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password..."
            autoComplete="current-password"
            error={error ?? undefined}
            className="pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className={cn(
              'absolute right-3 text-text-muted hover:text-text-primary transition-colors duration-150',
              // Offset position down to align with input (accounting for label height ~26px + gap ~6px)
              error ? 'bottom-8' : 'bottom-2.5',
            )}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          loadingText="Verifying..."
          disabled={!password.trim()}
          className="w-full rounded-pill"
        >
          Enter
        </Button>
      </form>
    </div>
  );
}
