// src/lib/constants.ts
// App-wide constants

export const USERS = {
  PARTNER_1: { id: 1, name: 'Partner 1' },
  PARTNER_2: { id: 2, name: 'Partner 2' },
} as const;

export const MAX_FEELINGS = 500;

export const MAX_PHOTOS = 500;

export const TIMELINE_PAGE_SIZE = 10;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/qa', label: 'Questions & Answers' },
  { href: '/feelings', label: 'Feelings' },
  { href: '/photos', label: 'Photos' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/secure', label: 'For Our Eyes Only' },
] as const;
