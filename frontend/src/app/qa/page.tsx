'use client';

// src/app/qa/page.tsx
// Questions & Answers page — fetches all questions on mount, renders QuestionCard list

import { useEffect, useState, useCallback } from 'react';
import type { Question, Answer, ApiError } from '@/types/index';
import { getQuestions, getAnswers } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';
import Button from '@/components/ui/Button';
import SkeletonCard from '@/components/ui/SkeletonCard';
import QuestionCard from '@/components/questions/QuestionCard';
import AddQuestionModal from '@/components/questions/AddQuestionModal';
import SuggestQuestion from '@/components/questions/SuggestQuestion';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

export default function QAPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [allExpanded, setAllExpanded] = useState(false);

  const { toasts, showError, dismiss } = useToast();

  // ---- Data fetching -------------------------------------------------------

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [qs, ans] = await Promise.all([getQuestions(), getAnswers()]);
      setQuestions(qs);
      setAnswers(ans);
    } catch (err) {
      const apiErr = err as ApiError;
      showError(apiErr?.message ?? 'Failed to load questions. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  // ---- Handlers ------------------------------------------------------------

  function handleAnswerChange(updated: Answer) {
    setAnswers((prev) => {
      const idx = prev.findIndex((a) => a.answerID === updated.answerID);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [...prev, updated];
    });
  }

  function handleQuestionCreated(question: Question) {
    setQuestions((prev) => [question, ...prev]);
  }

  function answersForQuestion(questionId: number): Answer[] {
    return answers.filter((a) => a.questionID === questionId);
  }

  // ---- Split questions: most recent shown, rest in collapsible list --------
  // Show top question prominently, all others in an expandable "All Questions" section

  const [featured, ...rest] = questions;

  // ---- Render --------------------------------------------------------------

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-10">

        {/* Page header */}
        <header className="flex flex-col gap-2">
          <h1 className="font-serif text-h1 text-text-primary">Questions &amp; Answers</h1>
          <p className="font-sans text-caption text-text-muted">
            A question a day keeps secrets away.
          </p>
        </header>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <SuggestQuestion questions={questions} onExpand={() => setAllExpanded(true)} />
          <Button
            variant="secondary"
            size="md"
            className="rounded-pill inline-flex items-center gap-2"
            onClick={() => setAddModalOpen(true)}
          >
            <Plus size={16} />
            Add Custom Question
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-sans text-body text-text-muted">
              No questions yet. Add the first one!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {/* Featured (most recent) question */}
            {featured && (
              <QuestionCard
                key={featured.questionID}
                question={featured}
                answers={answersForQuestion(featured.questionID)}
                onAnswerChange={handleAnswerChange}
              />
            )}

            {/* Collapsible "All Questions" section */}
            {rest.length > 0 && (
              <section className="flex flex-col gap-6">
                <button
                  type="button"
                  onClick={() => setAllExpanded((v) => !v)}
                  className="flex items-center gap-2 font-serif text-h2 text-text-primary hover:text-purple-deep transition-colors duration-150 self-start"
                  aria-expanded={allExpanded}
                >
                  All Questions
                  {allExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                </button>

                {allExpanded && (
                  <div className="flex flex-col gap-12">
                    {rest.map((q) => (
                      <QuestionCard
                        key={q.questionID}
                        question={q}
                        answers={answersForQuestion(q.questionID)}
                        onAnswerChange={handleAnswerChange}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>

      {/* Add Question Modal */}
      <AddQuestionModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={handleQuestionCreated}
      />
    </>
  );
}
