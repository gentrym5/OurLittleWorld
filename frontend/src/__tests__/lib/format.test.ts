// __tests__/lib/format.test.ts
// Unit tests for date/time formatting helpers in src/lib/format.ts

import { formatDate, formatRelative } from '@/lib/format';

describe('formatDate', () => {
  it('returns a string containing "March" for a March date', () => {
    const result = formatDate('2026-03-26T00:00:00Z');
    expect(result).toContain('March');
  });

  it('returns a string containing "2026" for a 2026 date', () => {
    const result = formatDate('2026-03-26T00:00:00Z');
    expect(result).toContain('2026');
  });

  it('returns a string containing both the month name and year', () => {
    const result = formatDate('2026-03-26T00:00:00Z');
    expect(result).toMatch(/March/);
    expect(result).toMatch(/2026/);
  });

  it('does not throw when given an invalid date string', () => {
    expect(() => formatDate('not-a-date')).not.toThrow();
  });

  it('does not throw when given an empty string', () => {
    expect(() => formatDate('')).not.toThrow();
  });

  it('returns a non-empty string for a valid ISO date', () => {
    const result = formatDate('2025-12-01T12:00:00Z');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatRelative', () => {
  it('returns "just now" for a timestamp less than 60 seconds ago', () => {
    const fiveSecondsAgo = new Date(Date.now() - 5_000).toISOString();
    expect(formatRelative(fiveSecondsAgo)).toBe('just now');
  });

  it('returns a string containing "ago" for a timestamp from yesterday', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelative(yesterday);
    expect(result).toContain('ago');
  });

  it('returns a string containing "minute" for a timestamp ~2 minutes ago', () => {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const result = formatRelative(twoMinutesAgo);
    expect(result).toContain('minute');
  });

  it('returns a string containing "hour" for a timestamp ~3 hours ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    const result = formatRelative(threeHoursAgo);
    expect(result).toContain('hour');
  });

  it('returns a string containing "day" for a timestamp ~5 days ago', () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelative(fiveDaysAgo);
    expect(result).toContain('day');
  });
});
