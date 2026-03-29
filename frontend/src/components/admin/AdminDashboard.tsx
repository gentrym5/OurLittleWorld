'use client';

// src/components/admin/AdminDashboard.tsx
// Main admin dashboard — stats bar, tab navigation, logout

import { useState, useEffect } from 'react';
import {
  MessageCircle,
  Smile,
  Image,
  Clock,
  BookOpen,
  LogOut,
  Settings,
} from 'lucide-react';
import { getAdminStats, adminLogout } from '@/lib/api';
import type { AdminStats } from '@/lib/api';
import type { ApiError } from '@/types/index';
import Button from '@/components/ui/Button';
import AdminQuestionsTab from './AdminQuestionsTab';
import AdminFeelingsTab from './AdminFeelingsTab';
import AdminPhotosTab from './AdminPhotosTab';
import AdminActivityTab from './AdminActivityTab';

type Tab = 'questions' | 'feelings' | 'photos' | 'activity';

interface AdminDashboardProps {
  onLogout: () => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'questions', label: 'Questions' },
  { id: 'feelings', label: 'Feelings' },
  { id: 'photos', label: 'Photos' },
  { id: 'activity', label: 'Activity Log' },
];

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  count: number | null;
}

function StatCard({ icon, label, count }: StatCardProps) {
  return (
    <div className="flex-1 min-w-[120px] bg-site-white rounded-md shadow-subtle p-5 flex flex-col items-center gap-2">
      <div className="text-purple-deep">{icon}</div>
      <span className="font-serif text-2xl text-purple-deep font-semibold">
        {count === null ? '—' : count}
      </span>
      <span className="text-caption text-text-muted font-sans text-center">{label}</span>
    </div>
  );
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('questions');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        const apiErr = err as ApiError;
        setStatsError(apiErr?.message ?? 'Failed to load stats.');
      }
    }
    fetchStats();
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await adminLogout();
    } catch {
      // Ignore logout API errors — clear session regardless
    } finally {
      setLoggingOut(false);
      onLogout();
    }
  }

  return (
    <div className="min-h-screen bg-purple-soft/30">
      {/* Admin Navbar */}
      <header className="bg-purple-soft border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Brand */}
            <div className="flex items-center gap-2 shrink-0">
              <Settings size={20} className="text-purple-deep" />
              <span className="font-serif text-h3 text-text-primary hidden sm:block">
                Admin Dashboard
              </span>
            </div>

            {/* Tab Bar */}
            <nav className="flex items-center gap-1 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    'px-3 py-2 rounded-sm text-btn font-sans font-semibold whitespace-nowrap transition-colors duration-150',
                    activeTab === tab.id
                      ? 'bg-pink-soft text-white'
                      : 'text-text-primary hover:bg-purple-light',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              loading={loggingOut}
              loadingText="Logging out..."
              className="shrink-0 gap-1.5"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Row */}
        <section aria-label="Dashboard statistics">
          <h1 className="font-serif text-h1 text-text-primary mb-5">Dashboard Overview</h1>

          {statsError && (
            <p className="text-caption text-error font-sans mb-4">{statsError}</p>
          )}

          <div className="flex flex-wrap gap-3">
            <StatCard
              icon={<MessageCircle size={24} />}
              label="Questions"
              count={stats?.questionCount ?? null}
            />
            <StatCard
              icon={<BookOpen size={24} />}
              label="Answers"
              count={stats?.answerCount ?? null}
            />
            <StatCard
              icon={<Smile size={24} />}
              label="Feelings"
              count={stats?.feelingCount ?? null}
            />
            <StatCard
              icon={<Image size={24} />}
              label="Photos"
              count={stats?.photoCount ?? null}
            />
            <StatCard
              icon={<Clock size={24} />}
              label="Timeline"
              count={stats?.timelineCount ?? null}
            />
          </div>
        </section>

        {/* Active Tab Content */}
        <section>
          {activeTab === 'questions' && <AdminQuestionsTab />}
          {activeTab === 'feelings' && <AdminFeelingsTab />}
          {activeTab === 'photos' && <AdminPhotosTab />}
          {activeTab === 'activity' && <AdminActivityTab />}
        </section>
      </main>
    </div>
  );
}
