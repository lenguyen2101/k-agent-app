import type { Project } from './lead';

export type ListingStatus =
  | 'AVAILABLE'       // Sẵn hàng — chưa có sale nào cooperate
  | 'PENDING'         // Chờ hợp tác — mình đã gửi yêu cầu
  | 'COOPERATING'     // Đang hợp tác — mình đang bán
  | 'RESERVED'        // Đã giữ chỗ (có khách đặt)
  | 'SOLD';           // Đã bán

export const listingStatusLabels: Record<ListingStatus, string> = {
  AVAILABLE: 'Sẵn hàng',
  PENDING: 'Chờ hợp tác',
  COOPERATING: 'Đang hợp tác',
  RESERVED: 'Giữ chỗ',
  SOLD: 'Đã bán',
};

// 4 thật — data verification signals
export type FourTruths = {
  photo: boolean;     // Ảnh thật (đã verify ảnh gốc)
  person: boolean;    // Người thật (agent eKYC)
  home: boolean;      // Nhà thật (có sổ/HĐ mua bán)
  price: boolean;     // Giá thật (chủ cam kết)
};

export const truthLabels: Record<keyof FourTruths, string> = {
  photo: 'Ảnh',
  person: 'Người',
  home: 'Nhà',
  price: 'Giá',
};

export type ListingAgent = {
  id: string;
  fullName: string;
  company: string;
  score: number;          // 0-100 trust score
  avatar?: string;
};

export type Listing = {
  id: string;             // internal id
  code: string;           // display code, VD "LST123456"

  project: Project;
  building?: string;      // Tòa S1.02
  unitType: string;       // "2PN 2WC"
  floor?: number;
  areaM2: number;

  title: string;
  description?: string;

  status: ListingStatus;
  truths: FourTruths;

  listPrice: number;              // giá niêm yết VND
  listPricePerM2?: number;        // VND / m²
  floorPrice?: number;            // giá bán sàn
  floorPricePerM2?: number;

  totalCommission: number;        // VND tổng hoa hồng môi giới
  myCommission: number;           // VND phần của sale
  myCommissionPct: number;        // % của sale trong tổng HH

  hasVrTour: boolean;
  coverImage: string;
  gallery: string[];

  agent: ListingAgent;

  viewCount: number;
  publishedAt: string;
  updatedAt: string;
};

export function truthsScore(t: FourTruths): number {
  return Number(t.photo) + Number(t.person) + Number(t.home) + Number(t.price);
}
