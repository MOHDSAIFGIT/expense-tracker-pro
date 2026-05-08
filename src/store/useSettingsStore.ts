import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings } from '../types';

interface SettingsState extends UserSettings {
  setCurrency: (currency: string) => void;
  toggleDarkMode: () => void;
  setBiometricsEnabled: (enabled: boolean) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'USD',
      isDarkMode: true,
      biometricsEnabled: false,

      setCurrency: (currency) => set({ currency }),
      
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      setBiometricsEnabled: (enabled) => set({ biometricsEnabled: enabled }),
      
      resetSettings: () => set({
        currency: 'USD',
        isDarkMode: true,
        biometricsEnabled: false,
      }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
