import { create } from 'zustand';
import { demoBookings } from '@/mock/bookings';

// Booking pipeline — contract tracking sau khi sale submit booking form.
// Status tiến triển theo funnel: PENDING → CONFIRMED → DEPOSITED → CONTRACTED
// → COMPLETED. Bất cứ lúc nào có thể CANCELLED. Mỗi transition append vào
// history[] để detail screen hiển thị timeline đầy đủ.

export type BookingStatus =
  | 'PENDING'      // Chờ CĐT xác nhận (vừa submit)
  | 'CONFIRMED'    // CĐT đã xác nhận, chờ khách đặt cọc
  | 'DEPOSITED'    // Khách đã đóng cọc giữ chỗ
  | 'CONTRACTED'   // Đã ký hợp đồng mua bán (HĐMB)
  | 'COMPLETED'    // Hoàn tất thanh toán + bàn giao
  | 'CANCELLED';   // Huỷ (bất cứ giai đoạn nào)

export const bookingStatusLabels: Record<BookingStatus, string> = {
  PENDING: 'Chờ CĐT',
  CONFIRMED: 'Đã xác nhận',
  DEPOSITED: 'Đã cọc',
  CONTRACTED: 'Đã ký HĐMB',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã huỷ',
};

// Status đang "đi đúng hướng" (pipeline progression). CANCELLED tách riêng.
export const PIPELINE_STATUSES: BookingStatus[] = [
  'PENDING',
  'CONFIRMED',
  'DEPOSITED',
  'CONTRACTED',
  'COMPLETED',
];

// Next valid status từ current — dùng cho "Chuyển bước" picker.
// Mỗi step chỉ cho đi forward 1 bước, hoặc CANCELLED. Không skip step.
export function nextStatuses(current: BookingStatus): BookingStatus[] {
  if (current === 'COMPLETED' || current === 'CANCELLED') return [];
  const idx = PIPELINE_STATUSES.indexOf(current);
  const next: BookingStatus[] = [];
  if (idx >= 0 && idx < PIPELINE_STATUSES.length - 1) {
    next.push(PIPELINE_STATUSES[idx + 1]);
  }
  next.push('CANCELLED');
  return next;
}

export type BookingPaymentMethod = 'TRANSFER' | 'CASH';

export type BookingStatusEvent = {
  status: BookingStatus;
  at: string;       // ISO timestamp
  note?: string;    // optional note cho transition (VD "CĐT gọi xác nhận lúc 14h")
};

export type Booking = {
  id: string;
  leadId?: string;
  projectId: string;
  projectName: string;
  unitTypeId?: string;
  unitTypeName?: string;
  unitCode?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerCccd?: string;
  depositVnd: number;
  paymentMethod: BookingPaymentMethod;
  notes?: string;
  status: BookingStatus;     // = history[last].status (denormalized cho query nhanh)
  history: BookingStatusEvent[];
  createdAt: string;
  updatedAt: string;
};

export type CreateBookingInput = Omit<
  Booking,
  'id' | 'status' | 'history' | 'createdAt' | 'updatedAt'
>;

type State = {
  bookings: Booking[];
  createBooking: (input: CreateBookingInput) => Booking;
  updateStatus: (id: string, status: BookingStatus, note?: string) => void;
  getById: (id: string) => Booking | undefined;
};

export const useBookings = create<State>((set, get) => ({
  bookings: demoBookings,

  createBooking: (input) => {
    const now = new Date().toISOString();
    const booking: Booking = {
      ...input,
      id: `bk-${Date.now()}`,
      status: 'PENDING',
      history: [{ status: 'PENDING', at: now }],
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ bookings: [booking, ...s.bookings] }));
    return booking;
  },

  updateStatus: (id, status, note) => {
    const now = new Date().toISOString();
    set((s) => ({
      bookings: s.bookings.map((b) =>
        b.id === id
          ? {
              ...b,
              status,
              history: [...b.history, { status, at: now, note }],
              updatedAt: now,
            }
          : b
      ),
    }));
  },

  getById: (id) => get().bookings.find((b) => b.id === id),
}));
