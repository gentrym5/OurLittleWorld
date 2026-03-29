'use client';

// src/components/admin/AdminFeelingsTab.tsx
// Admin paginated table for feelings — delete only

import { useState, useEffect } from 'react';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllFeelings, deleteFeeling } from '@/lib/api';
import type { Feeling, ApiError } from '@/types/index';
import { formatDateTime } from '@/lib/format';
import { useToast } from '@/hooks/useToast';
import Button from '@/components/ui/Button';
import ToastContainer from '@/components/ui/ToastContainer';

const PAGE_SIZE = 20;
const ENTRY_LIMIT = 500;
const WARN_THRESHOLD = 450;

export default function AdminFeelingsTab() {
  const [feelings, setFeelings] = useState<Feeling[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { toasts, showSuccess, showError, dismiss } = useToast();

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    fetchPage(page);
  }, [page]);

  async function fetchPage(p: number) {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getAllFeelings(p, PAGE_SIZE);
      setFeelings(data.items);
      setTotalCount(data.totalCount);
    } catch (err) {
      const apiErr = err as ApiError;
      setFetchError(apiErr?.message ?? 'Failed to load feelings.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm('Delete this feeling entry? This action cannot be undone.');
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await deleteFeeling(id);
      setTotalCount((prev) => Math.max(0, prev - 1));
      // If last item on page and not first page, go back one page
      if (feelings.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchPage(page);
      }
      showSuccess('Feeling entry deleted.');
    } catch (err) {
      const apiErr = err as ApiError;
      showError(apiErr?.message ?? 'Failed to delete feeling.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-serif text-h2 text-text-primary">Feelings</h2>
            <p className="text-caption text-text-muted font-sans mt-0.5">
              {totalCount} / {ENTRY_LIMIT} entries
            </p>
          </div>
        </div>

        {/* Warning banner */}
        {totalCount >= WARN_THRESHOLD && (
          <div className="flex items-center gap-2 px-4 py-3 bg-gold-light border border-gold-warm rounded-md text-caption font-sans text-text-primary">
            <span className="font-semibold">Warning:</span>
            Approaching entry limit ({totalCount}/{ENTRY_LIMIT}). Consider deleting old entries.
          </div>
        )}

        {loading && (
          <p className="text-body text-text-muted font-sans">Loading feelings...</p>
        )}
        {fetchError && (
          <p className="text-body text-error font-sans">{fetchError}</p>
        )}

        {!loading && !fetchError && (
          <>
            <div className="overflow-x-auto rounded-md shadow-subtle border border-border">
              <table className="w-full text-left text-body font-sans">
                <thead>
                  <tr className="bg-purple-light text-text-primary font-semibold text-caption">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Feeling</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3 hidden md:table-cell">Timestamp</th>
                    <th className="px-4 py-3 w-20 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {feelings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-text-muted">
                        No feelings found.
                      </td>
                    </tr>
                  )}
                  {feelings.map((f, idx) => (
                    <tr
                      key={f.feelingID}
                      className={idx % 2 === 0 ? 'bg-site-white' : 'bg-purple-soft/30'}
                    >
                      <td className="px-4 py-3 text-caption text-text-muted">
                        User {f.userID}
                      </td>
                      <td className="px-4 py-3 font-semibold">{f.feeling}</td>
                      <td className="px-4 py-3 text-text-muted">{f.subject || '—'}</td>
                      <td className="px-4 py-3 text-caption text-text-muted hidden md:table-cell">
                        {formatDateTime(f.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDelete(f.feelingID)}
                            disabled={deletingId === f.feelingID}
                            title="Delete feeling"
                            className="p-1.5 rounded-sm text-text-muted hover:text-error hover:bg-pink-light transition-colors duration-150 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-caption text-text-muted font-sans">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="gap-1"
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="gap-1"
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
