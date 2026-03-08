import { create } from 'zustand';
import type { UserPreference } from '@/models/preferences';
import * as service from '@/features/settings/services/preferenceService';

interface PreferenceStore {
  preferences: UserPreference | null;
  isLoading: boolean;

  loadPreferences: () => Promise<void>;
  updatePreferences: (updates: Partial<Omit<UserPreference, 'id'>>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const usePreferenceStore = create<PreferenceStore>()((set) => ({
  preferences: null,
  isLoading: false,

  loadPreferences: async () => {
    set({ isLoading: true });
    const preferences = await service.getPreferences();
    set({ preferences, isLoading: false });
  },

  updatePreferences: async (updates) => {
    const updated = await service.updatePreferences(updates);
    set({ preferences: updated });
  },

  completeOnboarding: async () => {
    const updated = await service.updatePreferences({ onboardingCompleted: true });
    set({ preferences: updated });
  },
}));
