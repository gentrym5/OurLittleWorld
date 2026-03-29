'use client';

// src/app/timeline/page.tsx
// Memory Timeline page — cursor-based pagination, Add Memory modal

import { useState, useEffect, useCallback } from 'react';
import { getTimeline } from '@/lib/api';
import type { TimelineEntry } from '@/types/index';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';
import Button from '@/components/ui/Button';
import SkeletonCard from '@/components/ui/SkeletonCard';
import Timeline from '@/components/timeline/Timeline';
import AddMemoryModal from '@/components/timeline/AddMemoryModal';

export default function TimelinePage() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { toasts, showSuccess, showError, dismiss } = useToast();

  // Initial load — newest 10, no cursor
  const fetchInitial = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getTimeline();
      setEntries(data);
      setHasMore(data.length === 10);
    } catch {
      setLoadError('Failed to load memories. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  // Cursor load — entries older than the oldest currently shown
  async function handleLoadEarlier() {
    if (entries.length === 0 || loadingMore) return;
    const cursor = entries[entries.length - 1].timestamp;
    setLoadingMore(true);
    try {
      const older = await getTimeline(cursor);
      setEntries((prev) => [...prev, ...older]);
      setHasMore(older.length === 10);
    } catch {
      showError('Failed to load earlier memories. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  }

  function handleModalSuccess(newEntry: TimelineEntry) {
    showSuccess('Memory saved!');
    // Prepend the new entry and reset to first-page view
    setEntries((prev) => [newEntry, ...prev]);
  }

  function handleModalError(message: string) {
    showError(message);
  }

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <AddMemoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        onError={handleModalError}
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Page header */}
        <header className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-h1 font-semibold text-text-primary leading-tight">
              Our Timeline
            </h1>
            <p className="text-caption font-sans text-text-muted mt-1">
              Every chapter of our story.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setModalOpen(true)}
            className="rounded-full self-start sm:self-auto shrink-0"
          >
            + Add Memory
          </Button>
        </header>

        {/* Timeline content */}
        {loading ? (
          <div className="flex flex-col gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} className="h-40" />
            ))}
          </div>
        ) : loadError ? (
          <p role="alert" className="text-body font-sans text-error text-center py-12">
            {loadError}
          </p>
        ) : (
          <>
            <Timeline entries={entries} />

            {/* Load Earlier button */}
            {entries.length > 0 && hasMore && (
              <div className="mt-14 flex justify-center">
                <Button
                  variant="secondary"
                  size="md"
                  loading={loadingMore}
                  loadingText="Loading…"
                  onClick={handleLoadEarlier}
                  className="rounded-full"
                >
                  Load Earlier Memories
                </Button>
              </div>
            )}

            {/* End-of-timeline message */}
            {entries.length > 0 && !hasMore && (
              <p className="mt-14 text-center font-sans text-caption text-text-muted">
                You&apos;ve reached the beginning of your story.
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}
