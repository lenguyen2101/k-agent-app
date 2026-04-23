import type { Lead } from '@/types/lead';

// Calendar event — union từ lead.nextFollowupAt + (future) activity.scheduledAt.
// Phase 1 chỉ cover FOLLOWUP từ nextFollowupAt. Activity MEETING/APPOINTMENT
// sẽ add khi form activity lưu được scheduledAt.
export type CalendarEventType = 'FOLLOWUP' | 'MEETING';

export type CalendarEvent = {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  projectName: string;
  leadNotes?: string;
  scheduledAt: string;
  type: CalendarEventType;
  leadStatus: Lead['status'];
};

// Lấy tất cả events từ leads (loại CLOSED_WON/LOST/ON_HOLD vì không cần FU).
// Sort ascending theo thời gian — bridge với section view (sớm nhất ở trên).
export function collectEvents(leads: Lead[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (const l of leads) {
    const skip = l.status === 'CLOSED_WON' || l.status === 'CLOSED_LOST' || l.status === 'ON_HOLD';
    if (skip) continue;
    if (l.nextFollowupAt) {
      events.push({
        id: `fu-${l.id}`,
        leadId: l.id,
        leadName: l.fullName,
        leadPhone: l.phone,
        projectName: l.primaryProject.shortName,
        leadNotes: l.notes,
        scheduledAt: l.nextFollowupAt,
        type: l.status === 'APPOINTMENT' || l.status === 'VISITED' ? 'MEETING' : 'FOLLOWUP',
        leadStatus: l.status,
      });
    }
  }
  return events.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}

// Group key — stable YYYY-MM-DD để section list nhóm events cùng ngày.
export function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Section label cho UI — Today / Tomorrow / thứ + dd/mm.
export function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400_000);

  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Ngày mai';
  if (diffDays === -1) return 'Hôm qua';

  const weekdayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const wd = weekdayNames[d.getDay()];
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${wd}, ${dd}/${mm}`;
}

// HH:MM hiển thị trong event row.
export function timeLabel(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Events của hôm nay — dùng cho Home mini section.
export function eventsToday(events: CalendarEvent[]): CalendarEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return events.filter((e) => {
    const t = new Date(e.scheduledAt).getTime();
    return t >= today.getTime() && t < tomorrow.getTime();
  });
}

// Count events overdue (trước now) — Home badge "cần xử lý".
export function overdueCount(events: CalendarEvent[]): number {
  const now = Date.now();
  return events.filter((e) => new Date(e.scheduledAt).getTime() < now).length;
}
