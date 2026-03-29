// src/app/qa/loading.tsx
// Suspense fallback for the Q&A route — skeleton cards mimicking question + answer layout

import SkeletonCard from '@/components/ui/SkeletonCard';

export default function QALoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* Page heading skeleton */}
      <div className="h-8 w-48 rounded-sm bg-border skeleton-shimmer mb-8" aria-hidden="true" />

      {/* 3 tall skeleton cards simulating question + answer pairs */}
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonCard
          key={i}
          lines={5}
          className="min-h-[180px]"
        />
      ))}
    </div>
  );
}
