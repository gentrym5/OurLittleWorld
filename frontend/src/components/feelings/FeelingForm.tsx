'use client';

// src/components/feelings/FeelingForm.tsx
// Form for logging a new feeling with autocomplete, user selector, and validation

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
  ChangeEvent,
} from 'react';
import { X } from 'lucide-react';
import { FEELINGS_LIST } from '@/lib/feelings';
import { USERS } from '@/lib/constants';
import { createFeeling } from '@/lib/api';
import { cn } from '@/lib/cn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

const MAX_DROPDOWN = 8;
const MAX_SUBJECT = 100;
const MAX_CONTEXT = 1000;

interface FeelingFormProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
  disabled?: boolean;
}

export default function FeelingForm({ onSuccess, onError, disabled = false }: FeelingFormProps) {
  // --- Autocomplete state ---
  const [inputValue, setInputValue] = useState('');
  const [selectedFeeling, setSelectedFeeling] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Form state ---
  const [selectedUser, setSelectedUser] = useState<number>(USERS.PARTNER_1.id);
  const [subject, setSubject] = useState('');
  const [context, setContext] = useState('');
  const [errors, setErrors] = useState<{ feeling?: string; subject?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Filtered options
  const filteredOptions = inputValue.trim()
    ? FEELINGS_LIST.filter((f) =>
        f.toLowerCase().includes(inputValue.toLowerCase()),
      ).slice(0, MAX_DROPDOWN)
    : [];

  // Keep dropdown in sync
  useEffect(() => {
    if (filteredOptions.length > 0 && inputValue && !selectedFeeling) {
      setDropdownOpen(true);
    } else {
      setDropdownOpen(false);
      setActiveIndex(-1);
    }
  }, [inputValue, filteredOptions.length, selectedFeeling]);

  // Close dropdown on outside click
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectOption(value: string) {
    setSelectedFeeling(value);
    setInputValue(value);
    setDropdownOpen(false);
    setActiveIndex(-1);
    setErrors((prev) => ({ ...prev, feeling: undefined }));
  }

  function clearSelection() {
    setSelectedFeeling('');
    setInputValue('');
    setDropdownOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    setSelectedFeeling(''); // clear selection if user edits
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!dropdownOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && filteredOptions[activeIndex]) {
        selectOption(filteredOptions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
      setActiveIndex(-1);
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && dropdownRef.current) {
      const item = dropdownRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // --- Validation ---
  function validate(): boolean {
    const newErrors: { feeling?: string; subject?: string } = {};
    if (!selectedFeeling) {
      newErrors.feeling = 'Please select a feeling from the list.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // --- Submit ---
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      setSubmitting(true);
      try {
        await createFeeling({
          userID: selectedUser,
          feeling: selectedFeeling,
          subject: subject.trim(),
          context: context.trim(),
        });
        // Reset form
        setSelectedFeeling('');
        setInputValue('');
        setSubject('');
        setContext('');
        setErrors({});
        onSuccess?.();
      } catch (err) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Failed to save feeling. Please try again.';
        onError?.(message);
      } finally {
        setSubmitting(false);
      }
    },
    [selectedUser, selectedFeeling, subject, context, onSuccess, onError],
  );

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Log a feeling"
      className="flex flex-col gap-5"
    >
      {/* ---- Feeling autocomplete ---- */}
      <div className="flex flex-col gap-1.5" ref={containerRef}>
        <label className="text-caption font-sans font-semibold text-text-primary">
          How are you feeling?
        </label>

        <div className="relative">
          {/* Input row with clear button */}
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={dropdownOpen}
              aria-autocomplete="list"
              aria-controls="feeling-listbox"
              aria-activedescendant={
                activeIndex >= 0 ? `feeling-option-${activeIndex}` : undefined
              }
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (filteredOptions.length > 0 && !selectedFeeling) {
                  setDropdownOpen(true);
                }
              }}
              placeholder="Type to search feelings..."
              disabled={disabled || submitting}
              autoComplete="off"
              className={cn(
                'w-full px-3 py-2.5 pr-9 rounded-sm border border-border bg-site-white-pure font-sans text-body text-text-primary placeholder:text-text-muted',
                'transition-shadow duration-150 outline-none',
                'focus:shadow-focus focus:border-pink-soft',
                errors.feeling && 'border-error focus:border-error focus:shadow-none',
                (disabled || submitting) && 'opacity-70 cursor-not-allowed',
              )}
            />
            {inputValue && (
              <button
                type="button"
                onClick={clearSelection}
                aria-label="Clear feeling selection"
                className="absolute right-2.5 text-text-muted hover:text-text-primary transition-colors duration-150 cursor-pointer"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {dropdownOpen && filteredOptions.length > 0 && (
            <ul
              id="feeling-listbox"
              ref={dropdownRef}
              role="listbox"
              aria-label="Feeling options"
              className="absolute z-20 left-0 right-0 mt-1 bg-site-white-pure shadow-hover rounded-md max-h-[200px] overflow-y-auto border border-border"
            >
              {filteredOptions.map((option, index) => (
                <li
                  key={option}
                  id={`feeling-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent blur before click
                    selectOption(option);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    'px-4 py-2.5 font-sans text-body text-text-primary cursor-pointer transition-colors duration-100',
                    index === activeIndex ? 'bg-pink-light' : 'hover:bg-pink-light',
                  )}
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>

        {errors.feeling && (
          <p role="alert" className="text-caption text-error font-sans">
            {errors.feeling}
          </p>
        )}
      </div>

      {/* ---- User selector ---- */}
      <div className="flex flex-col gap-1.5">
        <span className="text-caption font-sans font-semibold text-text-primary">
          Who is feeling this?
        </span>
        <div className="flex gap-2" role="group" aria-label="Select user">
          {[USERS.PARTNER_1, USERS.PARTNER_2].map((user) => (
            <button
              key={user.id}
              type="button"
              aria-pressed={selectedUser === user.id}
              onClick={() => setSelectedUser(user.id)}
              disabled={disabled || submitting}
              className={cn(
                'px-5 py-2 rounded-full text-btn font-sans font-semibold transition-colors duration-150 cursor-pointer outline-none',
                'focus-visible:ring-2 focus-visible:ring-offset-2',
                selectedUser === user.id
                  ? user.id === USERS.PARTNER_1.id
                    ? 'bg-pink-soft text-white focus-visible:ring-pink-soft'
                    : 'bg-purple-deep text-white focus-visible:ring-purple-deep'
                  : 'bg-purple-soft text-text-primary hover:bg-purple-light focus-visible:ring-purple-light',
                (disabled || submitting) && 'opacity-70 cursor-not-allowed pointer-events-none',
              )}
            >
              {user.name}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Subject ---- */}
      <div className="flex flex-col gap-1.5">
        <Input
          label="Subject (optional)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={MAX_SUBJECT}
          placeholder="What is this feeling about?"
          disabled={disabled || submitting}
          error={errors.subject}
          helperText={`${subject.length} / ${MAX_SUBJECT}`}
        />
      </div>

      {/* ---- Context ---- */}
      <div className="flex flex-col gap-1.5">
        <Textarea
          label="Context (optional)"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          maxLength={MAX_CONTEXT}
          rows={4}
          placeholder="Share a little more about how you're feeling..."
          disabled={disabled || submitting}
          helperText={`${context.length} / ${MAX_CONTEXT}`}
        />
      </div>

      {/* ---- Submit ---- */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={submitting}
        loadingText="Saving..."
        disabled={disabled}
        className="w-full rounded-full h-12"
      >
        Save Feeling
      </Button>
    </form>
  );
}
