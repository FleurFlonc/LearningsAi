import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { usePreferenceStore } from '@/features/settings/store/preferenceStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';

// Pages — lazy imports for code splitting
import { LogPage } from '@/features/sessions/pages/LogPage';
import { LessonsPage } from '@/features/lessons/pages/LessonsPage';
import { SessionDetailPage } from '@/features/sessions/pages/SessionDetailPage';
import { StatsPage } from '@/features/stats/pages/StatsPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { OnboardingPage } from '@/features/onboarding/pages/OnboardingPage';

// Guard: redirects to /onboarding until onboardingCompleted === true
function ProtectedRoutes() {
  const { preferences, isLoading } = usePreferenceStore();

  if (isLoading || preferences === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50 dark:bg-slate-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (!preferences.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/log" replace />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      <Route element={<ProtectedRoutes />}>
        <Route element={<AppLayout />}>
          <Route path="/log" element={<LogPage />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/lessons/:id" element={<SessionDetailPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/log" replace />} />
    </Routes>
  );
}
