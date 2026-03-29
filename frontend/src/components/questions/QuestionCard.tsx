'use client';

// src/components/questions/QuestionCard.tsx
// Displays a question with each partner's answer columns side by side (desktop)
// or stacked with tabs (mobile)

import { useState } from 'react';
import type { Question, Answer } from '@/types/index';
import { USERS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { Edit2 } from 'lucide-react';
import AnswerEditor from './AnswerEditor';

interface QuestionCardProps {
  question: Question;
  /** Pre-loaded answers for this question */
  answers: Answer[];
  /** Called when an answer is created or updated so parent can update state */
  onAnswerChange: (updated: Answer) => void;
}

type EditingUser = typeof USERS.PARTNER_1.id | typeof USERS.PARTNER_2.id | null;

export default function QuestionCard({ question, answers, onAnswerChange }: QuestionCardProps) {
  const [editingUser, setEditingUser] = useState<EditingUser>(null);
  // Mobile tab: 'partner1' | 'partner2'
  const [activeTab, setActiveTab] = useState<'partner1' | 'partner2'>('partner1');

  const partner1Answer = answers.find((a) => a.userID === USERS.PARTNER_1.id);
  const partner2Answer = answers.find((a) => a.userID === USERS.PARTNER_2.id);

  function handleSave(saved: Answer) {
    onAnswerChange(saved);
    setEditingUser(null);
  }

  // ---- Sub-renderers -------------------------------------------------------

  function renderAnswerContent(
    userId: number,
    name: string,
    accentColor: string,
    borderColor: string,
    answer: Answer | undefined,
  ) {
    const isEditing = editingUser === userId;

    return (
      <div
        className={`flex-1 bg-site-white-pure rounded-md shadow-subtle flex flex-col gap-3 p-6 border-t-4 ${borderColor}`}
        style={{ minWidth: 0 }}
      >
        {/* Column heading */}
        <h3 className={`font-serif text-h3 font-semibold`} style={{ color: accentColor }}>
          {name}&apos;s Answer
        </h3>

        {isEditing ? (
          <AnswerEditor
            questionId={question.questionID}
            userId={userId}
            existingAnswer={answer}
            onSave={handleSave}
            onCancel={() => setEditingUser(null)}
          />
        ) : answer ? (
          <>
            <p className="font-sans text-body text-text-primary leading-relaxed whitespace-pre-wrap flex-1">
              {answer.text}
            </p>
            <p className="font-sans text-timestamp" style={{ color: '#E8C87A' }}>
              Answered: {formatDate(answer.timestamp)}
            </p>
            <button
              type="button"
              onClick={() => setEditingUser(userId as EditingUser)}
              aria-label={`Edit ${name}'s answer`}
              className="self-start inline-flex items-center gap-1.5 text-caption font-sans font-semibold text-text-muted hover:text-text-primary transition-colors duration-150"
            >
              <Edit2 size={13} />
              Edit
            </button>
          </>
        ) : (
          <>
            <p className="font-sans text-body text-text-muted italic flex-1">No answer yet.</p>
            <button
              type="button"
              onClick={() => setEditingUser(userId as EditingUser)}
              aria-label={`Add ${name}'s answer`}
              className="self-start inline-flex items-center gap-1.5 text-caption font-sans font-semibold text-pink-deep hover:underline transition-colors duration-150"
            >
              <Edit2 size={13} />
              Add answer
            </button>
          </>
        )}
      </div>
    );
  }

  // ---- Render --------------------------------------------------------------

  return (
    <article
      id={`question-${question.questionID}`}
      className="flex flex-col gap-6 scroll-mt-24"
    >
      {/* Question card */}
      <div className="bg-purple-soft border-l-4 border-purple-light rounded-md px-6 py-5">
        <h2 className="font-serif text-h2 text-text-primary leading-snug">{question.text}</h2>
      </div>

      {/* Answer columns — hidden on mobile, shown md+ */}
      <div className="hidden md:flex gap-4">
        {renderAnswerContent(
          USERS.PARTNER_1.id,
          USERS.PARTNER_1.name,
          '#F8B4C8',
          'border-t-pink-soft',
          partner1Answer,
        )}
        {renderAnswerContent(
          USERS.PARTNER_2.id,
          USERS.PARTNER_2.name,
          '#C9B8E8',
          'border-t-purple-light',
          partner2Answer,
        )}
      </div>

      {/* Mobile tab layout */}
      <div className="md:hidden flex flex-col gap-4">
        {/* Tab switcher */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('partner1')}
            className={`flex-1 py-2 rounded-pill text-caption font-sans font-semibold transition-colors duration-150 ${
              activeTab === 'partner1'
                ? 'bg-pink-soft text-white'
                : 'bg-pink-light text-text-primary hover:bg-pink-soft hover:text-white'
            }`}
          >
            {USERS.PARTNER_1.name}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('partner2')}
            className={`flex-1 py-2 rounded-pill text-caption font-sans font-semibold transition-colors duration-150 ${
              activeTab === 'partner2'
                ? 'bg-purple-light text-white'
                : 'bg-purple-soft text-text-primary hover:bg-purple-light hover:text-white'
            }`}
          >
            {USERS.PARTNER_2.name}
          </button>
        </div>

        {/* Active tab panel */}
        {activeTab === 'partner1'
          ? renderAnswerContent(
              USERS.PARTNER_1.id,
              USERS.PARTNER_1.name,
              '#F8B4C8',
              'border-t-pink-soft',
              partner1Answer,
            )
          : renderAnswerContent(
              USERS.PARTNER_2.id,
              USERS.PARTNER_2.name,
              '#C9B8E8',
              'border-t-purple-light',
              partner2Answer,
            )}
      </div>
    </article>
  );
}
