'use client';

// src/components/ui/Textarea.tsx
// Styled textarea with label, error, and helper text support

import { TextareaHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-caption font-sans font-semibold text-text-primary"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          aria-invalid={error ? 'true' : undefined}
          className={cn(
            'w-full px-3 py-2.5 rounded-sm border border-border bg-site-white-pure font-sans text-body text-text-primary placeholder:text-text-muted',
            'resize-y transition-shadow duration-150 outline-none',
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

Textarea.displayName = 'Textarea';

export default Textarea;
