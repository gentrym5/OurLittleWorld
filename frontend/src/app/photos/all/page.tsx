'use client';

// src/app/photos/all/page.tsx
// Full gallery — all public photos with "Load More" offset pagination and upload button

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { UploadCloud, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import ToastContainer from '@/components/ui/ToastContainer';
import PhotoGrid from '@/components/photos/PhotoGrid';
import PhotoUploadModal from '@/components/photos/PhotoUploadModal';
import PhotoLightbox from '@/components/photos/PhotoLightbox';
import { getPhotos, deletePhoto } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import type { Photo, ApiError } from '@/types/index';

const PAGE_SIZE = 12;

export default function AllPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { toasts, showSuccess, showError, dismiss } = useToast();

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPhotos(undefined, 1, PAGE_SIZE);
      setPhotos(data);
      setPage(1);
      setHasMore(data.length === PAGE_SIZE);
    } catch {
      showError('Failed to load photos. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  async function handleLoadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const data = await getPhotos(undefined, nextPage, PAGE_SIZE);
      setPhotos((prev) => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(data.length === PAGE_SIZE);
    } catch {
      showError('Failed to load more photos.');
    } finally {
      setLoadingMore(false);
    }
  }

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
    // Reload from beginning after upload to include the new photo
    fetchInitial();
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-10 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <Link
            href="/photos"
            className="inline-flex items-center gap-1.5 font-sans text-caption text-text-muted hover:text-purple-deep transition-colors duration-150 mb-3"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to Photos
          </Link>
          <h1 className="font-serif text-h1 text-text-primary">All Photos</h1>
          <p className="font-sans text-caption text-text-muted mt-1">
            Every moment we&apos;ve captured together.
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

      {/* Full photo grid */}
      <PhotoGrid
        photos={photos}
        loading={loading}
        onDelete={handleDelete}
        onPhotoClick={(index) => setLightboxIndex(index)}
      />

      {/* Load More */}
      {!loading && hasMore && (
        <div className="flex justify-center mt-10">
          <Button
            variant="secondary"
            size="lg"
            className="rounded-pill"
            loading={loadingMore}
            loadingText="Loading..."
            onClick={handleLoadMore}
          >
            Load More
          </Button>
        </div>
      )}

      {/* End of photos indicator */}
      {!loading && !hasMore && photos.length > 0 && (
        <p className="text-center font-sans text-caption text-text-muted mt-10">
          You&apos;ve seen all your memories.
        </p>
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
