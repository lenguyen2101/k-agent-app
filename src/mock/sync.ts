// Mock pending mutations cho SyncStatus screen.
// Phase integrate: lấy từ Apollo cache-persist + MMKV mutation queue.

export type SyncStatus = 'PENDING' | 'FAILED' | 'CONFLICT' | 'SYNCED';

export type MutationType =
  | 'LEAD_CREATE'
  | 'LEAD_UPDATE'
  | 'ACTIVITY_CREATE'
  | 'LEAD_STATUS_CHANGE';

export const mutationTypeLabels: Record<MutationType, string> = {
  LEAD_CREATE: 'Tạo lead',
  LEAD_UPDATE: 'Cập nhật lead',
  ACTIVITY_CREATE: 'Thêm hoạt động',
  LEAD_STATUS_CHANGE: 'Đổi trạng thái lead',
};

export type PendingMutation = {
  id: string;
  type: MutationType;
  targetLabel: string;       // mô tả ngắn target
  status: SyncStatus;
  queuedAt: string;
  lastAttemptAt?: string;
  errorMessage?: string;
  conflict?: {
    localValue: string;      // giá trị local
    serverValue: string;     // giá trị server
    field: string;           // field bị conflict
  };
};

const now = Date.now();
const minAgo = (m: number) => new Date(now - m * 60_000).toISOString();

export const pendingMutations: PendingMutation[] = [
  {
    id: 'sync1',
    type: 'ACTIVITY_CREATE',
    targetLabel: 'Gọi điện · Trần Thị Bình (0912 345 678)',
    status: 'PENDING',
    queuedAt: minAgo(3),
  },
  {
    id: 'sync2',
    type: 'LEAD_UPDATE',
    targetLabel: 'Lê Minh Châu — thêm note xem nhà mẫu',
    status: 'PENDING',
    queuedAt: minAgo(12),
  },
  {
    id: 'sync3',
    type: 'LEAD_STATUS_CHANGE',
    targetLabel: 'Phạm Quốc Đạt — NEGOTIATING → CONTRACTED',
    status: 'CONFLICT',
    queuedAt: minAgo(25),
    lastAttemptAt: minAgo(24),
    conflict: {
      field: 'Trạng thái lead',
      localValue: 'CONTRACTED (bạn vừa đổi)',
      serverValue: 'DEPOSITED (trưởng sàn vừa đổi sau đó)',
    },
  },
  {
    id: 'sync4',
    type: 'ACTIVITY_CREATE',
    targetLabel: 'Gặp trực tiếp · Nguyễn Văn An tại showroom',
    status: 'FAILED',
    queuedAt: minAgo(48),
    lastAttemptAt: minAgo(2),
    errorMessage: 'Kết nối timeout. Sẽ thử lại khi có mạng.',
  },
];

export const syncSummary = {
  pendingCount: pendingMutations.filter((m) => m.status === 'PENDING').length,
  failedCount: pendingMutations.filter((m) => m.status === 'FAILED').length,
  conflictCount: pendingMutations.filter((m) => m.status === 'CONFLICT').length,
};
