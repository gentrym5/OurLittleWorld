// src/app/feelings/loading.tsx
// Suspense fallback for the Feelings route — skeleton form + 5 entry cards

import SkeletonCard from '@/components/ui/SkeletonCard';

export default function FeelingsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      {/* Page heading skeleton */}
      <div className="h-8 w-40 rounded-sm bg-border skeleton-shimmer mb-2" aria-hidden="true" />

      {/* Skeleton form area */}
      <div className="rounded-md bg-site-white p-8 shadow-subtle space-y-4" role="status" aria-label="Loading form">
        <div className="h-5 w-32 rounded-sm bg-border skeleton-shimmer" aria-hidden="true" />
        <div className="h-10 w-full rounded-sm bg-border skeleton-shimmer" aria-hidden="true" />
        <div className="h-10 w-1/3 rounded-sm bg-border skeleton-shimmer" aria-hidden="true" />
        <span className="sr-only">Loading...</span>
      </div>

      {/* 5 skeleton feeling entry cards */}
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </div>
  );
}
