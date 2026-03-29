'use client';

// src/components/admin/AdminQuestionsTab.tsx
// Admin CRUD table for questions — inline edit, delete with confirm, add via modal

import { useState, useEffect, useRef } from 'react';
import { Edit2, Trash2, Check, X as XIcon } from 'lucide-react';
import { getQuestions, updateQuestion, deleteQuestion } from '@/lib/api';
import type { Question, ApiError } from '@/types/index';
import { useToast } from '@/hooks/useToast';
import Button from '@/components/ui/Button';
import ToastContainer from '@/components/ui/ToastContainer';
import AddQuestionModal from '@/components/questions/AddQuestionModal';

export default function AdminQuestionsTab() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  const { toasts, showSuccess, showError, dismiss } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getQuestions();
      setQuestions(data);
    } catch (err) {
      const apiErr = err as ApiError;
      setFetchError(apiErr?.message ?? 'Failed to load questions.');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(q: Question) {
    setEditingId(q.questionID);
    setEditText(q.text);
    setTimeout(() => editInputRef.current?.focus(), 30);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText('');
  }

  async function saveEdit(id: number) {
    const trimmed = editText.trim();
    if (!trimmed) {
      showError('Question text cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateQuestion(id, trimmed);
      setQuestions((prev) =>
        prev.map((q) => (q.questionID === id ? { ...q, text: updated.text } : q)),
      );
      showSuccess('Question updated.');
      setEditingId(null);
    } catch (err) {
      const apiErr = err as ApiError;
      showError(apiErr?.message ?? 'Failed to update question.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm('Delete this question? This action cannot be undone.');
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.questionID !== id));
      showSuccess('Question deleted.');
    } catch (err) {
      const apiErr = err as ApiError;
      showError(apiErr?.message ?? 'Failed to delete question.');
    } finally {
      setDeletingId(null);
    }
  }

  function handleQuestionCreated(q: Question) {
    setQuestions((prev) => [q, ...prev]);
  }

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <AddQuestionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={handleQuestionCreated}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-serif text-h2 text-text-primary">Questions</h2>
          <Button
            variant="primary"
            size="sm"
            className="rounded-pill"
            onClick={() => setShowAddModal(true)}
          >
            + Add Question
          </Button>
        </div>

        {loading && (
          <p className="text-body text-text-muted font-sans">Loading questions...</p>
        )}
        {fetchError && (
          <p className="text-body text-error font-sans">{fetchError}</p>
        )}

        {!loading && !fetchError && (
          <div className="overflow-x-auto rounded-md shadow-subtle border border-border">
            <table className="w-full text-left text-body font-sans">
              <thead>
                <tr className="bg-purple-light text-text-primary font-semibold text-caption">
                  <th className="px-4 py-3 w-16">ID</th>
                  <th className="px-4 py-3">Question Text</th>
                  <th className="px-4 py-3 w-32">Type</th>
                  <th className="px-4 py-3 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-text-muted">
                      No questions found.
                    </td>
                  </tr>
                )}
                {questions.map((q, idx) => (
                  <tr
                    key={q.questionID}
                    className={idx % 2 === 0 ? 'bg-site-white' : 'bg-purple-soft/30'}
                  >
                    <td className="px-4 py-3 text-caption text-text-muted">
                      {String(q.questionID).padStart(3, '0')}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === q.questionID ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(q.questionID);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className="w-full px-2 py-1 rounded-sm border border-pink-soft bg-site-white-pure font-sans text-body text-text-primary outline-none focus:shadow-focus"
                          disabled={saving}
                          maxLength={500}
                        />
                      ) : (
                        <span
                          className="cursor-pointer hover:text-purple-deep transition-colors duration-150"
                          onClick={() => startEdit(q)}
                          title="Click to edit"
                        >
                          {q.text}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          'inline-block px-2 py-0.5 rounded-pill text-caption font-semibold',
                          q.isPredefined
                            ? 'bg-purple-light text-text-primary'
                            : 'bg-pink-light text-pink-deep',
                        ].join(' ')}
                      >
                        {q.isPredefined ? 'Predefined' : 'Custom'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === q.questionID ? (
                          <>
                            <button
                              onClick={() => saveEdit(q.questionID)}
                              disabled={saving}
                              title="Save"
                              className="p-1.5 rounded-sm text-success hover:bg-purple-soft transition-colors duration-150 disabled:opacity-50"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={saving}
                              title="Cancel"
                              className="p-1.5 rounded-sm text-text-muted hover:bg-purple-soft transition-colors duration-150 disabled:opacity-50"
                            >
                              <XIcon size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(q)}
                              title="Edit question"
                              className="p-1.5 rounded-sm text-text-muted hover:text-purple-deep hover:bg-purple-soft transition-colors duration-150"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(q.questionID)}
                              disabled={deletingId === q.questionID}
                              title="Delete question"
                              className="p-1.5 rounded-sm text-text-muted hover:text-error hover:bg-pink-light transition-colors duration-150 disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
