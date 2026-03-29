// src/components/ui/ErrorMessage.tsx
// Reusable inline error component — not a full-page error; renders inline within a section.

import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md border border-error bg-pink-light px-4 py-3 text-error"
    >
      <AlertCircle
        size={20}
        className="shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div className="flex-1 space-y-2">
        <p className="text-sm font-sans leading-snug">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-1 rounded-sm"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
