'use client';

// src/app/photos/page.tsx
// Photos preview page — shows first 9 photos (3×3 grid), upload button, "See All" link

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { UploadCloud } from 'lucide-react';
import Button from '@/components/ui/Button';
import ToastContainer from '@/components/ui/ToastContainer';
import PhotoGrid from '@/components/photos/PhotoGrid';
import PhotoUploadModal from '@/components/photos/PhotoUploadModal';
import PhotoLightbox from '@/components/photos/PhotoLightbox';
import { getPhotos, deletePhoto } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import type { Photo, ApiError } from '@/types/index';

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { toasts, showSuccess, showError, dismiss } = useToast();

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch first 9 photos — 3 rows × 3 columns
      const data = await getPhotos(undefined, 1, 9);
      setPhotos(data);
    } catch {
      showError('Failed to load photos. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  async function handleDelete(id: number) {
    try {
      await deletePhoto(id);
      setPhotos((prev) => prev.filter((p) => p.photoID !== id));
      showSuccess('Photo deleted.');
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.message ?? 'Failed to delete photo.');
    }
  }

  function handleUploadSuccess() {
    // Refresh the grid after a successful upload
    fetchPhotos();
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-10 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-h1 text-text-primary">Photos</h1>
          <p className="font-sans text-caption text-text-muted mt-1">
            Moments frozen in time.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          className="rounded-pill self-start sm:self-auto"
          onClick={() => setUploadOpen(true)}
        >
          <UploadCloud size={16} aria-hidden="true" />
          Upload Photo
        </Button>
      </div>

      {/* Photo grid — first 9 */}
      <PhotoGrid
        photos={photos}
        loading={loading}
        onDelete={handleDelete}
        onPhotoClick={(index) => setLightboxIndex(index)}
      />

      {/* See All button */}
      {!loading && photos.length > 0 && (
        <div className="flex justify-center mt-10">
          <Link href="/photos/all">
            <Button variant="secondary" size="lg" className="rounded-pill">
              See All Photos
            </Button>
          </Link>
        </div>
      )}

      {/* Upload modal */}
      <PhotoUploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
        onUploadSuccess={showSuccess}
        onError={showError}
      />

      {/* Lightbox */}
      {lightboxIndex !== null && photos.length > 0 && (
        <PhotoLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
