'use client';

// src/components/layout/Navbar.tsx
// Fixed top navigation bar with mobile hamburger overlay and scroll blur

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Menu, X, Home, MessageCircle, Smile, Image, Clock, Lock, Settings } from 'lucide-react';
import { cn } from '@/lib/cn';

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Home', icon: <Home size={18} aria-hidden="true" /> },
  { href: '/qa', label: 'Q&A', icon: <MessageCircle size={18} aria-hidden="true" /> },
  { href: '/feelings', label: 'Feelings', icon: <Smile size={18} aria-hidden="true" /> },
  { href: '/photos', label: 'Photos', icon: <Image size={18} aria-hidden="true" /> },
  { href: '/timeline', label: 'Timeline', icon: <Clock size={18} aria-hidden="true" /> },
  { href: '/secure', label: 'For Our Eyes Only', icon: <Lock size={18} aria-hidden="true" /> },
  { href: '/admin', label: 'Admin', icon: <Settings size={18} aria-hidden="true" /> },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Detect scroll to apply backdrop blur
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 h-16 md:h-[64px] transition-all duration-200',
          scrolled
            ? 'bg-site-white/85 backdrop-blur-md shadow-hover'
            : 'bg-site-white shadow-subtle',
        )}
      >
        <nav
          className="h-full max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group outline-none focus-visible:ring-2 focus-visible:ring-pink-soft rounded-sm"
            aria-label="Our Little World — home"
          >
            <Heart
              size={22}
              className="text-pink-soft fill-pink-soft group-hover:scale-110 transition-transform duration-150"
              aria-hidden="true"
            />
            <span className="font-serif text-h3 text-purple-deep leading-none">
              Our Little World
            </span>
          </Link>

          {/* Desktop navigation links */}
          <ul className="hidden md:flex items-center gap-1" role="list">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'px-3 py-2 font-sans text-nav font-medium rounded-sm transition-colors duration-150 outline-none',
                      'focus-visible:ring-2 focus-visible:ring-pink-soft',
                      isActive
                        ? 'text-purple-deep border-b-2 border-pink-soft'
                        : 'text-text-primary hover:text-purple-deep',
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            className="md:hidden p-2 text-purple-deep rounded-sm hover:bg-purple-soft transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-pink-soft"
          >
            <Menu size={22} aria-hidden="true" />
          </button>
        </nav>
      </header>

      {/* Mobile full-screen overlay menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-site-white flex flex-col animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Overlay header */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-border">
            <div className="flex items-center gap-2">
              <Heart
                size={20}
                className="text-pink-soft fill-pink-soft"
                aria-hidden="true"
              />
              <span className="font-serif text-h3 text-purple-deep">Our Little World</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="p-2 text-purple-deep rounded-sm hover:bg-purple-soft transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-pink-soft"
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>

          {/* Mobile nav links */}
          <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto py-6 px-6">
            <ul className="flex flex-col gap-1" role="list">
              {NAV_LINKS.map(({ href, label, icon }) => {
                const isActive = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3.5 rounded-sm font-sans text-nav font-medium transition-colors duration-150 outline-none',
                        'focus-visible:ring-2 focus-visible:ring-pink-soft',
                        isActive
                          ? 'bg-pink-light text-purple-deep'
                          : 'text-text-primary hover:bg-purple-soft hover:text-purple-deep',
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {icon}
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
