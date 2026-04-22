import type { StatusGroup } from '@/theme';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'INTERESTED'
  | 'APPOINTMENT'
  | 'VISITED'
  | 'NEGOTIATING'
  | 'DEPOSITED'
  | 'CONTRACTED'
  | 'CLOSED_WON'
  | 'CLOSED_LOST'
  | 'ON_HOLD';

// Map LeadStatus → 6 visual groups. Color tokens ở semantic.leadGroup.
export const statusToGroup: Record<LeadStatus, StatusGroup> = {
  NEW: 'new',
  CONTACTED: 'engaged',
  INTERESTED: 'engaged',
  APPOINTMENT: 'midfunnel',
  VISITED: 'midfunnel',
  NEGOTIATING: 'midfunnel',
  DEPOSITED: 'closing',
  CONTRACTED: 'closing',
  CLOSED_WON: 'won',
  CLOSED_LOST: 'ended',
  ON_HOLD: 'ended',
};

export const statusLabels: Record<LeadStatus, string> = {
  NEW: 'Mới',
  CONTACTED: 'Đã liên hệ',
  INTERESTED: 'Quan tâm',
  APPOINTMENT: 'Đã hẹn',
  VISITED: 'Đã xem',
  NEGOTIATING: 'Đàm phán',
  DEPOSITED: 'Đã cọc',
  CONTRACTED: 'Đã ký HĐ',
  CLOSED_WON: 'Thành công',
  CLOSED_LOST: 'Rớt',
  ON_HOLD: 'Tạm dừng',
};

export type LeadSource =
  | 'NOXH_PLATFORM'
  | 'FACEBOOK_ADS'
  | 'HOTLINE'
  | 'WALK_IN'
  | 'REFERRAL'
  | 'EVENT'
  | 'ZALO'
  | 'OTHER';

export type ActivityType =
  | 'CALL'
  | 'SMS'
  | 'ZALO_MESSAGE'
  | 'EMAIL'
  | 'MEETING'
  | 'NOTE'
  | 'STATUS_CHANGE'
  | 'ASSIGNMENT_CHANGE'
  | 'FOLLOWUP_SCHEDULED'
  | 'BOOKING_CREATED';

export type ActivityOutcome =
  | 'REACHED'
  | 'NO_ANSWER'
  | 'WRONG_NUMBER'
  | 'CALLBACK_LATER'
  | 'NOT_INTERESTED'
  | 'INTERESTED';

export type Project = {
  id: string;
  name: string;
  shortName: string;
  location: string;
  thumbnail?: string;
  unitTypes: string[];
  priceRange: string;
};

export type NoxhProfile = {
  noxhUserId: string;
  ekycVerified: boolean;
  fullNameVerified: string;
  cccdMasked: string;
  socialHousingEligible: boolean;
  province: string;
};

export type Activity = {
  id: string;
  leadId: string;
  type: ActivityType;
  content?: string;
  outcome?: ActivityOutcome;
  scheduledAt?: string;
  durationSeconds?: number;
  createdBy: string;
  createdAt: string;
};

export type Lead = {
  id: string;
  phone: string;
  fullName: string;
  source: LeadSource;
  status: LeadStatus;
  primaryProject: Project;
  alternativeProjects?: Project[];
  unitTypeInterests?: string[];
  nextFollowupAt?: string;
  expiresAt?: string;
  notes?: string;
  noxhProfile?: NoxhProfile;
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
};

export type LeadOffer = {
  id: string;
  leadId: string;
  lead: Pick<Lead, 'id' | 'fullName' | 'phone' | 'source' | 'primaryProject' | 'noxhProfile'>;
  offeredAt: string;
  expiresAt: string;
  remainingSeconds: number;
};
