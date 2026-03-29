'use client';

// src/app/admin/page.tsx
// Admin page — renders PasswordGate when unauthenticated, AdminDashboard once authenticated

import { useAdminSession } from '@/hooks/useAdminSession';
import PasswordGate from '@/components/ui/PasswordGate';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const { isAuthenticated, isVerifying, error, verifyPassword, logout } = useAdminSession();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-light to-purple-soft flex items-center justify-center p-6">
        <PasswordGate
          title="Admin Access"
          description="Authorised personnel only"
          onSubmit={verifyPassword}
          isLoading={isVerifying}
          error={error}
        />
      </div>
    );
  }

  return <AdminDashboard onLogout={logout} />;
}
