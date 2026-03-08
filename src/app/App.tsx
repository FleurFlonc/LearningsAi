import { useEffect, useState } from 'react';
import { usePreferenceStore } from '@/features/settings/store/preferenceStore';
import { useSessionStore } from '@/features/sessions/store/sessionStore';
import { useTheme } from '@/hooks/useTheme';
import { useStorageWarning } from '@/hooks/useStorageWarning';
import { isPrivateBrowsing } from '@/lib/storage/storageMonitor';
import { PrivateBrowsingWarning } from '@/components/feedback/PrivateBrowsingWarning';
import { StorageWarningBanner } from '@/components/feedback/StorageWarningBanner';
import { AppRoutes } from './routes';

export default function App() {
  const loadPreferences = usePreferenceStore((state) => state.loadPreferences);
  const loadSessions = useSessionStore((state) => state.loadSessions);
  const { level } = useStorageWarning();
  const [isPrivate, setIsPrivate] = useState(false);

  // Apply theme class on <html>
  useTheme();

  useEffect(() => {
    loadPreferences();
    loadSessions();
    isPrivateBrowsing().then(setIsPrivate);
  }, [loadPreferences, loadSessions]);

  return (
    <>
      {isPrivate && <PrivateBrowsingWarning />}
      {(level === 'warning' || level === 'critical') && <StorageWarningBanner />}
      <AppRoutes />
    </>
  );
}
