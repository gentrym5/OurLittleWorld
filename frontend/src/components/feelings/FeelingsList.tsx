'use client';

// src/components/feelings/FeelingsList.tsx
// Renders a list of FeelingEntry components

import type { Feeling } from '@/types/index';
import FeelingEntry from './FeelingEntry';

interface FeelingsListProps {
  feelings: Feeling[];
  onDelete: (id: number) => void;
}

export default function FeelingsList({ feelings, onDelete }: FeelingsListProps) {
  if (feelings.length === 0) {
    return (
      <p className="text-body font-sans text-text-muted text-center py-8">
        No feelings recorded yet. Add your first one above!
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4" aria-label="Feelings entries">
      {feelings.map((feeling) => (
        <li key={feeling.feelingID}>
          <FeelingEntry feeling={feeling} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}
