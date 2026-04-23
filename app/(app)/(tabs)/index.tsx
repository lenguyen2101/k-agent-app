import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Switch, View } from 'react-native';
import { router } from 'expo-router';
import {
  CalendarDays,
  ChevronRight,
  MessageSquare,
  Mic,
  PhoneCall,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react-native';
import { useAuth } from '@/store/auth';
import { useLeads } from '@/store/leads';
import { FAB } from '@/components/FAB';
import { HeroStatsCard, type PipelineSegment } from '@/components/HeroStatsCard';
import { QuickActionRow, type QuickAction } from '@/components/QuickActionRow';
import { SalesProfileHeader } from '@/components/SalesProfileHeader';
import { Screen } from '@/components/Screen';
import { TodoistEventCard } from '@/components/TodoistEventCard';
import { VoiceTodoSheet } from '@/components/VoiceTodoSheet';
import { Text } from '@/components/ui/Text';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { collectEvents, eventsToday } from '@/lib/calendar';
import { isOverdue } from '@/lib/format';
import { statusToGroup } from '@/types/lead';
import { palette, semantic } from '@/theme';

export default function Home() {
  const user = useAuth((s) => s.user);
  const isOnline = useAuth((s) => s.isOnline);
  const toggleOnline = useAuth((s) => s.toggleOnline);
  const refresh = usePullToRefresh();
  const leads = useLeads((s) => s.leads);
  const [voiceTodoOpen, setVoiceTodoOpen] = useState(false);

  const overdueLeads = leads.filter(
    (l) => isOverdue(l.nextFollowupAt) && l.status !== 'CLOSED_WON' && l.status !== 'CLOSED_LOST'
  );
  const newLeads = leads.filter((l) => l.status === 'NEW');
  const todayEvents = eventsToday(collectEvents(leads));

  // Pipeline bar — 3 segment đầu funnel (Mới/Đang trao đổi/Hẹn-Xem) cho Home.
  // Stage Chốt + Thành công xem ở Thu nhập tab. Tone sienna + pattern distinct.
  const pipelineConfig = [
    { group: 'new',       label: 'Mới',            color: palette.sienna[300], pattern: 'stripes' as const },
    { group: 'engaged',   label: 'Đang trao đổi',  color: palette.sienna[500], pattern: 'solid' as const },
    { group: 'midfunnel', label: 'Hẹn/Xem',        color: palette.sienna[700], pattern: 'dots' as const },
  ] as const;

  const pipeline: PipelineSegment[] = pipelineConfig.map((cfg) => ({
    key: cfg.group,
    label: cfg.label,
    count: leads.filter((l) => statusToGroup[l.status] === cfg.group).length,
    color: cfg.color,
    pattern: cfg.pattern,
  }));

  const quickActions: QuickAction[] = [
    {
      key: 'new-lead',
      label: 'Lead mới',
      icon: Users,
      badge: newLeads.length || undefined,
      onPress: () => router.push('/(app)/(tabs)/leads'),
    },
    {
      key: 'call',
      label: 'Gọi nhanh',
      icon: PhoneCall,
      onPress: () => router.push('/(app)/(tabs)/leads'),
    },
    {
      key: 'chat',
      label: 'AI Chat',
      icon: MessageSquare,
      onPress: () => router.push('/(app)/chat/new'),
    },
    {
      key: 'income',
      label: 'Thu nhập',
      icon: TrendingUp,
      onPress: () => router.push('/(app)/income'),
    },
  ];

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        refreshControl={
          <RefreshControl
            refreshing={refresh.refreshing}
            onRefresh={refresh.onRefresh}
            tintColor={refresh.tintColor}
            colors={[...refresh.colors]}
          />
        }
      >
        <SalesProfileHeader
          name={user?.fullName ?? ''}
          team={user?.team}
          tier="Tân binh"
          unreadCount={overdueLeads.length}
          onBellPress={() => router.push('/(app)/notifications')}
        />

        <View className="px-4 pt-1">
          <QuickActionRow actions={quickActions} />
        </View>

        <View className="px-4 pt-5">
          <HeroStatsCard
            title="Tổng quan hoạt động hôm nay"
            pipeline={pipeline}
          />
        </View>

        {/* Combined receiving-lead card — bg đổi theo state để phân biệt rõ:
            online = emerald soft · offline = slate soft */}
        <View
          className="mx-4 mt-8 rounded-2xl overflow-hidden"
          style={{
            backgroundColor: isOnline ? palette.emerald[50] : palette.slate[100],
            borderWidth: 1,
            borderColor: isOnline ? palette.emerald[100] : palette.slate[200],
          }}
        >
          {/* Top row — status + toggle */}
          <View className="p-4 flex-row items-center gap-3">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: palette.white }}
            >
              <View
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: isOnline ? palette.emerald[500] : semantic.text.tertiary }}
              />
            </View>
            <View className="flex-1">
              <Text variant="h3" style={{ color: semantic.text.primary }}>
                {isOnline ? 'Đang nhận lead' : 'Tạm tắt nhận lead'}
              </Text>
              <Text variant="caption" style={{ color: semantic.text.secondary, marginTop: 2 }}>
                {isOnline ? 'AI sẽ gửi lead mới cho bạn' : 'Bật để bắt đầu nhận lead'}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={toggleOnline}
              trackColor={{ true: palette.emerald[100], false: semantic.border.default }}
              thumbColor={isOnline ? palette.emerald[500] : palette.white}
              ios_backgroundColor={semantic.border.default}
            />
          </View>

          {/* Divider + inline alert row — chỉ hiện khi online */}
          {isOnline && (
            <>
              <View style={{ height: 1, backgroundColor: palette.emerald[100] }} />
              <Pressable
                onPress={() => router.push('/(modal)/lead-offer')}
                className="px-4 py-3 flex-row items-center gap-3"
              >
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center"
                  style={{ backgroundColor: palette.white }}
                >
                  <Sparkles size={16} color={semantic.action.primary} strokeWidth={2.4} />
                  <View
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: palette.red[500],
                      borderWidth: 1.5,
                      borderColor: palette.white,
                    }}
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text
                      variant="caption"
                      style={{
                        color: palette.red[600],
                        fontFamily: 'BeVietnamPro_700Bold',
                        fontSize: 10,
                        letterSpacing: 0.4,
                      }}
                    >
                      DEMO · LEAD MỚI
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: semantic.text.primary,
                      fontFamily: 'BeVietnamPro_700Bold',
                      fontSize: 14,
                      marginTop: 1,
                    }}
                  >
                    Có 1 khách tiềm năng · tap để xem
                  </Text>
                </View>
                <ChevronRight size={18} color={semantic.action.primaryDeep} strokeWidth={2.2} />
              </Pressable>
            </>
          )}
        </View>

        {/* Lịch hôm nay — Todoist-style card list */}
        <View className="mt-8 px-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <View
                className="w-7 h-7 rounded-lg items-center justify-center"
                style={{ backgroundColor: palette.blue[50] }}
              >
                <CalendarDays size={15} color={palette.blue[700]} strokeWidth={2.4} />
              </View>
              <Text variant="h3" style={{ color: semantic.text.primary }}>
                Lịch hôm nay
              </Text>
              {todayEvents.length > 0 && (
                <Text variant="caption" className="text-text-tertiary">
                  {todayEvents.length} cuộc hẹn
                </Text>
              )}
            </View>
            <Pressable
              onPress={() => router.push('/(app)/calendar')}
              className="flex-row items-center gap-0.5"
              hitSlop={4}
            >
              <Text
                variant="caption"
                style={{
                  color: semantic.action.primary,
                  fontFamily: 'BeVietnamPro_600SemiBold',
                }}
              >
                Xem lịch
              </Text>
              <ChevronRight size={14} color={semantic.action.primary} strokeWidth={2.4} />
            </Pressable>
          </View>

          {todayEvents.length === 0 ? (
            <View
              className="p-5 rounded-2xl items-center"
              style={{
                backgroundColor: palette.white,
                borderWidth: 1,
                borderColor: semantic.border.light,
              }}
            >
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center mb-2"
                style={{ backgroundColor: palette.emerald[50] }}
              >
                <CalendarDays size={22} color={palette.emerald[700]} strokeWidth={1.8} />
              </View>
              <Text
                style={{
                  color: semantic.text.primary,
                  fontFamily: 'BeVietnamPro_700Bold',
                  fontSize: 14,
                }}
              >
                Không có cuộc hẹn hôm nay
              </Text>
              <Text
                variant="caption"
                className="text-text-secondary mt-0.5 text-center"
              >
                Tận hưởng ngày nhẹ nhàng hoặc chủ động gọi lead!
              </Text>
            </View>
          ) : (
            <View className="gap-2.5">
              {todayEvents.slice(0, 4).map((ev) => (
                <TodoistEventCard key={ev.id} event={ev} />
              ))}
              {todayEvents.length > 4 && (
                <Pressable
                  onPress={() => router.push('/(app)/calendar')}
                  className="flex-row items-center justify-center gap-1 py-2"
                >
                  <Text
                    variant="caption"
                    style={{
                      color: semantic.action.primary,
                      fontFamily: 'BeVietnamPro_700Bold',
                    }}
                  >
                    Xem thêm {todayEvents.length - 4} cuộc hẹn
                  </Text>
                  <ChevronRight size={14} color={semantic.action.primary} strokeWidth={2.4} />
                </Pressable>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <FAB icon={Mic} onPress={() => setVoiceTodoOpen(true)} />

      <VoiceTodoSheet visible={voiceTodoOpen} onClose={() => setVoiceTodoOpen(false)} />
    </Screen>
  );
}
