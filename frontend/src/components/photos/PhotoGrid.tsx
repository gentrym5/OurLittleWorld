// src/components/photos/PhotoGrid.tsx
// Responsive 3-column photo grid with skeleton loading and empty state

import SkeletonCard from '@/components/ui/SkeletonCard';
import PhotoCard from './PhotoCard';
import type { Photo } from '@/types/index';

interface PhotoGridProps {
  photos: Photo[];
  loading?: boolean;
  onDelete: (id: number) => void;
  onPhotoClick: (index: number) => void;
}

export default function PhotoGrid({
  photos,
  loading = false,
  onDelete,
  onPhotoClick,
}: PhotoGridProps) {
  if (loading) {
    return (
      <div
        aria-label="Loading photos"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonCard
            key={i}
            showImage={false}
            lines={0}
            className="aspect-square p-0"
          />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-sans text-body text-text-muted">
          No photos yet &mdash; capture your first memory!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.photoID}
          photo={photo}
          onDelete={onDelete}
          onClick={() => onPhotoClick(index)}
        />
      ))}
    </div>
  );
}
