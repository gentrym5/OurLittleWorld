// src/app/page.tsx
// Home page — Server Component
// Hero section + floating love notes + feature cards grid + Surprise Me CTA

import Link from 'next/link';
import {
  MessageCircle,
  Smile,
  Image,
  Lock,
  Clock,
  Sparkles,
} from 'lucide-react';
import FloatingNotes from '@/components/home/FloatingNotes';
import FeatureCard from '@/components/home/FeatureCard';

// ---------------------------------------------------------------------------
// Feature card data
// ---------------------------------------------------------------------------

const features = [
  {
    icon: MessageCircle,
    title: 'Questions & Answers',
    description: 'Share thoughts, answer prompts together, and discover each other a little more every day.',
    href: '/qa',
  },
  {
    icon: Smile,
    title: 'Feelings',
    description: 'Log how you feel each day — the big emotions and the quiet little ones.',
    href: '/feelings',
  },
  {
    icon: Image,
    title: 'Photos',
    description: 'Capture your favourite moments and keep them in one beautiful place.',
    href: '/photos',
  },
  {
    icon: Lock,
    title: 'For Our Eyes Only',
    description: 'Your most private space — protected and just for the two of you.',
    href: '/secure',
  },
  {
    icon: Clock,
    title: 'Memory Timeline',
    description: 'Relive your journey together, milestone by milestone.',
    href: '/timeline',
  },
  {
    icon: Sparkles,
    title: 'Surprise Me',
    description: 'Let us pick something special — a question, a feeling, or a memory — just for you.',
    href: '/surprise',
  },
] as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ------------------------------------------------------------------ */}
      {/* Hero section                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="relative overflow-hidden px-base py-page text-center"
        style={{
          background:
            'radial-gradient(ellipse at center, #FDE8EF 0%, #EDE6F8 100%)',
        }}
        aria-label="Hero"
      >
        {/* Floating love notes — absolutely positioned inside the hero */}
        <FloatingNotes />

        {/* Content sits above the floating notes */}
        <div className="relative z-10 mx-auto max-w-2xl">
          {/* Display heading */}
          <h1 className="text-display font-serif font-bold text-text-primary mb-section">
            Our Little World
          </h1>

          {/* Romantic subtitle */}
          <p className="text-body font-sans text-text-muted max-w-[540px] mx-auto mb-gap">
            A private space built with love — just for the two of us. Somewhere
            to share questions, log feelings, revisit memories, and always find
            our way back to each other.
          </p>

          {/* Small heart divider */}
          <div className="flex items-center justify-center gap-3 text-pink-soft text-h2 select-none" aria-hidden="true">
            <span>&#9835;</span>
            <span>&#9829;</span>
            <span>&#9835;</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Feature cards grid                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="px-base py-gap max-w-6xl mx-auto" aria-label="Features">
        <div className="grid grid-cols-1 gap-section sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.href}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              href={feature.href}
            />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Surprise Me CTA                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-gap text-center" aria-label="Surprise Me call to action">
        <Link
          href="/surprise"
          className="inline-flex items-center gap-2 px-8 h-12 rounded-pill
                     bg-pink-soft text-text-primary font-sans font-semibold text-btn
                     shadow-subtle transition-all duration-200
                     hover:bg-pink-deep hover:scale-[1.03] hover:shadow-hover
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-soft focus-visible:ring-offset-2"
          aria-label="Go to Surprise Me page"
        >
          <Sparkles size={18} aria-hidden="true" />
          Surprise Me
        </Link>
        <p className="mt-tight text-caption font-sans text-text-muted">
          Picks a random question, feeling, or memory — just for you.
        </p>
      </section>
    </div>
  );
}
