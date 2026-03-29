'use client';

// src/components/admin/AdminActivityTab.tsx
// Read-only paginated activity log table — Timestamp | IP | Page | Action

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getActivityLogs } from '@/lib/api';
import type { ActivityLog } from '@/lib/api';
import type { ApiError } from '@/types/index';
import { formatDateTime } from '@/lib/format';
import Button from '@/components/ui/Button';

const PAGE_SIZE = 20;

export default function AdminActivityTab() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  async function fetchLogs(p: number) {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getActivityLogs(p, PAGE_SIZE);
      setLogs(data.items);
      setTotalCount(data.totalCount);
    } catch (err) {
      const apiErr = err as ApiError;
      setFetchError(apiErr?.message ?? 'Failed to load activity logs.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-serif text-h2 text-text-primary">Activity Log</h2>
        <p className="text-caption text-text-muted font-sans">{totalCount} total entries</p>
      </div>

      {loading && (
        <p className="text-body text-text-muted font-sans">Loading activity logs...</p>
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
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3 hidden sm:table-cell">IP Address</th>
                  <th className="px-4 py-3">Page</th>
                  <th className="px-4 py-3 hidden md:table-cell">Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-text-muted">
                      No activity logs found.
                    </td>
                  </tr>
                )}
                {logs.map((log, idx) => (
                  <tr
                    key={log.logID}
                    className={idx % 2 === 0 ? 'bg-site-white' : 'bg-purple-soft/30'}
                  >
                    <td className="px-4 py-3 text-caption text-text-muted whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-caption text-text-muted font-mono hidden sm:table-cell">
                      {log.ipAddress}
                    </td>
                    <td className="px-4 py-3 text-caption">{log.page}</td>
                    <td className="px-4 py-3 text-caption text-text-muted hidden md:table-cell">
                      {log.action}
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
  );
}
