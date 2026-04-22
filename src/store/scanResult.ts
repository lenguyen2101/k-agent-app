import { create } from 'zustand';
import type { CccdData } from '@/lib/cccd';

// Scanner → form pattern: scanner modal set `pending`, dismiss; form detect
// trong useEffect, consume rồi clear. Tránh passing via router params (không
// support object) + tránh callback prop.

type State = {
  pending: CccdData | null;
  setPending: (data: CccdData) => void;
  consume: () => CccdData | null;  // get + clear atomically
  clear: () => void;
};

export const useScanResult = create<State>((set, get) => ({
  pending: null,
  setPending: (data) => set({ pending: data }),
  consume: () => {
    const current = get().pending;
    if (current) set({ pending: null });
    return current;
  },
  clear: () => set({ pending: null }),
}));
