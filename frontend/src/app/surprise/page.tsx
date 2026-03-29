'use client';

// src/app/surprise/page.tsx
// Surprise Me — fetches a random question, feeling, or timeline entry on mount
// and on every button click. Displays the result based on the `type` field.

import { useEffect, useState, useCallback } from 'react';
import { Sparkles, RefreshCw, Heart } from 'lucide-react';
import { getSurpriseItem } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';
import type { SurpriseDto, Question, Feeling, TimelineEntry, ApiError } from '@/types/index';

// ---------------------------------------------------------------------------
// Helpers — narrow the unknown data based on type string
// ---------------------------------------------------------------------------

function isQuestion(type: string, data: unknown): data is Question {
  return type === 'question';
}

function isFeeling(type: string, data: unknown): data is Feeling {
  return type === 'feeling';
}

function isTimeline(type: string, data: unknown): data is TimelineEntry {
  return type === 'timeline';
}

// ---------------------------------------------------------------------------
// Sub-components for each content type
// ---------------------------------------------------------------------------

function QuestionDisplay({ question }: { question: Question }) {
  return (
    <div className="text-center max-w-xl mx-auto">
      <p className="text-caption font-sans text-text-muted uppercase tracking-widest mb-tight">
        A question for you
      </p>
      <blockquote className="text-h2 font-serif text-text-primary leading-relaxed">
        &ldquo;{question.text}&rdquo;
      </blockquote>
    </div>
  );
}

function FeelingDisplay({ feeling }: { feeling: Feeling }) {
  return (
    <div className="text-center max-w-xl mx-auto">
      <p className="text-caption font-sans text-text-muted uppercase tracking-widest mb-tight">
        A feeling logged
      </p>
      <div className="flex items-center justify-center gap-3 mb-section">
        <Heart size={32} className="text-pink-soft fill-pink-soft" aria-hidden="true" />
        <span className="text-display font-serif text-text-primary">{feeling.feeling}</span>
        <Heart size={32} className="text-pink-soft fill-pink-soft" aria-hidden="true" />
      </div>
      {feeling.subject && (
        <p className="text-body font-sans text-text-muted">
          About: <span className="font-semibold text-text-primary">{feeling.subject}</span>
        </p>
      )}
      {feeling.context && (
        <p className="text-body font-sans text-text-muted mt-tight italic">{feeling.context}</p>
      )}
    </div>
  );
}

function TimelineDisplay({ entry }: { entry: TimelineEntry }) {
  const formattedDate = new Date(entry.timestamp).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="text-center max-w-xl mx-auto">
      <p className="text-caption font-sans text-text-muted uppercase tracking-widest mb-tight">
        A memory from your timeline
      </p>
      <h2 className="text-h2 font-serif text-text-primary mb-tight">{entry.title}</h2>
      <p className="text-timestamp font-sans text-gold-warm mb-section">{formattedDate}</p>
      {entry.content && (
        <p className="text-body font-sans text-text-muted leading-relaxed">{entry.content}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading spinner — romantic heart pulse
// ---------------------------------------------------------------------------

function RomanticSpinner() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-section"
      role="status"
      aria-label="Loading your surprise"
    >
      <Heart
        size={48}
        className="text-pink-soft fill-pink-soft animate-heartPulse"
        aria-hidden="true"
      />
      <p className="text-caption font-sans text-text-muted">Finding something special&hellip;</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SurprisePage() {
  const [surprise, setSurprise] = useState<SurpriseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const { toasts, showError, dismiss } = useToast();

  const fetchSurprise = useCallback(async () => {
    setLoading(true);
    setSurprise(null);
    try {
      const result = await getSurpriseItem();
      setSurprise(result);
    } catch (err) {
      const apiErr = err as ApiError;
      showError(apiErr?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Fetch on mount
  useEffect(() => {
    fetchSurprise();
  }, [fetchSurprise]);

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="min-h-screen flex flex-col items-center justify-start px-base py-page">
        {/* Page heading */}
        <header className="text-center mb-gap">
          <div className="flex items-center justify-center gap-2 mb-section">
            <Sparkles size={24} className="text-purple-deep" aria-hidden="true" />
            <h1 className="text-h1 font-serif text-text-primary">Surprise Me</h1>
            <Sparkles size={24} className="text-purple-deep" aria-hidden="true" />
          </div>
          <p className="text-body font-sans text-text-muted max-w-md mx-auto">
            Something special picked just for the two of you — a question, a feeling, or a memory.
          </p>
        </header>

        {/* Content card */}
        <div
          className="w-full max-w-2xl bg-site-white border border-border rounded-lg shadow-subtle
                     px-card py-gap flex flex-col items-center min-h-[220px] justify-center"
        >
          {loading && <RomanticSpinner />}

          {!loading && surprise && (
            <>
              {isQuestion(surprise.type, surprise.data) && (
                <QuestionDisplay question={surprise.data} />
              )}
              {isFeeling(surprise.type, surprise.data) && (
                <FeelingDisplay feeling={surprise.data} />
              )}
              {isTimeline(surprise.type, surprise.data) && (
                <TimelineDisplay entry={surprise.data} />
              )}
              {/* Fallback for unrecognised type */}
              {!isQuestion(surprise.type, surprise.data) &&
                !isFeeling(surprise.type, surprise.data) &&
                !isTimeline(surprise.type, surprise.data) && (
                  <p className="text-body font-sans text-text-muted text-center">
                    Something unexpected came up. Try again?
                  </p>
                )}
            </>
          )}

          {!loading && !surprise && (
            <p className="text-body font-sans text-text-muted text-center">
              Could not load a surprise right now. Give it another go.
            </p>
          )}
        </div>

        {/* Surprise Me Again button */}
        <button
          onClick={fetchSurprise}
          disabled={loading}
          aria-label="Get another surprise"
          className="mt-gap inline-flex items-center gap-2 px-8 h-12 rounded-pill
                     bg-pink-soft text-text-primary font-sans font-semibold text-btn
                     shadow-subtle transition-all duration-200
                     hover:bg-pink-deep hover:scale-[1.03] hover:shadow-hover
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-soft focus-visible:ring-offset-2
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          <RefreshCw size={16} aria-hidden="true" className={loading ? 'animate-spin' : ''} />
          Surprise Me Again
        </button>
      </div>
    </>
  );
}
