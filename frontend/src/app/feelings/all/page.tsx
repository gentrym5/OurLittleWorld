'use client';

// src/app/feelings/all/page.tsx
// Paginated list of all feelings

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllFeelings, deleteFeeling } from '@/lib/api';
import type { Feeling } from '@/types/index';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';
import FeelingsList from '@/components/feelings/FeelingsList';
import Button from '@/components/ui/Button';
import SkeletonCard from '@/components/ui/SkeletonCard';

const PAGE_SIZE = 20;

export default function AllFeelingsPage() {
  const [feelings, setFeelings] = useState<Feeling[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { toasts, showSuccess, showError, dismiss } = useToast();

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const loadPage = useCallback(async (targetPage: number) => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await getAllFeelings(targetPage, PAGE_SIZE);
      setFeelings(result.items);
      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
      setPage(result.page);
    } catch {
      setLoadError('Failed to load feelings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  async function handleDelete(id: number) {
    try {
      await deleteFeeling(id);
      showSuccess('Feeling deleted.');
      // Reload current page; if it becomes empty and not first page, go back one
      const newCount = totalCount - 1;
      const maxPage = Math.max(1, Math.ceil(newCount / PAGE_SIZE));
      const targetPage = Math.min(page, maxPage);
      await loadPage(targetPage);
    } catch {
      showError('Failed to delete feeling. Please try again.');
    }
  }

  function handlePrev() {
    if (page > 1) loadPage(page - 1);
  }

  function handleNext() {
    if (hasMore) loadPage(page + 1);
  }

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-8 flex items-center gap-4">
          <Link
            href="/feelings"
            className="inline-flex items-center gap-1 text-caption font-sans text-text-muted hover:text-text-primary transition-colors duration-150"
            aria-label="Back to Feelings"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Back
          </Link>
          <h1 className="font-serif text-h1 font-semibold text-text-primary leading-tight">
            All Feelings
          </h1>
        </header>

        {/* Count summary */}
        {!loading && !loadError && (
          <p className="text-caption font-sans text-text-muted mb-6">
            {totalCount} {totalCount === 1 ? 'entry' : 'entries'} total
          </p>
        )}

        {/* List */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : loadError ? (
          <p role="alert" className="text-body font-sans text-error text-center py-8">
            {loadError}
          </p>
        ) : (
          <FeelingsList feelings={feelings} onDelete={handleDelete} />
        )}

        {/* Pagination */}
        {!loading && !loadError && totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-10 flex items-center justify-center gap-4"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={page <= 1}
              aria-label="Previous page"
              className="inline-flex items-center gap-1"
            >
              <ChevronLeft size={16} aria-hidden="true" />
              Previous
            </Button>

            <span className="text-caption font-sans text-text-muted">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              disabled={!hasMore}
              aria-label="Next page"
              className="inline-flex items-center gap-1"
            >
              Next
              <ChevronRight size={16} aria-hidden="true" />
            </Button>
          </nav>
        )}
      </div>
    </>
  );
}
