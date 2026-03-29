'use client';

// src/components/photos/PhotoUploadModal.tsx
// Drag-and-drop upload modal with client-side compression and preview

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { UploadCloud, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';
import { uploadPhoto } from '@/lib/api';
import { USERS } from '@/lib/constants';
import type { ApiError } from '@/types/index';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
  onUploadSuccess: (message: string) => void;
  /** When true, the photo is pre-marked as private and the toggle is locked */
  isSecureDefault?: boolean;
  /** The user uploading the photo — defaults to PARTNER_1 */
  userId?: number;
}

export default function PhotoUploadModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
  onUploadSuccess,
  isSecureDefault = false,
  userId = USERS.PARTNER_1.id,
}: PhotoUploadModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSecure, setIsSecure] = useState(isSecureDefault);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only JPEG, PNG, WEBP, and GIF files are accepted.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return 'File is too large. Maximum size is 10 MB.';
    }
    return null;
  }

  function applyFile(file: File) {
    const error = validateFile(file);
    if (error) {
      setFileError(error);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    setFileError(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  }, []);

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function clearSelection() {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFileError(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleClose() {
    clearSelection();
    setIsSecure(isSecureDefault);
    onClose();
  }

  async function handleSubmit() {
    if (!selectedFile) return;
    setUploading(true);

    try {
      // Client-side compression — skip GIFs (compression breaks animation)
      let fileToUpload: File = selectedFile;
      if (selectedFile.type !== 'image/gif') {
        fileToUpload = await imageCompression(selectedFile, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
      }

      const formData = new FormData();
      formData.append('file', fileToUpload, selectedFile.name);
      formData.append('userId', String(userId));
      formData.append('isSecure', String(isSecure));

      await uploadPhoto(formData);

      onUploadSuccess('Photo uploaded successfully.');
      handleClose();
      onSuccess();
    } catch (err) {
      const apiError = err as ApiError;
      onError(apiError.message ?? 'Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Photo" maxWidth="max-w-md">
      <div className="space-y-4">
        {/* Drop zone */}
        {!previewUrl && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Drag and drop zone or click to browse files"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg p-10 cursor-pointer transition-colors duration-150',
              dragOver
                ? 'border-pink-soft bg-pink-light'
                : 'border-border bg-purple-soft hover:border-pink-soft hover:bg-pink-light',
            )}
          >
            <UploadCloud
              size={40}
              className={cn(
                'transition-colors duration-150',
                dragOver ? 'text-pink-deep' : 'text-text-muted',
              )}
              aria-hidden="true"
            />
            <p className="font-sans text-body text-text-primary text-center">
              Drag &amp; drop or{' '}
              <span className="text-pink-deep underline underline-offset-2">click to select</span>
            </p>
            <p className="font-sans text-caption text-text-muted text-center">
              Accepts: JPG, PNG, WEBP, GIF &mdash; Max 10 MB
            </p>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={handleFileInputChange}
        />

        {/* File error */}
        {fileError && (
          <p className="font-sans text-caption text-error" role="alert">
            {fileError}
          </p>
        )}

        {/* Preview */}
        {previewUrl && selectedFile && (
          <div className="relative">
            <div className="relative w-full aspect-video rounded-md overflow-hidden bg-purple-soft">
              <Image
                src={previewUrl}
                alt="Selected photo preview"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <button
              onClick={clearSelection}
              aria-label="Remove selected photo"
              className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full bg-text-primary/70 hover:bg-text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X size={14} className="text-white" aria-hidden="true" />
            </button>
            <p className="mt-2 font-sans text-caption text-text-muted truncate">
              {selectedFile.name}
            </p>
          </div>
        )}

        {/* Private toggle — locked when opened from the Secure Section */}
        <label
          className={cn(
            'flex items-center gap-3 select-none',
            isSecureDefault ? 'cursor-default opacity-70' : 'cursor-pointer',
          )}
        >
          <input
            type="checkbox"
            checked={isSecure}
            onChange={(e) => !isSecureDefault && setIsSecure(e.target.checked)}
            disabled={isSecureDefault}
            aria-label={isSecureDefault ? 'Private photo (locked)' : 'Private photo'}
            className="w-4 h-4 accent-pink-soft rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-soft"
          />
          <span className="font-sans text-body text-text-primary">
            Private photo?{' '}
            <span className="text-text-muted text-caption">
              {isSecureDefault
                ? '(always private in this section)'
                : '(visible in secure section only)'}
            </span>
          </span>
        </label>

        {/* Upload progress */}
        {uploading && (
          <div className="flex items-center gap-3 py-2" aria-live="polite">
            <Spinner size="md" />
            <span className="font-sans text-caption text-text-muted">Uploading...</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            variant="primary"
            size="md"
            className="flex-1 rounded-pill"
            disabled={!selectedFile || uploading}
            loading={uploading}
            loadingText="Uploading..."
            onClick={handleSubmit}
          >
            Upload
          </Button>
          <Button
            variant="ghost"
            size="md"
            className="flex-1 rounded-pill"
            disabled={uploading}
            onClick={handleClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
