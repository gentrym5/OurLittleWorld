'use client';

// src/components/ui/Input.tsx
// Styled text input with label, error, and helper text support

import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-caption font-sans font-semibold text-text-primary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          aria-invalid={error ? 'true' : undefined}
          className={cn(
            'w-full px-3 py-2.5 rounded-sm border border-border bg-site-white-pure font-sans text-body text-text-primary placeholder:text-text-muted',
            'transition-shadow duration-150 outline-none',
            'focus:shadow-focus focus:border-pink-soft',
            error && 'border-error focus:border-error focus:shadow-none',
            className,
          )}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-caption text-error font-sans">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="text-caption text-text-muted font-sans">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
