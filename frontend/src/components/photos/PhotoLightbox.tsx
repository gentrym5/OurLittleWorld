'use client';

// src/components/photos/PhotoLightbox.tsx
// Full-screen lightbox with prev/next navigation, keyboard support, and metadata footer

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateTime } from '@/lib/format';
import type { Photo } from '@/types/index';

interface PhotoLightboxProps {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
}

export default function PhotoLightbox({
  photos,
  initialIndex,
  onClose,
}: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const current = photos[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const goNext = useCallback(() => {
    if (hasNext) setCurrentIndex((i) => i + 1);
  }, [hasNext]);

  const goPrev = useCallback(() => {
    if (hasPrev) setCurrentIndex((i) => i - 1);
  }, [hasPrev]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goNext, goPrev]);

  // Prevent body scroll while lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!current) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo lightbox"
      className="fixed inset-0 z-[60] flex flex-col bg-black/90"
    >
      {/* Top bar — close button */}
      <div className="flex items-center justify-end px-4 py-3 shrink-0">
        <button
          onClick={onClose}
          aria-label="Close lightbox"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-150 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Main image area */}
      <div className="flex-1 relative flex items-center justify-center px-12 overflow-hidden">
        {/* Prev arrow */}
        {hasPrev && (
          <button
            onClick={goPrev}
            aria-label="Previous photo"
            className="absolute left-2 md:left-4 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 transition-colors duration-150 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white z-10"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
        )}

        {/* Photo */}
        <div className="relative w-full h-full max-w-4xl mx-auto">
          <Image
            key={current.photoID}
            src={current.imageURL}
            alt="Our memory"
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>

        {/* Next arrow */}
        {hasNext && (
          <button
            onClick={goNext}
            aria-label="Next photo"
            className="absolute right-2 md:right-4 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 transition-colors duration-150 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white z-10"
          >
            <ChevronRight size={24} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Bottom metadata bar */}
      <div className="shrink-0 px-6 py-4 flex items-center justify-between gap-4 bg-black/50">
        <p className="font-sans text-caption text-white/70">
          {formatDateTime(current.timestamp)}
        </p>
        <p className="font-sans text-caption text-white/50">
          {currentIndex + 1} / {photos.length}
        </p>
      </div>
    </div>,
    document.body,
  );
}
