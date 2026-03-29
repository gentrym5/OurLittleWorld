// __tests__/lib/feelings.test.ts
// Unit tests for the FEELINGS_LIST constant in src/lib/feelings.ts

import { FEELINGS_LIST } from '@/lib/feelings';

describe('FEELINGS_LIST', () => {
  it('has more than 50 items', () => {
    expect(FEELINGS_LIST.length).toBeGreaterThan(50);
  });

  it('is sorted alphabetically (case-insensitive)', () => {
    const sorted = [...FEELINGS_LIST].sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase()),
    );
    expect(FEELINGS_LIST).toEqual(sorted);
  });

  it('contains "Happy"', () => {
    expect(FEELINGS_LIST).toContain('Happy');
  });

  it('contains "Sad"', () => {
    expect(FEELINGS_LIST).toContain('Sad');
  });

  it('contains "Loved"', () => {
    expect(FEELINGS_LIST).toContain('Loved');
  });

  it('has no duplicate entries', () => {
    const unique = new Set(FEELINGS_LIST);
    expect(unique.size).toBe(FEELINGS_LIST.length);
  });

  it('contains only non-empty strings', () => {
    FEELINGS_LIST.forEach((item) => {
      expect(typeof item).toBe('string');
      expect(item.trim().length).toBeGreaterThan(0);
    });
  });
});
