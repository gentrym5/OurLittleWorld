// src/components/home/FeatureCard.tsx
// Feature card with hover lift effect; links to a feature page

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

export default function FeatureCard({ icon: Icon, title, description, href }: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group block bg-site-white border border-border rounded-md shadow-subtle p-card
                 transition-all duration-200 ease-in-out
                 hover:-translate-y-1 hover:shadow-hover hover:border-pink-soft
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-soft focus-visible:ring-offset-2"
      aria-label={`Go to ${title}`}
    >
      {/* Icon */}
      <div className="mb-section">
        <Icon size={32} className="text-purple-deep" aria-hidden="true" />
      </div>

      {/* Title */}
      <h3 className="text-h3 font-serif text-text-primary mb-tight">{title}</h3>

      {/* Description */}
      <p className="text-body font-sans text-text-muted mb-section">{description}</p>

      {/* Go there link */}
      <span className="inline-flex items-center gap-1 text-caption font-sans font-semibold text-pink-deep
                       no-underline group-hover:underline transition-all duration-150">
        Go there
        <ArrowRight size={14} aria-hidden="true" />
      </span>
    </Link>
  );
}
