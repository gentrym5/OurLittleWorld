'use client';

// src/components/questions/AnswerEditor.tsx
// Inline editor for writing or updating an answer, with preview toggle

import { useState } from 'react';
import type { Answer, ApiError } from '@/types/index';
import { createAnswer, updateAnswer } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ToastContainer from '@/components/ui/ToastContainer';

interface AnswerEditorProps {
  questionId: number;
  userId: number;
  existingAnswer?: Answer;
  onSave: (answer: Answer) => void;
  onCancel: () => void;
}

export default function AnswerEditor({
  questionId,
  userId,
  existingAnswer,
  onSave,
  onCancel,
}: AnswerEditorProps) {
  const [text, setText] = useState(existingAnswer?.text ?? '');
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toasts, showSuccess, showError, dismiss } = useToast();

  async function handleSave() {
    const trimmed = text.trim();
    if (!trimmed) {
      showError('Answer cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      let saved: Answer;
      if (existingAnswer) {
        saved = await updateAnswer(existingAnswer.answerID, { text: trimmed });
      } else {
        saved = await createAnswer({ questionID: questionId, userID: userId, text: trimmed });
      }
      showSuccess('Answer saved!');
      onSave(saved);
    } catch (err) {
      const apiErr = err as ApiError;
      showError(apiErr?.message ?? 'Failed to save answer. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="flex flex-col gap-3">
        <Textarea
          label="Your answer"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your answer here..."
          disabled={saving}
        />

        <div className="flex flex-wrap items-center gap-2">
          {/* Save — filled pink pill */}
          <Button
            variant="primary"
            size="sm"
            className="rounded-pill"
            onClick={handleSave}
            loading={saving}
            loadingText="Saving..."
            disabled={saving}
          >
            Save
          </Button>

          {/* Preview — outlined purple */}
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            disabled={saving}
            className="px-3 py-1.5 text-caption font-sans font-semibold rounded-sm border border-purple-light text-purple-deep hover:bg-purple-soft transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Preview
          </button>

          {/* Cancel — ghost/text only */}
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-3 py-1.5 text-caption font-sans font-semibold text-text-muted hover:text-text-primary transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Preview modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Preview"
        maxWidth="max-w-lg"
      >
        <div className="min-h-[80px] font-sans text-body text-text-primary leading-relaxed whitespace-pre-wrap">
          {text.trim() ? text : <span className="text-text-muted italic">Nothing to preview yet.</span>}
        </div>
        <div className="mt-5 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setPreviewOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
}
