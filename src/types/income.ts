// Income / hoa hồng — data model for Thu nhập feature.
// Scope: 3 nguồn thu (GSM/HHMG mạng lưới/Thưởng) × 4 trạng thái × mạng lưới 4 cấp.

export type IncomeSource =
  | 'GSM'            // Giao dịch sale này bán trực tiếp
  | 'HHMG_NETWORK'   // Hoa hồng môi giới mạng lưới (F1-F4 share)
  | 'BONUS';         // Thưởng nóng / thi đua / chiến dịch

export const incomeSourceLabels: Record<IncomeSource, string> = {
  GSM: 'GSM',
  HHMG_NETWORK: 'HHMG mạng lưới',
  BONUS: 'Thưởng',
};

export type TransactionStatus =
  | 'PAID'       // Đã nhận tiền
  | 'APPROVED'   // Đã duyệt, chờ chi
  | 'PENDING'   // Chờ thẩm định
  | 'REJECTED'; // Từ chối

export const transactionStatusLabels: Record<TransactionStatus, string> = {
  PAID: 'Đã nhận',
  APPROVED: 'Đã duyệt',
  PENDING: 'Chờ thanh toán',
  REJECTED: 'Từ chối',
};

export type IncomeTransaction = {
  id: string;
  code: string;                 // "TX12001"
  source: IncomeSource;
  title: string;                // mô tả ngắn
  grossAmount: number;          // VND trước thuế
  netAmount: number;            // VND sau thuế (thực nhận)
  status: TransactionStatus;
  bic?: string;                 // mã BIC ngân hàng
  recipientName: string;        // tên người nhận (có thể là downline)
  recipientLevel?: 1 | 2 | 3 | 4; // F1-F4 nếu HHMG_NETWORK
  relatedLeadName?: string;
  relatedListingCode?: string;
  createdAt: string;
  paidAt?: string;
};

export type NetworkLevel = {
  level: 1 | 2 | 3 | 4;         // F1-F4
  memberCount: number;          // số MG trong cấp
  activeQaCount: number;        // số active quarter
  totalHhmg: number;            // tổng HHMG cấp này mang lại
  mySharePct: number;           // % sale này được chia
};

export type IncomeSummary = {
  periodLabel: string;          // "Tháng này" / "Quý 2/2026"
  periodFrom: string;           // ISO
  periodTo: string;             // ISO
  netTotal: number;             // tổng thu nhập ròng
  trendPct: number;             // +20 / -5 vs same period previous
  paidAmount: number;           // đã nhận
  pendingAmount: number;        // chờ thanh toán
  breakdown: {
    source: IncomeSource;
    amount: number;
    pct: number;                // share %
  }[];
  gsmTotal: number;             // tổng GSM (sale tự bán)
  networkHhmgTotal: number;     // tổng HHMG mạng lưới
  network: NetworkLevel[];
  bicBalance: number;           // số dư BIC (kho thưởng nội bộ)
};
