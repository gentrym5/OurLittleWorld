'use client';

// src/app/feelings/page.tsx
// Feelings main page — form + 5 recent entries + "See All" link

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getFeelings, getFeelingsCount, deleteFeeling } from '@/lib/api';
import { MAX_FEELINGS } from '@/lib/constants';
import type { Feeling } from '@/types/index';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';
import FeelingForm from '@/components/feelings/FeelingForm';
import FeelingsList from '@/components/feelings/FeelingsList';
import Button from '@/components/ui/Button';
import SkeletonCard from '@/components/ui/SkeletonCard';

const RECENT_LIMIT = 5;
const APPROACHING_THRESHOLD = 450; // within 50 of 500

export default function FeelingsPage() {
  const [feelings, setFeelings] = useState<Feeling[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { toasts, showSuccess, showError, dismiss } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [recentFeelings, totalCount] = await Promise.all([
        getFeelings(RECENT_LIMIT),
        getFeelingsCount(),
      ]);
      setFeelings(recentFeelings);
      setCount(totalCount);
    } catch {
      setLoadError('Failed to load feelings. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleFormSuccess() {
    showSuccess('Feeling saved!');
    await loadData();
  }

  function handleFormError(message: string) {
    showError(message);
  }

  async function handleDelete(id: number) {
    try {
      await deleteFeeling(id);
      showSuccess('Feeling deleted.');
      await loadData();
    } catch {
      showError('Failed to delete feeling. Please try again.');
    }
  }

  const atLimit = count !== null && count >= MAX_FEELINGS;
  const approaching = count !== null && count >= APPROACHING_THRESHOLD && !atLimit;

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Page header */}
        <header className="mb-10">
          <h1 className="font-serif text-h1 font-semibold text-text-primary leading-tight">
            Feelings
          </h1>
          <p className="text-caption font-sans text-text-muted mt-1">
            How are you feeling today?
          </p>
        </header>

        {/* Usage banner */}
        {atLimit && (
          <div
            role="alert"
            className="mb-6 px-4 py-3 rounded-md bg-error/10 border border-error text-error font-sans text-caption"
          >
            You&apos;ve reached the maximum entries (500). Delete old entries to add new ones.
          </div>
        )}
        {approaching && count !== null && (
          <div className="mb-6 px-4 py-3 rounded-md bg-gold-light border border-gold-warm text-text-primary font-sans text-caption">
            {count} of {MAX_FEELINGS} entries used.
          </div>
        )}

        {/* Entry form */}
        <section
          aria-label="Log a feeling"
          className="bg-site-white-pure shadow-subtle rounded-md p-8 mb-10"
        >
          <FeelingForm
            onSuccess={handleFormSuccess}
            onError={handleFormError}
            disabled={atLimit}
          />
        </section>

        {/* Recent entries */}
        <section aria-label="Recent feelings">
          <h2 className="font-serif text-h2 font-semibold text-text-primary mb-4">
            Recent Entries
          </h2>
          <hr className="border-border mb-6" />

          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : loadError ? (
            <p role="alert" className="text-body font-sans text-error text-center py-6">
              {loadError}
            </p>
          ) : (
            <FeelingsList feelings={feelings} onDelete={handleDelete} />
          )}
        </section>

        {/* See All button */}
        <div className="mt-8 flex justify-center">
          <Link href="/feelings/all">
            <Button variant="secondary" size="md" className="rounded-full">
              See All Feelings
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
