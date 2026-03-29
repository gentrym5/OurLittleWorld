'use client';

// src/components/timeline/AddMemoryModal.tsx
// Modal form to create a new timeline memory

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { createTimelineEntry } from '@/lib/api';
import { USERS } from '@/lib/constants';
import type { TimelineEntry } from '@/types/index';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newEntry: TimelineEntry) => void;
  onError: (message: string) => void;
}

interface FormErrors {
  title?: string;
  content?: string;
}

export default function AddMemoryModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: AddMemoryModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(todayISO);
  const [selectedUserID, setSelectedUserID] = useState<number>(USERS.PARTNER_1.id);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!title.trim()) next.title = 'Title is required.';
    else if (title.trim().length > 100) next.title = 'Title must be 100 characters or fewer.';
    if (!content.trim()) next.content = 'Content is required.';
    else if (content.trim().length > 1000) next.content = 'Content must be 1000 characters or fewer.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Combine the selected date with the current time so the timestamp is
      // meaningful while still reflecting the user's chosen date.
      const now = new Date();
      const [year, month, day] = date.split('-').map(Number);
      const timestamp = new Date(
        year,
        month - 1,
        day,
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
      ).toISOString();

      const newEntry = await createTimelineEntry({
        userID: selectedUserID,
        title: title.trim(),
        content: content.trim(),
        // The backend CreateTimelineEntryRequest accepts an optional timestamp;
        // if the API doesn't support it yet, the server will use its own timestamp.
        // We pass it here for future-proofing.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        timestamp,
      } as any);

      onSuccess(newEntry);
      handleClose();
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to save memory. Please try again.';
      onError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setTitle('');
    setContent('');
    setDate(todayISO());
    setSelectedUserID(USERS.PARTNER_1.id);
    setErrors({});
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add a Memory" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* Title */}
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's this memory called?"
          maxLength={100}
          error={errors.title}
          disabled={submitting}
          required
        />

        {/* Content */}
        <Textarea
          label="Memory"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tell the story…"
          maxLength={1000}
          rows={5}
          error={errors.content}
          disabled={submitting}
          required
        />

        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-caption font-sans font-semibold text-text-primary">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={submitting}
            max={todayISO()}
            className={cn(
              'w-full px-3 py-2.5 rounded-sm border border-border bg-site-white-pure',
              'font-sans text-body text-text-primary',
              'transition-shadow duration-150 outline-none',
              'focus:shadow-focus focus:border-pink-soft',
              submitting && 'opacity-70 cursor-not-allowed',
            )}
          />
        </div>

        {/* User selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-caption font-sans font-semibold text-text-primary">
            Who is sharing this memory?
          </span>
          <div className="flex gap-3">
            {[USERS.PARTNER_1, USERS.PARTNER_2].map((user) => (
              <button
                key={user.id}
                type="button"
                disabled={submitting}
                onClick={() => setSelectedUserID(user.id)}
                className={cn(
                  'px-4 py-1.5 rounded-pill font-sans text-caption font-semibold transition-colors duration-150',
                  selectedUserID === user.id
                    ? user.id === USERS.PARTNER_1.id
                      ? 'bg-pink-soft text-white'
                      : 'bg-purple-light text-text-primary'
                    : 'bg-site-white border border-border text-text-muted hover:border-pink-soft',
                  submitting && 'opacity-70 cursor-not-allowed pointer-events-none',
                )}
              >
                {user.name}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={submitting}
            loadingText="Saving…"
          >
            Save Memory
          </Button>
        </div>
      </form>
    </Modal>
  );
}
