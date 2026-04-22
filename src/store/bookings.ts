import { create } from 'zustand';

// Booking liên kết lead ↔ sản phẩm sơ cấp. Khi sale submit booking form,
// nếu đã chọn lead (pendingLeadId hoặc picker) → booking link vào lead +
// tự động append activity BOOKING_CREATED + chuyển lead status → DEPOSITED.

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export type BookingPaymentMethod = 'TRANSFER' | 'CASH';

export type Booking = {
  id: string;
  leadId?: string;                // link với lead nếu có
  projectId: string;
  projectName: string;            // snapshot để hiển thị khi project đổi tên / xóa
  unitTypeId?: string;
  unitTypeName?: string;
  unitCode?: string;              // "AV-08-05" nếu book 1 căn cụ thể
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerCccd?: string;
  depositVnd: number;
  paymentMethod: BookingPaymentMethod;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
};

export type CreateBookingInput = Omit<Booking, 'id' | 'status' | 'createdAt'>;

type State = {
  bookings: Booking[];
  createBooking: (input: CreateBookingInput) => Booking;
};

export const useBookings = create<State>((set) => ({
  bookings: [],
  createBooking: (input) => {
    const booking: Booking = {
      ...input,
      id: `bk-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ bookings: [booking, ...s.bookings] }));
    return booking;
  },
}));
