import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Handshake,
  PhoneCall,
} from 'lucide-react-native';
import { EmptyState } from '@/components/EmptyState';
import { TodoistEventCard } from '@/components/TodoistEventCard';
import { Text } from '@/components/ui/Text';
import { useLeads } from '@/store/leads';
import {
  collectEvents,
  dayKey,
  dayLabel,
  timeLabel,
  type CalendarEvent,
} from '@/lib/calendar';
import { palette, semantic } from '@/theme';

// Calendar screen — 2 view modes:
// - "day":   grid theo giờ, event positioned absolute (Google Calendar style)
// - "agenda": sectioned list theo day (legacy mode, dùng cho xem nhiều ngày)

type ViewMode = 'day' | 'agenda';

const DAY_START = 7;    // 07:00
const DAY_END = 22;     // 22:00 (15 hours total)
const DAY_HOURS = DAY_END - DAY_START;
// Avg px per hour cho auto-scroll offset — flex layout nên chỉ approximate.
const HOUR_SCROLL_ESTIMATE = 80;

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const leads = useLeads((s) => s.leads);
  const [mode, setMode] = useState<ViewMode>('day');
  const [dayOffset, setDayOffset] = useState(0); // 0 = today, +1 = tomorrow, -1 = yesterday

  const allEvents = useMemo(() => collectEvents(leads), [leads]);

  // Day view — target date = today + dayOffset
  const targetDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [dayOffset]);

  const targetKey = dayKey(targetDate.toISOString());
  const dayEvents = useMemo(
    () => allEvents.filter((e) => dayKey(e.scheduledAt) === targetKey),
    [allEvents, targetKey]
  );

  // Agenda — group all events by day
  const agendaSections = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of allEvents) {
      const key = dayKey(e.scheduledAt);
      const arr = map.get(key);
      if (arr) arr.push(e);
      else map.set(key, [e]);
    }
    return Array.from(map.entries())
      .map(([key, items]) => ({
        key,
        label: dayLabel(items[0].scheduledAt),
        items,
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [allEvents]);

  const isToday = dayOffset === 0;
  const now = Date.now();
  const overdueCount = allEvents.filter((e) => new Date(e.scheduledAt).getTime() < now).length;

  return (
    <View className="flex-1 bg-surface">
      <View
        className="bg-white border-b border-border-light flex-row items-center px-2"
        style={{ paddingTop: insets.top + 4, paddingBottom: 10 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
          hitSlop={8}
        >
          <ArrowLeft size={22} color={semantic.text.primary} />
        </Pressable>
        <View className="w-10" />
        <View className="flex-1 items-center">
          <Text
            variant="h3"
            style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
          >
            Lịch của tôi
          </Text>
        </View>
        <View className="w-10" />
      </View>

      {/* Segmented toggle */}
      <View className="px-4 pt-3 bg-white border-b border-border-light pb-3">
        <View
          className="flex-row p-1 rounded-xl"
          style={{ backgroundColor: semantic.surface.alt }}
        >
          <SegButton
            label="Theo ngày"
            active={mode === 'day'}
            onPress={() => setMode('day')}
          />
          <SegButton
            label="Danh sách"
            active={mode === 'agenda'}
            onPress={() => setMode('agenda')}
          />
        </View>
      </View>

      {mode === 'day' ? (
        <DayView
          targetDate={targetDate}
          dayOffset={dayOffset}
          onDayChange={setDayOffset}
          events={dayEvents}
          isToday={isToday}
        />
      ) : (
        <AgendaView sections={agendaSections} overdueCount={overdueCount} />
      )}
    </View>
  );
}

function SegButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 h-9 rounded-lg items-center justify-center"
      style={{
        backgroundColor: active ? palette.white : 'transparent',
        shadowColor: palette.obsidian[900],
        shadowOpacity: active ? 0.08 : 0,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: active ? 1 : 0,
      }}
    >
      <Text
        variant="body"
        style={{
          color: active ? semantic.text.primary : semantic.text.secondary,
          fontFamily: 'BeVietnamPro_700Bold',
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// --- DAY VIEW ---

function DayView({
  targetDate,
  dayOffset,
  onDayChange,
  events,
  isToday,
}: {
  targetDate: Date;
  dayOffset: number;
  onDayChange: (offset: number) => void;
  events: CalendarEvent[];
  isToday: boolean;
}) {
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll tới current time khi load ngày "Hôm nay"
  useEffect(() => {
    if (!isToday) return;
    const now = new Date();
    const nowHour = now.getHours() + now.getMinutes() / 60;
    const offset = Math.max(0, (nowHour - DAY_START - 1) * HOUR_SCROLL_ESTIMATE);
    scrollRef.current?.scrollTo({ y: offset, animated: false });
  }, [isToday]);

  // Format header label: "Hôm nay, Th 4, 23/04"
  const weekdayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const headerLabel = isToday
    ? 'Hôm nay'
    : dayOffset === 1
    ? 'Ngày mai'
    : dayOffset === -1
    ? 'Hôm qua'
    : weekdayNames[targetDate.getDay()];
  const dateLabel = `${String(targetDate.getDate()).padStart(2, '0')}/${String(
    targetDate.getMonth() + 1
  ).padStart(2, '0')}`;

  return (
    <View style={{ flex: 1 }}>
      {/* Day nav header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-border-light">
        <Pressable
          onPress={() => onDayChange(dayOffset - 1)}
          hitSlop={8}
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: semantic.surface.alt }}
        >
          <ChevronLeft size={18} color={semantic.text.primary} strokeWidth={2.4} />
        </Pressable>
        <View className="flex-1 items-center">
          <Text
            style={{
              color: semantic.text.primary,
              fontFamily: 'BeVietnamPro_700Bold',
              fontSize: 15,
            }}
          >
            {headerLabel}
          </Text>
          <Text variant="caption" className="text-text-secondary mt-0.5">
            {weekdayNames[targetDate.getDay()]} · {dateLabel} · {events.length} sự kiện
          </Text>
        </View>
        <Pressable
          onPress={() => onDayChange(dayOffset + 1)}
          hitSlop={8}
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: semantic.surface.alt }}
        >
          <ChevronRight size={18} color={semantic.text.primary} strokeWidth={2.4} />
        </Pressable>
      </View>

      {/* Today CTA — shortcut khi đang ở ngày khác */}
      {!isToday && (
        <View className="px-4 py-2 bg-white border-b border-border-light">
          <Pressable
            onPress={() => onDayChange(0)}
            className="flex-row items-center justify-center gap-1 h-8 rounded-lg"
            style={{ backgroundColor: semantic.action.primarySoft }}
          >
            <CalendarDays size={13} color={semantic.action.primaryDeep} strokeWidth={2.4} />
            <Text
              variant="caption"
              style={{
                color: semantic.action.primaryDeep,
                fontFamily: 'BeVietnamPro_700Bold',
              }}
            >
              Về hôm nay
            </Text>
          </Pressable>
        </View>
      )}

      {/* Grid body */}
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <DayGrid events={events} isToday={isToday} />
      </ScrollView>
    </View>
  );
}

function DayGrid({ events, isToday }: { events: CalendarEvent[]; isToday: boolean }) {
  // Partition events: within-grid vs out-of-range (before/after DAY_START/END)
  const { inGrid, outOfRange, eventsByHour } = useMemo(() => {
    const inGrid: CalendarEvent[] = [];
    const outOfRange: CalendarEvent[] = [];
    for (const ev of events) {
      const d = new Date(ev.scheduledAt);
      const h = d.getHours();
      if (h >= DAY_START && h < DAY_END) inGrid.push(ev);
      else outOfRange.push(ev);
    }
    const eventsByHour = new Map<number, CalendarEvent[]>();
    for (const ev of inGrid) {
      const h = new Date(ev.scheduledAt).getHours();
      const arr = eventsByHour.get(h) ?? [];
      arr.push(ev);
      eventsByHour.set(h, arr);
    }
    // Sort each bucket ascending by minute
    for (const [, arr] of eventsByHour) {
      arr.sort(
        (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
    }
    return { inGrid, outOfRange, eventsByHour };
  }, [events]);

  const now = new Date();
  const nowHour = now.getHours();

  return (
    <View>
      {/* Out-of-range events — before 07:00 or after 22:00, render as chips at top */}
      {outOfRange.length > 0 && (
        <View
          className="px-4 py-3 gap-2"
          style={{
            backgroundColor: semantic.surface.alt,
            borderBottomWidth: 1,
            borderBottomColor: semantic.border.light,
          }}
        >
          <Text
            variant="caption"
            style={{
              color: semantic.text.tertiary,
              fontFamily: 'BeVietnamPro_700Bold',
              letterSpacing: 0.4,
              fontSize: 10,
            }}
          >
            NGOÀI GIỜ HÀNH CHÍNH
          </Text>
          {outOfRange.map((ev) => (
            <TodoistEventCard key={ev.id} event={ev} />
          ))}
        </View>
      )}

      {/* Flex time grid — mỗi giờ là section cao theo nội dung events bên trong,
          không cố định HOUR_HEIGHT. Time labels tự flex theo → không còn overlap. */}
      <View style={{ backgroundColor: palette.white }}>
        {Array.from({ length: DAY_HOURS }).map((_, i) => {
          const hour = DAY_START + i;
          const hourEvents = eventsByHour.get(hour) ?? [];
          const isCurrentHour = isToday && hour === nowHour;
          return (
            <HourRow
              key={hour}
              hour={hour}
              events={hourEvents}
              isCurrentHour={isCurrentHour}
              now={now}
            />
          );
        })}
      </View>

      {/* Empty state */}
      {inGrid.length === 0 && outOfRange.length === 0 && (
        <View className="px-4 py-6">
          <EmptyState
            icon={CalendarDays}
            title="Không có cuộc hẹn"
            description="Ngày này chưa có lead nào cần follow-up."
          />
        </View>
      )}
    </View>
  );
}

// Hour row — flex section, time label ngồi top-left, events stack dưới.
// Section height = content-driven (tổng các event block + gap) → không overflow.
function HourRow({
  hour,
  events,
  isCurrentHour,
  now,
}: {
  hour: number;
  events: CalendarEvent[];
  isCurrentHour: boolean;
  now: Date;
}) {
  // Nếu hour đang là "bây giờ" → chia events thành past/upcoming để chèn now-line giữa.
  const nowMs = now.getTime();
  const pastEvents: CalendarEvent[] = [];
  const upcomingEvents: CalendarEvent[] = [];
  if (isCurrentHour) {
    for (const ev of events) {
      if (new Date(ev.scheduledAt).getTime() < nowMs) pastEvents.push(ev);
      else upcomingEvents.push(ev);
    }
  }

  return (
    <View
      style={{
        paddingTop: 14,
        paddingBottom: events.length > 0 ? 6 : 14,
        borderTopWidth: 1,
        borderTopColor: semantic.border.light,
      }}
    >
      {/* Hour label — inline trên cùng section */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', paddingHorizontal: 12 }}>
        <Text
          variant="caption"
          style={{
            color: semantic.text.tertiary,
            fontSize: 12,
            fontFamily: 'BeVietnamPro_600SemiBold',
            width: 44,
          }}
        >
          {String(hour).padStart(2, '0')}:00
        </Text>
        <View style={{ flex: 1 }} />
      </View>

      {/* Events column — padding-left match time label width */}
      {events.length > 0 && (
        <View style={{ paddingLeft: 56, paddingRight: 12, paddingTop: 8, gap: 8 }}>
          {isCurrentHour ? (
            <>
              {pastEvents.map((ev) => (
                <EventBlockInline key={ev.id} event={ev} />
              ))}
              <NowLine time={now} />
              {upcomingEvents.map((ev) => (
                <EventBlockInline key={ev.id} event={ev} />
              ))}
            </>
          ) : (
            events.map((ev) => <EventBlockInline key={ev.id} event={ev} />)
          )}
        </View>
      )}

      {/* Current hour với 0 event → vẫn hiện now-line */}
      {isCurrentHour && events.length === 0 && (
        <View style={{ paddingLeft: 56, paddingRight: 12, paddingTop: 8 }}>
          <NowLine time={now} />
        </View>
      )}
    </View>
  );
}

function NowLine({ time }: { time: Date }) {
  const label = `${String(time.getHours()).padStart(2, '0')}:${String(
    time.getMinutes()
  ).padStart(2, '0')}`;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2 }}>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: semantic.urgency.fg,
        }}
      />
      <Text
        variant="caption"
        style={{
          color: semantic.urgency.fg,
          fontFamily: 'BeVietnamPro_700Bold',
          fontSize: 11,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
      <View style={{ flex: 1, height: 1.5, backgroundColor: semantic.urgency.fg, opacity: 0.5 }} />
    </View>
  );
}

// Inline version of EventBlock — không dùng position absolute, tự expand theo
// nội dung notes. Layout 3 dòng: icon+time · name · notes (max 3 lines).
function EventBlockInline({ event }: { event: CalendarEvent }) {
  const d = new Date(event.scheduledAt);
  const isMeeting = event.type === 'MEETING';
  const bg = isMeeting ? palette.blue[50] : palette.sienna[50];
  const borderColor = isMeeting ? palette.blue[100] : palette.sienna[100];
  const fg = isMeeting ? palette.blue[700] : palette.sienna[700];
  const overdue = d.getTime() < Date.now();

  return (
    <Pressable
      onPress={() => router.push(`/(app)/leads/${event.leadId}`)}
      style={{
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: overdue ? palette.red[100] : borderColor,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        opacity: overdue ? 0.75 : 1,
      }}
    >
      {/* Line 1: icon + time */}
      <View className="flex-row items-center gap-1.5">
        {isMeeting ? (
          <Handshake size={13} color={fg} strokeWidth={2.4} />
        ) : (
          <PhoneCall size={13} color={fg} strokeWidth={2.4} />
        )}
        <Text
          style={{
            color: fg,
            fontFamily: 'BeVietnamPro_700Bold',
            fontSize: 12,
            letterSpacing: 0.3,
          }}
        >
          {timeLabel(event.scheduledAt)}
        </Text>
      </View>

      {/* Line 2: lead name */}
      <Text
        style={{
          color: semantic.text.primary,
          fontFamily: 'BeVietnamPro_700Bold',
          fontSize: 14,
          marginTop: 4,
        }}
        numberOfLines={1}
      >
        {event.leadName}
      </Text>

      {/* Line 3: notes — fallback về project name nếu lead chưa có note */}
      <Text
        variant="caption"
        style={{
          color: semantic.text.secondary,
          fontSize: 12,
          lineHeight: 17,
          marginTop: 3,
        }}
        numberOfLines={3}
      >
        {event.leadNotes?.trim() || `Dự án: ${event.projectName}`}
      </Text>
    </Pressable>
  );
}

// --- AGENDA VIEW ---

function AgendaView({
  sections,
  overdueCount,
}: {
  sections: { key: string; label: string; items: CalendarEvent[] }[];
  overdueCount: number;
}) {
  const todayCount = sections.find((s) => s.label === 'Hôm nay')?.items.length ?? 0;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View
        className="mx-4 mt-4 p-4 rounded-2xl flex-row items-center gap-3"
        style={{
          backgroundColor: semantic.action.primarySoft,
          borderWidth: 1,
          borderColor: palette.sienna[100],
        }}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: palette.white }}
        >
          <CalendarDays size={20} color={semantic.action.primaryDeep} strokeWidth={2.2} />
        </View>
        <View className="flex-1">
          <Text
            style={{
              color: semantic.text.primary,
              fontFamily: 'BeVietnamPro_700Bold',
              fontSize: 15,
            }}
          >
            Hôm nay: {todayCount} cuộc hẹn
          </Text>
          <Text variant="caption" className="text-text-secondary mt-0.5">
            {overdueCount > 0 ? `${overdueCount} quá hạn cần xử lý` : 'Tất cả đúng giờ'}
          </Text>
        </View>
        {overdueCount > 0 && (
          <View
            className="px-2.5 py-1 rounded-full"
            style={{ backgroundColor: palette.red[50] }}
          >
            <Text
              variant="caption"
              style={{
                color: palette.red[600],
                fontFamily: 'BeVietnamPro_700Bold',
                fontSize: 11,
              }}
            >
              {overdueCount} trễ
            </Text>
          </View>
        )}
      </View>

      {sections.length === 0 ? (
        <View className="mx-4 mt-6">
          <EmptyState
            icon={CalendarDays}
            title="Chưa có cuộc hẹn nào"
            description="Đặt lịch follow-up trong lead detail để xuất hiện ở đây."
          />
        </View>
      ) : (
        sections.map((section) => (
          <View key={section.key} className="mt-6">
            <View className="px-4 mb-2 flex-row items-baseline gap-2">
              <Text
                style={{
                  color: semantic.text.primary,
                  fontFamily: 'BeVietnamPro_700Bold',
                  fontSize: 14,
                  letterSpacing: 0.3,
                }}
              >
                {section.label.toUpperCase()}
              </Text>
              <Text variant="caption" style={{ color: semantic.text.tertiary, fontSize: 11 }}>
                {section.items.length} sự kiện
              </Text>
            </View>
            <View className="px-4 gap-2.5">
              {section.items.map((ev) => (
                <TodoistEventCard key={ev.id} event={ev} />
              ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
