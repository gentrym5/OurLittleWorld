// src/app/layout.tsx
// Root layout — fonts, global styles, Navbar, Footer

import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ToastProvider from '@/components/ui/ToastProvider';
import './globals.css';

// ---------------------------------------------------------------------------
// Font configuration — loaded via next/font/google (zero layout shift)
// ---------------------------------------------------------------------------

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-playfair',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-lato',
});

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Our Little World',
  description: 'A private shared space for just the two of us.',
};

// ---------------------------------------------------------------------------
// Root layout
// ---------------------------------------------------------------------------

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${lato.variable}`}>
      <body className="bg-site-white text-text-primary font-sans min-h-screen flex flex-col">
        <ToastProvider>
          <Navbar />
          {/* Offset for fixed navbar height */}
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
