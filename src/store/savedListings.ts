import { create } from 'zustand';

// Saved listings — user ghim căn để quay lại xem nhanh hoặc chia sẻ khách.
// Phase integrate: persist MMKV, sync với server favorite list.

type State = {
  savedIds: Set<string>;
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
};

// Pre-seed 2 listing để saved screen không empty lúc đầu
const initialSaved = new Set(['ls1', 'ls4']);

export const useSavedListings = create<State>((set, get) => ({
  savedIds: initialSaved,
  isSaved: (id) => get().savedIds.has(id),
  toggle: (id) =>
    set((s) => {
      const next = new Set(s.savedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { savedIds: next };
    }),
  remove: (id) =>
    set((s) => {
      const next = new Set(s.savedIds);
      next.delete(id);
      return { savedIds: next };
    }),
}));
