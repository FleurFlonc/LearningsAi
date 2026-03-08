import { useMemo } from 'react';
import { useSessionStore } from '@/features/sessions/store/sessionStore';
import { calculateAnalytics } from '@/lib/analytics/analyticsService';
import type { DerivedAnalytics } from '@/models/analytics';

export function useAnalytics(): DerivedAnalytics {
  const sessions = useSessionStore((state) => state.sessions);
  return useMemo(() => calculateAnalytics(sessions), [sessions]);
}
