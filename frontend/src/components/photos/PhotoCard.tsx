'use client';

// src/components/photos/PhotoCard.tsx
// Single photo tile with hover overlay, delete icon, and click-to-lightbox

import { useState } from 'react';
import Image from 'next/image';
import { Trash2, Expand } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Photo } from '@/types/index';

interface PhotoCardProps {
  photo: Photo;
  onDelete: (id: number) => void;
  onClick: () => void;
}

export default function PhotoCard({ photo, onDelete, onClick }: PhotoCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    onDelete(photo.photoID);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="View photo"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="relative aspect-square overflow-hidden rounded-md cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-soft focus-visible:ring-offset-2"
    >
      {/* Placeholder background shown until image loads */}
      <div
        className={cn(
          'absolute inset-0 bg-purple-soft skeleton-shimmer rounded-md transition-opacity duration-300',
          loaded ? 'opacity-0' : 'opacity-100',
        )}
        aria-hidden="true"
      />

      {/* Photo image */}
      <Image
        src={photo.imageURL}
        alt="Our memory"
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={cn(
          'object-cover transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />

      {/* Hover overlay */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 flex items-start justify-between p-2 transition-opacity duration-[180ms]',
          hovered ? 'opacity-100' : 'opacity-0',
        )}
        style={{ background: 'rgba(58, 45, 79, 0.45)' }}
      >
        {/* View icon — bottom-left */}
        <span className="mt-auto">
          <Expand size={18} className="text-white" aria-hidden="true" />
        </span>

        {/* Delete button — top-right */}
        <button
          onClick={handleDeleteClick}
          aria-label="Delete photo"
          className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-opacity duration-150 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          style={{ background: 'rgba(217, 83, 79, 0.85)' }}
        >
          <Trash2 size={15} className="text-white" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
