import { create } from 'zustand';
import { currentUser } from '../mock/leads';

type AuthUser = {
  id: string;
  fullName: string;
  phone: string;
  role: string;
  team: string;
};

type AuthState = {
  user: AuthUser | null;
  isOnline: boolean;
  signIn: (phone: string) => void;
  signOut: () => void;
  toggleOnline: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: currentUser,
  isOnline: true,
  signIn: () => set({ user: currentUser }),
  signOut: () => set({ user: null }),
  toggleOnline: () => set((s) => ({ isOnline: !s.isOnline })),
}));
