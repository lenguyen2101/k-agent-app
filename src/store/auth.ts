import { create } from 'zustand';
import { currentUser } from '../mock/leads';

type AuthUser = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: string;
  team: string;
  noxhCertified?: boolean;
};

export type LanguageCode = 'vi' | 'en';

export type AppSettings = {
  biometric: boolean;           // Face ID / Touch ID khi mở app
  pushEnabled: boolean;         // nhận push notification
  pushSound: boolean;           // âm báo khi có lead mới
  language: LanguageCode;
  syncOnCellular: boolean;      // sync qua 4G hay chỉ WiFi
};

const defaultSettings: AppSettings = {
  biometric: true,
  pushEnabled: true,
  pushSound: true,
  language: 'vi',
  syncOnCellular: true,
};

type AuthState = {
  user: AuthUser | null;
  isOnline: boolean;
  settings: AppSettings;
  signIn: (phone: string) => void;
  signOut: () => void;
  toggleOnline: () => void;
  updateProfile: (patch: Partial<AuthUser>) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: {
    ...currentUser,
    email: 'lenguyen@k-city.vn',
    noxhCertified: true,
  },
  isOnline: true,
  settings: defaultSettings,
  signIn: () =>
    set({
      user: {
        ...currentUser,
        email: 'lenguyen@k-city.vn',
        noxhCertified: true,
      },
    }),
  signOut: () => set({ user: null }),
  toggleOnline: () => set((s) => ({ isOnline: !s.isOnline })),
  updateProfile: (patch) =>
    set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
  updateSettings: (patch) =>
    set((s) => ({ settings: { ...s.settings, ...patch } })),
}));
