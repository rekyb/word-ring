import { create } from 'zustand';

type SettingsState = {
  soundOn: boolean;
  hapticsOn: boolean;
  toggleSound: () => void;
  toggleHaptics: () => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  soundOn: true,
  hapticsOn: true,
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  toggleHaptics: () => set((s) => ({ hapticsOn: !s.hapticsOn })),
}));
