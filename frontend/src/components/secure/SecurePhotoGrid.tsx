'use client';

// src/components/secure/SecurePhotoGrid.tsx
// Private photo grid for the Secure Section — same layout as PhotoGrid but
// fetches from GET /api/photos/secure, handles delete, and shows a custom empty state.

import { useState, useEffect, useCallback } from 'react';
import PhotoCard from '@/components/photos/PhotoCard';
import PhotoLightbox from '@/components/photos/PhotoLightbox';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { getSecurePhotos, deletePhoto } from '@/lib/api';
import type { Photo } from '@/types/index';

interface SecurePhotoGridProps {
  /** Increment this key to force a full reload (e.g. after upload) */
  refreshKey?: number;
  onDeleteError: (message: string) => void;
  onDeleteSuccess: (message: string) => void;
}

export default function SecurePhotoGrid({
  refreshKey = 0,
  onDeleteError,
  onDeleteSuccess,
}: SecurePhotoGridProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSecurePhotos();
      setPhotos(data);
    } catch {
      setFetchError('Could not load photos. Your session may have expired — try logging out and back in.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos, refreshKey]);

  async function handleDelete(id: number) {
    try {
      await deletePhoto(id);
      setPhotos((prev) => prev.filter((p) => p.photoID !== id));
      onDeleteSuccess('Photo deleted.');
    } catch {
      onDeleteError('Failed to delete photo. Please try again.');
    }
  }

  // Skeleton loading state
  if (loading) {
    return (
      <div
        aria-label="Loading private photos"
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

  // Fetch error state
  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-sans text-body text-text-muted">{fetchError}</p>
      </div>
    );
  }

  // Empty state
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-sans text-body text-text-muted">
          Your private memories will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.photoID}
            photo={photo}
            onDelete={handleDelete}
            onClick={() => setLightboxIndex(index)}
          />
        ))}
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
