// src/components/feelings/FeelingEntry.tsx
// Single feeling entry card with delete confirmation

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Feeling } from '@/types/index';
import { USERS } from '@/lib/constants';
import { formatRelative, formatDateTime } from '@/lib/format';
import { cn } from '@/lib/cn';
import Button from '@/components/ui/Button';

interface FeelingEntryProps {
  feeling: Feeling;
  onDelete: (id: number) => void;
}

export default function FeelingEntry({ feeling, onDelete }: FeelingEntryProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isPartner1 = feeling.userID === USERS.PARTNER_1.id;
  const userName = isPartner1 ? USERS.PARTNER_1.name : USERS.PARTNER_2.name;

  async function handleDelete() {
    setDeleting(true);
    await onDelete(feeling.feelingID);
    setDeleting(false);
    setConfirming(false);
  }

  return (
    <article className="bg-site-white-pure shadow-subtle rounded-md px-6 py-5 flex flex-col gap-3">
      {/* Top row: feeling badge + user tag + timestamp */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Feeling word badge */}
        <span
          className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-caption font-semibold font-sans',
            isPartner1
              ? 'bg-pink-light text-pink-deep'
              : 'bg-purple-soft text-purple-deep',
          )}
        >
          {feeling.feeling}
        </span>

        {/* User tag */}
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-sans',
            isPartner1
              ? 'bg-pink-soft/30 text-pink-deep'
              : 'bg-purple-light/40 text-purple-deep',
          )}
        >
          {userName}
        </span>

        {/* Timestamp — gold, pushed right */}
        <time
          dateTime={feeling.timestamp}
          title={formatDateTime(feeling.timestamp)}
          className="ml-auto text-caption font-sans text-gold-warm shrink-0"
        >
          {formatRelative(feeling.timestamp)}
        </time>
      </div>

      {/* Subject */}
      {feeling.subject && (
        <p className="font-sans font-bold text-body text-text-primary leading-snug">
          {feeling.subject}
        </p>
      )}

      {/* Context — truncated at 2 lines */}
      {feeling.context && (
        <p className="font-sans text-body text-text-primary leading-relaxed line-clamp-2">
          {feeling.context}
        </p>
      )}

      {/* Delete controls */}
      <div className="flex items-center gap-3 pt-1">
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            aria-label="Delete this feeling entry"
            className="inline-flex items-center gap-1.5 text-caption font-sans text-text-muted hover:text-error transition-colors duration-150 cursor-pointer"
          >
            <Trash2 size={14} aria-hidden="true" />
            Delete
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-caption font-sans text-text-primary">Are you sure?</span>
            <Button
              variant="danger"
              size="sm"
              loading={deleting}
              loadingText="Deleting..."
              onClick={handleDelete}
            >
              Yes, delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={deleting}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
