// src/app/privacy/page.tsx
// Privacy Policy page — Server Component, static content, consistent with site design

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — Our Little World',
  description: 'How we handle your data on Our Little World.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-8 group"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-0.5 transition-transform"
          aria-hidden="true"
        />
        Back to home
      </Link>

      {/* Title */}
      <h1 className="font-serif text-4xl text-text-primary mb-2">Privacy Policy</h1>
      <p className="text-text-muted text-sm mb-10">Last updated: March 2026</p>

      <div className="space-y-10 text-text-primary font-sans leading-relaxed">

        {/* Section 1 */}
        <section>
          <h2 className="font-serif text-xl mb-3">What we collect</h2>
          <p className="text-text-muted mb-3">
            This is a private website for two people. We collect only what you enter:
          </p>
          <ul className="list-disc list-inside space-y-1 text-text-muted pl-2">
            <li>Feelings — the words and context you log together</li>
            <li>Answers — your written responses to shared questions</li>
            <li>Photos — images you upload to your shared gallery</li>
            <li>Activity logs — page visits and actions, including IP address, for security monitoring</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="font-serif text-xl mb-3">How it is stored</h2>
          <ul className="list-disc list-inside space-y-1 text-text-muted pl-2">
            <li>
              <strong className="text-text-primary">Photos</strong> — stored securely on{' '}
              <a
                href="https://cloudinary.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-text-primary transition-colors"
              >
                Cloudinary
              </a>
              . Cloudinary is the only third-party service this site uses.
            </li>
            <li>
              <strong className="text-text-primary">All other data</strong> — stored in a private PostgreSQL database hosted on Railway. No data is shared with any other third party.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="font-serif text-xl mb-3">Who has access</h2>
          <p className="text-text-muted">
            Only the two site owners have access to this site and its data. There are no public accounts, no analytics services, no advertising networks, and no third-party tracking of any kind beyond Cloudinary for photo storage.
          </p>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="font-serif text-xl mb-3">Contact</h2>
          <p className="text-text-muted">
            This site is private and not intended for public use. If you have reached this page in error, please leave.
          </p>
        </section>

      </div>
    </div>
  );
}
