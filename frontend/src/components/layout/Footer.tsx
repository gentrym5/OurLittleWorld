// src/components/layout/Footer.tsx
// Site footer with gradient background, nav links, privacy policy, and copyright

import Link from 'next/link';
import { Heart } from 'lucide-react';

const FOOTER_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/qa', label: 'Q&A' },
  { href: '/feelings', label: 'Feelings' },
  { href: '/photos', label: 'Photos' },
  { href: '/timeline', label: 'Timeline' },
] as const;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-purple-soft to-pink-light mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-gap space-y-6">
        {/* Made with love */}
        <div className="flex items-center justify-center gap-2">
          <Heart
            size={20}
            className="text-pink-soft fill-pink-soft shrink-0"
            aria-hidden="true"
          />
          <p className="font-sans text-caption text-text-muted">
            Made with love
          </p>
        </div>

        {/* Navigation links */}
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2" role="list">
            {FOOTER_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="font-sans text-caption text-purple-deep no-underline hover:underline transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-pink-soft rounded-sm"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-border">
          <Link
            href="/privacy"
            className="font-sans text-caption text-purple-deep no-underline hover:underline transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-pink-soft rounded-sm"
          >
            Privacy Policy
          </Link>
          <p className="font-sans text-caption text-text-muted">
            &copy; {currentYear} Our Little World
          </p>
        </div>
      </div>
    </footer>
  );
}
