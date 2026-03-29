'use client';

// src/components/questions/SuggestQuestion.tsx
// Picks a random predefined question from the already-loaded list and scrolls to its card

import type { Question } from '@/types/index';
import Button from '@/components/ui/Button';
import { Sparkles } from 'lucide-react';

interface SuggestQuestionProps {
  questions: Question[];
  /** Called before scrolling when the target question is not the featured one */
  onExpand?: () => void;
}

export default function SuggestQuestion({ questions, onExpand }: SuggestQuestionProps) {
  function handleSuggest() {
    const predefined = questions.filter((q) => q.isPredefined);
    if (predefined.length === 0) return;

    const randomIndex = Math.floor(Math.random() * predefined.length);
    const picked = predefined[randomIndex];

    // If the element is not yet in the DOM (collapsed accordion), expand first then scroll.
    const el = document.getElementById(`question-${picked.questionID}`);
    if (!el && onExpand) {
      onExpand();
      // Wait one frame for React to render the expanded list before scrolling.
      requestAnimationFrame(() => {
        const expanded = document.getElementById(`question-${picked.questionID}`);
        if (expanded) {
          expanded.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <Button
      variant="primary"
      size="md"
      className="rounded-pill inline-flex items-center gap-2"
      onClick={handleSuggest}
      disabled={questions.filter((q) => q.isPredefined).length === 0}
    >
      <Sparkles size={16} />
      Suggest a Question
    </Button>
  );
}
