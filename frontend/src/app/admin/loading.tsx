// src/app/admin/loading.tsx
// Suspense fallback for the Admin dashboard route — skeleton stats row + table rows

import SkeletonCard from '@/components/ui/SkeletonCard';

export default function AdminLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Page heading skeleton */}
      <div className="h-8 w-48 rounded-sm bg-border skeleton-shimmer" aria-hidden="true" />

      {/* 5 small stat boxes in a row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} lines={1} className="py-5 px-4" />
        ))}
      </div>

      {/* Large table skeleton */}
      <div
        role="status"
        aria-label="Loading table data"
        className="rounded-md bg-site-white shadow-subtle overflow-hidden"
      >
        {/* Table header row */}
        <div className="flex gap-4 px-6 py-4 border-b border-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-4 rounded-sm bg-border skeleton-shimmer flex-1"
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Table body rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 px-6 py-4 border-b border-border last:border-0"
          >
            {Array.from({ length: 4 }).map((_, j) => (
              <div
                key={j}
                className="h-4 rounded-sm bg-border skeleton-shimmer flex-1"
                aria-hidden="true"
              />
            ))}
          </div>
        ))}

        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
