import { useEffect } from 'react';
import { usePreferenceStore } from '@/features/settings/store/preferenceStore';

export function useTheme(): void {
  const themeMode = usePreferenceStore((state) => state.preferences?.themeMode ?? 'system');

  useEffect(() => {
    const html = document.documentElement;

    if (themeMode === 'dark') {
      html.classList.add('dark');
      return;
    }

    if (themeMode === 'light') {
      html.classList.remove('dark');
      return;
    }

    // system — follow OS preference
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    html.classList.toggle('dark', mq.matches);

    const handler = (e: MediaQueryListEvent) => html.classList.toggle('dark', e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [themeMode]);
}
