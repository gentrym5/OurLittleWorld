'use client';

// src/components/questions/AddQuestionModal.tsx
// Modal form for adding a custom question

import { useState, useRef, useEffect } from 'react';
import type { Question, ApiError } from '@/types/index';
import { createQuestion } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import ToastContainer from '@/components/ui/ToastContainer';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (question: Question) => void;
}

export default function AddQuestionModal({ isOpen, onClose, onCreated }: AddQuestionModalProps) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const { toasts, showSuccess, showError, dismiss } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setText('');
      // Small delay to let Modal finish rendering / focus trap
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      showError('Please enter a question.');
      return;
    }

    setSaving(true);
    try {
      const question = await createQuestion(trimmed, false);
      showSuccess('Question added!');
      onCreated(question);
      onClose();
    } catch (err) {
      const apiErr = err as ApiError;
      showError(apiErr?.message ?? 'Failed to add question. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <Modal isOpen={isOpen} onClose={onClose} title="Add a Custom Question" maxWidth="max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="new-question-text"
              className="text-caption font-sans font-semibold text-text-primary"
            >
              Question
            </label>
            <input
              ref={inputRef}
              id="new-question-text"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask each other something..."
              disabled={saving}
              maxLength={500}
              className="w-full px-3 py-2.5 rounded-sm border border-border bg-site-white-pure font-sans text-body text-text-primary placeholder:text-text-muted outline-none transition-shadow duration-150 focus:shadow-focus focus:border-pink-soft disabled:opacity-60"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="rounded-pill"
              loading={saving}
              loadingText="Adding..."
              disabled={saving}
            >
              Add Question
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
