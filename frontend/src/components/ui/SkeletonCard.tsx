// src/components/ui/SkeletonCard.tsx
// Shimmer skeleton placeholder card for loading states

import { cn } from '@/lib/cn';

interface SkeletonCardProps {
  className?: string;
  lines?: number;
  showImage?: boolean;
}

function SkeletonLine({ width = 'w-full' }: { width?: string }) {
  return (
    <div
      className={cn(
        'h-4 rounded-sm bg-border skeleton-shimmer',
        width,
      )}
      aria-hidden="true"
    />
  );
}

export default function SkeletonCard({
  className,
  lines = 3,
  showImage = false,
}: SkeletonCardProps) {
  return (
    <div
      role="status"
      aria-label="Loading content"
      className={cn(
        'rounded-md bg-site-white p-8 shadow-subtle space-y-3',
        className,
      )}
    >
      {showImage && (
        <div
          className="w-full h-36 rounded-sm bg-border skeleton-shimmer mb-4"
          aria-hidden="true"
        />
      )}
      {/* Heading skeleton */}
      <SkeletonLine width="w-3/5" />
      {/* Body lines */}
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          width={i === lines - 1 ? 'w-4/5' : 'w-full'}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
