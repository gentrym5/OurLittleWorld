// src/app/photos/loading.tsx
// Suspense fallback for the Photos route — skeleton 4×3 grid of square placeholders

import SkeletonCard from '@/components/ui/SkeletonCard';

export default function PhotosLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Page heading skeleton */}
      <div className="h-8 w-36 rounded-sm bg-border skeleton-shimmer mb-8" aria-hidden="true" />

      {/* 4×3 grid — 12 square skeleton cells */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard
            key={i}
            lines={0}
            showImage={false}
            className="aspect-square p-0 overflow-hidden"
          />
        ))}
      </div>
    </div>
  );
}
