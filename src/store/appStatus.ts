import { create } from 'zustand';

// App status store — xử lý các flag toàn cục:
// - onboardingCompleted: user đã xem 3 slide giới thiệu chưa (first-launch)
// - forceUpdate: app version < min từ BE → block, buộc update
// - maintenance: BE đang bảo trì → block, retry
//
// Phase integrate: persist onboardingCompleted qua MMKV, fetch force/maintenance
// từ /app/status endpoint mỗi khi app start hoặc resume.

export type ForceUpdateData = {
  required: boolean;
  minVersion: string;
  latestVersion: string;
  storeUrl: string;
  changelog?: string;
};

export type MaintenanceData = {
  active: boolean;
  message: string;
  estimatedEndAt?: string;
  supportEmail?: string;
};

type AppStatusState = {
  hydrated: boolean;               // đã finish init checks chưa
  onboardingCompleted: boolean;
  forceUpdate: ForceUpdateData;
  maintenance: MaintenanceData;

  hydrate: () => void;             // mô phỏng init delay + fetch status
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setForceUpdate: (data: Partial<ForceUpdateData>) => void;
  setMaintenance: (data: Partial<MaintenanceData>) => void;
};

const defaultForceUpdate: ForceUpdateData = {
  required: false,
  minVersion: '1.0.0',
  latestVersion: '1.0.0',
  storeUrl: 'https://apps.apple.com',
  changelog: 'Sửa lỗi và cải tiến hiệu suất. Cài bản mới để tiếp tục dùng K-Agent.',
};

const defaultMaintenance: MaintenanceData = {
  active: false,
  message: 'K-Agent đang bảo trì định kỳ. Vui lòng quay lại sau ít phút.',
  supportEmail: 'agent-support@k-city.vn',
};

export const useAppStatus = create<AppStatusState>((set) => ({
  hydrated: false,
  onboardingCompleted: false,
  forceUpdate: defaultForceUpdate,
  maintenance: defaultMaintenance,

  hydrate: () => {
    // Mô phỏng đọc MMKV + gọi /app/status.
    // Phase integrate: await Promise.all([MMKV.getItem, fetch('/app/status')])
    setTimeout(() => set({ hydrated: true }), 900);
  },
  completeOnboarding: () => set({ onboardingCompleted: true }),
  resetOnboarding: () => set({ onboardingCompleted: false }),
  setForceUpdate: (data) =>
    set((s) => ({ forceUpdate: { ...s.forceUpdate, ...data } })),
  setMaintenance: (data) =>
    set((s) => ({ maintenance: { ...s.maintenance, ...data } })),
}));
