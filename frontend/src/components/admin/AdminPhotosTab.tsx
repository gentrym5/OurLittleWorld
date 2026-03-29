'use client';

// src/components/admin/AdminPhotosTab.tsx
// Admin photo grid — shows all photos (public + private), delete and toggle-secure actions

import { useState, useEffect } from 'react';
import { Trash2, Lock, Unlock } from 'lucide-react';
import { getPhotos, deletePhoto, togglePhotoSecure } from '@/lib/api';
import type { Photo, ApiError } from '@/types/index';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';
import Image from 'next/image';

export default function AdminPhotosTab() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const { toasts, showSuccess, showError, dismiss } = useToast();

  useEffect(() => {
    fetchAllPhotos();
  }, []);

  async function fetchAllPhotos() {
    setLoading(true);
    setFetchError(null);
    try {
      // Fetch public and private photos in parallel
      const [publicPhotos, privatePhotos] = await Promise.all([
        getPhotos(false, 1, 200),
        getPhotos(true, 1, 200),
      ]);
      // Merge, deduplicate by photoID (in case overlap), sort newest first
      const merged = [...publicPhotos, ...privatePhotos].filter(
        (photo, index, self) =>
          index === self.findIndex((p) => p.photoID === photo.photoID),
      );
      merged.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      setPhotos(merged);
    } catch (err) {
      const apiErr = err as ApiError;
      setFetchError(apiErr?.message ?? 'Failed to load photos.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm('Delete this photo? This action cannot be undone.');
    if (!confirmed) return;
    setActionId(id);
    try {
      await deletePhoto(id);
      setPhotos((prev) => prev.filter((p) => p.photoID !== id));
      showSuccess('Photo deleted.');
    } catch (err) {
      const apiErr = err as ApiError;
      showError(apiErr?.message ?? 'Failed to delete photo.');
    } finally {
      setActionId(null);
    }
  }

  async function handleToggleSecure(photo: Photo) {
    setActionId(photo.photoID);
    try {
      const updated = await togglePhotoSecure(photo.photoID, !photo.isSecure);
      setPhotos((prev) =>
        prev.map((p) => (p.photoID === photo.photoID ? { ...p, isSecure: updated.isSecure } : p)),
      );
      showSuccess(updated.isSecure ? 'Photo moved to private.' : 'Photo moved to public.');
    } catch (err) {
      const apiErr = err as ApiError;
      showError(apiErr?.message ?? 'Failed to update photo visibility.');
    } finally {
      setActionId(null);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-serif text-h2 text-text-primary">Photos</h2>
          <p className="text-caption text-text-muted font-sans">{photos.length} total</p>
        </div>

        {loading && (
          <p className="text-body text-text-muted font-sans">Loading photos...</p>
        )}
        {fetchError && (
          <p className="text-body text-error font-sans">{fetchError}</p>
        )}

        {!loading && !fetchError && photos.length === 0 && (
          <p className="text-body text-text-muted font-sans">No photos uploaded yet.</p>
        )}

        {!loading && !fetchError && photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.photoID}
                className="relative group rounded-md overflow-hidden border border-border shadow-subtle bg-purple-soft aspect-square"
              >
                {/* Thumbnail */}
                <Image
                  src={photo.imageURL}
                  alt={`Photo ${photo.photoID}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 200px"
                  className="object-cover transition-opacity duration-300"
                />

                {/* Private badge */}
                {photo.isSecure && (
                  <span className="absolute top-2 left-2 flex items-center gap-1 bg-text-primary/80 text-white text-caption px-2 py-0.5 rounded-pill font-sans font-semibold z-10">
                    <Lock size={11} />
                    Private
                  </span>
                )}

                {/* Action overlay */}
                <div className="absolute inset-0 bg-text-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 z-20">
                  <button
                    onClick={() => handleToggleSecure(photo)}
                    disabled={actionId === photo.photoID}
                    title={photo.isSecure ? 'Make public' : 'Make private'}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-site-white-pure rounded-sm text-caption font-semibold font-sans text-text-primary hover:bg-purple-light transition-colors duration-150 disabled:opacity-50"
                  >
                    {photo.isSecure ? (
                      <>
                        <Unlock size={13} />
                        Make Public
                      </>
                    ) : (
                      <>
                        <Lock size={13} />
                        Make Private
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(photo.photoID)}
                    disabled={actionId === photo.photoID}
                    title="Delete photo"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-error rounded-sm text-caption font-semibold font-sans text-white hover:opacity-90 transition-opacity duration-150 disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
