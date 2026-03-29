'use client';

// src/components/secure/SecureContent.tsx
// Authenticated view of the Secure Section — photo grid, upload, and logout.

import { useState } from 'react';
import { LockOpen, LogOut, Upload } from 'lucide-react';
import Button from '@/components/ui/Button';
import ToastContainer from '@/components/ui/ToastContainer';
import PhotoUploadModal from '@/components/photos/PhotoUploadModal';
import SecurePhotoGrid from './SecurePhotoGrid';
import { logoutSecure } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

interface SecureContentProps {
  onLogout: () => void;
}

export default function SecureContent({ onLogout }: SecureContentProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const { toasts, showSuccess, showError, dismiss } = useToast();

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logoutSecure();
    } catch {
      // Cookie expiry or network error — proceed with client-side logout regardless
    } finally {
      setLoggingOut(false);
      onLogout();
    }
  }

  function handleUploadSuccess() {
    // Increment key to trigger a fresh fetch in SecurePhotoGrid
    setRefreshKey((k) => k + 1);
  }

  return (
    <main className="min-h-screen bg-site-white px-4 py-12 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <LockOpen
              size={28}
              className="text-purple-deep shrink-0"
              aria-hidden="true"
            />
            <div>
              <h1 className="font-serif text-h1 text-text-primary leading-tight">
                For Our Eyes Only
              </h1>
              <p className="font-sans text-caption text-text-muted mt-0.5">
                Our most private space.
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Log out of this section"
            className="inline-flex items-center gap-1.5 font-sans text-caption text-text-muted hover:text-text-primary transition-colors duration-150 disabled:opacity-60 shrink-0 self-start sm:self-auto"
          >
            <LogOut size={14} aria-hidden="true" />
            {loggingOut ? 'Logging out...' : 'Log out of this section'}
          </button>
        </div>

        {/* Private photo grid */}
        <SecurePhotoGrid
          refreshKey={refreshKey}
          onDeleteError={showError}
          onDeleteSuccess={showSuccess}
        />

        {/* Upload button */}
        <div className="mt-8 flex justify-center">
          <Button
            variant="primary"
            size="md"
            className="rounded-pill"
            onClick={() => setUploadOpen(true)}
          >
            <Upload size={16} aria-hidden="true" />
            Upload Private Photo
          </Button>
        </div>
      </div>

      {/* Upload modal — locked to private */}
      <PhotoUploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
        onError={showError}
        onUploadSuccess={showSuccess}
        isSecureDefault={true}
      />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </main>
  );
}
