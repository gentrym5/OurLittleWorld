'use client';

// src/components/ui/Button.tsx
// Reusable button with variants, sizes, and loading state

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';
import Spinner from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-pink-soft text-white hover:bg-pink-deep active:bg-pink-deep focus-visible:ring-2 focus-visible:ring-pink-soft focus-visible:ring-offset-2',
  secondary:
    'bg-purple-light text-text-primary hover:bg-purple-deep hover:text-white active:bg-purple-deep focus-visible:ring-2 focus-visible:ring-purple-light focus-visible:ring-offset-2',
  ghost:
    'bg-transparent text-text-primary hover:bg-purple-soft active:bg-purple-soft focus-visible:ring-2 focus-visible:ring-purple-light focus-visible:ring-offset-2',
  danger:
    'bg-error text-white hover:opacity-90 active:opacity-100 focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-caption rounded-sm',
  md: 'px-5 py-2.5 text-btn rounded-sm',
  lg: 'px-8 py-3.5 text-btn rounded-md',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-sans font-semibold transition-colors duration-150 outline-none cursor-pointer',
          variantClasses[variant],
          sizeClasses[size],
          isDisabled && 'opacity-70 cursor-not-allowed pointer-events-none',
          className,
        )}
        {...props}
      >
        {loading && <Spinner size="sm" className="border-current border-t-transparent" />}
        {loading && loadingText ? loadingText : children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
