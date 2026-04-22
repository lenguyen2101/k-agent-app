// Primary market project (Sơ cấp) — dự án CĐT đang mở bán.
// Agent dùng để tư vấn lead + hỗ trợ booking/đặt cọc.
// Khác ListingCard (Thứ cấp) = căn lẻ do môi giới post lại.

export type PrimaryProjectStatus =
  | 'SELLING'       // Đang mở bán
  | 'UPCOMING'      // Sắp mở bán
  | 'HANDED_OVER'   // Đã bàn giao
  | 'SOLD_OUT';     // Hết hàng

export const primaryStatusLabels: Record<PrimaryProjectStatus, string> = {
  SELLING: 'Đang mở bán',
  UPCOMING: 'Sắp mở bán',
  HANDED_OVER: 'Đã bàn giao',
  SOLD_OUT: 'Hết hàng',
};

export type TowerStatus = 'CONSTRUCTING' | 'FINISHED' | 'PLANNED';

export const towerStatusLabels: Record<TowerStatus, string> = {
  CONSTRUCTING: 'Đang thi công',
  FINISHED: 'Đã hoàn thiện',
  PLANNED: 'Đang lên kế hoạch',
};

export type ProgressMilestone = {
  label: string;                // "Đổ móng", "Xây thô tầng 10", "Hoàn thiện"
  date: string;                 // "Q2/2025"
  done: boolean;
};

export type Tower = {
  id: string;
  name: string;                 // "Tòa The Gateway"
  thumbnail: string;
  status: TowerStatus;
  floors: number;
  units: number;
  unitsPerFloor?: number;
  pricePerM2Min?: number;       // "Giá đang cập nhật" nếu null
  pricePerM2Max?: number;
  // Detail-only fields (hiện ở Tower Detail screen)
  description?: string;
  progressPct?: number;         // 0-100 cho tòa CONSTRUCTING
  progressMilestones?: ProgressMilestone[];
  gallery?: string[];           // progress photos, exterior
  handoverDate?: string;
  unitTypeIds?: string[];       // reference project.unitTypes có trong tòa này
};

export type AvailableUnitStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';

export const availableUnitStatusLabels: Record<AvailableUnitStatus, string> = {
  AVAILABLE: 'Sẵn hàng',
  RESERVED: 'Giữ chỗ',
  SOLD: 'Đã bán',
};

export type AvailableUnit = {
  code: string;              // "A-12-05"
  floor: number;
  direction?: string;        // "Đông Nam"
  areaM2: number;
  priceVnd: number;
  status: AvailableUnitStatus;
};

export type UnitType = {
  id: string;
  name: string;              // "1PN" / "2PN" / "3PN" / "Studio"
  bedrooms: number;
  bathrooms: number;
  areaMin: number;           // m²
  areaMax: number;
  towerName: string;         // "Tòa The Gateway"
  floorRange: string;        // "Tầng 03-29"
  pricePerM2Min: number;
  pricePerM2Max: number;
  floorplanImage: string;    // sơ đồ
  photoCount: number;        // đếm ảnh gallery
  // Detail-only
  description?: string;
  interiorImages?: string[]; // ảnh nội thất mẫu
  directions?: string[];     // ["Đông Nam", "Tây Bắc"]
  balconyArea?: number;      // m² ban công
  commissionPct?: number;    // % hoa hồng sale
  availableUnits?: AvailableUnit[];
};

// Icon key — map tới lucide-react-native icon trong AmenitySection component.
// Thêm key mới → thêm entry trong AMENITY_ICON_MAP.
export type AmenityCategoryIcon =
  | 'entertainment'   // Gamepad2 — giải trí, vui chơi
  | 'wellness'        // Dumbbell — gym, spa, yoga
  | 'school'          // GraduationCap — trường học
  | 'healthcare'      // HeartPulse — bệnh viện, phòng khám
  | 'shopping'        // ShoppingBag — TTTM, mall
  | 'transport'       // TramFront — metro, bus, sân bay
  | 'nature'          // Trees — công viên, cây xanh
  | 'dining'          // UtensilsCrossed — F&B, nhà hàng
  | 'business'        // Briefcase — văn phòng, co-working
  | 'lifestyle';      // Sparkles — tiện ích khác

export type AmenityItem = {
  id: string;
  title: string;
  description: string;
  image: string;
  distance?: string;   // "5 phút", "800m" (exterior only)
};

export type AmenityCategory = {
  key: string;
  label: string;             // "Giải trí"
  icon: AmenityCategoryIcon;
  items: AmenityItem[];
};

export type AmenityList = {
  heroImage: string;         // hero cinematic cho section
  totalCount: number;        // tổng tiện ích (precomputed để show stat)
  categories: AmenityCategory[];
};

// Tham số cho Overview description — chia block để format đẹp.
export type OverviewHighlight = {
  icon: AmenityCategoryIcon;
  label: string;             // "Vị trí đắc địa"
  value: string;             // "Trục đường Nguyễn Lương Bằng, Quận 7"
};

// Rich description: mix heading, paragraph, quote, list — render như article
export type DescriptionBlock =
  | { type: 'heading'; text: string }                    // H2 style
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string; author?: string }     // highlighted quote
  | { type: 'list'; items: string[] };                   // bullet list

// Media carousel — support image + YouTube video embed.
export type MediaItem =
  | { type: 'image'; url: string }
  | { type: 'youtube'; url: string; thumbnail: string; title?: string };

export type PrimaryProject = {
  id: string;
  slug: string;
  name: string;              // "Thông tin dự án Bcons Center City"
  shortName: string;         // "Bcons Center City"
  developer: string;         // "Công ty Cổ phần Địa ốc Bcons"
  builder: string;           // "Công ty Cổ phần Đầu tư Xây dựng Bcons"

  addressFull: string;       // "Xã Bình Thắng, Dĩ An, Bình Dương"
  province: string;
  district: string;

  status: PrimaryProjectStatus;
  priceMinVnd: number;       // 2_400_000_000
  priceMaxVnd: number;       // 4_800_000_000
  pricePerM2Min: number;     // 55_810_000
  pricePerM2Max: number;     // 60_760_000

  gallery: string[];         // 5+ ảnh hero (cover cho card + fallback đơn giản)

  scaleUnits: number;        // 1940 căn hộ
  ownership: string;         // "Sổ hồng"
  totalAreaM2: number;       // 32000
  progressNote: string | null;  // "Đang cập nhật" hoặc "Xây thô 40%"
  startDate: string;         // "Quý II/2025"
  handoverDate: string;      // "Quý IV/2027"

  description: string;       // plain text fallback (hiện không render)
  descriptionBlocks: DescriptionBlock[];  // rich format — render magazine-style
  highlights: OverviewHighlight[];  // 3-4 điểm nổi bật (format card trong Overview)

  media: MediaItem[];        // gallery hero — mix image + youtube

  towers: Tower[];
  unitTypes: UnitType[];

  interiorAmenities: AmenityList;  // Tiện ích nội khu (chia category)
  exteriorAmenities: AmenityList;  // Tiện ích ngoại khu (chia category + distance)
};
