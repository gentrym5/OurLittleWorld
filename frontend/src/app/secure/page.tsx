'use client';

// src/app/secure/page.tsx
// Secure Section page — shows PasswordGate until authenticated, then SecureContent.

import { Lock } from 'lucide-react';
import PasswordGate from '@/components/ui/PasswordGate';
import SecureContent from '@/components/secure/SecureContent';
import { useSecureSession } from '@/hooks/useSecureSession';

export default function SecurePage() {
  const { isAuthenticated, isVerifying, error, verifyPassword, logout } = useSecureSession();

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(248,180,200,0.7) 0%, rgba(201,184,232,0.7) 60%, rgba(237,230,248,0.7) 100%)',
        }}
      >
        {/* Lock icon above the gate card */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <Lock
            size={48}
            className="text-purple-deep"
            aria-hidden="true"
          />
        </div>

        <PasswordGate
          title="For Our Eyes Only"
          description="This space is just for us"
          onSubmit={verifyPassword}
          isLoading={isVerifying}
          error={error}
        />
      </div>
    );
  }

  return <SecureContent onLogout={logout} />;
}
